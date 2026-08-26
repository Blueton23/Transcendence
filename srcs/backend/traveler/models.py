from typing import ClassVar

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import CheckConstraint, F, Q, UniqueConstraint

from common.models import TimeStampedModel

# Traveler


class Traveler(AbstractUser, TimeStampedModel):
    email = models.EmailField("email address", unique=True)
    profile_picture_url = models.URLField(blank=True, null=True)
    is_online = models.BooleanField(default=False)

    class Meta:
        swappable = "AUTH_USER_MODEL"


# Friendship
class Status(models.TextChoices):
    PENDING = "p", "Pending"
    ACCEPTED = "a", "Accepted"


class Friendship(TimeStampedModel):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendships_as_sender",
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendships_as_receiver",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendships_requested",
    )
    status = models.CharField(
        max_length=1, choices=Status.choices, default=Status.PENDING
    )

    class Meta:
        constraints: ClassVar[list] = [
            UniqueConstraint(fields=["sender", "receiver"], name="unique_friendship"),
            CheckConstraint(
                check=Q(sender__lt=F("receiver")), name="friendship_sender_lt_receiver"
            ),
        ]
