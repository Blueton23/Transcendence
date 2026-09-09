from typing import ClassVar

from rest_framework import serializers

from .models import ParticipationStatus, Step, Travel


def validate_date_range(instance, attrs):
    start = attrs.get("start_date", getattr(instance, "start_date", None))
    end = attrs.get("end_date", getattr(instance, "end_date", None))
    if start and end and end < start:
        raise serializers.ValidationError(
            {"end_date": "Must be on or after the start date."}
        )
    return attrs


class TravelSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    travelers = serializers.SerializerMethodField()
    nights = serializers.SerializerMethodField()

    def get_status(self, obj):
        return "current" if obj.status == "c" else "finished"

    def get_travelers(self, obj):
        accepted = obj.participations.filter(status=ParticipationStatus.ACCEPTED)
        return [
            {
                "id": participation.traveler.id,
                "initials": participation.traveler.username[:2].upper(),
                "name": participation.traveler.username,
            }
            for participation in accepted
        ]

    def get_nights(self, obj):
        return (obj.end_date - obj.start_date).days

    def validate(self, attrs):
        validate_date_range(self.instance, attrs)
        return attrs

    class Meta:
        model = Travel
        fields: ClassVar[list[str]] = [
            "id",
            "travelers",
            "title",
            "start_date",
            "end_date",
            "nights",
            "invite_token",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields: ClassVar[list[str]] = [
            "id",
            "invite_token",
            "created_at",
            "updated_at",
        ]


class StepSerializer(serializers.ModelSerializer):
    nights = serializers.SerializerMethodField()
    idea_count = serializers.SerializerMethodField()

    def get_nights(self, obj):
        return (obj.end_date - obj.start_date).days

    def get_idea_count(self, obj):
        # TODO(seb): brancher sur idea.count() une fois l app idea prete
        return 2

    def validate(self, attrs):
        validate_date_range(self.instance, attrs)
        return attrs

    class Meta:
        model = Step
        fields: ClassVar[list[str]] = [
            "id",
            "travel",
            "priority",
            "start_date",
            "end_date",
            "nights",
            "idea_count",
            "localisation",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "id",
            "travel",
            "created_at",
            "updated_at",
        ]
