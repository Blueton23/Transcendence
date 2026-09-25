import datetime

from django.core.exceptions import ValidationError
from django.test import TestCase

from idea.models import Idea, IdeaType
from spending.models import Spending, SpendingCategory
from travel.models import Step, Travel
from traveler.models import Traveler


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
        self.step = Step.objects.create(
            travel=self.travel,
            localisation="Lyon",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
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
