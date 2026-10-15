from io import BytesIO

from django.contrib.auth import SESSION_KEY
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase

from traveler.models import Friendship, Status, Traveler
from traveler.serializers import (
    TravelerCreateSerializer,
    TravelerSerializer,
    TravelerUpdatePasswordSerializer,
    TravelerUpdateProfilePictureSerializer,
    TravelerUpdateSerializer,
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
        serializer = TravelerUpdateSerializer(
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
        serializer = TravelerUpdateSerializer(
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
        serializer = TravelerUpdateSerializer(
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
            "[temp]Traveler API is running",
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

        self.assertEqual(response.status_code, 400)
        self.assertIn(
            "password_confirmation",
            response.data["details"],
        )

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

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data["details"])

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

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data["details"])

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

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.data["detail"],
            "Identifiants invalides.",
        )

    def test_login_rejects_unknown_username(self):
        response = self.client.post(
            reverse("auth-login"),
            {
                "username": "unknown-user",
                "password": self.password,
            },
        )

        self.assertEqual(response.status_code, 401)

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
            "Déconnexion réussie.",
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
            "Mot de passe modifié avec succès.",
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
            "CSRF token initialized.",
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

        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data["details"])

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
        self.assertIn("email", response.data["details"])

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

        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data["details"])

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

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data["details"])

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

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data["details"])

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

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data["details"])

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

        self.assertEqual(response.status_code, 400)
        self.assertIn(
            "profile_picture",
            response.data["details"],
        )

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

        self.assertEqual(response.status_code, 409)
        self.assertEqual(Friendship.objects.count(), 1)

    def test_reverse_request_is_also_rejected(self):
        self.create_friendship(self.alice, self.bob)
        self.client.force_authenticate(user=self.bob)

        response = self.client.post(
            reverse("friendship-request"),
            {"user_id": self.alice.pk},
        )

        self.assertEqual(response.status_code, 409)
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
    # Alice envoie une demande à Bob.
    incoming = self.create_friendship(self.alice, self.bob)

    # Charlie envoie une demande à Alice.
    self.create_friendship(self.charlie, self.alice)

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
        self.assertEqual(response.data["traveler"]["id"], self.bob.pk)

    def test_search_friend_by_email_is_case_insensitive(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(
            reverse("friendship-search"),
            {"q": "BOB@EXAMPLE.COM"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["traveler"]["id"], self.bob.pk)

    def test_search_rejects_empty_query(self):
        self.client.force_authenticate(user=self.alice)

        for query in ("", "   "):
            with self.subTest(query=query):
                response = self.client.get(
                    reverse("friendship-search"),
                    {"q": query},
                )
                self.assertEqual(response.status_code, 400)

    def test_search_excludes_current_user(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(
            reverse("friendship-search"),
            {"q": "alice"},
        )

        self.assertEqual(response.status_code, 404)

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
