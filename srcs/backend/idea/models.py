from typing import ClassVar

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q, UniqueConstraint

from common.models import TimeStampedModel
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
        return self.filter(step__isnull=True)


class Idea(TimeStampedModel):
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
    # Libre dans le pool tant que step est vide. Une etape supprimee renvoie
    # ses idees au pool (SET NULL) plutot que de les emporter.
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
        help_text="Who marked the idea as chosen.",
    )
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=1, choices=IdeaType.choices)
    status = models.CharField(
        max_length=1, choices=IdeaStatus.choices, default=IdeaStatus.SUGGESTED
    )
    localisation = models.CharField(max_length=255, blank=True)
    note = models.TextField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    price_per_night = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    arrival_date = models.DateTimeField(null=True, blank=True)
    departure_date = models.DateTimeField(null=True, blank=True)
    chosen_at = models.DateTimeField(null=True, blank=True)

    objects = IdeaQuerySet.as_manager()

    class Meta:
        ordering: ClassVar[list] = ["-created_at"]
        constraints: ClassVar[list] = [
            CheckConstraint(
                check=Q(departure_date__gte=models.F("arrival_date")),
                name="idea_departure_date_gte_arrival_date",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.travel})"

    @property
    def is_in_pool(self) -> bool:
        return self.step_id is None


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
