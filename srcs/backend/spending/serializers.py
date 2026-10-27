from typing import ClassVar

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from idea.models import Idea
from spending.models import Spending, SpendingShare
from spending.services import create_spending
from travel.models import Step
from traveler.models import Traveler


class SpendingSharesSerializer(serializers.ModelSerializer):
    traveler_id = serializers.PrimaryKeyRelatedField(
        source="traveler",
        queryset=Traveler.objects.all(),
        allow_null=False,
        required=True,
    )

    def save(self, **kwargs):
        try:
            return super().save(**kwargs)
        except DjangoValidationError as exc:
            detail = getattr(exc, "message_dict", exc.messages)
            raise serializers.ValidationError(detail) from exc

    class Meta:
        model = SpendingShare
        fields: ClassVar[list[str]] = [
            "spending_id",
            "traveler_id",
            "amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "spending_id",
            "created_at",
            "updated_at",
        ]


class SpendingSerializer(serializers.ModelSerializer):
    travel_id = serializers.IntegerField(read_only=True)

    traveler_id = serializers.PrimaryKeyRelatedField(
        source="traveler",
        queryset=Traveler.objects.all(),
        allow_null=False,
        required=True,
    )

    step_id = serializers.PrimaryKeyRelatedField(
        source="step",
        queryset=Step.objects.alive(),
        allow_null=True,
        required=False,
    )

    idea_id = serializers.PrimaryKeyRelatedField(
        source="idea",
        queryset=Idea.objects.all(),
        allow_null=True,
        required=False,
    )

    shares = SpendingSharesSerializer(many=True, required=False)

    def create(self, validated_data):
        shares = validated_data.pop("shares", None)
        if shares is not None:
            shares = {s["traveler"]: s["amount"] for s in shares}
        return create_spending(shares=shares, **validated_data)

    def save(self, **kwargs):
        try:
            return super().save(**kwargs)
        except DjangoValidationError as exc:
            detail = getattr(exc, "message_dict", exc.messages)
            raise serializers.ValidationError(detail) from exc

    class Meta:
        model = Spending
        fields: ClassVar[list[str]] = [
            "id",
            "travel_id",
            "traveler_id",
            "step_id",
            "idea_id",
            "category",
            "label",
            "amount",
            "paid_date",
            "created_at",
            "updated_at",
            "shares",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "travel_id",
            "created_at",
            "updated_at",
        ]
