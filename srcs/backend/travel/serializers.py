from typing import ClassVar
from rest_framework import serializers
from .models import Step

class StepCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields: ClassVar[list[str]] = [
            "id",
            "travel",
            "priority",
            "start_date",
            "end_date",
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
