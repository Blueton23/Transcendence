import datetime
from unittest.mock import patch

from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.db import IntegrityError, transaction
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from rest_framework.test import APITestCase

from chat.models import Message
from common.realtime import travel_group
from common.testing import BroadcastListenerMixin, WebsocketCommunicator
from config.asgi import application
from idea.models import (
    Idea,
    IdeaType,
)
from travel.consumers import (
    CLOSE_NOT_AUTHENTICATED,
    CLOSE_NOT_PARTICIPANT,
    TravelConsumer,
)
from travel.models import (
    Participation,
    ParticipationStatus,
    Step,
    Travel,
    TravelStatus,
    is_travel_member,
)
from travel.serializers import StepSerializer, TravelSerializer
from traveler.models import Traveler

COORDS = {"latitude": 46.5197, "longitude": 6.6323}

# --- Model tests ---


class TravelModelTest(TestCase):
    def test_create_travel(self):
        travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        self.assertEqual(travel.title, "Road trip")
        self.assertEqual(travel.status, TravelStatus.CURRENT)

    def test_invite_token_is_generated_and_unique(self):
        travel_a = Travel.objects.create(
            title="Trip A",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        travel_b = Travel.objects.create(
            title="Trip B",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 15),
        )
        self.assertTrue(travel_a.invite_token)
        self.assertNotEqual(travel_a.invite_token, travel_b.invite_token)

    def test_duplicate_invite_token_raises_integrity_error(self):
        Travel.objects.create(
            title="Trip A",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
            invite_token="shared-token",
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            Travel.objects.create(
                title="Trip B",
                start_date=datetime.date(2026, 7, 1),
                end_date=datetime.date(2026, 7, 15),
                invite_token="shared-token",
            )

    def test_end_date_before_start_date_raises_integrity_error(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Travel.objects.create(
                title="Backwards trip",
                start_date=datetime.date(2026, 6, 15),
                end_date=datetime.date(2026, 6, 1),
            )

    def test_str_representation(self):
        travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        self.assertEqual(str(travel), "Road trip")


class ParticipationModelTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
        )
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )

    def test_create_participation_default_status_invited(self):
        participation = Participation.objects.create(
            traveler=self.traveler, travel=self.travel
        )
        self.assertEqual(participation.status, ParticipationStatus.INVITED)
        self.assertIsNone(participation.left_at)
        self.assertIsNotNone(participation.created_at)

    def test_duplicate_participation_raises_integrity_error(self):
        Participation.objects.create(traveler=self.traveler, travel=self.travel)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Participation.objects.create(traveler=self.traveler, travel=self.travel)

    def test_cascade_delete_on_travel_removal(self):
        participation = Participation.objects.create(
            traveler=self.traveler, travel=self.travel
        )
        participation_id = participation.id

        self.travel.delete()

        self.assertFalse(Participation.objects.filter(id=participation_id).exists())

    def test_cascade_delete_on_traveler_removal(self):
        participation = Participation.objects.create(
            traveler=self.traveler, travel=self.travel
        )
        participation_id = participation.id

        self.traveler.delete()

        self.assertFalse(Participation.objects.filter(id=participation_id).exists())

    def test_related_names(self):
        participation = Participation.objects.create(
            traveler=self.traveler, travel=self.travel
        )

        self.assertIn(participation, self.traveler.participations.all())
        self.assertIn(participation, self.travel.participations.all())

    def test_last_read_at_is_empty_until_marked_read(self):
        participation = Participation.objects.create(
            traveler=self.traveler, travel=self.travel
        )
        self.assertIsNone(participation.last_read_at)

        participation.mark_read()

        participation.refresh_from_db()
        self.assertIsNotNone(participation.last_read_at)

    def test_is_travel_member_depends_on_status(self):
        self.assertFalse(is_travel_member(self.travel.id, self.traveler.id))

        participation = Participation.objects.create(
            traveler=self.traveler, travel=self.travel
        )
        expected = {
            ParticipationStatus.INVITED: False,
            ParticipationStatus.ACCEPTED: True,
            ParticipationStatus.REFUSED: False,
            ParticipationStatus.LEFT: True,
        }
        for status, is_member in expected.items():
            participation.status = status
            participation.save()
            self.assertEqual(
                is_travel_member(self.travel.id, self.traveler.id), is_member
            )


