from typing import ClassVar

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from common.models import TimeStampedModel, ValidatedModel
from idea.models import Idea
from travel.models import Step, Travel


class SpendingCategory(models.TextChoices):
    LODGING = "l", "Lodging"
    FUEL = "f", "Fuel"
    ACTIVITIES = "a", "Activities"
    MEALS = "m", "Meals"
    TOLLS = "t", "Tolls"
    OTHER = "o", "Other"


class Spending(TimeStampedModel, ValidatedModel):
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        related_name="spendings",
    )
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
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
