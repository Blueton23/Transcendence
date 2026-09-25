from typing import ClassVar

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers

from idea.models import Idea, Reaction
from travel.models import Step


class IdeaSerializer(serializers.ModelSerializer):
    travel_id = serializers.IntegerField(read_only=True)
    traveler_id = serializers.IntegerField(read_only=True)

    step_id = serializers.PrimaryKeyRelatedField(
        source="step",
        queryset=Step.objects.alive(),
        allow_null=True,
        required=False,
    )

    chosen_by_id = serializers.IntegerField(read_only=True)

    def save(self, **kwargs):
        try:
            return super().save(**kwargs)
        except DjangoValidationError as exc:
            detail = getattr(exc, "message_dict", exc.messages)
            raise serializers.ValidationError(detail) from exc

    class Meta:
        model = Idea
        fields: ClassVar[list[str]] = [
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
        ]
        read_only_fields: ClassVar[list[str]] = [
            "id",
            "travel_id",
            "traveler_id",
            "chosen_by_id",
            "status",
            "chosen_at",
            "created_at",
            "updated_at",
        ]


# ========================================================================#


class ReactionSerializer(serializers.ModelSerializer):
    traveler_id = serializers.IntegerField(read_only=True)
    idea_id = serializers.IntegerField(read_only=True)

    def save(self, **kwargs):
        try:
            with transaction.atomic():
                return super().save(**kwargs)
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"reaction": "You have already reacted to this idea."}
            ) from exc

    class Meta:
        model = Reaction
        fields: ClassVar[list[str]] = [
            "id",
            "traveler_id",
            "idea_id",
            "created_at",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "id",
            "traveler_id",
            "idea_id",
            "created_at",
        ]
