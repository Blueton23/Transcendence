from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from common.seeders.clear import clear_seed_data
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
    }
    defaults.update(kwargs)
    call_command("seed", stdout=StringIO(), **defaults)


class ClearSeedDataTest(TestCase):
    def test_clears_every_domain_table(self):
        _seed()
        self.assertTrue(Travel.objects.exists())

        deleted = clear_seed_data()

        self.assertEqual(Traveler.objects.count(), 0)
        self.assertEqual(Friendship.objects.count(), 0)
        self.assertEqual(Participation.objects.count(), 0)
        self.assertEqual(Step.objects.count(), 0)
        self.assertEqual(Travel.objects.count(), 0)
        self.assertEqual(
            set(deleted),
            {
                "friendships",
                "participations",
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
