from typing import ClassVar

from django.contrib.auth import password_validation
from django.contrib.auth.forms import PasswordChangeForm
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Traveler


def django_error_detail(
    error: DjangoValidationError,
) -> serializers.ErrorDetail:
    return serializers.ErrorDetail(
        error.message % error.params if error.params else error.message,
        code=error.code or "invalid",
    )


def password_error_details(
    exc: DjangoValidationError,
) -> list[serializers.ErrorDetail]:
    return [django_error_detail(error) for error in exc.error_list]


class TravelerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Traveler

        fields: ClassVar[list[str]] = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
            "is_online",
            "created_at",
            "updated_at",
        ]

        read_only_fields: ClassVar[list[str]] = [
            "id",
            "profile_picture",
            "is_online",
            "created_at",
            "updated_at",
        ]


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
        extra_kwargs: ClassVar[dict] = {"email": {"validators": []}}

    def validate_email(self, value: str) -> str:
        traveler = Traveler.objects.filter(email__iexact=value).first()

        if traveler is None:
            return value

        if not traveler.has_usable_password():
            raise serializers.ValidationError(
                "A Google account is already linked to this email address.",
                code="googleAccountExists",
            )

        raise serializers.ValidationError(
            "Username is already in use.",
            code="unique",
        )

    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        if attrs["password"] != attrs["password_confirmation"]:
            raise serializers.ValidationError(
                {
                    "password_confirmation": serializers.ErrorDetail(
                        "Passwords do not match.",
                        code="password_mismatch",
                    )
                }
            )

        try:
            password_validation.validate_password(
                attrs["password"],
            )
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                {
                    "password": password_error_details(exc),
                }
            ) from exc

        return attrs


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
    )


class TravelerUpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password_1 = serializers.CharField(write_only=True)
    new_password_2 = serializers.CharField(write_only=True)

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
            field_mapping = {
                "old_password": "old_password",
                "new_password1": "new_password_1",
                "new_password2": "new_password_2",
            }

            errors = {}

            for field, field_errors in form.errors.as_data().items():
                api_field = field_mapping.get(field, field)

                errors[api_field] = [
                    django_error_detail(error) for error in field_errors
                ]

            raise serializers.ValidationError(errors)

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
                "The profile picture must not exceed 5 MB.",
                code="max_size",
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


class FriendshipCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
