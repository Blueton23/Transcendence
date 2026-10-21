from typing import ClassVar

from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    traveler_name = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    is_unread = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields: ClassVar[list[str]] = [
            "id",
            "traveler",
            "traveler_name",
            "user",
            "body",
            "created_at",
            "is_system",
            "is_unread",
        ]
        read_only_fields: ClassVar[list[str]] = [
            "id",
            "traveler",
            "traveler_name",
            "user",
            "created_at",
            "is_system",
            "is_unread",
        ]

    def get_traveler_name(self, obj):
        return str(obj.traveler) if obj.traveler else "Ancien participant"

    def get_user(self, obj):
        traveler = obj.traveler

        if traveler is None:
            return None

        profile_picture = None
        picture_field = getattr(traveler, "profile_picture", None)

        if picture_field:
            try:
                profile_picture = picture_field.url
            except (ValueError, AttributeError):
                profile_picture = None

        return {
            "id": traveler.pk,
            "first_name": traveler.first_name,
            "last_name": traveler.last_name,
            "profile_picture": profile_picture,
        }

    def get_is_unread(self, obj):
        participation = self.context.get("participation")

        if not participation or obj.is_system:
            return False

        if obj.traveler_id == participation.traveler_id:
            return False

        last_read_at = participation.last_read_at

        return last_read_at is None or obj.created_at > last_read_at

    def validate_body(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Le message ne peut pas être vide.")

        if len(value) > 2000:
            raise serializers.ValidationError(
                "Le message ne peut pas dépasser 2000 caractères."
            )

        return value
