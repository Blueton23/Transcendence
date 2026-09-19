from typing import ClassVar

from rest_framework import serializers
from idea.models import Idea
from travel.models import Step

class IdeaSerializer(serializers.ModelSerializer):
    travel_id = serializers.IntegerField(read_only=True)
    traveler_id = serializers.IntegerField(read_only=True)

    step_id = serializers.PrimaryKeyRelatedField(
        source="step",
        queryset=Step.objects.all(),
        allow_null=True,
        required=False,
    )

    chosen_by_id = serializers.IntegerField(read_only=True)

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
            "updated_at"
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


