import datetime
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase

from idea.models import Idea, IdeaType
from spending.models import Spending, SpendingCategory, SpendingShare
from spending.services import (
    compute_balances,
    compute_settlements,
    create_spending,
    set_shares,
    split_equally,
    update_spending,
)
from travel.models import Participation, ParticipationStatus, Step, Travel
from traveler.models import Traveler

COORDS = {"latitude": 46.5197, "longitude": 6.6323}


class SpendingModelTest(TestCase):
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
            **COORDS,
        )
        self.idea = Idea.objects.create(
            travel=self.travel,
            traveler=self.traveler,
            title="Bouchon lyonnais",
            type=IdeaType.RESTAURANT,
        )

    def _make_spending(self, **overrides):
        data = {
            "travel": self.travel,
            "traveler": self.traveler,
            "category": SpendingCategory.FUEL,
            "amount": "42.50",
        }
        data.update(overrides)
        return Spending.objects.create(**data)

    def test_create_spending_defaults(self):
        spending = self._make_spending()
        self.assertIsNone(spending.step_id)
        self.assertIsNone(spending.idea_id)
        self.assertIsNone(spending.paid_date)
        self.assertIsNotNone(spending.created_at)
        self.assertIsNotNone(spending.updated_at)

    def test_spending_can_be_attached_to_step(self):
        spending = self._make_spending(step=self.step, category=SpendingCategory.TOLLS)
        self.assertEqual(spending.step, self.step)

    def test_spending_can_be_attached_to_idea(self):
        spending = self._make_spending(idea=self.idea, category=SpendingCategory.MEALS)
        self.assertEqual(spending.idea, self.idea)

    def test_step_from_another_travel_is_rejected(self):
        other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        other_step = Step.objects.create(
            travel=other_travel,
            localisation="Nice",
            start_date=datetime.date(2026, 7, 2),
            end_date=datetime.date(2026, 7, 3),
            **COORDS,
        )
        with self.assertRaises(ValidationError):
            self._make_spending(step=other_step)

    def test_idea_from_another_travel_is_rejected(self):
        other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        other_idea = Idea.objects.create(
            travel=other_travel,
            traveler=self.traveler,
            title="Somewhere else",
            type=IdeaType.SIGHT,
        )
        with self.assertRaises(ValidationError):
            self._make_spending(idea=other_idea)

    def test_negative_amount_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_spending(amount="-5.00")

    def test_step_deletion_keeps_spending_and_clears_link(self):
        spending = self._make_spending(step=self.step)
        self.step.delete()
        spending.refresh_from_db()
        self.assertIsNone(spending.step_id)

    def test_idea_deletion_keeps_spending_and_clears_link(self):
        spending = self._make_spending(idea=self.idea)
        self.idea.delete()
        spending.refresh_from_db()
        self.assertIsNone(spending.idea_id)

    def test_step_must_match_idea_step(self):
        other_step = Step.objects.create(
            travel=self.travel,
            localisation="Grenoble",
            start_date=datetime.date(2026, 6, 5),
            end_date=datetime.date(2026, 6, 6),
            **COORDS,
        )
        placed_idea = Idea.objects.create(
            travel=self.travel,
            traveler=self.traveler,
            step=self.step,
            title="Musee",
            type=IdeaType.SIGHT,
            start_date=datetime.date(2026, 6, 3),
            end_date=datetime.date(2026, 6, 3),
        )
        with self.assertRaises(ValidationError) as ctx:
            self._make_spending(idea=placed_idea, step=other_step)
        self.assertIn("step", ctx.exception.message_dict)

        spending = self._make_spending(idea=placed_idea, step=self.step)
        self.assertEqual(spending.step, self.step)

    def test_step_allowed_when_idea_is_in_pool(self):
        spending = self._make_spending(idea=self.idea, step=self.step)
        self.assertEqual(spending.step, self.step)

    def test_invalid_category_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_spending(category="z")

    def test_payer_with_spendings_cannot_be_deleted(self):
        self._make_spending()
        with self.assertRaises(ProtectedError):
            self.traveler.delete()

    def test_travel_deletion_cascades(self):
        self._make_spending()
        self.travel.delete()
        self.assertFalse(Spending.objects.exists())

    def test_str(self):
        spending = self._make_spending()
        self.assertEqual(str(spending), "Fuel - 42.50 (Road trip)")

    def test_paid_date_is_a_date(self):
        spending = self._make_spending(paid_date=datetime.date(2026, 6, 3))
        spending.refresh_from_db()
        self.assertEqual(spending.paid_date, datetime.date(2026, 6, 3))

    def test_label_defaults_to_empty(self):
        spending = self._make_spending()
        self.assertEqual(spending.label, "")

    def test_label_is_saved(self):
        spending = self._make_spending(label="Hotel Ibis Lyon")
        spending.refresh_from_db()
        self.assertEqual(spending.label, "Hotel Ibis Lyon")

    def test_label_too_long_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_spending(label="x" * 101)

    def test_traveler_without_participation_is_rejected(self):
        outsider = Traveler.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="password123",
        )
        with self.assertRaises(ValidationError) as ctx:
            self._make_spending(traveler=outsider)
        self.assertIn("traveler", ctx.exception.message_dict)

    def test_traveler_not_accepted_is_rejected(self):
        for status in (ParticipationStatus.INVITED, ParticipationStatus.REFUSED):
            with self.subTest(status=status):
                Participation.objects.filter(traveler=self.traveler).update(
                    status=status
                )
                with self.assertRaises(ValidationError) as ctx:
                    self._make_spending()
                self.assertIn("traveler", ctx.exception.message_dict)

    def test_traveler_who_left_can_still_have_spendings(self):
        spending = self._make_spending()
        Participation.objects.filter(traveler=self.traveler).update(
            status=ParticipationStatus.LEFT
        )
        spending.amount = "50.00"
        spending.save()
        spending.refresh_from_db()
        self.assertEqual(spending.amount, Decimal("50.00"))

    def test_traveler_participating_in_another_travel_is_rejected(self):
        other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        with self.assertRaises(ValidationError):
            self._make_spending(travel=other_travel)


