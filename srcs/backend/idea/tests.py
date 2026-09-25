import datetime
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.serializers import ValidationError as DRFValidationError
from rest_framework.test import APITestCase

from idea.models import Idea, IdeaStatus, IdeaType, Reaction
from idea.serializers import IdeaSerializer, ReactionSerializer
from travel.models import (
    Participation,
    ParticipationStatus,
    Step,
    Travel,
)
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
        self.assertEqual(idea.status, IdeaStatus.PLACED)
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

    def test_step_hard_delete_clears_chosen_lodging(self):
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

        self.step.delete()
        idea.refresh_from_db()

        self.assertIsNone(idea.chosen_by)
        self.assertIsNone(idea.chosen_at)

        self.assertEqual(idea.start_date, self.step.start_date)
        self.assertEqual(idea.end_date, self.step.end_date)

    def test_end_before_start_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                type=IdeaType.LODGING,
                start_date=datetime.date(2026, 6, 10),
                end_date=datetime.date(2026, 6, 8),
            )

    def test_database_rejects_end_date_before_start_date(self):
        idea = self._make_idea(
            type=IdeaType.LODGING,
            start_date=datetime.date(2026, 6, 8),
            end_date=datetime.date(2026, 6, 10),
        )

        with self.assertRaises(IntegrityError), transaction.atomic():
            Idea.objects.filter(pk=idea.pk).update(
                end_date=datetime.date(2026, 6, 7),
            )

    def test_only_one_date_is_rejected(self):
        date_cases = [
            {
                "start_date": datetime.date(2026, 6, 3),
                "end_date": None,
            },
            {
                "start_date": None,
                "end_date": datetime.date(2026, 6, 3),
            },
        ]

        for date_case in date_cases:
            with self.subTest(date_case=date_case), self.assertRaises(ValidationError):
                self._make_idea(
                    type=IdeaType.LODGING,
                    **date_case,
                )

    def test_idea_dates_outside_step_are_rejected(self):
        outside_date = self.step.end_date + datetime.timedelta(days=1)

        with self.assertRaises(ValidationError) as context:
            self._make_idea(
                step=self.step,
                start_date=outside_date,
                end_date=outside_date,
            )

        self.assertIn("step", context.exception.message_dict)

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
        with self.assertRaises(ValidationError) as context:
            self._make_idea(
                type=IdeaType.LODGING,
                price_per_night="-1.00",
                start_date=datetime.date(2026, 6, 8),
                end_date=datetime.date(2026, 6, 10),
            )

        self.assertIn("price_per_night", context.exception.message_dict)

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

    def test_non_lodging_placed_without_dates_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_idea(
                type=IdeaType.RESTAURANT,
                step=self.step,
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
                end_date=datetime.date(2026, 6, 4),
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
            end_date=datetime.date(2026, 6, 4),
            chosen_at=timezone.now(),
        )
        self.assertEqual(second.status, IdeaStatus.CHOSEN)

    def test_chosen_lodging_does_not_overlap_with_itself(self):
        idea = self._make_idea(
            type=IdeaType.LODGING,
            step=self.step,
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 4),
            chosen_at=timezone.now(),
        )

        idea.title = "Hotel modifié"
        idea.save()

        self.assertEqual(idea.title, "Hotel modifié")

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

    def test_str_representation(self):
        reaction = Reaction.objects.create(
            traveler=self.traveler,
            idea=self.idea,
        )

        self.assertEqual(
            str(reaction),
            f"{self.traveler} <3 {self.idea}",
        )


# ========================================================================#

# ========================================================================#
# --- Idée -> Serializer tests --- #
# ========================================================================#

# Une idée ne peut pas exister sans un traveler et un travel


