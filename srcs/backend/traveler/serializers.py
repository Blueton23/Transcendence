# serializers.py

from typing import ClassVar

from django.contrib.auth import password_validation
from django.contrib.auth.forms import PasswordChangeForm
from rest_framework import serializers

from .models import Traveler


class TravelerSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

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

    def get_profile_picture_url(self, obj: Traveler) -> str | None:
        if not obj.profile_picture:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(obj.profile_picture.url)

        return obj.profile_picture.url


class TravelerCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
    )

    password_confirmation = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = Traveler

        fields: ClassVar[list[str]] = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "password_confirmation",
        ]

    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        if attrs["password"] != attrs["password_confirmation"]:
            raise serializers.ValidationError(
                {
                    "password_confirmation": "Les mots de passe ne correspondent pas.",
                }
            )

        password_validation.validate_password(
            attrs["password"],
        )

        return attrs


class TravelerUpdateSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

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

    def get_profile_picture_url(self, obj: Traveler) -> str | None:
        if not obj.profile_picture:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(obj.profile_picture.url)

        return obj.profile_picture.url


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


class TravelerUpdateProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Traveler

        fields: ClassVar[list[str]] = [
            "profile_picture",
        ]

    def validate_profile_picture(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "La photo de profil ne doit pas dépasser 5 Mo."
            )

        return value

    def update(self, instance, validated_data):
        old_picture_name = (
            instance.profile_picture.name if instance.profile_picture else None
        )

        instance = super().update(instance, validated_data)

        new_picture_name = (
            instance.profile_picture.name if instance.profile_picture else None
        )

        if (
            old_picture_name
            and old_picture_name != new_picture_name
            and old_picture_name != "profile_pictures/profil.png"
        ):
            instance.profile_picture.storage.delete(old_picture_name)

        return instance
