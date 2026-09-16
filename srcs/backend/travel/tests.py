import datetime

from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase

from travel.models import (
    Participation,
    ParticipationStatus,
    Step,
    Travel,
    TravelStatus,
)
from travel.serializers import StepSerializer, TravelSerializer
from traveler.models import Traveler

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
        }
        data.update(overrides)
        return Step.objects.create(**data)

    def test_create_step_defaults(self):
        step = self._make_step()
        self.assertIsNone(step.priority)
        self.assertIsNone(step.latitude)
        self.assertIsNone(step.longitude)
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
        )
        self.assertEqual(StepSerializer(step).data["nights"], 2)


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
            },
        )

        response = self.client.get(reverse("travel-list"))

        self.assertEqual(len(response.data), 2)
        titles = [t["title"] for t in response.data]
        self.assertIn("Nouvelle aventure", titles)

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
        )

        self.autre_voyage = Travel.objects.create(
            title="Voyage de quelqu'un d'autre",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 15),
        )

        Step.objects.create(
            travel=self.autre_voyage,
            localisation="Paris",
            start_date=datetime.date(2026, 7, 3),
            end_date=datetime.date(2026, 7, 4),
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
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data["details"])
