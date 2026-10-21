import datetime

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from chat.models import MESSAGE_BODY_MAX_LENGTH, Message
from chat.serializers import MessageSerializer
from idea.models import Idea, IdeaType
from travel.models import Participation, ParticipationStatus, Step, Travel
from traveler.models import Traveler

COORDS = {"latitude": 45.0, "longitude": 6.0}


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
            **COORDS,
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

    def test_orphaned_message_can_still_be_deleted(self):
        message = self._make_message()
        self.traveler.delete()
        message.refresh_from_db()

        message.delete()

        self.assertFalse(Message.objects.filter(id=message.id).exists())

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
            **COORDS,
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

    # --- Suppression ---

    def test_delete_removes_the_row(self):
        message = self._make_message()
        message_id = message.id

        message.delete()

        self.assertFalse(Message.objects.filter(id=message_id).exists())

    # --- Non-lus ---

    def test_everything_from_others_is_unread_before_first_read(self):
        mine = self._make_message()
        theirs = self._make_message(traveler=self.other)
        self._make_message(traveler=None, is_system=True)

        unread = Message.objects.unread_for(self.participation)

        self.assertEqual(list(unread), [theirs])
        self.assertNotIn(mine, unread)

    def test_mark_read_clears_unread_until_a_new_message(self):
        self._make_message(traveler=self.other)

        self.participation.mark_read()

        self.assertFalse(Message.objects.unread_for(self.participation).exists())

        new = self._make_message(traveler=self.other)

        self.assertEqual(list(Message.objects.unread_for(self.participation)), [new])

    def test_unread_ignores_deleted_messages_and_other_travels(self):
        self._make_message(traveler=self.other).delete()
        Participation.objects.create(
            traveler=self.other,
            travel=self.other_travel,
            status=ParticipationStatus.ACCEPTED,
        )
        Message.objects.create(
            travel=self.other_travel, traveler=self.other, body="Elsewhere"
        )

        self.assertFalse(Message.objects.unread_for(self.participation).exists())


class ChatViewsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.traveler = Traveler.objects.create_user(
            username="alice_api",
            email="alice_api@example.com",
            password="password123",
        )
        self.other = Traveler.objects.create_user(
            username="bob_api",
            email="bob_api@example.com",
            password="password123",
        )
        self.stranger = Traveler.objects.create_user(
            username="carol_api",
            email="carol_api@example.com",
            password="password123",
        )

        self.travel = Travel.objects.create(
            title="Road trip API",
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

        self.messages_url = reverse(
            "travel-messages",
            kwargs={"travel_id": self.travel.pk},
        )
        self.unread_count_url = reverse(
            "travel-unread-count",
            kwargs={"travel_id": self.travel.pk},
        )
        self.mark_read_url = reverse(
            "travel-mark-read",
            kwargs={"travel_id": self.travel.pk},
        )

    def test_non_member_get_receives_403(self):
        self.client.force_authenticate(user=self.stranger)

        response = self.client.get(self.messages_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_member_post_receives_403(self):
        self.client.force_authenticate(user=self.stranger)

        response = self.client.post(
            self.messages_url,
            {"body": "Hello!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Message.objects.filter(travel=self.travel).exists())

    def test_left_member_can_read_messages(self):
        self.participation.status = ParticipationStatus.LEFT
        self.participation.save()

        Message.objects.create(
            travel=self.travel,
            traveler=self.other,
            body="Message sent before departure",
        )

        self.client.force_authenticate(user=self.traveler)
        response = self.client.get(self.messages_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["body"],
            "Message sent before departure",
        )

    def test_left_member_cannot_send_messages(self):
        self.participation.status = ParticipationStatus.LEFT
        self.participation.save()

        self.client.force_authenticate(user=self.traveler)
        response = self.client.post(
            self.messages_url,
            {"body": "I should not be able to send this"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            Message.objects.filter(
                travel=self.travel,
                body="I should not be able to send this",
            ).exists()
        )

    def test_empty_message_is_rejected(self):
        self.client.force_authenticate(user=self.traveler)

        for body in ("", "   ", "\n\t"):
            with self.subTest(body=repr(body)):
                response = self.client.post(
                    self.messages_url,
                    {"body": body},
                    format="json",
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_400_BAD_REQUEST,
                )

    def test_message_over_max_length_is_rejected(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            self.messages_url,
            {"body": "a" * (MESSAGE_BODY_MAX_LENGTH + 1)},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_message_at_max_length_is_accepted(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            self.messages_url,
            {"body": "a" * MESSAGE_BODY_MAX_LENGTH},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_mark_read_resets_unread_count_to_zero(self):
        Message.objects.create(
            travel=self.travel,
            traveler=self.other,
            body="Unread message",
        )

        self.client.force_authenticate(user=self.traveler)

        unread_response = self.client.get(self.unread_count_url)
        self.assertEqual(unread_response.status_code, status.HTTP_200_OK)
        self.assertEqual(unread_response.data["unread_count"], 1)

        mark_read_response = self.client.post(self.mark_read_url)
        self.assertEqual(
            mark_read_response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(mark_read_response.data, {"success": True})

        unread_response = self.client.get(self.unread_count_url)
        self.assertEqual(unread_response.status_code, status.HTTP_200_OK)
        self.assertEqual(unread_response.data["unread_count"], 0)


class MessageSerializerTest(TestCase):
    def test_empty_body_is_invalid(self):
        for body in ("", "   ", "\n\t"):
            with self.subTest(body=repr(body)):
                serializer = MessageSerializer(data={"body": body})

                self.assertFalse(serializer.is_valid())
                self.assertIn("body", serializer.errors)

    def test_body_over_max_length_is_invalid(self):
        serializer = MessageSerializer(
            data={
                "body": "a" * (MESSAGE_BODY_MAX_LENGTH + 1),
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("body", serializer.errors)

    def test_body_at_max_length_is_valid(self):
        serializer = MessageSerializer(
            data={
                "body": "a" * MESSAGE_BODY_MAX_LENGTH,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            len(serializer.validated_data["body"]),
            MESSAGE_BODY_MAX_LENGTH,
        )

    def test_body_is_trimmed(self):
        serializer = MessageSerializer(data={"body": "  Hello world  "})

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["body"],
            "Hello world",
        )
