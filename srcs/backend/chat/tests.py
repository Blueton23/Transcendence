import datetime

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from chat.models import MESSAGE_BODY_MAX_LENGTH, Message
from idea.models import Idea, IdeaType
from travel.models import Participation, ParticipationStatus, Step, Travel
from traveler.models import Traveler


class MessageModelTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
        )
        self.other = Traveler.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="password123",
        )
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        self.participation = Participation.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )
        Participation.objects.create(
            traveler=self.other,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )
        self.step = Step.objects.create(
            travel=self.travel,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
        )
        self.idea = Idea.objects.create(
            travel=self.travel,
            traveler=self.other,
            title="Bouchon lyonnais",
            type=IdeaType.RESTAURANT,
        )
        self.other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )

    def _make_message(self, **overrides):
        data = {
            "travel": self.travel,
            "traveler": self.traveler,
            "body": "On part a quelle heure ?",
        }
        data.update(overrides)
        return Message.objects.create(**data)

    # --- Creation et relations ---

    def test_create_message_defaults(self):
        message = self._make_message()
        self.assertFalse(message.is_system)
        self.assertIsNone(message.step_id)
        self.assertIsNone(message.idea_id)
        self.assertIsNone(message.deleted_at)
        self.assertFalse(message.is_trashed)
        self.assertIsNotNone(message.created_at)
        self.assertIsNotNone(message.updated_at)

    def test_related_names(self):
        on_step = self._make_message(step=self.step)
        on_idea = self._make_message(idea=self.idea)

        self.assertIn(on_step, self.travel.messages.all())
        self.assertIn(on_step, self.traveler.messages.all())
        self.assertIn(on_step, self.step.messages.all())
        self.assertIn(on_idea, self.idea.messages.all())

    def test_ordering_is_oldest_first(self):
        first = self._make_message(body="first")
        second = self._make_message(body="second")
        third = self._make_message(body="third")

        self.assertEqual(list(self.travel.messages.all()), [first, second, third])

    def test_str_representation(self):
        message = self._make_message(body="Hello")
        self.assertEqual(str(message), "alice @ Road trip: Hello")

        system = self._make_message(traveler=None, is_system=True, body="Bob joined")
        self.assertEqual(str(system), "system @ Road trip: Bob joined")

    # --- Suppressions en cascade ---

    def test_cascade_delete_on_travel_removal(self):
        message_id = self._make_message().id

        self.travel.delete()

        self.assertFalse(Message.objects.filter(id=message_id).exists())

    def test_author_removal_keeps_the_message_without_author(self):
        message = self._make_message()

        self.traveler.delete()

        message.refresh_from_db()
        self.assertIsNone(message.traveler_id)
        self.assertFalse(message.is_system)

    def test_orphaned_message_can_still_be_soft_deleted(self):
        message = self._make_message()
        self.traveler.delete()
        message.refresh_from_db()

        message.soft_delete()

        message.refresh_from_db()
        self.assertTrue(message.is_trashed)

    def test_step_hard_delete_keeps_the_message_on_the_travel(self):
        message = self._make_message(step=self.step)

        self.step.delete()

        message.refresh_from_db()
        self.assertIsNone(message.step_id)
        self.assertEqual(message.travel_id, self.travel.id)

    def test_step_soft_delete_keeps_the_link(self):
        message = self._make_message(step=self.step)

        self.step.soft_delete()

        message.refresh_from_db()
        self.assertEqual(message.step_id, self.step.id)

    def test_idea_hard_delete_keeps_the_message_on_the_travel(self):
        message = self._make_message(idea=self.idea)

        self.idea.delete()

        message.refresh_from_db()
        self.assertIsNone(message.idea_id)
        self.assertEqual(message.travel_id, self.travel.id)

    # --- Auteur et messages systeme ---

    def test_system_message_has_no_author(self):
        message = self._make_message(traveler=None, is_system=True)
        self.assertTrue(message.is_system)
        self.assertIsNone(message.traveler_id)

    def test_system_message_with_author_is_rejected(self):
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(is_system=True)
        self.assertIn("traveler", ctx.exception.message_dict)

    def test_database_rejects_system_message_with_author(self):
        message = self._make_message()
        with self.assertRaises(IntegrityError), transaction.atomic():
            Message.objects.filter(pk=message.pk).update(is_system=True)

    def test_message_without_author_is_rejected(self):
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(traveler=None)
        self.assertIn("traveler", ctx.exception.message_dict)

    def test_author_outside_the_travel_is_rejected(self):
        stranger = Traveler.objects.create_user(
            username="carol",
            email="carol@example.com",
            password="password123",
        )
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(traveler=stranger)
        self.assertIn("traveler", ctx.exception.message_dict)

    def test_invited_traveler_cannot_write(self):
        self.participation.status = ParticipationStatus.INVITED
        self.participation.save()

        with self.assertRaises(ValidationError):
            self._make_message()

    def test_message_stays_editable_after_its_author_left(self):
        message = self._make_message()
        self.participation.status = ParticipationStatus.REFUSED
        self.participation.save()

        message.body = "Edited"
        message.save()

        message.refresh_from_db()
        self.assertEqual(message.body, "Edited")

    # --- Rattachement a une etape ou une idee ---

    def test_step_and_idea_together_are_rejected(self):
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(step=self.step, idea=self.idea)
        self.assertIn("idea", ctx.exception.message_dict)

    def test_database_rejects_step_and_idea_together(self):
        message = self._make_message(step=self.step)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Message.objects.filter(pk=message.pk).update(idea=self.idea)

    def test_step_from_another_travel_is_rejected(self):
        foreign_step = Step.objects.create(
            travel=self.other_travel,
            localisation="Nice",
            start_date=datetime.date(2026, 7, 2),
            end_date=datetime.date(2026, 7, 4),
        )
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(step=foreign_step)
        self.assertIn("step", ctx.exception.message_dict)

    def test_idea_from_another_travel_is_rejected(self):
        foreign_idea = Idea.objects.create(
            travel=self.other_travel,
            traveler=self.other,
            title="Socca",
            type=IdeaType.RESTAURANT,
        )
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(idea=foreign_idea)
        self.assertIn("idea", ctx.exception.message_dict)

    # --- Contenu ---

    def test_blank_body_is_rejected(self):
        with self.assertRaises(ValidationError) as ctx:
            self._make_message(body="")
        self.assertIn("body", ctx.exception.message_dict)

    def test_body_over_max_length_is_rejected(self):
        self._make_message(body="a" * MESSAGE_BODY_MAX_LENGTH)

        with self.assertRaises(ValidationError) as ctx:
            self._make_message(body="a" * (MESSAGE_BODY_MAX_LENGTH + 1))
        self.assertIn("body", ctx.exception.message_dict)

    # --- Corbeille ---

    def test_soft_delete_and_restore(self):
        message = self._make_message()

        message.soft_delete()

        self.assertTrue(message.is_trashed)
        self.assertNotIn(message, Message.objects.alive())
        self.assertIn(message, Message.objects.trashed())

        message.restore()

        self.assertFalse(message.is_trashed)
        self.assertIn(message, Message.objects.alive())
        self.assertNotIn(message, Message.objects.trashed())

    # --- Non-lus ---

    def test_everything_from_others_is_unread_before_first_read(self):
        mine = self._make_message()
        theirs = self._make_message(traveler=self.other)
        system = self._make_message(traveler=None, is_system=True)

        unread = Message.objects.unread_for(self.participation)

        self.assertEqual(list(unread), [theirs, system])
        self.assertNotIn(mine, unread)

    def test_mark_read_clears_unread_until_a_new_message(self):
        self._make_message(traveler=self.other)

        self.participation.mark_read()

        self.assertFalse(Message.objects.unread_for(self.participation).exists())

        new = self._make_message(traveler=self.other)

        self.assertEqual(list(Message.objects.unread_for(self.participation)), [new])

    def test_unread_ignores_trashed_messages_and_other_travels(self):
        trashed = self._make_message(traveler=self.other)
        trashed.soft_delete()
        Participation.objects.create(
            traveler=self.other,
            travel=self.other_travel,
            status=ParticipationStatus.ACCEPTED,
        )
        Message.objects.create(
            travel=self.other_travel, traveler=self.other, body="Elsewhere"
        )

        self.assertFalse(Message.objects.unread_for(self.participation).exists())
