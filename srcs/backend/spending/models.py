from typing import ClassVar

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import UniqueConstraint

from common.models import TimeStampedModel, ValidatedModel
from idea.models import Idea
from travel.models import Participation, ParticipationStatus, Step, Travel


class SpendingCategory(models.TextChoices):
    LODGING = "l", "Lodging"
    FUEL = "f", "Fuel"
    ACTIVITIES = "a", "Activities"
    MEALS = "m", "Meals"
    TOLLS = "t", "Tolls"
    OTHER = "o", "Other"


# LEFT compte comme membre : un ex-participant garde ses depenses et ses parts.
def is_travel_member(travel_id: int, traveler_id: int) -> bool:
    return Participation.objects.filter(
        travel_id=travel_id,
        traveler_id=traveler_id,
        status__in=[ParticipationStatus.ACCEPTED, ParticipationStatus.LEFT],
    ).exists()


class Spending(TimeStampedModel, ValidatedModel):
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        related_name="spendings",
    )
    # PROTECT : supprimer le payeur effacerait ce que les autres lui doivent.
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="spendings",
        help_text="Who paid.",
    )
    # Optionnel : une depense peut relever du voyage seul (carburant), d'une
    # etape (peage) ou d'une idee (le resto qu'on a fait). Si l'etape/l'idee
    # disparait, la depense reste rattachee au voyage (SET NULL).
    step = models.ForeignKey(
        Step,
        on_delete=models.SET_NULL,
        related_name="spendings",
        null=True,
        blank=True,
    )
    idea = models.ForeignKey(
        Idea,
        on_delete=models.SET_NULL,
        related_name="spendings",
        null=True,
        blank=True,
    )
    category = models.CharField(max_length=1, choices=SpendingCategory.choices)
    label = models.CharField(max_length=100, blank=True, default="")
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    paid_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering: ClassVar[list] = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.get_category_display()} - {self.amount} ({self.travel})"

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}

        if (
            self.traveler_id
            and self.travel_id
            and not is_travel_member(self.travel_id, self.traveler_id)
        ):
            errors["traveler"] = "The traveler must be a participant of the travel."

        if self.step_id and self.travel_id and self.step.travel_id != self.travel_id:
            errors["step"] = "The step must belong to the same travel as the spending."

        if self.idea_id and self.travel_id and self.idea.travel_id != self.travel_id:
            errors["idea"] = "The idea must belong to the same travel as the spending."
        elif (
            self.idea_id
            and self.step_id
            and self.idea.step_id
            and self.idea.step_id != self.step_id
        ):
            errors["step"] = "The step must match the step of the linked idea."

        if errors:
            raise ValidationError(errors)


# Part d'une depense due par un voyageur. Figee a la creation : si quelqu'un
# quitte le voyage, il reste redevable des depenses faites avant son depart.
class SpendingShare(TimeStampedModel, ValidatedModel):
    spending = models.ForeignKey(
        Spending,
        on_delete=models.CASCADE,
        related_name="shares",
    )
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="spending_shares",
        help_text="Who owes this part.",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        ordering: ClassVar[list] = ["created_at"]
        constraints: ClassVar[list] = [
            UniqueConstraint(
                fields=["spending", "traveler"], name="unique_share_per_traveler"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.traveler} owes {self.amount} ({self.spending})"

    def clean(self) -> None:
        super().clean()
        if (
            self.spending_id
            and self.traveler_id
            and not is_travel_member(self.spending.travel_id, self.traveler_id)
        ):
            raise ValidationError(
                {"traveler": "The traveler must be a participant of the travel."}
            )
