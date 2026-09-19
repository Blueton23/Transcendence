import datetime

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone

from idea.models import Idea, IdeaStatus, IdeaType, Reaction
from travel.models import Step, Travel
from traveler.models import Traveler


class IdeaModelTest(TestCase):
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

    def _make_idea(self, **overrides):
        data = {
            "travel": self.travel,
            "traveler": self.traveler,
            "title": "Bouchon lyonnais",
            "type": IdeaType.RESTAURANT,
        }
        data.update(overrides)
        return Idea.objects.create(**data)

    def test_create_idea_defaults(self):
        idea = self._make_idea()
        self.assertEqual(idea.status, IdeaStatus.SUGGESTED)
        self.assertIsNone(idea.step_id)
        self.assertIsNone(idea.chosen_by_id)
        self.assertIsNone(idea.chosen_at)
        self.assertEqual(idea.note, "")
        self.assertEqual(idea.url, "")
        self.assertTrue(idea.is_in_pool)
        self.assertIsNotNone(idea.created_at)
        self.assertIsNotNone(idea.updated_at)

    def test_idea_attached_to_step_is_not_in_pool(self):
        idea = self._make_idea(
            step=self.step,
            start_date=self.step.start_date,
            end_date=self.step.start_date,
        )
        self.assertFalse(idea.is_in_pool)
        self.assertIn(idea, self.step.ideas.all())

    def test_related_name_ideas_on_travel_and_traveler(self):
        idea = self._make_idea()
        self.assertIn(idea, self.travel.ideas.all())
        self.assertIn(idea, self.traveler.ideas.all())

    def test_cascade_delete_on_travel_removal(self):
        idea = self._make_idea()
        idea_id = idea.id

        self.travel.delete()

        self.assertFalse(Idea.objects.filter(id=idea_id).exists())

    def test_cascade_delete_on_traveler_removal(self):
        idea = self._make_idea()
        idea_id = idea.id

        self.traveler.delete()

        self.assertFalse(Idea.objects.filter(id=idea_id).exists())

    def test_step_hard_delete_sends_idea_back_to_pool(self):
        idea = self._make_idea(
            step=self.step,
            start_date=self.step.start_date,
            end_date=self.step.start_date,
        )

        self.step.delete()
        idea.refresh_from_db()

        self.assertIsNone(idea.step_id)
        self.assertTrue(idea.is_in_pool)
        self.assertIsNone(idea.start_date)
        self.assertIsNone(idea.end_date)

    def test_step_soft_delete_sends_idea_back_to_pool(self):
        idea = self._make_idea(
            step=self.step,
            start_date=self.step.start_date,
            end_date=self.step.start_date,
        )

        self.step.soft_delete()
        idea.refresh_from_db()

        self.assertEqual(idea.step_id, self.step.id)
        self.assertTrue(idea.is_in_pool)
        self.assertIn(idea, Idea.objects.pool())

    def test_step_restore_brings_idea_back_out_of_pool(self):
        idea = self._make_idea(
            step=self.step,
            start_date=self.step.start_date,
            end_date=self.step.start_date,
        )
        self.step.soft_delete()

        self.step.restore()
        idea.refresh_from_db()

        self.assertFalse(idea.is_in_pool)
        self.assertNotIn(idea, Idea.objects.pool())

    def test_chosen_by_set_null_on_traveler_removal(self):
        chooser = Traveler.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="password123",
        )
        idea = self._make_idea(
            type=IdeaType.LODGING,
            step=self.step,
            start_date=self.step.start_date,
            end_date=self.step.end_date,
            chosen_by=chooser,
            chosen_at=timezone.now(),
        )

        chooser.delete()
        idea.refresh_from_db()

        self.assertIsNone(idea.chosen_by_id)
        self.assertEqual(idea.status, IdeaStatus.CHOSEN)

    def test_end_before_start_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                type=IdeaType.LODGING,
                start_date=datetime.date(2026, 6, 10),
                end_date=datetime.date(2026, 6, 8),
            )

    def test_lodging_dates_in_order_are_allowed(self):
        idea = self._make_idea(
            type=IdeaType.LODGING,
            title="Camping du lac",
            price_per_night="24.00",
            start_date=datetime.date(2026, 6, 8),
            end_date=datetime.date(2026, 6, 10),
        )
        self.assertEqual(str(idea.price_per_night), "24.00")

    def test_lodging_without_dates_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_idea(type=IdeaType.LODGING)

    def test_step_from_another_travel_is_rejected(self):
        other_travel = Travel.objects.create(
            title="Other trip",
            start_date=datetime.date(2026, 7, 1),
            end_date=datetime.date(2026, 7, 10),
        )
        other_step = Step.objects.create(
            travel=other_travel,
            localisation="Paris",
            start_date=datetime.date(2026, 7, 2),
            end_date=datetime.date(2026, 7, 4),
        )
        with self.assertRaises(ValidationError):
            self._make_idea(
                step=other_step,
                start_date=other_step.start_date,
                end_date=other_step.start_date,
            )

    def test_non_lodging_cannot_have_price_per_night(self):
        with self.assertRaises(ValidationError):
            self._make_idea(price_per_night="10.00")

    def test_negative_price_per_night_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_idea(type=IdeaType.LODGING, price_per_night="-1.00")

    def test_non_lodging_idea_in_pool_cannot_have_dates(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                start_date=datetime.date(2026, 6, 2),
                end_date=datetime.date(2026, 6, 2),
            )

    def test_non_lodging_idea_placed_must_have_matching_single_day_dates(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                step=self.step,
                start_date=self.step.start_date,
                end_date=self.step.end_date,
            )

    def test_chosen_requires_lodging_type(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                step=self.step,
                start_date=self.step.start_date,
                end_date=self.step.start_date,
                chosen_at=timezone.now(),
            )

    def test_chosen_requires_being_placed_on_a_step(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                type=IdeaType.LODGING,
                start_date=datetime.date(2026, 6, 2),
                end_date=datetime.date(2026, 6, 4),
                chosen_at=timezone.now(),
            )

    def test_overlapping_chosen_lodgings_on_same_step_are_rejected(self):
        self._make_idea(
            type=IdeaType.LODGING,
            step=self.step,
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
            chosen_at=timezone.now(),
        )
        with self.assertRaises(ValidationError):
            self._make_idea(
                title="Autre hebergement",
                type=IdeaType.LODGING,
                step=self.step,
                start_date=datetime.date(2026, 6, 3),
                end_date=datetime.date(2026, 6, 5),
                chosen_at=timezone.now(),
            )

    def test_non_overlapping_chosen_lodgings_on_same_step_are_allowed(self):
        self._make_idea(
            type=IdeaType.LODGING,
            step=self.step,
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 3),
            chosen_at=timezone.now(),
        )
        second = self._make_idea(
            title="Autre hebergement",
            type=IdeaType.LODGING,
            step=self.step,
            start_date=datetime.date(2026, 6, 4),
            end_date=datetime.date(2026, 6, 5),
            chosen_at=timezone.now(),
        )
        self.assertEqual(second.status, IdeaStatus.CHOSEN)

    def test_note_and_url_are_optional(self):
        idea = self._make_idea(
            note="Réserver la table côté terrasse.",
            url="https://example.com/bouchon-lyonnais",
        )
        self.assertEqual(idea.note, "Réserver la table côté terrasse.")
        self.assertEqual(idea.url, "https://example.com/bouchon-lyonnais")

    def test_removing_idea_from_pool_deletes_it(self):
        idea = self._make_idea()
        idea_id = idea.id

        idea.delete()

        self.assertFalse(Idea.objects.filter(id=idea_id).exists())

    def test_pool_queryset_filters_out_stepped_ideas(self):
        pooled = self._make_idea()
        self._make_idea(
            step=self.step,
            start_date=self.step.start_date,
            end_date=self.step.start_date,
        )

        self.assertEqual(list(Idea.objects.pool()), [pooled])

    def test_ordering_is_newest_first(self):
        first = self._make_idea(title="First")
        second = self._make_idea(title="Second")

        self.assertEqual(list(Idea.objects.all()), [second, first])

    def test_str_representation(self):
        idea = self._make_idea(title="Musée")
        self.assertEqual(str(idea), f"Musée ({self.travel})")