class IdeaSerializerTest(TestCase):
    def setUp(self):
        # Travel principal
        self.traveler = Traveler.objects.create_user(
            username="Jean",
            email="jean@exemple.com",
            password="password123",
        )
        self.travel = Travel.objects.create(
            title="Road trip Suisse",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 10),
        )
        self.step = Step.objects.create(
            travel=self.travel,
            localisation="Vouvry",
            start_date=datetime.date(2026, 6, 3),
            end_date=datetime.date(2026, 6, 3),
        )

        # Autre Travel
        self.other_traveler = Traveler.objects.create_user(
            username="Paul",
            email="paul@exemple.com",
            password="password123",
        )
        self.other_travel = Travel.objects.create(
            title="Road trip France",
            start_date=datetime.date(2026, 7, 2),
            end_date=datetime.date(2026, 7, 10),
        )
        self.other_step = Step.objects.create(
            travel=self.other_travel,
            localisation="Paris",
            start_date=datetime.date(2026, 7, 3),
            end_date=datetime.date(2026, 7, 3),
        )

    # ========================================================================#
    # Bloc 1 : Sérialisation, désérialisation et validation
    # ========================================================================#

    # Test : Sérialisation Idea -> data, les champs et valeurs sortent correctement
    def test_serialized_idea_has_expected_data(self):
        idea = Idea.objects.create(
            travel=self.travel,
            traveler=self.traveler,
            title="Brasserie",
            type=IdeaType.RESTAURANT,
        )

        data = IdeaSerializer(idea).data

        expected_keys = {
            "id",
            "travel_id",
            "traveler_id",
            "step_id",
            "chosen_by_id",
            "title",
            "type",
            "status",
            "localisation",
            "note",
            "url",
            "latitude",
            "longitude",
            "price_per_night",
            "start_date",
            "end_date",
            "chosen_at",
            "created_at",
            "updated_at",
        }
        self.assertEqual(set(data.keys()), expected_keys)

        self.assertEqual(data["traveler_id"], self.traveler.id)
        self.assertEqual(data["travel_id"], self.travel.id)
        self.assertEqual(data["title"], "Brasserie")
        self.assertEqual(data["type"], IdeaType.RESTAURANT)
        self.assertEqual(data["status"], IdeaStatus.SUGGESTED)

    # Test : Désérialisation + création, les données deviennent une Idea sauvegardée
    def test_create_idea_with_serializer(self):
        data = {
            "title": "Brasserie",
            "type": IdeaType.RESTAURANT,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())

        self.assertEqual(serializer.validated_data["title"], "Brasserie")
        self.assertEqual(serializer.validated_data["type"], IdeaType.RESTAURANT)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertEqual(idea.title, "Brasserie")
        self.assertEqual(idea.travel_id, self.travel.id)
        self.assertEqual(idea.traveler_id, self.traveler.id)

    # ========================================================================#

    # ========================================================================#
    # Bloc 2 : Validation step_id
    # ========================================================================#

    # Test : Validation de la step_id, l’ID devient le bon objet Step
    def test_valid_step_id(self):
        data = {
            "title": "Brasserie",
            "type": IdeaType.RESTAURANT,
            "step_id": self.step.id,
            "start_date": "2026-06-03",
            "end_date": "2026-06-03",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertEqual(idea.step, self.step)

    # Test : Validaton si step est null, Idea dans le pool
    def test_step_id_null(self):
        data = {
            "title": "Brasserie",
            "type": IdeaType.RESTAURANT,
            "step_id": None,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertIsNone(idea.step)

    # Test : step_id inexistant, refus pendant is_valid
    def test_step_id_not_exist(self):
        data = {
            "title": "Brasserie",
            "type": IdeaType.RESTAURANT,
            "step_id": self.step.id + 9999,
        }

        serializer = IdeaSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("step_id", serializer.errors)

    # Test 7 : Step d’un autre Travel, accepté par le serializer, puis refusé par le modèle au save
    def test_rejects_step_from_another_travel(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "step_id": self.other_step.id,
            "start_date": "2026-07-03",
            "end_date": "2026-07-03",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())

        with self.assertRaises(DRFValidationError) as context:
            serializer.save(
                traveler=self.traveler,
                travel=self.travel,
            )

        self.assertIn("step", context.exception.detail)

    # ========================================================================#

    # ========================================================================#
    # Bloc 3 : Vérification des champs read-only
    # ========================================================================#

    # Test : Vérifie que id envoyé par le frontend est ignoré
    def test_id_is_read_only(self):
        data = {
            "id": 1,
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("id", serializer.validated_data)

    # Test : Vérifie que travel envoyé par le frontend est ignoré
    def test_travel_id_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "travel_id": self.other_travel.id,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("travel_id", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertEqual(idea.travel, self.travel)

    # Test : Vérifie que traveler envoyé par le frontend est ignoré
    def test_traveler_id_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "traveler_id": self.other_traveler.id,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("traveler_id", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertEqual(idea.traveler, self.traveler)

    # Test : Vérifie que chosen_by_id envoyé par le frontend est ignoré
    def test_chosen_by_id_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "chosen_by_id": self.other_traveler.id,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("chosen_by_id", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertIsNone(idea.chosen_by)

    # Test : Vérifie que chosen_at envoyé par le frontend est ignoré
    def test_chosen_at_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "chosen_at": "2026-07-03T14:30:00Z",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("chosen_at", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertIsNone(idea.chosen_at)

    # Test : Vérifie que status envoyé par le frontend est ignoré
    def test_status_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "status": IdeaStatus.CHOSEN,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("status", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertEqual(idea.status, IdeaStatus.SUGGESTED)

    # Test : Vérifie que created_at envoyé par le frontend est ignoré
    def test_created_at_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "created_at": "2000-01-01T00:00:00Z",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("created_at", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertIsNotNone(idea.created_at)

    # Test : Vérifie que updated_at envoyé par le frontend est ignoré
    def test_updated_at_is_read_only(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "updated_at": "2000-01-01T00:00:00Z",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("updated_at", serializer.validated_data)

        idea = serializer.save(
            traveler=self.traveler,
            travel=self.travel,
        )

        self.assertIsNotNone(idea.updated_at)

    # ========================================================================#

    # ========================================================================#
    # Bloc 4 :  Type d'idée
    # ========================================================================#

    # Test : Validation des types d'idée
    def test_valid_idea_types(self):
        valid_types = [
            IdeaType.RESTAURANT,
            IdeaType.LODGING,
            IdeaType.ACTIVITY,
            IdeaType.SIGHT,
        ]

        for idea_type in valid_types:
            with self.subTest(idea_type=idea_type):
                data = {
                    "title": "Test",
                    "type": idea_type,
                }

                serializer = IdeaSerializer(data=data)

                self.assertTrue(serializer.is_valid())
                self.assertEqual(serializer.validated_data["type"], idea_type)

    # Test : Refus d'un type d'idée inconnu
    def test_invalid_idea_types(self):
        data = {
            "title": "Test",
            "type": "invalid_types",
        }

        serializer = IdeaSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("type", serializer.errors)

    # ========================================================================#

    # ========================================================================#
    # Bloc 5 : Champs modifiables / optionnels
    # ========================================================================#

    # Test : Validation des champs - localisation, note, url
    def test_optional_text_valid(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "localisation": "Valais",
            "note": "Réserver le restaurant",
            "url": "http://pizzeria.ch",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["localisation"], "Valais")
        self.assertEqual(serializer.validated_data["note"], "Réserver le restaurant")
        self.assertEqual(serializer.validated_data["url"], "http://pizzeria.ch")

    # ========================================================================#

    # ========================================================================#
    # Bloc 6 : Conversion des champs speciaux
    # ========================================================================#

    # Test : Validation des champs - latitude, longitude
    def test_coordinates_valid(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "localisation": "Valais",
            "longitude": "56.789643",
            "latitude": "7.678976",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["longitude"], Decimal("56.789643"))
        self.assertEqual(serializer.validated_data["latitude"], Decimal("7.678976"))

    # Test : Validation - longitude, latitude en null
    def test_coordinates_null(self):
        data = {
            "title": "Pizzeria",
            "type": IdeaType.RESTAURANT,
            "localisation": "Valais",
            "longitude": None,
            "latitude": None,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertIsNone(serializer.validated_data["longitude"])
        self.assertIsNone(serializer.validated_data["latitude"])

    # Test : Validation - prix par nuit
    def test_valid_price_per_night(self):
        data = {
            "title": "Hotel",
            "type": IdeaType.LODGING,
            "price_per_night": "43.70",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["price_per_night"], Decimal("43.70"))

    # Test : Validation - prix par nuit est null
    def test_valid_price_per_night_is_null(self):
        data = {
            "title": "Hotel",
            "type": IdeaType.LODGING,
            "price_per_night": None,
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertIsNone(serializer.validated_data["price_per_night"])

    # Test : Validation - start_date et end_date
    def test_valid_start_date_and_end_date(self):
        data = {
            "title": "Hotel",
            "type": IdeaType.LODGING,
            "start_date": "2026-06-03",
            "end_date": "2026-06-05",
        }

        serializer = IdeaSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertEqual(
            serializer.validated_data["start_date"], datetime.date(2026, 6, 3)
        )
        self.assertEqual(
            serializer.validated_data["end_date"], datetime.date(2026, 6, 5)
        )

    # ========================================================================#

    # ========================================================================#
    # Bloc 7 : Champs obligatoire
    # ========================================================================#

    # Test : Invalide si le titre n'existe pas
    def test_title_is_required(self):
        data = {
            "type": IdeaType.RESTAURANT,
        }

        serializer = IdeaSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    # Test : Invalide si type n'existe pas
    def test_type_is_required(self):
        data = {
            "title": "Pizzeria",
        }

        serializer = IdeaSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("type", serializer.errors)


# ========================================================================#

# ========================================================================#
# --- Reaction -> Serializer tests --- #
# ========================================================================#

# Une réaction ne peut pas exister sans un traveler et une idée


class ReactionSerializerTest(TestCase):
    def setUp(self):
        self.traveler = Traveler.objects.create_user(
            username="Jean",
            email="jean@exemple.com",
            password="password123",
        )
        self.travel = Travel.objects.create(
            title="Road trip Suisse",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 10),
        )
        self.idea = Idea.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            title="Japonais",
            type=IdeaType.RESTAURANT,
        )

    # ========================================================================#

    # ========================================================================#
    # Bloc 8 : Tests complet reaction
    # ========================================================================#

    # Test : Sérialisation Reaction -> data, les champs et valeurs sortent correctement
    def test_serialized_reaction_has_expected_data(self):
        reaction = Reaction.objects.create(
            traveler=self.traveler,
            idea=self.idea,
        )

        data = ReactionSerializer(reaction).data

        expected_keys = {
            "id",
            "traveler_id",
            "idea_id",
            "created_at",
        }

        self.assertEqual(set(data.keys()), expected_keys)

        self.assertEqual(data["id"], reaction.id)
        self.assertEqual(data["traveler_id"], self.traveler.id)
        self.assertEqual(data["idea_id"], self.idea.id)
        self.assertIsNotNone(data["created_at"])

    # Test : Création d’une réaction via le serializer
    def test_create_reaction_with_serializer(self):
        serializer = ReactionSerializer(data={})

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data, {})

        reaction = serializer.save(
            traveler=self.traveler,
            idea=self.idea,
        )

        self.assertEqual(reaction.traveler, self.traveler)
        self.assertEqual(reaction.idea, self.idea)
        self.assertIsNotNone(reaction.created_at)

    # Test : Vérification des champs read-only
    def test_read_only_fields_are_ignored(self):
        other_traveler = Traveler.objects.create_user(
            username="Paul",
            email="paul@exemple.com",
            password="password123",
        )

        data = {
            "id": 999,
            "traveler_id": other_traveler.id,
            "idea_id": 999,
            "created_at": "2000-01-01T00:00:00Z",
        }

        serializer = ReactionSerializer(data=data)

        self.assertTrue(serializer.is_valid())

        self.assertNotIn("id", serializer.validated_data)
        self.assertNotIn("traveler_id", serializer.validated_data)
        self.assertNotIn("idea_id", serializer.validated_data)
        self.assertNotIn("created_at", serializer.validated_data)

        reaction = serializer.save(
            traveler=self.traveler,
            idea=self.idea,
        )

        self.assertEqual(reaction.traveler, self.traveler)
        self.assertEqual(reaction.idea, self.idea)
        self.assertNotEqual(reaction.id, 999)
        self.assertIsNotNone(reaction.created_at)

    # Test : Evite qu'un user vote deux fois sur la meme idée
    def test_duplicate_reaction_error(self):
        Reaction.objects.create(
            traveler=self.traveler,
            idea=self.idea,
        )

        serializer = ReactionSerializer(data={})

        self.assertTrue(serializer.is_valid())

        with self.assertRaises(DRFValidationError) as context:
            serializer.save(
                traveler=self.traveler,
                idea=self.idea,
            )

        self.assertIn("reaction", context.exception.detail)

    # ========================================================================#


# ========================================================================#
# --- Idée -> views tests --- #
# ========================================================================#


class IdeaViewTest(APITestCase):
    def setUp(self):
        # Travel principale
        self.traveler = Traveler.objects.create_user(
            username="Jean",
            email="jean@exemple.com",
            password="password123",
        )

        self.travel = Travel.objects.create(
            title="Road trip Suisse",
            start_date=datetime.date(2026, 6, 2),
            end_date=datetime.date(2026, 6, 10),
        )

        Participation.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )

        self.idea = Idea.objects.create(
            traveler=self.traveler,
            travel=self.travel,
            title="Restaurant japonais",
            type=IdeaType.RESTAURANT,
        )
        # Autre Travel
        self.other_travel = Travel.objects.create(
            title="Road trip France",
            start_date=datetime.date(2026, 7, 2),
            end_date=datetime.date(2026, 7, 10),
        )

        self.other_step = Step.objects.create(
            travel=self.other_travel,
            localisation="Paris",
            start_date=datetime.date(2026, 7, 3),
            end_date=datetime.date(2026, 7, 3),
        )

        Idea.objects.create(
            traveler=self.traveler,
            travel=self.other_travel,
            title="Restaurant français",
            type=IdeaType.RESTAURANT,
        )

    # ========================================================================#

    # ========================================================================#
    # Bloc 1 : Tests idea-list
    # ========================================================================#

    # Test : GET lecture réussie -> récupérer des données
    def test_list_returns_only_ideas_of_this_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse(
                "idea-list",
                kwargs={"travel_id": self.travel.id},
            )
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.idea.id)

    # Test : POST création réussie -> créer une ressource
    def test_create_idea_travel_and_traveler(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse(
                "idea-list",
                kwargs={"travel_id": self.travel.id},
            ),
            {
                "title": "Fondue",
                "type": IdeaType.RESTAURANT,
            },
        )

        self.assertEqual(response.status_code, 201)

        idea = Idea.objects.get(id=response.data["id"])

        self.assertEqual(idea.travel, self.travel)
        self.assertEqual(idea.traveler, self.traveler)
        self.assertEqual(idea.title, "Fondue")

    # Test : POST -> connecté mais pas autorisé
    def test_create_forbidden_if_not_participant(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse(
                "idea-list",
                kwargs={"travel_id": self.other_travel.id},
            ),
            {
                "title": "Fondue",
                "type": IdeaType.RESTAURANT,
            },
        )

        self.assertEqual(response.status_code, 403)

        self.assertFalse(
            Idea.objects.filter(
                travel=self.other_travel,
                title="Fondue",
            ).exists()
        )

    # Test : POST données invalide -> step appartient a un autre travel
    def test_rejects_step_from_another_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.post(
            reverse(
                "idea-list",
                kwargs={"travel_id": self.travel.id},
            ),
            {
                "title": "Pizzeria",
                "type": IdeaType.RESTAURANT,
                "step_id": self.other_step.id,
                "start_date": "2026-07-03",
                "end_date": "2026-07-03",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("step", response.data["details"])

    # ========================================================================#

    # ========================================================================#
    # Bloc 2 : Tests idea-detail
    # ========================================================================#

    # Test : GET -> récupérer l'idée du travel
    def test_retrieve_idea_from_this_travel(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse(
                "idea-detail",
                kwargs={
                    "travel_id": self.travel.id,
                    "pk": self.idea.id,
                },
            )
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.idea.id)
        self.assertEqual(response.data["title"], self.idea.title)

    # Test : GET objet introuvable ou inaccessible -> récupère l'idée avec le mauvais travel
    def test_retrieve_idea_with_wrong_travel(self):
        Participation.objects.create(
            traveler=self.traveler,
            travel=self.other_travel,
            status=ParticipationStatus.ACCEPTED,
        )

        self.client.force_authenticate(user=self.traveler)

        response = self.client.get(
            reverse(
                "idea-detail",
                kwargs={"travel_id": self.other_travel.id, "pk": self.idea.id},
            )
        )

        self.assertEqual(response.status_code, 404)

    # Test : PATCH -> Le créateur de l'idée peut la modifier
    def test_creator_can_patch_idea(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse(
                "idea-detail",
                kwargs={
                    "travel_id": self.travel.id,
                    "pk": self.idea.id,
                },
            ),
            {
                "title": "Restaurant japonais modifié",
            },
        )

        self.assertEqual(response.status_code, 200)

        self.idea.refresh_from_db()
        self.assertEqual(self.idea.title, "Restaurant japonais modifié")

    # Test : PATCH connecté et autorisé
    def test_other_participant_can_patch_idea(self):
        other_traveler = Traveler.objects.create_user(
            username="Paul",
            email="paul@exemple.com",
            password="password123",
        )

        Participation.objects.create(
            traveler=other_traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )

        self.client.force_authenticate(user=other_traveler)

        response = self.client.patch(
            reverse(
                "idea-detail",
                kwargs={
                    "travel_id": self.travel.id,
                    "pk": self.idea.id,
                },
            ),
            {
                "title": "Titre modifié par Paul",
            },
        )

        self.assertEqual(response.status_code, 200)

        self.idea.refresh_from_db()
        self.assertEqual(self.idea.title, "Titre modifié par Paul")

    # Test : PATCH -> nouvelles données rendent l'idée invalide
    def test_participant_cannot_patch_with_invalid_data(self):
        self.client.force_authenticate(user=self.traveler)

        response = self.client.patch(
            reverse(
                "idea-detail",
                kwargs={"travel_id": self.travel.id, "pk": self.idea.id},
            ),
            {
                "type": IdeaType.LODGING,
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("start_date", response.data["details"])

        self.idea.refresh_from_db()
        self.assertEqual(self.idea.type, IdeaType.RESTAURANT)

    # Test : DELETE -> suppression réussie
    def test_creator_can_delete_idea(self):
        self.client.force_authenticate(user=self.traveler)

        idea_id = self.idea.id

        response = self.client.delete(
            reverse(
                "idea-detail", kwargs={"travel_id": self.travel.id, "pk": self.idea.id}
            )
        )

        self.assertEqual(response.status_code, 204)

        self.assertFalse(Idea.objects.filter(id=idea_id).exists())

    # Test : DELETE -> un autre participant accepté peut supprimer l'idée
    def test_other_participant_can_delete_idea(self):
        other_traveler = Traveler.objects.create_user(
            username="Paul",
            email="paul@exemple.com",
            password="password123",
        )

        Participation.objects.create(
            traveler=other_traveler,
            travel=self.travel,
            status=ParticipationStatus.ACCEPTED,
        )

        self.client.force_authenticate(user=other_traveler)

        idea_id = self.idea.id

        response = self.client.delete(
            reverse(
                "idea-detail", kwargs={"travel_id": self.travel.id, "pk": self.idea.id}
            )
        )

        self.assertEqual(response.status_code, 204)

        self.assertFalse(Idea.objects.filter(id=idea_id).exists())
