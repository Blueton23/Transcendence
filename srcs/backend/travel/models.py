import secrets
from typing import ClassVar

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.utils import timezone

from common.models import TimeStampedModel

# int id PK
# string Title
# date StartDate "date de départ"
# date EndDate "date de fin - borne ferme"
# string InviteToken UK "lien de partage pour rejoindre"
# enum Status "ouvert / terminé"
# datetime CreatedAt
# datetime UpdatedAt


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


# Participation
# int TravelerId PK, FK
# int TravelId PK, FK
# enum Status "invité / accepté / refusé / parti"
# datetime LeftAt "optionnel"
# datetime CreatedAt


class ParticipationStatus(models.TextChoices):
    INVITED = "i", "Invited"
    ACCEPTED = "a", "Accepted"
    REFUSED = "r", "Refused"
    LEFT = "l", "Left"


# TODO trouver un moyen de mettre qu'il y a des msg non lu
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


# STEP
# int id PK
# int TravelId FK
# int Position "ordre dans le trajet"
# int Nights "0 pour une halte"
# string Localisation
# decimal Latitude "optionnel - rempli par la recherche"
# decimal Longitude "optionnel - rempli par la recherche"
# datetime DeletedAt "optionnel - corbeille"
# datetime CreatedAt
# datetime UpdatedAt


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
    position = models.PositiveIntegerField()
    nights = models.PositiveIntegerField(default=0)
    localisation = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = StepQuerySet.as_manager() # for soft delete convenience

    class Meta:
        ordering: ClassVar[list] = ["position"]
        constraints: ClassVar[list] = [
            UniqueConstraint(
                fields=["travel", "position"],
                condition=Q(deleted_at__isnull=True),
                name="unique_step_position_per_travel",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.travel} #{self.position} - {self.localisation}"

    @property
    def is_trashed(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self) -> None:
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self) -> None:
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])
