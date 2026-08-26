import datetime

from django.db import IntegrityError, transaction
from django.test import TestCase

from travel.models import Participation, ParticipationStatus, Travel, TravelStatus
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
