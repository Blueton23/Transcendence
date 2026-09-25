from typing import ClassVar

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from common.models import TimeStampedModel, ValidatedModel
from travel.models import Step, Travel


class IdeaType(models.TextChoices):
    RESTAURANT = "r", "Restaurant"
    LODGING = "l", "Lodging"
    ACTIVITY = "a", "Activity"
    SIGHT = "s", "Sight"


class IdeaStatus(models.TextChoices):
    SUGGESTED = "s", "Suggested"
    PLACED = "p", "Placed"
    CHOSEN = "c", "Chosen"


class IdeaQuerySet(models.QuerySet):
    def pool(self) -> "IdeaQuerySet":
        return self.filter(Q(step__isnull=True) | Q(step__deleted_at__isnull=False))


class Idea(TimeStampedModel, ValidatedModel):
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        related_name="ideas",
    )
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ideas",
        help_text="Who proposed the idea.",
    )
    # Libre dans le pool tant que step est vide ou a la corbeille (soft delete) ;
    # une etape supprimee definitivement renvoie aussi ses idees au pool (SET NULL).
    step = models.ForeignKey(
        Step,
        on_delete=models.SET_NULL,
        related_name="ideas",
        null=True,
        blank=True,
    )
    chosen_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="chosen_ideas",
        null=True,
        blank=True,
        help_text="Who chose this lodging among the options of its step.",
    )
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=1, choices=IdeaType.choices)
    localisation = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)
    url = models.URLField(blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    chosen_at = models.DateTimeField(null=True, blank=True)

    objects = IdeaQuerySet.as_manager()

    class Meta:
        ordering: ClassVar[list] = ["-created_at"]
        constraints: ClassVar[list] = [
            CheckConstraint(
                check=Q(end_date__gte=models.F("start_date")),
                name="idea_end_date_gte_start_date",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.travel})"

    @property
    def is_in_pool(self) -> bool:
        return self.step_id is None or self.step.is_trashed

    # Derive plutot que stocker : suggested tant qu'aucune etape n'est assignee,
    # chosen seulement pour un hebergement dont chosen_at est rempli, placed sinon.
    @property
    def status(self) -> str:
        if self.is_in_pool:
            return IdeaStatus.SUGGESTED
        if self.type == IdeaType.LODGING and self.chosen_at is not None:
            return IdeaStatus.CHOSEN
        return IdeaStatus.PLACED

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}

        if self.step_id and self.travel_id and self.step.travel_id != self.travel_id:
            errors["step"] = "The step must belong to the same travel as the idea."

        if (
            self.step_id
            and not self.step.is_trashed
            and self.start_date
            and self.end_date
            and (
                self.start_date < self.step.start_date
                or self.end_date > self.step.end_date
            )
        ):
            errors["step"] = "The idea dates must be within the step dates."

        if self.type != IdeaType.LODGING and self.price_per_night is not None:
            errors["price_per_night"] = "Only a lodging can have a price per night."

        if self.chosen_at is not None and (
            self.type != IdeaType.LODGING or self.is_in_pool
        ):
            errors["chosen_at"] = "Only a lodging placed on a step can be chosen."

        if bool(self.start_date) != bool(self.end_date):
            errors["end_date"] = "Both dates must be set together, or neither."
        elif self.start_date and self.end_date:
            if self.type != IdeaType.LODGING:
                if self.is_in_pool:
                    errors["start_date"] = "An idea in the pool cannot have dates."
                elif self.start_date != self.end_date:
                    errors["end_date"] = "A non-lodging idea only spans a single day."
        elif self.type == IdeaType.LODGING:
            errors["start_date"] = "A lodging must always have dates."
        elif not self.is_in_pool:
            errors["start_date"] = "An idea placed on a step must have dates."

        if errors:
            raise ValidationError(errors)

        if (
            self.type == IdeaType.LODGING
            and self.chosen_at is not None
            and self.step_id
        ):
            overlapping = (
                Idea.objects.filter(
                    step_id=self.step_id,
                    type=IdeaType.LODGING,
                    chosen_at__isnull=False,
                    start_date__lte=self.end_date,
                    end_date__gte=self.start_date,
                )
                .exclude(pk=self.pk)
                .exists()
            )
            if overlapping:
                raise ValidationError(
                    {
                        "chosen_at": (
                            "Another chosen lodging on this step overlaps these dates."
                        )
                    }
                )


@receiver(pre_delete, sender=Step)
def _clear_ideas_before_step_hard_delete(
    sender: type, instance: Step, **kwargs: object
) -> None:
    # step va passer a NULL (SET_NULL) : sans ca, chosen_at/chosen_by et les dates
    # des idees non-hebergement deviennent incoherents avec les regles de clean().
    instance.ideas.filter(chosen_at__isnull=False).update(
        chosen_at=None, chosen_by=None
    )
    instance.ideas.exclude(type=IdeaType.LODGING).update(start_date=None, end_date=None)


class Reaction(models.Model):
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    idea = models.ForeignKey(
        Idea,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints: ClassVar[list] = [
            UniqueConstraint(fields=["traveler", "idea"], name="unique_reaction"),
        ]

    def __str__(self) -> str:
        return f"{self.traveler} <3 {self.idea}"
