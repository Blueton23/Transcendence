import datetime

from django.db import IntegrityError, transaction
from django.test import TestCase

from travel.models import (
    Participation,
    ParticipationStatus,
    Step,
    Travel,
    TravelStatus,
)
from traveler.models import Traveler


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
