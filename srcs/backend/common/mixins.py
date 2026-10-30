from typing import ClassVar

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.throttling import ScopedRateThrottle


class PublicApiMixin:
    # Vue de l'API publique : accepte la clé API (Authorization: Token <clé>) en plus de la session.
    # Ordre important : Session en premier -> garde le 403.
    authentication_classes: ClassVar[list] = [
        SessionAuthentication,
        TokenAuthentication,
    ]
    # Rate limiting : scope "public_api" (limite définie dans settings.py)
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "public_api"
    # Affichée dans la doc Swagger (filtre : common/schema.py)
    public_api = True


class ModelValidationMixin:
    def save(self, **kwargs):
        try:
            return super().save(**kwargs)
        except DjangoValidationError as exc:
            detail = getattr(exc, "message_dict", exc.messages)
            if isinstance(detail, dict):
                detail = {
                    self._client_name(key): messages for key, messages in detail.items()
                }
            raise serializers.ValidationError(detail) from exc

    def _client_name(self, key):
        return f"{key}_id" if f"{key}_id" in self.fields else key
