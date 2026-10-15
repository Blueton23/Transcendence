# models.py

from typing import ClassVar

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import CheckConstraint, F, Q, UniqueConstraint

from common.models import TimeStampedModel


class Traveler(AbstractUser, TimeStampedModel):
    email = models.EmailField("email address", unique=True)

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )

    is_online = models.BooleanField(default=False)

    class Meta:
        swappable = "AUTH_USER_MODEL"


class Status(models.TextChoices):
    PENDING = "p", "Pending"
    ACCEPTED = "a", "Accepted"


class Friendship(TimeStampedModel):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendships_user1",
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendships_user2",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendships_requested_by",
    )
    status = models.CharField(
        max_length=1, choices=Status.choices, default=Status.PENDING
    )

    class Meta:
        constraints: ClassVar[list] = [
            UniqueConstraint(fields=["user1", "user2"], name="unique_friendship"),
            CheckConstraint(
                check=Q(user1__lt=F("user2")), name="friendship_user1_lt_user2"
            ),
            CheckConstraint(
                check=Q(requested_by=F("user1")) | Q(requested_by=F("user2")),
                name="requested_by_is_participant",
            ),
        ]
