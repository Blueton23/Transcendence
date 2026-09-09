from typing import ClassVar
from rest_framework import serializers
from .models import Step
from .models import Travel
from .models import ParticipationStatus

class StepSerializer(serializers.ModelSerializer):
    nights = serializers.SerializerMethodField()

    def get_nights(self, obj):
        return (obj.end_date - obj.start_date).days

    class Meta:
        model = Step
        fields: ClassVar[list[str]] = [
            "id",
            "travel",
            "priority",
            "start_date",
            "end_date",
            "nights",
            "localisation",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "id",
            "travel",
            "created_at",
            "updated_at",
            "deleted_at",
        ]

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
