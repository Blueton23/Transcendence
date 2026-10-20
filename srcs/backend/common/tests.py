from io import StringIO
from unittest.mock import patch

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, TestCase

from chat.models import Message
from common.realtime import broadcast, travel_group
from common.seeders.clear import clear_seed_data
from common.testing import WebsocketCommunicator
from idea.models import Idea, Reaction
from spending.models import Spending
from travel.models import Participation, Step, Travel
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


"""@TODO fix the hang ind the following tests"""


class SeedFreshFlagTest(TestCase):
    def test_fresh_clears_previous_seed_first(self):
        _seed(travelers=8, travels=4)
        _seed(travelers=5, travels=2, fresh=True)

        self.assertEqual(Travel.objects.count(), 2)
        self.assertEqual(Traveler.objects.count(), 104)

    def test_fresh_keeps_superuser(self):
        Traveler.objects.create_superuser(
            username="admin", email="admin@example.com", password="pw"
        )
        _seed(travelers=4, fresh=True)

        self.assertTrue(Traveler.objects.filter(username="admin").exists())
        self.assertEqual(Traveler.objects.count(), 104)


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


class BroadcastTest(TestCase):
    """Hits the real Redis channel layer configured in settings."""

    def setUp(self):
        self.layer = get_channel_layer()
        self.channel = async_to_sync(self.layer.new_channel)()
        self.group = travel_group(42)
        async_to_sync(self.layer.group_add)(self.group, self.channel)
        self.addCleanup(
            async_to_sync(self.layer.group_discard), self.group, self.channel
        )

    def test_travel_group_name(self):
        self.assertEqual(self.group, "travel_42")

    def test_sends_camelized_envelope_after_commit(self):
        with self.captureOnCommitCallbacks(execute=True):
            broadcast(
                self.group,
                "idea.created",
                {"idea_id": 1, "created_by": {"display_name": "Ana"}},
            )

        message = async_to_sync(self.layer.receive)(self.channel)

        self.assertEqual(
            message,
            {
                "type": "idea.created",
                "payload": {"ideaId": 1, "createdBy": {"displayName": "Ana"}},
            },
        )

    def test_waits_for_commit(self):
        with self.captureOnCommitCallbacks(execute=False) as callbacks:
            broadcast(self.group, "idea.created", {})

        self.assertEqual(len(callbacks), 1)


class WebsocketCommunicatorTest(SimpleTestCase):
    async def test_merges_extra_scope(self):
        async def app(scope, receive, send):
            await receive()
            if scope["user"] == "ana" and scope["url_route"]["kwargs"]["id"] == 1:
                await send({"type": "websocket.accept"})
            else:
                await send({"type": "websocket.close"})

        communicator = WebsocketCommunicator(
            app,
            "/ws/test/",
            scope={"user": "ana", "url_route": {"args": (), "kwargs": {"id": 1}}},
        )
        connected, _ = await communicator.connect()

        self.assertTrue(connected)
