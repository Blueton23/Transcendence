import secrets
from typing import ClassVar

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.utils import timezone

from common.models import TimeStampedModel


def generate_invite_token() -> str:
    return secrets.token_urlsafe(16)


class TravelStatus(models.TextChoices):
    CURRENT = "c", "Current"
    FINISHED = "f", "Finished"


class Travel(TimeStampedModel):
    title = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    invite_token = models.CharField(
        max_length=50, unique=True, default=generate_invite_token
    )
    status = models.CharField(
        max_length=1, choices=TravelStatus.choices, default=TravelStatus.CURRENT
    )

    class Meta:
        ordering: ClassVar[list] = ["-created_at"]
        constraints: ClassVar[list] = [
            CheckConstraint(
                check=Q(end_date__gte=models.F("start_date")),
                name="travel_end_date_gte_start_date",
            ),
        ]

    def __str__(self) -> str:
        return self.title


class ParticipationStatus(models.TextChoices):
    INVITED = "i", "Invited"
    ACCEPTED = "a", "Accepted"
    REFUSED = "r", "Refused"
    LEFT = "l", "Left"


# TODO quand l'app chat serait a faire
# Pointer vers le last-read + un counter
class Participation(models.Model):
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="participations",
    )
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        related_name="participations",
    )
    status = models.CharField(
        max_length=1,
        choices=ParticipationStatus.choices,
        default=ParticipationStatus.INVITED,
    )
    left_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints: ClassVar[list] = [
            UniqueConstraint(
                fields=["traveler", "travel"], name="unique_participation"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.traveler} -> {self.travel} ({self.status})"


class StepQuerySet(models.QuerySet):
    def alive(self) -> "StepQuerySet":
        return self.filter(deleted_at__isnull=True)

    def trashed(self) -> "StepQuerySet":
        return self.filter(deleted_at__isnull=False)


class Step(TimeStampedModel):
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    # Ordre relatif entre etapes qui partagent la meme plage de dates.
    # Null par defaut : utile seulement pour departager un chevauchement.
    priority = models.PositiveIntegerField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    localisation = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = StepQuerySet.as_manager()  # for soft delete convenience

    class Meta:
        ordering: ClassVar[list] = ["start_date", "end_date", "priority"]
        constraints: ClassVar[list] = [
            CheckConstraint(
                check=Q(end_date__gte=models.F("start_date")),
                name="step_end_date_gte_start_date",
            ),
            UniqueConstraint(
                fields=["travel", "start_date", "end_date", "priority"],
                condition=Q(deleted_at__isnull=True, priority__isnull=False),
                name="unique_step_priority_per_travel_dates",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.travel} - {self.localisation} ({self.start_date} -> {self.end_date})"

    def save(self, *args: object, **kwargs: object) -> None:
        super().save(*args, **kwargs)
        update_fields = kwargs.get("update_fields")
        if update_fields is None or {"start_date", "end_date"} & set(update_fields):
            self.extend_travel_dates_to_fit()

    # Elargit la plage de dates du travel parent pour englober l'etape.
    def extend_travel_dates_to_fit(self) -> bool:
        widened_fields: list[str] = []
        if self.start_date and self.start_date < self.travel.start_date:
            self.travel.start_date = self.start_date
            widened_fields.append("start_date")
        if self.end_date and self.end_date > self.travel.end_date:
            self.travel.end_date = self.end_date
            widened_fields.append("end_date")
        if not widened_fields:
            return False
        self.travel.save(update_fields=[*widened_fields, "updated_at"])
        return True

    @property
    def is_trashed(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self) -> None:
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self) -> None:
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])
