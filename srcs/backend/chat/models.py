from typing import ClassVar

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator
from django.db import models
from django.db.models import CheckConstraint, Q
from django.utils import timezone

from common.models import TimeStampedModel, ValidatedModel
from idea.models import Idea
from travel.models import Participation, Step, Travel, is_travel_member

MESSAGE_BODY_MAX_LENGTH = 2000


class MessageQuerySet(models.QuerySet):
    def alive(self) -> "MessageQuerySet":
        return self.filter(deleted_at__isnull=True)

    def trashed(self) -> "MessageQuerySet":
        return self.filter(deleted_at__isnull=False)

    # Non-lus d'un participant : les messages des autres, arrives depuis son
    # dernier passage (tous si le chat n'a jamais ete ouvert).
    def unread_for(self, participation: Participation) -> "MessageQuerySet":
        unread = (
            self.alive()
            .filter(travel_id=participation.travel_id)
            .exclude(traveler_id=participation.traveler_id)
        )
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
    body = models.TextField(validators=[MaxLengthValidator(MESSAGE_BODY_MAX_LENGTH)])
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

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
        author = "system" if self.is_system else self.traveler
        return f"{author} @ {self.travel}: {self.body[:30]}"

    @property
    def is_trashed(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self) -> None:
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self) -> None:
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}

        if self.is_system and self.traveler_id:
            errors["traveler"] = "A system message cannot have an author."
        # A la creation seulement : un message dont l'auteur a disparu (SET NULL)
        # ou a ete retire du voyage doit rester modifiable.
        elif self._state.adding and not self.is_system:
            if not self.traveler_id:
                errors["traveler"] = "A message must have an author."
            elif self.travel_id and not is_travel_member(
                self.travel_id, self.traveler_id
            ):
                errors["traveler"] = "The author must be a participant of the travel."

        if self.step_id and self.idea_id:
            errors["idea"] = "A message is attached to a step or an idea, not both."

        if self.step_id and self.travel_id and self.step.travel_id != self.travel_id:
            errors["step"] = "The step must belong to the same travel as the message."

        if (
            self.idea_id
            and self.travel_id
            and self.idea.travel_id != self.travel_id
            and "idea" not in errors
        ):
            errors["idea"] = "The idea must belong to the same travel as the message."

        if errors:
            raise ValidationError(errors)
