from typing import ClassVar

from django.core.exceptions import (
    NON_FIELD_ERRORS,
    ValidationError as DjangoValidationError,
)
from rest_framework import serializers
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.settings import api_settings
from rest_framework.throttling import ScopedRateThrottle


class PublicApiMixin:
    authentication_classes: ClassVar[list] = [
        SessionAuthentication,
        TokenAuthentication,
    ]
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "public_api"
    public_api = True


class ModelValidationMixin:
    def save(self, **kwargs):
        try:
            return super().save(**kwargs)
        except DjangoValidationError as exc:

            def to_detail(error):
                message = (
                    error.message % error.params if error.params else error.message
                )
                return serializers.ErrorDetail(
                    message,
                    code=error.code or "invalid",
                )

            if hasattr(exc, "error_dict"):
                details = {
                    self._client_name(field): [to_detail(error) for error in errors]
                    for field, errors in exc.error_dict.items()
                }
            else:
                details = {
                    api_settings.NON_FIELD_ERRORS_KEY: [
                        to_detail(error) for error in exc.error_list
                    ]
                }

            raise serializers.ValidationError(details) from exc

    def _client_name(self, key):
        if key == NON_FIELD_ERRORS:
            return api_settings.NON_FIELD_ERRORS_KEY

        return f"{key}_id" if f"{key}_id" in self.fields else key
