from django.db import IntegrityError, transaction
from django.test import TestCase

from traveler.models import Friendship, Status, Traveler


class TravelerModelTest(TestCase):
    def test_create_traveler(self):
        traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
        )
        self.assertEqual(traveler.username, "alice")
        self.assertEqual(traveler.email, "alice@example.com")
        self.assertTrue(traveler.check_password("password123"))

    def test_default_field_values(self):
        traveler = Traveler.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="password123",
        )
        self.assertFalse(traveler.is_online)
        self.assertIsNone(traveler.profile_picture_url)
        self.assertIsNotNone(traveler.created_at)
        self.assertIsNotNone(traveler.updated_at)

    def test_updated_at_changes_on_save(self):
        traveler = Traveler.objects.create_user(
            username="carol",
            email="carol@example.com",
            password="password123",
        )
        first_updated_at = traveler.updated_at

        traveler.is_online = True
        traveler.save()

        self.assertGreater(traveler.updated_at, first_updated_at)

    def test_email_must_be_unique(self):
        Traveler.objects.create_user(
            username="dave",
            email="dave@example.com",
            password="password123",
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            Traveler.objects.create_user(
                username="dave2",
                email="dave@example.com",
                password="password123",
            )

    def test_str_representation(self):
        traveler = Traveler.objects.create_user(
            username="erin",
            email="erin@example.com",
            password="password123",
        )
        self.assertEqual(str(traveler), "erin")


class FriendshipModelTest(TestCase):
    def setUp(self):
        self.user_a = Traveler.objects.create_user(
            username="user_a",
            email="user_a@example.com",
            password="password123",
        )
        self.user_b = Traveler.objects.create_user(
            username="user_b",
            email="user_b@example.com",
            password="password123",
        )
        if self.user_a.pk > self.user_b.pk:
            self.user_a, self.user_b = self.user_b, self.user_a

    def test_create_friendship_default_status_pending(self):
        friendship = Friendship.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
        )
        self.assertEqual(friendship.status, Status.PENDING)
        self.assertIsNotNone(friendship.created_at)

    def test_friendship_status_can_be_accepted(self):
        friendship = Friendship.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=Status.ACCEPTED,
        )
        self.assertEqual(friendship.status, Status.ACCEPTED)

    def test_duplicate_friendship_raises_integrity_error(self):
        Friendship.objects.create(sender=self.user_a, receiver=self.user_b)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Friendship.objects.create(sender=self.user_a, receiver=self.user_b)

    def test_sender_must_be_less_than_receiver(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Friendship.objects.create(sender=self.user_b, receiver=self.user_a)

    def test_cascade_delete_on_sender_removal(self):
        friendship = Friendship.objects.create(sender=self.user_a, receiver=self.user_b)
        friendship_id = friendship.id

        self.user_a.delete()

        self.assertFalse(Friendship.objects.filter(id=friendship_id).exists())

    def test_cascade_delete_on_receiver_removal(self):
        friendship = Friendship.objects.create(sender=self.user_a, receiver=self.user_b)
        friendship_id = friendship.id

        self.user_b.delete()

        self.assertFalse(Friendship.objects.filter(id=friendship_id).exists())

    def test_related_names(self):
        friendship = Friendship.objects.create(sender=self.user_a, receiver=self.user_b)

        self.assertIn(friendship, self.user_a.friendships_as_sender.all())
        self.assertIn(friendship, self.user_b.friendships_as_receiver.all())
