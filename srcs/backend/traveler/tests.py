from io import BytesIO
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import requests
from asgiref.sync import sync_to_async
from authlib.integrations.django_client import OAuthError
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth import SESSION_KEY
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import TestCase, TransactionTestCase, override_settings
from django.urls import reverse
from joserfc.errors import BadSignatureError
from PIL import Image
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from common.consumers import CLOSE_NOT_AUTHENTICATED
from common.realtime import user_group
from common.testing import BroadcastListenerMixin, WebsocketCommunicator
from config.asgi import application
from traveler.consumers import NotificationConsumer
from traveler.models import Friendship, Status, Traveler
from traveler.presence import (
    reset_presence,
    traveler_connected,
    traveler_disconnected,
)
from traveler.serializers import (
    TravelerCreateSerializer,
    TravelerSerializer,
    TravelerUpdatePasswordSerializer,
    TravelerUpdateProfilePictureSerializer,
)


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
        self.assertFalse(traveler.profile_picture)
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

    def test_username_must_be_unique(self):
        Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
        )

        with self.assertRaises(IntegrityError), transaction.atomic():
            Traveler.objects.create_user(
                username="alice",
                email="alice2@example.com",
                password="password123",
            )

    def test_password_is_stored_hashed(self):
        password = "password123"

        traveler = Traveler.objects.create_user(
            username="hashed_user",
            email="hashed@example.com",
            password=password,
        )

        self.assertNotEqual(traveler.password, password)
        self.assertTrue(traveler.password.startswith("pbkdf2_"))
        self.assertTrue(traveler.check_password(password))

    def test_is_online_can_be_changed_directly(self):
        traveler = Traveler.objects.create_user(
            username="online_user",
            email="online@example.com",
            password="password123",
        )

        self.assertFalse(traveler.is_online)

        traveler.is_online = True
        traveler.save()
        traveler.refresh_from_db()

        self.assertTrue(traveler.is_online)


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
            user1=self.user_a,
            user2=self.user_b,
            requested_by=self.user_a,
        )
        self.assertEqual(friendship.status, Status.PENDING)
        self.assertIsNotNone(friendship.created_at)

    def test_friendship_status_can_be_accepted(self):
        friendship = Friendship.objects.create(
            user1=self.user_a,
            user2=self.user_b,
            requested_by=self.user_a,
            status=Status.ACCEPTED,
        )
        self.assertEqual(friendship.status, Status.ACCEPTED)

    def test_requested_by_tracks_the_initiator_regardless_of_user1_order(self):
        # user_b initiated the request even though it must be stored as
        # "user2" to satisfy the user1 < user2 ordering constraint.
        friendship = Friendship.objects.create(
            user1=self.user_a,
            user2=self.user_b,
            requested_by=self.user_b,
        )
        self.assertEqual(friendship.requested_by, self.user_b)
        self.assertIn(friendship, self.user_b.friendships_requested_by.all())

    def test_duplicate_friendship_raises_integrity_error(self):
        Friendship.objects.create(
            user1=self.user_a, user2=self.user_b, requested_by=self.user_a
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            Friendship.objects.create(
                user1=self.user_a, user2=self.user_b, requested_by=self.user_a
            )

    def test_user1_must_be_less_than_user2(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Friendship.objects.create(
                user1=self.user_b, user2=self.user_a, requested_by=self.user_b
            )

    def test_cascade_delete_on_user1_removal(self):
        friendship = Friendship.objects.create(
            user1=self.user_a, user2=self.user_b, requested_by=self.user_a
        )
        friendship_id = friendship.id

        self.user_a.delete()

        self.assertFalse(Friendship.objects.filter(id=friendship_id).exists())

    def test_cascade_delete_on_user2_removal(self):
        friendship = Friendship.objects.create(
            user1=self.user_a, user2=self.user_b, requested_by=self.user_a
        )
        friendship_id = friendship.id

        self.user_b.delete()

        self.assertFalse(Friendship.objects.filter(id=friendship_id).exists())

    def test_related_names(self):
        friendship = Friendship.objects.create(
            user1=self.user_a, user2=self.user_b, requested_by=self.user_a
        )

        self.assertIn(friendship, self.user_a.friendships_user1.all())
        self.assertIn(friendship, self.user_b.friendships_user2.all())
        self.assertIn(friendship, self.user_a.friendships_requested_by.all())


# --- Serializer tests ---


class TravelerSerializerTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
            first_name="Alice",
            last_name="Dupont",
        )

    def test_serialized_has_expected_keys(self):
        data = TravelerSerializer(self.traveler).data

        expected_keys = {
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
            "is_online",
            "created_at",
            "updated_at",
        }

        self.assertEqual(set(data.keys()), expected_keys)

    def test_serialized_data_matches_traveler(self):
        data = TravelerSerializer(self.traveler).data

        self.assertEqual(data["id"], self.traveler.id)
        self.assertEqual(data["username"], self.traveler.username)
        self.assertEqual(data["first_name"], self.traveler.first_name)
        self.assertEqual(data["last_name"], self.traveler.last_name)
        self.assertEqual(data["email"], self.traveler.email)
        self.assertEqual(data["is_online"], self.traveler.is_online)

    def test_profile_picture_is_none_when_not_set(self):
        data = TravelerSerializer(self.traveler).data

        self.assertIsNone(data["profile_picture"])

    def test_read_only_fields_are_not_updated(self):
        original_created_at = self.traveler.created_at
        original_updated_at = self.traveler.updated_at

        serializer = TravelerSerializer(
            self.traveler,
            data={
                "id": 9999,
                "username": "new_username",
                "is_online": True,
                "created_at": "2020-01-01T00:00:00Z",
                "updated_at": "2020-01-01T00:00:00Z",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()

        self.traveler.refresh_from_db()

        self.assertNotEqual(self.traveler.id, 9999)
        self.assertEqual(self.traveler.username, "new_username")
        self.assertFalse(self.traveler.is_online)
        self.assertEqual(self.traveler.created_at, original_created_at)
        self.assertGreaterEqual(self.traveler.updated_at, original_updated_at)


class TravelerCreateSerializerTest(TestCase):
    def test_valid_password_confirmation(self):
        serializer = TravelerCreateSerializer(
            data={
                "username": "alice",
                "first_name": "Alice",
                "last_name": "Dupont",
                "email": "alice@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_rejects_different_password_confirmation(self):
        serializer = TravelerCreateSerializer(
            data={
                "username": "alice",
                "first_name": "Alice",
                "last_name": "Dupont",
                "email": "alice@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "DifferentPassword123!",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password_confirmation", serializer.errors)

    def test_rejects_invalid_password(self):
        serializer = TravelerCreateSerializer(
            data={
                "username": "alice",
                "first_name": "Alice",
                "last_name": "Dupont",
                "email": "alice@example.com",
                "password": "123",
                "password_confirmation": "123",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_password_fields_are_write_only(self):
        serializer = TravelerCreateSerializer()

        self.assertTrue(serializer.fields["password"].write_only)
        self.assertTrue(serializer.fields["password_confirmation"].write_only)


class TravelerUpdateSerializerTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
            first_name="Alice",
            last_name="Dupont",
        )

    def test_can_update_first_name_and_last_name(self):
        serializer = TravelerSerializer(
            self.traveler,
            data={
                "first_name": "Alicia",
                "last_name": "Martin",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()

        self.traveler.refresh_from_db()

        self.assertEqual(self.traveler.first_name, "Alicia")
        self.assertEqual(self.traveler.last_name, "Martin")

    def test_can_update_email(self):
        serializer = TravelerSerializer(
            self.traveler,
            data={
                "email": "new@example.com",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()

        self.traveler.refresh_from_db()

        self.assertEqual(self.traveler.email, "new@example.com")

    def test_profile_picture_is_read_only(self):
        serializer = TravelerSerializer(
            self.traveler,
            data={
                "profile_picture": "fake-picture.jpg",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        serializer.save()

        self.traveler.refresh_from_db()

        self.assertFalse(self.traveler.profile_picture)


class TravelerUpdatePasswordSerializerTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="OldPassword123!",
        )

    def test_valid_password_change(self):
        request = type(
            "Request",
            (),
            {"user": self.traveler},
        )()

        serializer = TravelerUpdatePasswordSerializer(
            data={
                "old_password": "OldPassword123!",
                "new_password_1": "NewPassword123!",
                "new_password_2": "NewPassword123!",
            },
            context={"request": request},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertIn("_password_change_form", serializer.validated_data)

    def test_rejects_wrong_old_password(self):
        request = type(
            "Request",
            (),
            {"user": self.traveler},
        )()

        serializer = TravelerUpdatePasswordSerializer(
            data={
                "old_password": "WrongPassword123!",
                "new_password_1": "NewPassword123!",
                "new_password_2": "NewPassword123!",
            },
            context={"request": request},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("old_password", serializer.errors)

    def test_rejects_different_new_passwords(self):
        request = type(
            "Request",
            (),
            {"user": self.traveler},
        )()

        serializer = TravelerUpdatePasswordSerializer(
            data={
                "old_password": "OldPassword123!",
                "new_password_1": "NewPassword123!",
                "new_password_2": "DifferentPassword123!",
            },
            context={"request": request},
        )

        self.assertFalse(serializer.is_valid())
        self.assertTrue(serializer.errors)


class TravelerProfilePictureSerializerTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
        )

    def _make_image(self, name="test.jpg"):
        image = Image.new("RGB", (100, 100), "white")
        buffer = BytesIO()
        image.save(buffer, format="JPEG")
        buffer.seek(0)

        return SimpleUploadedFile(
            name,
            buffer.read(),
            content_type="image/jpeg",
        )

    def test_accepts_small_image(self):
        image = self._make_image()

        serializer = TravelerUpdateProfilePictureSerializer(
            self.traveler,
            data={"profile_picture": image},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_rejects_image_over_5mb(self):
        oversized_file = SimpleUploadedFile(
            "large.jpg",
            b"x" * (5 * 1024 * 1024 + 1),
            content_type="image/jpeg",
        )

        serializer = TravelerUpdateProfilePictureSerializer(
            self.traveler,
            data={"profile_picture": oversized_file},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("profile_picture", serializer.errors)


# --- API / View tests ---


class TravelerApiTest(APITestCase):
    def assert_validation_error_field(self, response, field):
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["type"], "validation_error")
        self.assertIn(
            field,
            [error["attr"] for error in response.data["errors"]],
            response.data,
        )

    def setUp(self):
        self.password = "Password123!"

        self.traveler = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password=self.password,
            first_name="Alice",
            last_name="Dupont",
        )

    def test_health_endpoint(self):
        response = self.client.get(reverse("api-health"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")

    def test_ping_requires_authentication(self):
        response = self.client.get(reverse("traveler-ping"))

        self.assertEqual(response.status_code, 403)

    def test_ping_authenticated(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(reverse("traveler-ping"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(
            response.data["message"],
            "The traveler API is running.",
        )

    def test_create_traveler(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "bob",
                "first_name": "Bob",
                "last_name": "Martin",
                "email": "bob@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assertEqual(response.status_code, 201)

        traveler = Traveler.objects.get(username="bob")

        self.assertEqual(traveler.email, "bob@example.com")
        self.assertTrue(traveler.check_password("StrongPassword123!"))
        self.assertEqual(response.data["traveler"]["username"], "bob")

    def test_create_traveler_stores_hashed_password(self):
        password = "StrongPassword123!"

        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "hashed_api_user",
                "first_name": "Hashed",
                "last_name": "User",
                "email": "hashed_api@example.com",
                "password": password,
                "password_confirmation": password,
            },
        )

        self.assertEqual(response.status_code, 201)

        traveler = Traveler.objects.get(username="hashed_api_user")

        self.assertNotEqual(traveler.password, password)
        self.assertTrue(traveler.check_password(password))

    def test_create_traveler_does_not_return_password(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "bob",
                "first_name": "Bob",
                "last_name": "Martin",
                "email": "bob@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assertEqual(response.status_code, 201)

        self.assertNotIn("password", response.data["traveler"])
        self.assertNotIn(
            "password_confirmation",
            response.data["traveler"],
        )

    def test_create_traveler_rejects_password_mismatch(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "bob",
                "first_name": "Bob",
                "last_name": "Martin",
                "email": "bob@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "DifferentPassword123!",
            },
        )

        self.assert_validation_error_field(response, "password_confirmation")

    def test_create_traveler_rejects_weak_password(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "bob",
                "first_name": "Bob",
                "last_name": "Martin",
                "email": "bob@example.com",
                "password": "123",
                "password_confirmation": "123",
            },
        )

        self.assert_validation_error_field(response, "password")

    def test_create_traveler_rejects_numeric_password(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "bob",
                "first_name": "Bob",
                "last_name": "Martin",
                "email": "bob@example.com",
                "password": "123456789",
                "password_confirmation": "123456789",
            },
        )

        self.assert_validation_error_field(response, "password")

    def test_create_traveler_rejects_duplicate_email(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "bob",
                "first_name": "Bob",
                "last_name": "Martin",
                "email": self.traveler.email,
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            Traveler.objects.filter(email=self.traveler.email).count(),
            1,
        )

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("auth-me"))

        self.assertEqual(response.status_code, 403)

    def test_me_returns_authenticated_traveler(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(reverse("auth-me"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["traveler"]["id"],
            self.traveler.id,
        )
        self.assertEqual(
            response.data["traveler"]["username"],
            self.traveler.username,
        )

    def test_update_requires_authentication(self):
        response = self.client.patch(
            reverse("traveler-update"),
            {"first_name": "Alicia"},
        )

        self.assertEqual(response.status_code, 403)

    def test_update_profile(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse("traveler-update"),
            {
                "first_name": "Alicia",
                "last_name": "Martin",
                "email": "alicia@example.com",
            },
        )

        self.assertEqual(response.status_code, 200)

        self.traveler.refresh_from_db()

        self.assertEqual(self.traveler.first_name, "Alicia")
        self.assertEqual(self.traveler.last_name, "Martin")
        self.assertEqual(self.traveler.email, "alicia@example.com")

        self.assertEqual(
            response.data["traveler"]["first_name"],
            "Alicia",
        )

    def test_update_cannot_change_is_online(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse("traveler-update"),
            {
                "is_online": True,
            },
        )

        self.assertEqual(response.status_code, 200)

        self.traveler.refresh_from_db()

        self.assertFalse(self.traveler.is_online)

    def test_update_cannot_change_profile_picture(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse("traveler-update"),
            {
                "profile_picture": "profile.jpg",
            },
        )

        self.assertEqual(response.status_code, 200)

        self.traveler.refresh_from_db()

        self.assertFalse(self.traveler.profile_picture)

    def test_login_success(self):
        response = self.client.post(
            reverse("auth-login"),
            {
                "username": self.traveler.username,
                "password": self.password,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["traveler"]["id"],
            self.traveler.id,
        )

    def test_login_rejects_wrong_password(self):
        response = self.client.post(
            reverse("auth-login"),
            {
                "username": self.traveler.username,
                "password": "WrongPassword123!",
            },
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["type"], "client_error")
        self.assertEqual(
            response.data["errors"][0]["code"],
            "invalid_credentials",
        )
        self.assertIsNone(response.data["errors"][0]["attr"])

    def test_login_rejects_unknown_username(self):
        response = self.client.post(
            reverse("auth-login"),
            {
                "username": "unknown-user",
                "password": self.password,
            },
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["type"], "client_error")
        self.assertEqual(
            response.data["errors"][0]["code"],
            "invalid_credentials",
        )

    def test_login_does_not_return_password(self):
        response = self.client.post(
            reverse("auth-login"),
            {
                "username": self.traveler.username,
                "password": self.password,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("password", response.data["traveler"])

    def test_logout_requires_authentication(self):
        response = self.client.post(reverse("auth-logout"))

        self.assertEqual(response.status_code, 403)

    def test_logout(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(reverse("auth-logout"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["message"],
            "Logged out successfully.",
        )

    def test_update_password_requires_authentication(self):
        response = self.client.post(
            reverse("traveler-update-password"),
            {
                "old_password": self.password,
                "new_password_1": "NewPassword123!",
                "new_password_2": "NewPassword123!",
            },
        )

        self.assertEqual(response.status_code, 403)

    def test_update_password(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("traveler-update-password"),
            {
                "old_password": self.password,
                "new_password_1": "NewPassword123!",
                "new_password_2": "NewPassword123!",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["detail"],
            "Password updated successfully.",
        )

        self.traveler.refresh_from_db()

        self.assertTrue(self.traveler.check_password("NewPassword123!"))
        self.assertFalse(self.traveler.check_password(self.password))

    def test_update_password_rejects_wrong_old_password(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("traveler-update-password"),
            {
                "old_password": "WrongPassword123!",
                "new_password_1": "NewPassword123!",
                "new_password_2": "NewPassword123!",
            },
        )

        self.assertEqual(response.status_code, 400)

        self.traveler.refresh_from_db()

        self.assertTrue(self.traveler.check_password(self.password))

    def test_update_password_rejects_mismatched_passwords(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("traveler-update-password"),
            {
                "old_password": self.password,
                "new_password_1": "NewPassword123!",
                "new_password_2": "DifferentPassword123!",
            },
        )

        self.assertEqual(response.status_code, 400)

    def test_csrf_endpoint(self):
        response = self.client.get(reverse("auth-csrf"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["message"],
            "CSRF protection initialized successfully.",
        )

    def test_create_traveler_rejects_duplicate_username(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": self.traveler.username,
                "first_name": "Bob",
                "last_name": "Martin",
                "email": "different@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assert_validation_error_field(response, "username")

    def test_create_traveler_rejects_invalid_email(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "invalid_email",
                "first_name": "Invalid",
                "last_name": "Email",
                "email": "not-an-email",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assert_validation_error_field(response, "email")

    def test_create_traveler_requires_username(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "first_name": "No",
                "last_name": "Username",
                "email": "nousername@example.com",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assert_validation_error_field(response, "username")

    def test_create_traveler_requires_email(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "noemail",
                "first_name": "No",
                "last_name": "Email",
                "password": "StrongPassword123!",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assert_validation_error_field(response, "email")

    def test_create_traveler_requires_password(self):
        response = self.client.post(
            reverse("traveler-create"),
            {
                "username": "nopassword",
                "first_name": "No",
                "last_name": "Password",
                "email": "nopassword@example.com",
                "password_confirmation": "StrongPassword123!",
            },
        )

        self.assert_validation_error_field(response, "password")

    def test_login_creates_session(self):
        response = self.client.post(
            reverse("auth-login"),
            {
                "username": self.traveler.username,
                "password": self.password,
            },
        )

        self.assertEqual(response.status_code, 200)

        session = self.client.session

        self.assertEqual(
            session.get(SESSION_KEY),
            str(self.traveler.pk),
        )

    def test_logout_removes_session(self):
        login_response = self.client.post(
            reverse("auth-login"),
            {
                "username": self.traveler.username,
                "password": self.password,
            },
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertIsNotNone(self.client.session.get(SESSION_KEY))

        logout_response = self.client.post(
            reverse("auth-logout"),
        )

        self.assertEqual(logout_response.status_code, 200)
        self.assertIsNone(self.client.session.get(SESSION_KEY))

    def test_update_profile_rejects_duplicate_email(self):
        Traveler.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="Password123!",
        )

        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse("traveler-update"),
            {
                "email": "bob@example.com",
            },
        )

        self.assert_validation_error_field(response, "email")

        self.traveler.refresh_from_db()

        self.assertEqual(
            self.traveler.email,
            "alice@example.com",
        )

    def test_update_profile_with_empty_data(self):
        self.client.force_authenticate(user=self.traveler)

        original_first_name = self.traveler.first_name
        original_last_name = self.traveler.last_name
        original_email = self.traveler.email

        response = self.client.patch(
            reverse("traveler-update"),
            {},
        )

        self.assertEqual(response.status_code, 200)

        self.traveler.refresh_from_db()

        self.assertEqual(
            self.traveler.first_name,
            original_first_name,
        )
        self.assertEqual(
            self.traveler.last_name,
            original_last_name,
        )
        self.assertEqual(
            self.traveler.email,
            original_email,
        )

    def test_update_profile_picture(self):
        image = Image.new("RGB", (100, 100), "white")

        buffer = BytesIO()
        image.save(buffer, format="JPEG")
        buffer.seek(0)

        uploaded_image = SimpleUploadedFile(
            "profile.jpg",
            buffer.read(),
            content_type="image/jpeg",
        )

        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("traveler-update-profile-picture"),
            {
                "profile_picture": uploaded_image,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 200)

        self.traveler.refresh_from_db()

        self.assertTrue(self.traveler.profile_picture)
        self.assertIn(
            "profile_pictures/",
            self.traveler.profile_picture.name,
        )

    def test_update_profile_picture_rejects_file_over_5mb(self):
        oversized_file = SimpleUploadedFile(
            "large.jpg",
            b"x" * (5 * 1024 * 1024 + 1),
            content_type="image/jpeg",
        )

        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse("traveler-update-profile-picture"),
            {
                "profile_picture": oversized_file,
            },
            format="multipart",
        )

        self.assert_validation_error_field(response, "profile_picture")

        self.traveler.refresh_from_db()

        self.assertFalse(self.traveler.profile_picture)


class FriendshipApiTest(APITestCase):
    def setUp(self):
        self.alice = Traveler.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="Password123!",
        )
        self.bob = Traveler.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="Password123!",
        )
        self.charlie = Traveler.objects.create_user(
            username="charlie",
            email="charlie@example.com",
            password="Password123!",
        )

    def create_friendship(self, requester, target, status=Status.PENDING):
        user1, user2 = sorted([requester, target], key=lambda user: user.pk)
        return Friendship.objects.create(
            user1=user1,
            user2=user2,
            requested_by=requester,
            status=status,
        )

    def test_request_friendship_success(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": self.bob.pk},
        )

        self.assertEqual(response.status_code, 201)

        friendship = Friendship.objects.get(
            user1=min(self.alice.pk, self.bob.pk),
            user2=max(self.alice.pk, self.bob.pk),
        )
        self.assertEqual(friendship.requested_by, self.alice)
        self.assertEqual(friendship.status, Status.PENDING)
        self.assertEqual(response.data["friendship"], friendship.pk)

    def test_cannot_request_friendship_with_self(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": self.alice.pk},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Friendship.objects.count(), 0)

    def test_cannot_request_friendship_with_unknown_user(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": 999999},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Friendship.objects.count(), 0)

    def test_cannot_create_duplicate_friendship(self):
        self.create_friendship(self.alice, self.bob)
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": self.bob.pk},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["type"], "validation_error")
        self.assertEqual(
            response.data["errors"][0]["code"],
            "relationship_exists",
        )
        self.assertEqual(Friendship.objects.count(), 1)

    def test_reverse_request_is_also_rejected(self):
        self.create_friendship(self.alice, self.bob)
        self.client.force_authenticate(user=self.bob)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": self.alice.pk},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["type"], "validation_error")
        self.assertEqual(
            response.data["errors"][0]["code"],
            "relationship_exists",
        )
        self.assertEqual(Friendship.objects.count(), 1)

    def test_recipient_can_accept_friendship(self):
        friendship = self.create_friendship(self.alice, self.bob)
        self.client.force_authenticate(user=self.bob)

        response = self.client.post(
            reverse("friendship-accept", args=[friendship.pk]),
        )

        self.assertEqual(response.status_code, 200)

        friendship.refresh_from_db()
        self.assertEqual(friendship.status, Status.ACCEPTED)

    def test_requester_cannot_accept_own_request(self):
        friendship = self.create_friendship(self.alice, self.bob)
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            reverse("friendship-accept", args=[friendship.pk]),
        )

        self.assertEqual(response.status_code, 403)

        friendship.refresh_from_db()
        self.assertEqual(friendship.status, Status.PENDING)

    def test_unrelated_user_cannot_accept_friendship(self):
        friendship = self.create_friendship(self.alice, self.bob)
        self.client.force_authenticate(user=self.charlie)

        response = self.client.post(
            reverse("friendship-accept", args=[friendship.pk]),
        )

        self.assertEqual(response.status_code, 403)

        friendship.refresh_from_db()
        self.assertEqual(friendship.status, Status.PENDING)

    def test_cannot_accept_already_accepted_friendship(self):
        friendship = self.create_friendship(
            self.alice,
            self.bob,
            status=Status.ACCEPTED,
        )
        self.client.force_authenticate(user=self.bob)

        response = self.client.post(
            reverse("friendship-accept", args=[friendship.pk]),
        )

        self.assertEqual(response.status_code, 404)

    def test_cannot_accept_unknown_friendship(self):
        self.client.force_authenticate(user=self.bob)

        response = self.client.post(
            reverse("friendship-accept", args=[999999]),
        )

        self.assertEqual(response.status_code, 404)

    def test_participant_can_remove_friendship(self):
        friendship = self.create_friendship(
            self.alice,
            self.bob,
            status=Status.ACCEPTED,
        )
        friendship_id = friendship.pk
        self.client.force_authenticate(user=self.bob)

        response = self.client.delete(
            reverse("friendship-remove", args=[friendship_id]),
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Friendship.objects.filter(pk=friendship_id).exists())

    def test_unrelated_user_cannot_remove_friendship(self):
        friendship = self.create_friendship(
            self.alice,
            self.bob,
            status=Status.ACCEPTED,
        )
        self.client.force_authenticate(user=self.charlie)

        response = self.client.delete(
            reverse("friendship-remove", args=[friendship.pk]),
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(Friendship.objects.filter(pk=friendship.pk).exists())

    def test_cannot_remove_unknown_friendship(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.delete(
            reverse("friendship-remove", args=[999999]),
        )

        self.assertEqual(response.status_code, 404)

    def test_requests_returns_only_incoming_pending_requests(self):
        # Alice envoie une demande à Bob : sortante pour Alice.
        self.create_friendship(self.alice, self.bob)

        # Charlie envoie une demande à Alice : entrante pour Alice.
        incoming = self.create_friendship(self.charlie, self.alice)

        self.client.force_authenticate(user=self.alice)

        response = self.client.get(reverse("friendship-requests"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["requests"]), 1)
        self.assertEqual(
            response.data["requests"][0]["id"],
            incoming.pk,
        )
        self.assertEqual(
            response.data["requests"][0]["traveler"]["id"],
            self.charlie.pk,
        )

    def test_friendship_list_returns_only_accepted_friends(self):
        # Alice est user1 ou user2 selon les identifiants.
        self.create_friendship(self.alice, self.bob, status=Status.ACCEPTED)
        # self.create_friendship(self.alice, self.charlie) #dejas fait plus haut

        self.client.force_authenticate(user=self.alice)

        response = self.client.get(reverse("friendship-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["friendships"]), 1)
        self.assertEqual(
            response.data["friendships"][0]["friend"]["id"],
            self.bob.pk,
        )

    def test_friendship_list_returns_correct_friend_for_user2(self):
        friendship = self.create_friendship(
            self.alice, self.bob, status=Status.ACCEPTED
        )

        # On authentifie volontairement l'utilisateur stocké en user2.
        user2 = friendship.user2
        expected_friend = friendship.user1

        self.client.force_authenticate(user=user2)

        response = self.client.get(reverse("friendship-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["friendships"]), 1)
        self.assertEqual(
            response.data["friendships"][0]["friend"]["id"],
            expected_friend.pk,
        )

    def test_search_friend_by_username(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(
            reverse("friendship-search"),
            {"q": "bob"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["travelers"]), 1)
        self.assertEqual(
            response.data["travelers"][0]["id"],
            self.bob.pk,
        )

    def test_search_friend_by_username_is_case_insensitive(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(
            reverse("friendship-search"),
            {"q": "BOB"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["travelers"]), 1)
        self.assertEqual(
            response.data["travelers"][0]["id"],
            self.bob.pk,
        )

    def test_search_does_not_match_email(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(
            reverse("friendship-search"),
            {"q": "bob@example.com"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["travelers"], [])

    def test_search_empty_query_returns_empty_list(self):
        self.client.force_authenticate(user=self.alice)

        for query in ("", "   ", "a"):
            with self.subTest(query=query):
                response = self.client.get(
                    reverse("friendship-search"),
                    {"q": query},
                )

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["travelers"], [])

    def test_search_excludes_current_user(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(
            reverse("friendship-search"),
            {"q": "alice"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["travelers"], [])

    def test_friendship_endpoints_require_authentication(self):
        friendship = self.create_friendship(self.alice, self.bob)

        cases = [
            ("get", reverse("friendship-search"), {"q": "bob"}),
            ("post", reverse("friendship-request"), {"user_id": self.bob.pk}),
            ("get", reverse("friendship-requests"), None),
            ("post", reverse("friendship-accept", args=[friendship.pk]), None),
            ("delete", reverse("friendship-remove", args=[friendship.pk]), None),
            ("get", reverse("friendship-list"), None),
        ]

        for method, url, data in cases:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(url, data)
                self.assertIn(response.status_code, (401, 403))

    def test_request_friendship_rejects_malformed_user_id(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": "abc"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Friendship.objects.count(), 0)

    def test_requested_by_must_be_a_participant(self):
        friendship = Friendship(
            user1=self.alice,
            user2=self.bob,
            requested_by=self.charlie,
            status=Status.PENDING,
        )

        with self.assertRaises(ValidationError):
            friendship.full_clean()


# ===================================================================#

# Test : Connexion avec Token (swagger)


# Obtention de la clé API : POST /api/auth/token/
class ApiTokenViewTest(APITestCase):
    def setUp(self):
        cache.clear()
        self.password = "Password123.wq"
        self.traveler = Traveler.objects.create_user(
            username="dub1", email="dub1@example.com", password=self.password
        )
        self.url = reverse("auth-token")

    def test_returns_token_with_valid_credentials(self):
        response = self.client.post(
            self.url, {"username": "dub1", "password": self.password}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["token"], Token.objects.get(user=self.traveler).key
        )

    def test_rejects_wrong_password(self):
        response = self.client.post(self.url, {"username": "dub1", "password": "wrong"})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["type"], "client_error")
        self.assertEqual(
            response.data["errors"][0]["code"],
            "invalid_credentials",
        )
        self.assertFalse(Token.objects.exists())


class FriendshipBroadcastTest(BroadcastListenerMixin, APITestCase):
    """Hits the real Redis channel layer configured in settings."""

    def setUp(self):
        self.alice = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="Password123!"
        )
        self.bob = Traveler.objects.create_user(
            username="bob", email="bob@example.com", password="Password123!"
        )
        self.client.force_authenticate(user=self.alice)

    def create_friendship(self, requester, target, status=Status.PENDING):
        user1, user2 = sorted([requester, target], key=lambda user: user.pk)
        return Friendship.objects.create(
            user1=user1, user2=user2, requested_by=requester, status=status
        )

    def request(self, method, url, data=None):
        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            response = getattr(self.client, method)(url, data)
        return response, callbacks

    def test_request_notifies_the_target(self):
        self.listen_to(user_group(self.bob.id))

        response, _ = self.request(
            "post", reverse("friendship-request"), {"user_id": self.bob.pk}
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            self.receive_event(),
            {
                "type": "friendship.requested",
                "payload": {"friendshipId": response.data["friendship"]},
            },
        )

    def test_request_also_notifies_the_requesters_other_tabs(self):
        self.listen_to(user_group(self.alice.id))

        self.request("post", reverse("friendship-request"), {"user_id": self.bob.pk})

        self.assertEqual(self.receive_event()["type"], "friendship.requested")

    def test_accept_notifies_the_requester(self):
        friendship = self.create_friendship(self.bob, self.alice)
        self.listen_to(user_group(self.bob.id))

        response, _ = self.request(
            "post",
            reverse("friendship-accept", kwargs={"friendship_id": friendship.id}),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.receive_event(),
            {
                "type": "friendship.accepted",
                "payload": {"friendshipId": friendship.id},
            },
        )

    def test_remove_notifies_the_other_friend(self):
        friendship = self.create_friendship(self.bob, self.alice, Status.ACCEPTED)
        friendship_id = friendship.id
        self.listen_to(user_group(self.bob.id))

        response, _ = self.request(
            "delete",
            reverse("friendship-remove", kwargs={"friendship_id": friendship_id}),
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Friendship.objects.filter(pk=friendship_id).exists())
        self.assertEqual(
            self.receive_event(),
            {
                "type": "friendship.removed",
                "payload": {"friendshipId": friendship_id},
            },
        )

    def test_rejected_request_notifies_nobody(self):
        response, callbacks = self.request(
            "post", reverse("friendship-request"), {"user_id": self.alice.pk}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(callbacks, [])


# TransactionTestCase: database_sync_to_async closes the connection that
# TestCase keeps open for its wrapping transaction.
class NotificationConsumerTest(TransactionTestCase):
    """Hits the real Redis channel layer configured in settings."""

    def setUp(self):
        self.alice = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="Password123!"
        )

    def communicator(self, user):
        return WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/", scope={"user": user}
        )

    async def test_user_receives_own_events_only(self):
        communicator = self.communicator(self.alice)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        layer = get_channel_layer()
        event = {"type": "friendship.requested", "payload": {"friendshipId": 1}}
        await layer.group_send(user_group(self.alice.id + 1), event)
        self.assertTrue(await communicator.receive_nothing(timeout=0.2))

        await layer.group_send(user_group(self.alice.id), event)
        self.assertEqual(await communicator.receive_json_from(), event)
        await communicator.disconnect()

    async def test_anonymous_is_closed_with_4401(self):
        communicator = self.communicator(AnonymousUser())

        connected, _ = await communicator.connect()
        message = await communicator.receive_output(timeout=2)

        self.assertTrue(connected)
        self.assertEqual(
            message, {"type": "websocket.close", "code": CLOSE_NOT_AUTHENTICATED}
        )
        await communicator.disconnect()

    async def test_logged_in_user_connects_through_routing(self):
        await sync_to_async(self.client.force_login)(self.alice)
        session_id = self.client.cookies[settings.SESSION_COOKIE_NAME].value
        communicator = WebsocketCommunicator(
            application,
            "/ws/notifications/",
            headers=[
                (b"origin", b"http://localhost"),
                (b"cookie", f"{settings.SESSION_COOKIE_NAME}={session_id}".encode()),
            ],
        )

        connected, _ = await communicator.connect()

        self.assertTrue(connected)
        self.assertTrue(await communicator.receive_nothing(timeout=0.2))
        await communicator.disconnect()


class PresenceTest(BroadcastListenerMixin, TestCase):
    def setUp(self):
        self.alice = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="Password123!"
        )
        self.bob = Traveler.objects.create_user(
            username="bob", email="bob@example.com", password="Password123!"
        )
        self.carol = Traveler.objects.create_user(
            username="carol", email="carol@example.com", password="Password123!"
        )
        Friendship.objects.create(
            user1=self.alice,
            user2=self.bob,
            requested_by=self.alice,
            status=Status.ACCEPTED,
        )
        # Pending: carol is not a friend yet and must not be told.
        Friendship.objects.create(
            user1=self.alice,
            user2=self.carol,
            requested_by=self.carol,
            status=Status.PENDING,
        )

    def run_presence(self, action):
        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            action(self.alice.pk)
        self.alice.refresh_from_db()
        return callbacks

    def test_first_connection_sets_online_and_notifies_friends(self):
        self.listen_to(user_group(self.bob.pk))

        self.run_presence(traveler_connected)

        self.assertTrue(self.alice.is_online)
        self.assertEqual(self.alice.online_connections, 1)
        self.assertEqual(
            self.receive_event(),
            {
                "type": "presence.changed",
                "payload": {"travelerId": self.alice.pk, "isOnline": True},
            },
        )

    def test_pending_friend_is_not_notified(self):
        self.listen_to(user_group(self.carol.pk))

        callbacks = self.run_presence(traveler_connected)

        self.assertEqual(len(callbacks), 1)  # bob only

    def test_second_tab_does_not_notify(self):
        self.run_presence(traveler_connected)

        callbacks = self.run_presence(traveler_connected)

        self.assertEqual(self.alice.online_connections, 2)
        self.assertTrue(self.alice.is_online)
        self.assertEqual(callbacks, [])

    def test_stays_online_until_last_tab_closes(self):
        self.run_presence(traveler_connected)
        self.run_presence(traveler_connected)

        callbacks = self.run_presence(traveler_disconnected)
        self.assertTrue(self.alice.is_online)
        self.assertEqual(callbacks, [])

        self.listen_to(user_group(self.bob.pk))
        self.run_presence(traveler_disconnected)
        self.assertFalse(self.alice.is_online)
        self.assertEqual(self.alice.online_connections, 0)
        self.assertEqual(
            self.receive_event()["payload"],
            {"travelerId": self.alice.pk, "isOnline": False},
        )

    def test_disconnect_never_goes_below_zero(self):
        callbacks = self.run_presence(traveler_disconnected)

        self.assertEqual(self.alice.online_connections, 0)
        self.assertFalse(self.alice.is_online)
        self.assertEqual(callbacks, [])

    def test_reset_marks_everyone_offline(self):
        Traveler.objects.filter(pk=self.alice.pk).update(
            is_online=True, online_connections=3
        )

        self.assertEqual(reset_presence(), 1)

        self.alice.refresh_from_db()
        self.assertFalse(self.alice.is_online)
        self.assertEqual(self.alice.online_connections, 0)


class PresenceConsumerTest(TransactionTestCase):
    """The notification socket drives presence."""

    def setUp(self):
        self.alice = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="Password123!"
        )
        self.bob = Traveler.objects.create_user(
            username="bob", email="bob@example.com", password="Password123!"
        )
        Friendship.objects.create(
            user1=self.alice,
            user2=self.bob,
            requested_by=self.alice,
            status=Status.ACCEPTED,
        )

    def communicator(self, user):
        return WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/", scope={"user": user}
        )

    async def refreshed_alice(self):
        await sync_to_async(self.alice.refresh_from_db)()
        return self.alice

    async def test_friend_sees_traveler_come_online_and_leave(self):
        bob_socket = self.communicator(self.bob)
        await bob_socket.connect()

        alice_socket = self.communicator(self.alice)
        await alice_socket.connect()
        self.assertTrue((await self.refreshed_alice()).is_online)
        self.assertEqual(
            await bob_socket.receive_json_from(),
            {
                "type": "presence.changed",
                "payload": {"travelerId": self.alice.pk, "isOnline": True},
            },
        )

        await alice_socket.disconnect()
        self.assertFalse((await self.refreshed_alice()).is_online)
        self.assertEqual(
            (await bob_socket.receive_json_from())["payload"],
            {"travelerId": self.alice.pk, "isOnline": False},
        )
        await bob_socket.disconnect()

    async def test_anonymous_socket_changes_nothing(self):
        communicator = self.communicator(AnonymousUser())
        await communicator.connect()
        await communicator.receive_output(timeout=2)  # the 4401 close
        await communicator.disconnect()

        alice = await self.refreshed_alice()
        self.assertFalse(alice.is_online)
        self.assertEqual(alice.online_connections, 0)


# ===================================================================#

# Test : Connexion avec Google (OAuth 2.0)


# Ce qu'Authlib lirait dans le document "openid-configuration" de Google
GOOGLE_METADATA = {
    "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth"
}

# Les infos de l'utilisateur, telles qu'Authlib les tire de l'id_token vérifié
GOOGLE_USERINFO = {
    "email": "david.lf@gmail.com",
    "email_verified": True,
    "given_name": "David",
    "family_name": "lf",
}


@override_settings(
    GOOGLE_REDIRECT_URI="http://localhost:8080/api/auth/google/callback/",
)
@patch(
    "traveler.views.oauth.google.load_server_metadata",
    return_value=GOOGLE_METADATA,
)
class GoogleLoginViewTest(APITestCase):
    # Vérifie que l'utilisateur est redirigé vers Google avec les bons paramètres
    def test_redirects_to_google(self, mock_metadata):
        response = self.client.get(reverse("auth-google"))

        self.assertEqual(response.status_code, 302)

        url = urlparse(response["Location"])
        params = parse_qs(url.query)

        self.assertEqual(url.netloc, "accounts.google.com")
        self.assertEqual(
            params["redirect_uri"],
            ["http://localhost:8080/api/auth/google/callback/"],
        )
        self.assertEqual(params["response_type"], ["code"])
        self.assertEqual(params["scope"], ["openid email profile"])
        self.assertEqual(params["prompt"], ["select_account"])
        self.assertIn("state", params)
        self.assertIn("nonce", params)


@patch("traveler.views.oauth.google.authorize_access_token")
class GoogleCallbackViewTest(APITestCase):
    # Simule le retour de Google sur le callback
    def setUp(self):
        super().setUp()

        logger_patcher = patch("traveler.views.logger.warning")
        logger_patcher.start()
        self.addCleanup(logger_patcher.stop)

    def google_callback(self):
        return self.client.get(
            reverse("auth-google-callback"),
            {"state": "un-state", "code": "un-code"},
        )

    # Vérifie qu'une erreur OAuth (state, annulation, code refusé) est gérée
    def test_oauth_error_is_refused(self, mock_authorize):
        mock_authorize.side_effect = OAuthError(error="mismatching_state")

        response = self.google_callback()

        self.assertRedirects(
            response, "/login?error=google", fetch_redirect_response=False
        )
        self.assertNotIn(SESSION_KEY, self.client.session)

    # Vérifie qu'un id_token invalide (mauvaise signature...) est refusé
    def test_invalid_id_token_is_refused(self, mock_authorize):
        mock_authorize.side_effect = BadSignatureError()

        response = self.google_callback()

        self.assertRedirects(
            response, "/login?error=google", fetch_redirect_response=False
        )
        self.assertNotIn(SESSION_KEY, self.client.session)

    # Vérifie que Google injoignable est géré
    def test_google_unreachable(self, mock_authorize):
        mock_authorize.side_effect = requests.ConnectionError()

        response = self.google_callback()

        self.assertRedirects(
            response, "/login?error=google", fetch_redirect_response=False
        )

    # Vérifie qu'un nouvel utilisateur Google est créé et connecté
    def test_creates_traveler_and_logs_in(self, mock_authorize):
        mock_authorize.return_value = {"userinfo": GOOGLE_USERINFO}

        response = self.google_callback()

        self.assertRedirects(response, "/travel", fetch_redirect_response=False)
        traveler = Traveler.objects.get(email="david.lf@gmail.com")
        self.assertEqual(traveler.username, "david.lf")
        self.assertEqual(traveler.first_name, "David")
        self.assertEqual(traveler.last_name, "lf")
        self.assertFalse(traveler.has_usable_password())
        self.assertEqual(self.client.session[SESSION_KEY], str(traveler.pk))

    # Vérifie qu'à la 2e connexion, on retrouve le même compte (pas de doublon)
    def test_existing_traveler_is_reused(self, mock_authorize):
        mock_authorize.return_value = {"userinfo": GOOGLE_USERINFO}
        self.google_callback()
        self.client.logout()

        self.google_callback()

        self.assertEqual(Traveler.objects.count(), 1)
        self.assertIn(SESSION_KEY, self.client.session)

    # Vérifie qu'un username déjà pris reçoit un numéro
    def test_username_already_taken(self, mock_authorize):
        Traveler.objects.create_user(
            username="david.lf", email="autre@example.com", password="pass12345"
        )
        mock_authorize.return_value = {"userinfo": GOOGLE_USERINFO}

        self.google_callback()

        traveler = Traveler.objects.get(email="david.lf@gmail.com")
        self.assertEqual(traveler.username, "david.lf1")

    # Vérifie qu'un email non vérifié par Google est refusé
    def test_unverified_email_is_refused(self, mock_authorize):
        mock_authorize.return_value = {
            "userinfo": {**GOOGLE_USERINFO, "email_verified": False}
        }

        response = self.google_callback()

        self.assertRedirects(
            response, "/login?error=google", fetch_redirect_response=False
        )
        self.assertFalse(Traveler.objects.exists())
        self.assertNotIn(SESSION_KEY, self.client.session)

    # Vérifie qu'un compte classique (avec mot de passe) n'est pas ouvert via Google
    def test_password_account_is_refused(self, mock_authorize):
        Traveler.objects.create_user(
            username="david", email="david.lf@gmail.com", password="pass12345"
        )
        mock_authorize.return_value = {"userinfo": GOOGLE_USERINFO}

        response = self.google_callback()

        self.assertRedirects(
            response,
            "/login?error=google_email_exists",
            fetch_redirect_response=False,
        )
        self.assertNotIn(SESSION_KEY, self.client.session)
