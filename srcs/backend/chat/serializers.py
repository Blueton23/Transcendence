
from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    traveler_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "traveler",
            "traveler_name",
            "body",
            "created_at",
            "is_system",
        ]
        read_only_fields = [
            "id",
            "traveler",
            "traveler_name",
            "created_at",
            "is_system",
        ]

    def get_traveler_name(self, obj):
        if obj.traveler is None:
            return "Ancien membre"
        return str(obj.traveler)

    def validate_body(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Le message ne peut pas être vide."
            )

        if len(value) > 2000:
            raise serializers.ValidationError(
                "Le message ne peut pas dépasser 2000 caractères."
            )

        return value