class StepModelTest(TestCase):
    def setUp(self):
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )

    def _make_step(self, **overrides):
        data = {
            "travel": self.travel,
            "localisation": "Lyon",
            "start_date": datetime.date(2026, 6, 2),
            "end_date": datetime.date(2026, 6, 4),
            "latitude": 46.5197,
            "longitude": 6.6323,
        }
        data.update(overrides)
        return Step.objects.create(**data)

    def test_create_step_defaults(self):
        step = self._make_step()
        self.assertIsNone(step.priority)
        self.assertIsNone(step.deleted_at)
        self.assertFalse(step.is_trashed)
        self.assertIsNotNone(step.created_at)
        self.assertIsNotNone(step.updated_at)

    def test_ordering_by_dates_then_priority(self):
        self._make_step(
            localisation="Nice",
            start_date=datetime.date(2026, 6, 5),
            end_date=datetime.date(2026, 6, 6),
        )
        self._make_step(
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 3),
        )
        self._make_step(
            localisation="Menton",
            start_date=datetime.date(2026, 6, 5),
            end_date=datetime.date(2026, 6, 6),
            priority=1,
        )

        self.assertEqual(
            [s.localisation for s in self.travel.steps.all()],
            ["Lyon", "Menton", "Nice"],
        )

    def test_related_name_steps(self):
        step = self._make_step()
        self.assertIn(step, self.travel.steps.all())

    def test_cascade_delete_on_travel_removal(self):
        step = self._make_step()
        step_id = step.id

        self.travel.delete()

        self.assertFalse(Step.objects.filter(id=step_id).exists())

    def test_end_date_before_start_date_raises_integrity_error(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            self._make_step(
                start_date=datetime.date(2026, 6, 6),
                end_date=datetime.date(2026, 6, 4),
            )

    def test_unique_priority_per_travel_and_dates(self):
        self._make_step(priority=1)
        with self.assertRaises(IntegrityError), transaction.atomic():
            self._make_step(localisation="Paris", priority=1)

    def test_null_priority_is_not_deduplicated(self):
        self._make_step(priority=None)
        self._make_step(localisation="Paris", priority=None)

        self.assertEqual(self.travel.steps.filter(priority__isnull=True).count(), 2)

    def test_same_priority_allowed_on_different_dates(self):
        self._make_step(priority=1)
        self._make_step(
            localisation="Paris",
            start_date=datetime.date(2026, 6, 8),
            end_date=datetime.date(2026, 6, 9),
            priority=1,
        )

        self.assertEqual(self.travel.steps.filter(priority=1).count(), 2)

    def test_soft_delete_frees_the_priority(self):
        step = self._make_step(priority=1)
        step.soft_delete()

        self.assertTrue(step.is_trashed)
        self.assertIsNotNone(step.deleted_at)

        reused = self._make_step(localisation="Grenoble", priority=1)
        self.assertEqual(Step.objects.alive().get(priority=1), reused)
        self.assertIn(step, Step.objects.trashed())

    def test_restore(self):
        step = self._make_step()
        step.soft_delete()
        step.restore()

        self.assertFalse(step.is_trashed)
        self.assertIn(step, Step.objects.alive())

    def test_str_representation(self):
        step = self._make_step(
            localisation="Nice",
            start_date=datetime.date(2026, 6, 5),
            end_date=datetime.date(2026, 6, 7),
        )
        self.assertEqual(str(step), f"{self.travel} - Nice (2026-06-05 -> 2026-06-07)")

    def test_step_within_travel_range_leaves_travel_untouched(self):
        self._make_step(end_date=datetime.date(2026, 6, 15))
        self.travel.refresh_from_db()

        self.assertEqual(self.travel.end_date, datetime.date(2026, 6, 15))

    def test_step_end_date_past_travel_end_extends_the_travel(self):
        step = self._make_step(
            start_date=datetime.date(2026, 6, 10),
            end_date=datetime.date(2026, 6, 20),
        )
        self.travel.refresh_from_db()

        self.assertEqual(self.travel.end_date, datetime.date(2026, 6, 20))
        self.assertTrue(step.extend_travel_dates_to_fit() is False)

    def test_step_start_date_before_travel_start_extends_the_travel(self):
        self._make_step(
            start_date=datetime.date(2026, 5, 25),
            end_date=datetime.date(2026, 5, 28),
        )
        self.travel.refresh_from_db()

        self.assertEqual(self.travel.start_date, datetime.date(2026, 5, 25))
        self.assertEqual(self.travel.end_date, datetime.date(2026, 6, 15))


# --- Serializer tests ---


class TravelSerializerTest(TestCase):
    def setUp(self):
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 10),
        )

    def test_rejects_end_date_before_start_date(self):
        serializer = TravelSerializer(
            data={
                "title": "France Road Trip",
                "start_date": "2026-10-12",
                "end_date": "2026-10-11",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_date", serializer.errors)

    def test_seriaized_has_expected_keys(self):
        travel = Travel.objects.create(
            title="Road Trip Suisse",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
        )
        data = TravelSerializer(travel).data

        expected_keys = {
            "id",
            "travelers",
            "title",
            "start_date",
            "end_date",
            "nights",
            "invite_token",
            "status",
            "created_at",
            "updated_at",
        }
        self.assertEqual(set(data.keys()), expected_keys)

    def test_nights_is_computed(self):
        travel = Travel.objects.create(
            title="France Road Trip",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 10),
        )
        self.assertEqual(TravelSerializer(travel).data["nights"], 8)

    def test_travelers_includes_only_accepted_participation(self):
        accepted_traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        invited_traveler = Traveler.objects.create_user(
            username="bob", email="bob@example.com", password="password123"
        )
        Participation.objects.create(
            traveler=accepted_traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )
        Participation.objects.create(
            traveler=invited_traveler,
            travel=self.travel,
            status=ParticipationStatus.INVITED,
        )
        travelers = TravelSerializer(self.travel).data["travelers"]

        self.assertEqual(len(travelers), 1)
        self.assertEqual(travelers[0]["id"], accepted_traveler.id)


class StepSerializerTest(TestCase):
    def setUp(self):
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )

    def test_rejects_end_date_before_start_date(self):
        serializer = StepSerializer(
            data={
                "start_date": "2026-10-12",
                "end_date": "2026-10-11",
                "localisation": "Test",
                "latitude": 46.5197,
                "longitude": 6.6323,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_date", serializer.errors)

    def test_seriaized_has_expected_keys(self):
        step = Step.objects.create(
            travel=self.travel,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
            **COORDS,
        )
        data = StepSerializer(step).data

        expected_keys = {
            "id",
            "travel_id",
            "priority",
            "start_date",
            "end_date",
            "nights",
            "idea_count",
            "localisation",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        }
        self.assertEqual(set(data.keys()), expected_keys)

    def test_nights_is_computed(self):
        step = Step.objects.create(
            travel=self.travel,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
            **COORDS,
        )
        self.assertEqual(StepSerializer(step).data["nights"], 2)

    def test_rejects_coordinates_out_of_range(self):
        serializer = StepSerializer(
            data={
                "start_date": "2026-06-02",
                "end_date": "2026-06-03",
                "localisation": "Nice",
                "latitude": -120,
                "longitude": -200,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("latitude", serializer.errors)
        self.assertIn("longitude", serializer.errors)

    def test_missing_coordinates(self):
        serializer = StepSerializer(
            data={
                "start_date": "2026-06-02",
                "end_date": "2026-06-03",
                "localisation": "Nice",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("latitude", serializer.errors)
        self.assertIn("longitude", serializer.errors)

    def test_idea_counts_is_computed(self):
        step = Step.objects.create(
            travel=self.travel,
            localisation="Paris",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
            **COORDS,
        )
        other_step = Step.objects.create(
            travel=self.travel,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 5),
            end_date=datetime.date(2026, 6, 8),
            **COORDS,
        )
        traveler = Traveler.objects.create_user(
            username="alice", password="Password-123!"
        )
        Idea.objects.create(
            travel=self.travel,
            traveler=traveler,
            step=step,
            title="Musée",
            type=IdeaType.ACTIVITY,
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 2),
        )
        self.assertEqual(StepSerializer(step).data["idea_count"], 1)
        self.assertEqual(StepSerializer(other_step).data["idea_count"], 0)


# --- View tests ---


class TravelViewTest(APITestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.mon_voyage = Travel.objects.create(
            title="Mon voyage",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        Participation.objects.create(
            traveler=self.traveler,
            travel=self.mon_voyage,
            status=ParticipationStatus.ACCEPTED,
        )

        self.autre_voyage = Travel.objects.create(
            title="Voyage de quelqu'un d'autre",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 15),
        )

    def test_list_returns_only_my_travels(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(reverse("travel-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.mon_voyage.id)

    def test_cant_access_travel_with_no_participation(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse("travel-detail", kwargs={"pk": self.autre_voyage.id})
        )

        self.assertEqual(response.status_code, 404)

    def test_create_travel_makes_traveler_participant(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("travel-list"),
            {
                "title": "Nouveau voyage",
                "start_date": "2026-08-01",
                "end_date": "2026-08-05",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )

        self.assertEqual(response.status_code, 201)
        nouveau_voyage_id = response.data["id"]
        self.assertTrue(
            Participation.objects.filter(
                travel_id=nouveau_voyage_id,
                traveler=self.traveler,
                status=ParticipationStatus.ACCEPTED,
            )
        )

    def test_traveler_sees_new_travel_in_list(self):
        self.client.force_authenticate(user=self.traveler)

        self.client.post(
            reverse("travel-list"),
            {
                "title": "Nouvelle aventure",
                "start_date": "2026-08-06",
                "end_date": "2026-08-12",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )

        response = self.client.get(reverse("travel-list"))

        self.assertEqual(len(response.data), 2)
        titles = [t["title"] for t in response.data]
        self.assertIn("Nouvelle aventure", titles)

    # Tests for TravelJoinView

    def test_unknown_invite_token(self):
        self.client.force_authenticate(user=self.traveler)
        response = self.client.get(
            reverse("travel-join", kwargs={"token": "im_an_unknown_token"})
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("No Travel", response.data["message"])

    def test_traveler_is_not_connected(self):

        response = self.client.get(
            reverse("travel-join", kwargs={"token": self.mon_voyage.invite_token})
        )
        self.assertEqual(response.status_code, 403)

    def test_traveler_has_left_and_comes_back(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("travel-leave", kwargs={"travel_id": self.mon_voyage.id})
        )

        participation = Participation.objects.get(
            travel=self.mon_voyage, traveler=self.traveler
        )

        self.assertEqual(participation.status, ParticipationStatus.LEFT)
        self.assertIsNotNone(participation.left_at)

        response = self.client.post(
            reverse("travel-join", kwargs={"token": self.mon_voyage.invite_token})
        )
        self.assertEqual(response.status_code, 200)
        participation.refresh_from_db()
        self.assertEqual(participation.status, ParticipationStatus.ACCEPTED)
        self.assertIsNone(participation.left_at)

    def test_traveler_has_already_joined_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse("travel-join", kwargs={"token": self.mon_voyage.invite_token})
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["is_member"], True)

    def test_traveler_joins_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("travel-join", kwargs={"token": self.autre_voyage.invite_token})
        )
        self.assertEqual(response.status_code, 200)
        participation = Participation.objects.get(
            travel=self.autre_voyage, traveler=self.traveler
        )
        self.assertEqual(participation.status, ParticipationStatus.ACCEPTED)

    def test_traveler_non_member_sees_preview_without_joining(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse("travel-join", kwargs={"token": self.autre_voyage.invite_token})
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["is_member"], False)
        self.assertFalse(
            Participation.objects.filter(
                travel=self.autre_voyage, traveler=self.traveler
            ).exists()
        )

    # Test for LeaveTravelView
    def test_traveler_leaves_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("travel-leave", kwargs={"travel_id": self.mon_voyage.id})
        )

        self.assertEqual(response.status_code, 204)
        participation = Participation.objects.get(
            travel=self.mon_voyage, traveler=self.traveler
        )
        self.assertEqual(participation.status, ParticipationStatus.LEFT)
        self.assertIsNotNone(participation.left_at)

    def test_traveler_travels_in_list_after_leaving(self):
        self.client.force_authenticate(user=self.traveler)

        self.client.post(
            reverse("travel-leave", kwargs={"travel_id": self.mon_voyage.id})
        )

        response = self.client.get(reverse("travel-list"))

        self.assertEqual(len(response.data), 0)
        titles = [t["title"] for t in response.data]
        self.assertNotIn("Mon voyage", titles)


class StepViewTest(APITestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.mon_voyage = Travel.objects.create(
            title="Mon voyage",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        Participation.objects.create(
            traveler=self.traveler,
            travel=self.mon_voyage,
            status=ParticipationStatus.ACCEPTED,
        )

        self.mon_step = Step.objects.create(
            travel=self.mon_voyage,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 3),
            **COORDS,
        )

        self.autre_voyage = Travel.objects.create(
            title="Voyage de quelqu'un d'autre",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 15),
        )

        self.autre_step = Step.objects.create(
            travel=self.autre_voyage,
            localisation="Paris",
            start_date=datetime.date(2026, 7, 3),
            end_date=datetime.date(2026, 7, 4),
            **COORDS,
        )

    def test_list_returns_only_steps_of_this_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id})
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.mon_step.id)

    def test_soft_delete_instead_of_hard_delete(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.delete(
            reverse(
                "step-detail",
                kwargs={"travel_id": self.mon_voyage.id, "pk": self.mon_step.id},
            )
        )

        self.assertEqual(response.status_code, 204)
        self.mon_step.refresh_from_db()
        self.assertIsNotNone(self.mon_step.deleted_at)
        self.assertTrue(Step.objects.filter(id=self.mon_step.id).exists())

    def test_create_succeeded_step_add_to_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id}),
            {
                "start_date": "2026-06-10",
                "end_date": "2026-06-12",
                "localisation": "Nice",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["travel_id"], self.mon_voyage.id)

    def test_create_forbidden_if_not_participant(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("step-list", kwargs={"travel_id": self.autre_voyage.id}),
            {
                "start_date": "2026-06-10",
                "end_date": "2026-06-12",
                "localisation": "Nice",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Step.objects.filter(localisation="Nice").count(), 0)

    def test_rejects_start_date_before_travel_start_date(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id}),
            {
                "start_date": "2026-05-02",
                "end_date": "2026-06-14",
                "localisation": "Lyon",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("start_date", response.data["details"])

    def test_rejects_end_date_after_travel_end_date(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id}),
            {
                "start_date": "2026-06-02",
                "end_date": "2026-06-17",
                "localisation": "Lyon",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data["details"])

    def test_rejects_dates_overlaping(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id}),
            {
                "start_date": "2026-06-02",
                "end_date": "2026-06-04",
                "localisation": "Lyon",
                "latitude": 46.5197,
                "longitude": 6.6323,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("start_date", response.data["details"])

    def test_403_is_traveler_has_not_accepted_participation(self):
        other_traveler = Traveler.objects.create_user(
            username="bobby", email="bobby@example.com", password="password123"
        )
        Participation.objects.create(
            traveler=other_traveler,
            travel=self.mon_voyage,
            status=ParticipationStatus.INVITED,
        )
        self.client.force_authenticate(user=other_traveler)

        response = self.client.get(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id})
        )
        self.assertEqual(response.status_code, 403)

    def test_403_traveler_is_not_connected(self):
        response = self.client.get(
            reverse("step-list", kwargs={"travel_id": self.mon_voyage.id})
        )

        self.assertEqual(response.status_code, 403)

    def test_access_wrong_step_from_travel_id(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse(
                "step-detail",
                kwargs={"pk": self.autre_step.id, "travel_id": self.mon_voyage.id},
            ),
        )
        self.assertEqual(response.status_code, 404)

    def test_patch_step_succeeds(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse(
                "step-detail",
                kwargs={"pk": self.mon_step.id, "travel_id": self.mon_voyage.id},
            ),
            {"localisation": "Fribourg"},
        )

        self.assertEqual(response.status_code, 200)
        self.mon_step.refresh_from_db()
        self.assertEqual(self.mon_step.localisation, "Fribourg")

    def test_patch_step_refused_if_not_participant(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse(
                "step-detail",
                kwargs={"pk": self.autre_step.id, "travel_id": self.autre_voyage.id},
            ),
            {"localisation": "Fribourg"},
        )
        self.assertEqual(response.status_code, 404)
        self.mon_step.refresh_from_db()
        self.assertEqual(self.autre_step.localisation, "Paris")


# --- WebSocket tests ---


class StepBroadcastTest(BroadcastListenerMixin, APITestCase):
    """Hits the real Redis channel layer configured in settings."""

    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.travel = Travel.objects.create(
            title="Mon voyage",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        Participation.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )
        self.step = Step.objects.create(
            travel=self.travel,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 3),
            **COORDS,
        )
        self.client.force_authenticate(user=self.traveler)
        self.listen_to(travel_group(self.travel.id))

    def request(self, method, url, data=None):
        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            response = getattr(self.client, method)(url, data, format="json")
        return response, callbacks

    def detail_url(self):
        return reverse(
            "step-detail", kwargs={"travel_id": self.travel.id, "pk": self.step.id}
        )

    def test_create_broadcasts_step_created(self):
        response, _ = self.request(
            "post",
            reverse("step-list", kwargs={"travel_id": self.travel.id}),
            {
                "localisation": "Annecy",
                "start_date": "2026-06-05",
                "end_date": "2026-06-07",
                **COORDS,
            },
        )

        self.assertEqual(response.status_code, 201)
        event = self.receive_event()
        self.assertEqual(event["type"], "step.created")
        self.assertEqual(event["payload"]["id"], response.data["id"])
        self.assertEqual(event["payload"]["travelId"], self.travel.id)
        self.assertEqual(event["payload"]["startDate"], "2026-06-05")

    def test_update_broadcasts_step_updated(self):
        response, _ = self.request("patch", self.detail_url(), {"localisation": "Nice"})

        self.assertEqual(response.status_code, 200)
        event = self.receive_event()
        self.assertEqual(event["type"], "step.updated")
        self.assertEqual(event["payload"]["localisation"], "Nice")

    def test_delete_broadcasts_step_deleted(self):
        response, _ = self.request("delete", self.detail_url())

        self.assertEqual(response.status_code, 204)
        self.assertEqual(
            self.receive_event(),
            {"type": "step.deleted", "payload": {"id": self.step.id}},
        )

    def test_invalid_update_broadcasts_nothing(self):
        response, callbacks = self.request(
            "patch", self.detail_url(), {"end_date": "2026-05-01"}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(callbacks, [])


class ParticipantBroadcastTest(BroadcastListenerMixin, APITestCase):
    """Joining and leaving a travel: system message, participant event, and
    the kick that closes the sockets of whoever left."""

    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.travel = Travel.objects.create(
            title="Mon voyage",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        self.client.force_authenticate(user=self.traveler)
        self.listen_to(travel_group(self.travel.id))

    def participate(self, status=ParticipationStatus.ACCEPTED):
        return Participation.objects.create(
            traveler=self.traveler, travel=self.travel, status=status
        )

    def post(self, url):
        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            response = self.client.post(url)
        return response, callbacks

    def join(self):
        return self.post(
            reverse("travel-join", kwargs={"token": self.travel.invite_token})
        )

    def leave(self):
        return self.post(reverse("travel-leave", kwargs={"travel_id": self.travel.id}))

    def assert_system_message(self, body):
        event = self.receive_event()
        self.assertEqual(event["type"], "chat.message")
        self.assertTrue(event["payload"]["isSystem"])
        self.assertIsNone(event["payload"]["traveler"])
        self.assertEqual(event["payload"]["body"], body)
        self.assertTrue(
            Message.objects.filter(
                travel=self.travel, is_system=True, body=body
            ).exists()
        )

    def test_leave_announces_then_kicks(self):
        self.participate()

        response, _ = self.leave()

        self.assertEqual(response.status_code, 204)
        self.assert_system_message("alice a quitté le voyage.")
        self.assertEqual(
            self.receive_event(),
            {
                "type": "participant.left",
                "payload": {"travelerId": self.traveler.id},
            },
        )
        # Internal event: snake_case and no "payload", never sent to clients.
        self.assertEqual(
            self.receive_event(),
            {"type": "travel.kick", "traveler_id": self.traveler.id},
        )

    def test_leave_without_being_member_announces_nothing(self):
        self.participate(ParticipationStatus.LEFT)

        response, callbacks = self.leave()

        self.assertEqual(response.status_code, 404)
        self.assertEqual(callbacks, [])
        self.assertFalse(Message.objects.filter(travel=self.travel).exists())

    def test_first_join_announces(self):
        response, _ = self.join()

        self.assertEqual(response.status_code, 200)
        self.assert_system_message("alice a rejoint le voyage.")
        self.assertEqual(
            self.receive_event(),
            {
                "type": "participant.joined",
                "payload": {"travelerId": self.traveler.id},
            },
        )

    def test_join_after_leaving_announces(self):
        self.participate(ParticipationStatus.LEFT)

        response, _ = self.join()

        self.assertEqual(response.status_code, 200)
        self.assert_system_message("alice a rejoint le voyage.")
        self.assertEqual(self.receive_event()["type"], "participant.joined")

    def test_join_as_member_announces_nothing(self):
        self.participate()

        response, callbacks = self.join()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(callbacks, [])
        self.assertFalse(Message.objects.filter(travel=self.travel).exists())


# TransactionTestCase: database_sync_to_async closes the connection that
# TestCase keeps open for its wrapping transaction.
class TravelConsumerTest(TransactionTestCase):
    """Hits the real Redis channel layer configured in settings."""

    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.travel = Travel.objects.create(
            title="Mon voyage",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        self.participation = Participation.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )

    def communicator(self, user, travel_id=None):
        return WebsocketCommunicator(
            TravelConsumer.as_asgi(),
            f"/ws/travels/{travel_id or self.travel.id}/",
            scope={
                "user": user,
                "url_route": {
                    "args": (),
                    "kwargs": {"travel_id": travel_id or self.travel.id},
                },
            },
        )

    async def assert_closed_with(self, communicator, code):
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        message = await communicator.receive_output(timeout=2)
        self.assertEqual(message, {"type": "websocket.close", "code": code})
        await communicator.disconnect()

    async def group_send(self, message):
        await get_channel_layer().group_send(travel_group(self.travel.id), message)

    async def test_participant_receives_group_events(self):
        communicator = self.communicator(self.traveler)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        event = {"type": "idea.created", "payload": {"ideaId": 1}}
        await self.group_send(event)

        self.assertEqual(await communicator.receive_json_from(), event)
        await communicator.disconnect()

    async def test_anonymous_is_closed_with_4401(self):
        await self.assert_closed_with(
            self.communicator(AnonymousUser()), CLOSE_NOT_AUTHENTICATED
        )

    async def test_stranger_is_closed_with_4403(self):
        stranger = await sync_to_async(Traveler.objects.create_user)(
            username="bob", email="bob@example.com", password="password123"
        )
        await self.assert_closed_with(
            self.communicator(stranger), CLOSE_NOT_PARTICIPANT
        )

    async def test_non_accepted_participations_are_closed_with_4403(self):
        for status in (
            ParticipationStatus.INVITED,
            ParticipationStatus.REFUSED,
            ParticipationStatus.LEFT,
        ):
            with self.subTest(status=status):
                self.participation.status = status
                await self.participation.asave()
                await self.assert_closed_with(
                    self.communicator(self.traveler), CLOSE_NOT_PARTICIPANT
                )

    async def test_unknown_travel_is_closed_with_4403(self):
        await self.assert_closed_with(
            self.communicator(self.traveler, travel_id=999999),
            CLOSE_NOT_PARTICIPANT,
        )

    async def test_rejected_socket_does_not_join_group(self):
        communicator = self.communicator(AnonymousUser())
        await communicator.connect()
        await communicator.receive_output(timeout=2)

        await self.group_send({"type": "idea.created", "payload": {}})

        self.assertTrue(await communicator.receive_nothing(timeout=0.2))
        await communicator.disconnect()

    async def test_disconnect_leaves_group(self):
        layer = get_channel_layer()
        communicator = self.communicator(self.traveler)
        await communicator.connect()

        with patch.object(
            layer, "group_discard", wraps=layer.group_discard
        ) as group_discard:
            await communicator.disconnect()

        group_discard.assert_awaited_once()
        self.assertEqual(group_discard.await_args.args[0], travel_group(self.travel.id))

    async def test_kick_closes_only_that_travelers_socket(self):
        bob = await sync_to_async(Traveler.objects.create_user)(
            username="bob", email="bob@example.com", password="password123"
        )
        await Participation.objects.acreate(
            traveler=bob, travel=self.travel, status=ParticipationStatus.ACCEPTED
        )
        alice_socket = self.communicator(self.traveler)
        bob_socket = self.communicator(bob)
        await alice_socket.connect()
        await bob_socket.connect()

        await self.group_send({"type": "travel.kick", "traveler_id": self.traveler.id})

        self.assertEqual(
            await alice_socket.receive_output(timeout=2),
            {"type": "websocket.close", "code": CLOSE_NOT_PARTICIPANT},
        )
        # The kick itself is internal: bob sees nothing, and still gets events.
        self.assertTrue(await bob_socket.receive_nothing(timeout=0.2))
        event = {"type": "idea.created", "payload": {"ideaId": 1}}
        await self.group_send(event)
        self.assertEqual(await bob_socket.receive_json_from(), event)
        self.assertTrue(await alice_socket.receive_nothing(timeout=0.2))

        await alice_socket.disconnect()
        await bob_socket.disconnect()

    async def test_client_messages_are_ignored(self):
        communicator = self.communicator(self.traveler)
        await communicator.connect()

        await communicator.send_json_to({"message": "hello"})

        self.assertTrue(await communicator.receive_nothing(timeout=0.2))
        await communicator.disconnect()


class TravelSocketRoutingTest(TransactionTestCase):
    """Goes through config.asgi.application: route, origin check and session
    auth from a real cookie."""

    ORIGIN = (b"origin", b"http://localhost")

    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.travel = Travel.objects.create(
            title="Mon voyage",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        Participation.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )

    def communicator(self, cookie=None):
        headers = [self.ORIGIN]
        if cookie:
            headers.append((b"cookie", cookie.encode()))
        return WebsocketCommunicator(
            application, f"/ws/travels/{self.travel.id}/", headers=headers
        )

    async def test_logged_in_participant_stays_connected(self):
        await sync_to_async(self.client.force_login)(self.traveler)
        session_id = self.client.cookies[settings.SESSION_COOKIE_NAME].value
        communicator = self.communicator(f"{settings.SESSION_COOKIE_NAME}={session_id}")

        connected, _ = await communicator.connect()

        self.assertTrue(connected)
        self.assertTrue(await communicator.receive_nothing(timeout=0.2))
        await communicator.disconnect()

    async def test_no_session_is_closed_with_4401(self):
        communicator = self.communicator()

        connected, _ = await communicator.connect()
        message = await communicator.receive_output(timeout=2)

        self.assertTrue(connected)
        self.assertEqual(
            message, {"type": "websocket.close", "code": CLOSE_NOT_AUTHENTICATED}
        )
        await communicator.disconnect()
