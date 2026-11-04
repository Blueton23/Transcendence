from typing import ClassVar

from rest_framework import serializers

from common.mixins import ModelValidationMixin
from idea.models import Idea
from spending.models import Spending, SpendingShare
from spending.services import create_spending, split_equally, update_spending
from travel.models import Step
from traveler.models import Traveler


class SpendingSharesSerializer(serializers.ModelSerializer):
    traveler_id = serializers.PrimaryKeyRelatedField(
        source="traveler",
        queryset=Traveler.objects.all(),
        allow_null=False,
        required=True,
    )

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


class SpendingSerializer(ModelValidationMixin, serializers.ModelSerializer):
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

    shared_with = serializers.PrimaryKeyRelatedField(
        queryset=Traveler.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    @staticmethod
    def resolve_shares(validated_data, instance=None):
        shares = validated_data.pop("shares", None)
        shared_with = validated_data.pop("shared_with", None)
        if shared_with is not None:
            amount = validated_data.get("amount") or instance.amount
            return split_equally(amount, shared_with)
        if shares is not None:
            return {s["traveler"]: s["amount"] for s in shares}
        return None

    def create(self, validated_data):
        shares = self.resolve_shares(validated_data)
        return create_spending(shares=shares, **validated_data)

    def update(self, instance, validated_data):
        shares = self.resolve_shares(validated_data, instance)
        return update_spending(instance, shares=shares, **validated_data)

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
            "shared_with",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "travel_id",
            "created_at",
            "updated_at",
        ]

        extra_kwargs: ClassVar[dict] = {
            "label": {"required": True, "allow_blank": False}
        }
