# serializers.py

from typing import ClassVar

from django.contrib.auth.forms import PasswordChangeForm
from rest_framework import serializers

from .models import Traveler


class TravelerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )

    class Meta:
        model = Traveler

        fields: ClassVar[list[str]] = [
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

        read_only_fields: ClassVar[list[str]] = [
            "id",
            "profile_picture_url",
            "is_online",
            "created_at",
            "updated_at",
        ]


class TravelerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Traveler

        fields: ClassVar[list[str]] = [
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

        read_only_fields: ClassVar[list[str]] = [
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


class TravelerUpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
    )

    new_password_1 = serializers.CharField(
        write_only=True,
    )

    new_password_2 = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        request = self.context["request"]

        form = PasswordChangeForm(
            user=request.user,
            data={
                "old_password": attrs["old_password"],
                "new_password1": attrs["new_password_1"],
                "new_password2": attrs["new_password_2"],
            },
        )

        if not form.is_valid():
            raise serializers.ValidationError(form.errors)

        attrs["_password_change_form"] = form

        return attrs
