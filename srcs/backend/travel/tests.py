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

    def test_create_step_defaults(self):
        step = Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        self.assertEqual(step.nights, 0)
        self.assertIsNone(step.latitude)
        self.assertIsNone(step.longitude)
        self.assertIsNone(step.deleted_at)
        self.assertFalse(step.is_trashed)
        self.assertIsNotNone(step.created_at)
        self.assertIsNotNone(step.updated_at)

    def test_ordering_by_position(self):
        Step.objects.create(travel=self.travel, position=2, localisation="Nice")
        Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        Step.objects.create(travel=self.travel, position=3, localisation="Menton")

        self.assertEqual(
            [s.localisation for s in self.travel.steps.all()],
            ["Lyon", "Nice", "Menton"],
        )

    def test_related_name_steps(self):
        step = Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        self.assertIn(step, self.travel.steps.all())

    def test_cascade_delete_on_travel_removal(self):
        step = Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        step_id = step.id

        self.travel.delete()

        self.assertFalse(Step.objects.filter(id=step_id).exists())

    def test_unique_position_per_travel_raises_integrity_error(self):
        Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        with self.assertRaises(IntegrityError), transaction.atomic():
            Step.objects.create(travel=self.travel, position=1, localisation="Paris")

    def test_same_position_allowed_on_different_travels(self):
        other_travel = Travel.objects.create(
            title="Second trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        Step.objects.create(travel=other_travel, position=1, localisation="Lyon")

        self.assertEqual(Step.objects.filter(position=1).count(), 2)

    def test_soft_delete_frees_the_position(self):
        step = Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        step.soft_delete()

        self.assertTrue(step.is_trashed)
        self.assertIsNotNone(step.deleted_at)

        reused = Step.objects.create(
            travel=self.travel, position=1, localisation="Grenoble"
        )
        self.assertEqual(Step.objects.alive().get(position=1), reused)
        self.assertIn(step, Step.objects.trashed())

    def test_restore(self):
        step = Step.objects.create(travel=self.travel, position=1, localisation="Lyon")
        step.soft_delete()
        step.restore()

        self.assertFalse(step.is_trashed)
        self.assertIn(step, Step.objects.alive())

    def test_str_representation(self):
        step = Step.objects.create(travel=self.travel, position=2, localisation="Nice")
        self.assertEqual(str(step), f"{self.travel} #2 - Nice")