class SpendingShareModelTest(TestCase):
    def setUp(self):
        self.alice = Traveler.objects.create_user(
            username="alice", email="alice@example.com", password="password123"
        )
        self.bob = Traveler.objects.create_user(
            username="bob", email="bob@example.com", password="password123"
        )
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        for traveler in (self.alice, self.bob):
            Participation.objects.create(
                traveler=traveler,
                travel=self.travel,
                status=ParticipationStatus.ACCEPTED,
            )
        self.spending = Spending.objects.create(
            travel=self.travel,
            traveler=self.alice,
            category=SpendingCategory.FUEL,
            amount="30.00",
        )

    def _make_share(self, **overrides):
        data = {"spending": self.spending, "traveler": self.bob, "amount": "15.00"}
        data.update(overrides)
        return SpendingShare.objects.create(**data)

    def test_create_share(self):
        share = self._make_share()
        self.assertEqual(share.amount, Decimal("15.00"))
        self.assertIn(share, self.spending.shares.all())
        self.assertIn(share, self.bob.spending_shares.all())

    def test_payer_can_have_a_share(self):
        share = self._make_share(traveler=self.alice)
        self.assertEqual(share.traveler, self.alice)

    def test_duplicate_share_is_rejected(self):
        self._make_share()
        with self.assertRaises(ValidationError):
            self._make_share()

    def test_duplicate_share_is_rejected_at_db_level(self):
        self._make_share()
        duplicate = SpendingShare(
            spending=self.spending, traveler=self.bob, amount="1.00"
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            SpendingShare.objects.bulk_create([duplicate])

    def test_negative_amount_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_share(amount="-1.00")

    def test_non_member_is_rejected(self):
        outsider = Traveler.objects.create_user(
            username="carol", email="carol@example.com", password="password123"
        )
        with self.assertRaises(ValidationError) as ctx:
            self._make_share(traveler=outsider)
        self.assertIn("traveler", ctx.exception.message_dict)

    def test_invited_traveler_is_rejected(self):
        Participation.objects.filter(traveler=self.bob).update(
            status=ParticipationStatus.INVITED
        )
        with self.assertRaises(ValidationError):
            self._make_share()

    def test_share_survives_traveler_leaving(self):
        share = self._make_share()
        Participation.objects.filter(traveler=self.bob).update(
            status=ParticipationStatus.LEFT
        )
        share.amount = "10.00"
        share.save()
        share.refresh_from_db()
        self.assertEqual(share.amount, Decimal("10.00"))

    def test_spending_deletion_cascades(self):
        self._make_share()
        self.spending.delete()
        self.assertFalse(SpendingShare.objects.exists())

    def test_traveler_with_shares_cannot_be_deleted(self):
        self._make_share()
        with self.assertRaises(ProtectedError):
            self.bob.delete()

    def test_str(self):
        share = self._make_share()
        self.assertEqual(str(share), "bob owes 15.00 (Fuel - 30.00 (Road trip))")


class SplitEquallyTest(TestCase):
    def setUp(self):
        self.travelers = [
            Traveler.objects.create_user(
                username=name, email=f"{name}@example.com", password="password123"
            )
            for name in ("alice", "bob", "carol")
        ]

    def test_even_split(self):
        shares = split_equally(Decimal("30.00"), self.travelers)
        self.assertEqual(set(shares.values()), {Decimal("10.00")})

    def test_remaining_cents_go_to_first_travelers(self):
        shares = split_equally(Decimal("10.00"), reversed(self.travelers))
        alice, bob, carol = self.travelers
        self.assertEqual(shares[alice], Decimal("3.34"))
        self.assertEqual(shares[bob], Decimal("3.33"))
        self.assertEqual(shares[carol], Decimal("3.33"))
        self.assertEqual(sum(shares.values()), Decimal("10.00"))

    def test_no_traveler_is_rejected(self):
        with self.assertRaises(ValidationError):
            split_equally(Decimal("10.00"), [])


class SpendingServiceTest(TestCase):
    def setUp(self):
        self.alice, self.bob, self.carol = (
            Traveler.objects.create_user(
                username=name, email=f"{name}@example.com", password="password123"
            )
            for name in ("alice", "bob", "carol")
        )
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        for traveler in (self.alice, self.bob):
            Participation.objects.create(
                traveler=traveler,
                travel=self.travel,
                status=ParticipationStatus.ACCEPTED,
            )
        Participation.objects.create(
            traveler=self.carol,
            travel=self.travel,
            status=ParticipationStatus.INVITED,
        )

    def _create(self, **overrides):
        data = {
            "travel": self.travel,
            "traveler": self.alice,
            "category": SpendingCategory.FUEL,
            "amount": Decimal("30.00"),
        }
        data.update(overrides)
        return create_spending(**data)

    def _shares(self, spending):
        return {share.traveler: share.amount for share in spending.shares.all()}

    def test_default_split_between_accepted_travelers(self):
        spending = self._create()
        self.assertEqual(
            self._shares(spending),
            {self.alice: Decimal("15.00"), self.bob: Decimal("15.00")},
        )

    def test_custom_shares(self):
        spending = self._create(
            shares={self.alice: Decimal("12.00"), self.bob: Decimal("18.00")}
        )
        self.assertEqual(self._shares(spending)[self.bob], Decimal("18.00"))

    def test_shares_not_matching_amount_roll_back_everything(self):
        with self.assertRaises(ValidationError) as ctx:
            self._create(shares={self.alice: Decimal("10.00")})
        self.assertIn("shares", ctx.exception.message_dict)
        self.assertFalse(Spending.objects.exists())
        self.assertFalse(SpendingShare.objects.exists())

    def test_share_for_non_member_rolls_back_everything(self):
        with self.assertRaises(ValidationError):
            self._create(
                shares={self.alice: Decimal("15.00"), self.carol: Decimal("15.00")}
            )
        self.assertFalse(Spending.objects.exists())

    def test_empty_shares_are_rejected(self):
        with self.assertRaises(ValidationError):
            self._create(shares={})

    def test_traveler_who_left_keeps_shares(self):
        spending = self._create()
        Participation.objects.filter(traveler=self.bob).update(
            status=ParticipationStatus.LEFT
        )
        later = self._create(amount=Decimal("8.00"))
        self.assertIn(self.bob, self._shares(spending))
        self.assertEqual(self._shares(later), {self.alice: Decimal("8.00")})

    def test_update_amount_resplits_between_current_holders(self):
        spending = self._create(shares={self.alice: Decimal("30.00")})
        update_spending(spending, amount=Decimal("40.00"))
        self.assertEqual(self._shares(spending), {self.alice: Decimal("40.00")})

    def test_update_with_explicit_shares(self):
        spending = self._create()
        update_spending(
            spending,
            amount=Decimal("40.00"),
            shares={self.alice: Decimal("10.00"), self.bob: Decimal("30.00")},
        )
        spending.refresh_from_db()
        self.assertEqual(spending.amount, Decimal("40.00"))
        self.assertEqual(self._shares(spending)[self.bob], Decimal("30.00"))

    def test_update_without_amount_change_keeps_shares(self):
        spending = self._create(
            shares={self.alice: Decimal("10.00"), self.bob: Decimal("20.00")}
        )
        update_spending(spending, label="Plein a Lyon")
        self.assertEqual(self._shares(spending)[self.bob], Decimal("20.00"))

    def test_update_spending_without_shares_uses_default_split(self):
        spending = Spending.objects.create(
            travel=self.travel,
            traveler=self.alice,
            category=SpendingCategory.FUEL,
            amount="30.00",
        )
        update_spending(spending, amount=Decimal("20.00"))
        self.assertEqual(
            self._shares(spending),
            {self.alice: Decimal("10.00"), self.bob: Decimal("10.00")},
        )

    def test_failed_update_rolls_back_amount(self):
        spending = self._create()
        with self.assertRaises(ValidationError):
            update_spending(
                spending, amount=Decimal("40.00"), shares={self.alice: Decimal("1.00")}
            )
        spending.refresh_from_db()
        self.assertEqual(spending.amount, Decimal("30.00"))

    def test_update_cannot_move_spending_to_another_travel(self):
        spending = self._create()
        other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        for fields in ({"travel": other_travel}, {"travel_id": other_travel.pk}):
            with self.subTest(fields=fields):
                with self.assertRaises(ValidationError) as ctx:
                    update_spending(spending, **fields)
                self.assertIn("travel", ctx.exception.message_dict)
        spending.refresh_from_db()
        self.assertEqual(spending.travel, self.travel)

    def test_update_with_same_travel_is_allowed(self):
        spending = self._create()
        update_spending(spending, travel=self.travel, label="Plein")
        self.assertEqual(spending.label, "Plein")

    def test_set_shares_replaces_previous_ones(self):
        spending = self._create()
        set_shares(spending, {self.bob: Decimal("30.00")})
        self.assertEqual(self._shares(spending), {self.bob: Decimal("30.00")})


class ComputeBalancesTest(TestCase):
    def setUp(self):
        self.alice, self.bob, self.carol, self.dave = (
            Traveler.objects.create_user(
                username=name, email=f"{name}@example.com", password="password123"
            )
            for name in ("alice", "bob", "carol", "dave")
        )
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        for traveler in (self.alice, self.bob, self.carol):
            Participation.objects.create(
                traveler=traveler,
                travel=self.travel,
                status=ParticipationStatus.ACCEPTED,
            )
        # dave a ete invite mais n'a jamais accepte : il n'a pas de solde.
        Participation.objects.create(
            traveler=self.dave,
            travel=self.travel,
            status=ParticipationStatus.INVITED,
        )

    def _spend(self, payer, amount, shares=None):
        return create_spending(
            travel=self.travel,
            traveler=payer,
            category=SpendingCategory.FUEL,
            amount=Decimal(amount),
            shares=shares,
        )

    def _by_traveler(self):
        return {b.traveler: b for b in compute_balances(self.travel)}

    def test_no_spending_gives_zero_balances(self):
        balances = self._by_traveler()
        self.assertEqual(set(balances), {self.alice, self.bob, self.carol})
        for balance in balances.values():
            self.assertEqual(balance.paid, Decimal(0))
            self.assertEqual(balance.owed, Decimal(0))
            self.assertEqual(balance.balance, Decimal(0))

    def test_equal_split(self):
        self._spend(self.alice, "90.00")
        balances = self._by_traveler()
        self.assertEqual(balances[self.alice].paid, Decimal("90.00"))
        self.assertEqual(balances[self.alice].owed, Decimal("30.00"))
        self.assertEqual(balances[self.alice].balance, Decimal("60.00"))
        self.assertEqual(balances[self.bob].balance, Decimal("-30.00"))
        self.assertEqual(balances[self.carol].balance, Decimal("-30.00"))

    def test_several_spendings_and_custom_shares(self):
        self._spend(self.alice, "90.00")
        self._spend(
            self.bob,
            "40.00",
            shares={self.bob: Decimal("22.00"), self.carol: Decimal("18.00")},
        )
        balances = self._by_traveler()
        self.assertEqual(balances[self.alice].balance, Decimal("60.00"))
        self.assertEqual(balances[self.bob].balance, Decimal("-12.00"))
        self.assertEqual(balances[self.carol].balance, Decimal("-48.00"))

    def test_balances_sum_to_zero(self):
        self._spend(self.alice, "10.00")
        self._spend(self.bob, "33.33")
        self._spend(self.carol, "7.01")
        total = sum(b.balance for b in compute_balances(self.travel))
        self.assertEqual(total, Decimal(0))

    def test_traveler_who_left_keeps_their_balance(self):
        self._spend(self.alice, "90.00")
        Participation.objects.filter(traveler=self.carol).update(
            status=ParticipationStatus.LEFT
        )
        self._spend(self.alice, "20.00")
        balances = self._by_traveler()
        self.assertIn(self.carol, balances)
        self.assertEqual(balances[self.carol].balance, Decimal("-30.00"))
        self.assertEqual(balances[self.bob].balance, Decimal("-40.00"))

    def test_other_travels_are_ignored(self):
        other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        Participation.objects.create(
            traveler=self.alice,
            travel=other_travel,
            status=ParticipationStatus.ACCEPTED,
        )
        create_spending(
            travel=other_travel,
            traveler=self.alice,
            category=SpendingCategory.FUEL,
            amount=Decimal("100.00"),
        )
        self.assertEqual(self._by_traveler()[self.alice].paid, Decimal(0))

    def test_sorted_by_traveler_id(self):
        travelers = [b.traveler for b in compute_balances(self.travel)]
        self.assertEqual(travelers, [self.alice, self.bob, self.carol])

    def test_query_count_does_not_grow_with_spendings(self):
        for _ in range(5):
            self._spend(self.alice, "10.00")
        with self.assertNumQueries(4):
            compute_balances(self.travel)


class ComputeSettlementsTest(TestCase):
    def setUp(self):
        self.alice, self.bob, self.carol, self.dave = (
            Traveler.objects.create_user(
                username=name, email=f"{name}@example.com", password="password123"
            )
            for name in ("alice", "bob", "carol", "dave")
        )
        self.travel = Travel.objects.create(
            title="Road trip",
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 6, 15),
        )
        for traveler in (self.alice, self.bob, self.carol, self.dave):
            Participation.objects.create(
                traveler=traveler,
                travel=self.travel,
                status=ParticipationStatus.ACCEPTED,
            )

    def _spend(self, payer, amount, shares=None):
        return create_spending(
            travel=self.travel,
            traveler=payer,
            category=SpendingCategory.FUEL,
            amount=Decimal(amount),
            shares=shares,
        )

    def _as_tuples(self):
        return [
            (s.debtor, s.creditor, s.amount) for s in compute_settlements(self.travel)
        ]

    def _assert_settles_everyone(self):
        remaining = {b.traveler: b.balance for b in compute_balances(self.travel)}
        for settlement in compute_settlements(self.travel):
            self.assertGreater(settlement.amount, 0)
            remaining[settlement.debtor] += settlement.amount
            remaining[settlement.creditor] -= settlement.amount
        self.assertEqual(set(remaining.values()), {Decimal(0)})

    def test_no_spending_needs_no_settlement(self):
        self.assertEqual(compute_settlements(self.travel), [])

    def test_payer_alone_in_shares_needs_no_settlement(self):
        self._spend(self.alice, "50.00", shares={self.alice: Decimal("50.00")})
        self.assertEqual(compute_settlements(self.travel), [])

    def test_mockup_example(self):
        # 1 240 CHF a 4 : 310 chacun -> alice +250, bob +110, carol -145, dave -215.
        self._spend(self.alice, "560.00")
        self._spend(self.bob, "420.00")
        self._spend(self.carol, "165.00")
        self._spend(self.dave, "95.00")
        self.assertEqual(
            self._as_tuples(),
            [
                (self.dave, self.alice, Decimal("215.00")),
                (self.carol, self.bob, Decimal("110.00")),
                (self.carol, self.alice, Decimal("35.00")),
            ],
        )
        self._assert_settles_everyone()

    def test_at_most_n_minus_one_transfers(self):
        self._spend(self.alice, "10.00")
        self._spend(self.bob, "33.33")
        self._spend(self.carol, "7.01")
        self._spend(self.dave, "0.05")
        self.assertLessEqual(len(compute_settlements(self.travel)), 3)
        self._assert_settles_everyone()

    def test_uneven_cents_are_fully_settled(self):
        self._spend(self.alice, "10.00")
        self._spend(self.bob, "1.00")
        self._assert_settles_everyone()

    def test_traveler_who_left_still_settles(self):
        self._spend(self.alice, "40.00")
        Participation.objects.filter(traveler=self.dave).update(
            status=ParticipationStatus.LEFT
        )
        debtors = {s.debtor for s in compute_settlements(self.travel)}
        self.assertIn(self.dave, debtors)
        self._assert_settles_everyone()
