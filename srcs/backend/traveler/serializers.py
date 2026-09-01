# serializers.py

from rest_framework import serializers
from .models import Traveler


class TravelerCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )

    class Meta:
        model = Traveler

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "profile_picture_url",
            "is_online",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "profile_picture_url",
            "is_online",
            "created_at",
            "updated_at",
        ]


class TravelerUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Traveler

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile_picture_url",
            "is_online",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "profile_picture_url",
            "is_online",
            "created_at",
            "updated_at",
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
    )

