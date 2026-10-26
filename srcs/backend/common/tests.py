import datetime
from io import StringIO
from unittest.mock import patch

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, SimpleTestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from chat.models import Message
from common.realtime import broadcast, travel_group
from common.seeders.clear import clear_seed_data
from idea.models import Idea, IdeaType, Reaction
from spending.models import Spending
from travel.models import Participation, ParticipationStatus, Step, Travel
from traveler.models import Friendship

Traveler = get_user_model()


def _seed(**kwargs):
    defaults = {
        "travelers": 6,
        "friendships": 3,
        "travels": 3,
        "participations": 5,
        "steps_per_travel": 2,
        "ideas_per_travel": 3,
        "reactions": 5,
        "messages_per_travel": 3,
        "spendings_per_travel": 3,
        # The default (99) hashes 99 passwords on every call: keep tests fast.
        "dub_travelers": 0,
    }
    defaults.update(kwargs)
    call_command("seed", stdout=StringIO(), **defaults)


class ClearSeedDataTest(TestCase):
    def test_clears_every_domain_table(self):
        _seed()
        self.assertTrue(Travel.objects.exists())
        self.assertTrue(Message.objects.exists())

        deleted = clear_seed_data()

        self.assertEqual(Traveler.objects.count(), 0)
        self.assertEqual(Message.objects.count(), 0)
        self.assertEqual(Friendship.objects.count(), 0)
        self.assertEqual(Participation.objects.count(), 0)
        self.assertEqual(Reaction.objects.count(), 0)
        self.assertEqual(Spending.objects.count(), 0)
        self.assertEqual(Idea.objects.count(), 0)
        self.assertEqual(Step.objects.count(), 0)
        self.assertEqual(Travel.objects.count(), 0)
        self.assertEqual(
            set(deleted),
            {
                "messages",
                "friendships",
                "participations",
                "spendings",
                "reactions",
                "ideas",
                "steps",
                "travels",
                "travelers",
            },
        )

    def test_keeps_superusers_by_default(self):
        admin = Traveler.objects.create_superuser(
            username="admin", email="admin@example.com", password="pw"
        )
        _seed()

        clear_seed_data()

        self.assertTrue(Traveler.objects.filter(pk=admin.pk).exists())
        self.assertEqual(Traveler.objects.count(), 1)

    def test_all_travelers_removes_superusers(self):
        Traveler.objects.create_superuser(
            username="admin", email="admin@example.com", password="pw"
        )

        clear_seed_data(keep_superusers=False)

        self.assertEqual(Traveler.objects.count(), 0)

    def test_idempotent_on_empty_database(self):
        deleted = clear_seed_data()

        self.assertEqual(sum(deleted.values()), 0)


class UnseedCommandTest(TestCase):
    def test_yes_flag_skips_prompt_and_wipes(self):
        _seed()

        call_command("unseed", "--yes", stdout=StringIO())

        self.assertEqual(Travel.objects.count(), 0)
        self.assertEqual(Traveler.objects.count(), 0)

    def test_aborts_without_confirmation(self):
        _seed()
        travelers_before = Traveler.objects.count()

        with patch("builtins.input", return_value="n"), self.assertRaises(CommandError):
            call_command("unseed", stdout=StringIO())

        self.assertEqual(Traveler.objects.count(), travelers_before)

    def test_proceeds_on_yes_answer(self):
        _seed()

        with patch("builtins.input", return_value="y"):
            call_command("unseed", stdout=StringIO())

        self.assertEqual(Travel.objects.count(), 0)


class SeedFreshFlagTest(TestCase):
    def test_fresh_clears_previous_seed_first(self):
        _seed(travelers=8, travels=4)
        _seed(travelers=5, travels=2, fresh=True)

        self.assertEqual(Travel.objects.count(), 2)
        self.assertEqual(Traveler.objects.count(), 5)

    def test_fresh_keeps_superuser(self):
        Traveler.objects.create_superuser(
            username="admin", email="admin@example.com", password="pw"
        )
        _seed(travelers=4, fresh=True)

        self.assertTrue(Traveler.objects.filter(username="admin").exists())
        self.assertEqual(Traveler.objects.count(), 5)


class SeedDubTravelersTest(TestCase):
    def test_creates_the_requested_dub_accounts_and_their_friendships(self):
        _seed(dub_travelers=20)

        dubs = Traveler.objects.filter(username__startswith="dub")
        self.assertEqual(dubs.count(), 20)
        self.assertTrue(Friendship.objects.filter(user1__in=dubs).exists())


class SeedSpendingsTest(TestCase):
    def test_creates_spendings_per_travel(self):
        _seed(travels=3, spendings_per_travel=4)

        self.assertEqual(Spending.objects.count(), 12)
        for travel in Travel.objects.all():
            self.assertEqual(travel.spendings.count(), 4)

    def test_seeded_shares_match_spending_amount(self):
        _seed(travels=3, spendings_per_travel=4)

        for spending in Spending.objects.prefetch_related("shares"):
            total = sum(share.amount for share in spending.shares.all())
            self.assertEqual(total, spending.amount)

    def test_step_and_idea_belong_to_spending_travel(self):
        _seed(travels=3, spendings_per_travel=10)

        for spending in Spending.objects.select_related("step", "idea"):
            if spending.step is not None:
                self.assertEqual(spending.step.travel_id, spending.travel_id)
            if spending.idea is not None:
                self.assertEqual(spending.idea.travel_id, spending.travel_id)


# Accès aux vues publiques avec la clé API
class PublicApiKeyTest(APITestCase):
    def setUp(self):
        cache.clear()
        self.traveler = Traveler.objects.create_user(
            username="dub1", email="dub1@example.com", password="Password123.wq"
        )
        self.token = Token.objects.create(user=self.traveler)
        self.travel = Travel.objects.create(
            title="Road trip",
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
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
            latitude=45.764,
            longitude=4.8357,
        )
        self.idea = Idea.objects.create(
            travel=self.travel,
            traveler=self.traveler,
            title="Musée",
            type=IdeaType.SIGHT,
        )

    def authorize(self, key):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {key}")

    def test_token_gives_access_to_all_public_views(self):
        travel_id = self.travel.id
        public_urls = [
            reverse("travel-list"),
            reverse("travel-detail", kwargs={"pk": travel_id}),
            reverse("step-list", kwargs={"travel_id": travel_id}),
            reverse("step-detail", kwargs={"travel_id": travel_id, "pk": self.step.id}),
            reverse("idea-list", kwargs={"travel_id": travel_id}),
            reverse("idea-detail", kwargs={"travel_id": travel_id, "pk": self.idea.id}),
        ]
        self.authorize(self.token.key)

        for url in public_urls:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

    def test_invalid_token_returns_403(self):
        self.authorize("invalid-key")

        response = self.client.get(reverse("travel-list"))

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["message"], "Invalid token.")

    def test_token_does_not_open_private_views(self):
        self.authorize(self.token.key)

        response = self.client.get(reverse("auth-me"))

        self.assertEqual(response.status_code, 403)

    def test_token_does_not_give_access_to_other_travels(self):
        other_travel = Travel.objects.create(
            title="Not mine",
            start_date=datetime.date(2026, 8, 1),
            end_date=datetime.date(2026, 8, 5),
        )
        self.authorize(self.token.key)

        response = self.client.get(
            reverse("travel-detail", kwargs={"pk": other_travel.pk})
        )

        self.assertEqual(response.status_code, 404)
