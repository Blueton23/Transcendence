from typing import ClassVar

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator
from django.db import models
from django.db.models import CheckConstraint, Q

from common.models import TimeStampedModel, ValidatedModel
from idea.models import Idea
from travel.models import Participation, Step, Travel, is_travel_member

MESSAGE_BODY_MAX_LENGTH = 2000


class SystemMessageKey(models.TextChoices):
    PARTICIPANT_JOINED = "participant_joined", "Participant joined"
    PARTICIPANT_LEFT = "participant_left", "Participant left"


class MessageQuerySet(models.QuerySet):
    # Non-lus d'un participant : les messages des autres, arrives depuis son
    # dernier passage (tous si le chat n'a jamais ete ouvert).
    def unread_for(self, participation: Participation) -> "MessageQuerySet":
        unread = self.filter(
            travel_id=participation.travel_id, is_system=False
        ).exclude(traveler_id=participation.traveler_id)
        if participation.last_read_at is not None:
            unread = unread.filter(created_at__gt=participation.last_read_at)
        return unread


class Message(TimeStampedModel, ValidatedModel):
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    # Vide pour un message systeme, ou quand le compte de l'auteur a ete
    # supprime (SET NULL) : le message reste dans le fil.
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="messages",
        null=True,
        blank=True,
        help_text="Who wrote the message.",
    )
    # Optionnel : un message releve du voyage, d'une etape ou d'une idee, jamais
    # des deux. Si l'etape/l'idee disparait, il reste rattache au voyage (SET NULL).
    step = models.ForeignKey(
        Step,
        on_delete=models.SET_NULL,
        related_name="messages",
        null=True,
        blank=True,
    )
    idea = models.ForeignKey(
        Idea,
        on_delete=models.SET_NULL,
        related_name="messages",
        null=True,
        blank=True,
    )
    is_system = models.BooleanField(default=False)
    # Empty for a system message: its text is built by the front from system_key and system_params.
    body = models.TextField(
        blank=True, validators=[MaxLengthValidator(MESSAGE_BODY_MAX_LENGTH)]
    )
    system_key = models.CharField(
        max_length=50, choices=SystemMessageKey.choices, blank=True
    )
    system_params = models.JSONField(default=dict, blank=True)

    objects = MessageQuerySet.as_manager()

    class Meta:
        ordering: ClassVar[list] = ["created_at", "id"]
        indexes: ClassVar[list] = [
            models.Index(
                fields=["travel", "created_at"], name="message_travel_created"
            ),
        ]
        constraints: ClassVar[list] = [
            CheckConstraint(
                check=Q(is_system=False) | Q(traveler__isnull=True),
                name="message_system_has_no_author",
            ),
            CheckConstraint(
                check=Q(step__isnull=True) | Q(idea__isnull=True),
                name="message_step_or_idea_not_both",
            ),
        ]

    def __str__(self) -> str:
        if self.is_system:
            return f"system @ {self.travel}: {self.system_key}"
        return f"{self.traveler} @ {self.travel}: {self.body[:30]}"

    def clean(self) -> None:
        super().clean()
        errors: dict[str, list[ValidationError]] = {}

        def add_error(field: str, message: str, code: str) -> None:
            errors.setdefault(field, []).append(ValidationError(message, code=code))

        if self.is_system and self.traveler_id:
            add_error(
                "traveler",
                "A system message cannot have an author.",
                "system_message_has_author",
            )
        elif self._state.adding and not self.is_system:
            if not self.traveler_id:
                add_error(
                    "traveler",
                    "A message must have an author.",
                    "message_author_required",
                )
            elif self.travel_id and not is_travel_member(
                self.travel_id, self.traveler_id
            ):
                add_error(
                    "traveler",
                    "The author must be a participant of the travel.",
                    "message_author_not_member",
                )

        if self.is_system:
            if not self.system_key:
                add_error(
                    "system_key",
                    "A system message must have a system key.",
                    "system_key_required",
                )
        else:
            if self.system_key:
                add_error(
                    "system_key",
                    "Only a system message can have a system key.",
                    "system_key_forbidden",
                )

            if not self.body:
                add_error(
                    "body",
                    "A message must have a body.",
                    "message_body_required",
                )

        if self.step_id and self.idea_id:
            add_error(
                "idea",
                "A message is attached to a step or an idea, not both.",
                "message_step_idea_conflict",
            )

        if self.step_id and self.travel_id and self.step.travel_id != self.travel_id:
            add_error(
                "step",
                "The step must belong to the same travel as the message.",
                "step_not_in_message_travel",
            )

        if self.idea_id and self.travel_id and self.idea.travel_id != self.travel_id:
            add_error(
                "idea",
                "The idea must belong to the same travel as the message.",
                "idea_not_in_message_travel",
            )

        if errors:
            raise ValidationError(errors)