class ReactionModelTest(TestCase):
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
        self.idea = Idea.objects.create(
            travel=self.travel,
            traveler=self.traveler,
            title="Bouchon lyonnais",
            type=IdeaType.RESTAURANT,
        )

    def test_create_reaction(self):
        reaction = Reaction.objects.create(traveler=self.traveler, idea=self.idea)
        self.assertIsNotNone(reaction.created_at)
        self.assertIn(reaction, self.idea.reactions.all())
        self.assertIn(reaction, self.traveler.reactions.all())

    def test_duplicate_reaction_raises_integrity_error(self):
        Reaction.objects.create(traveler=self.traveler, idea=self.idea)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Reaction.objects.create(traveler=self.traveler, idea=self.idea)

    def test_cascade_delete_on_idea_removal(self):
        reaction = Reaction.objects.create(traveler=self.traveler, idea=self.idea)
        reaction_id = reaction.id

        self.idea.delete()

        self.assertFalse(Reaction.objects.filter(id=reaction_id).exists())

    def test_cascade_delete_on_traveler_removal(self):
        reaction = Reaction.objects.create(traveler=self.traveler, idea=self.idea)
        reaction_id = reaction.id

        self.traveler.delete()

        self.assertFalse(Reaction.objects.filter(id=reaction_id).exists())

    def test_no_updated_at_field(self):
        field_names = {f.name for f in Reaction._meta.get_fields()}
        self.assertNotIn("updated_at", field_names)
