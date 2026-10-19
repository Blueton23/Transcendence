from typing import ClassVar

from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.throttling import ScopedRateThrottle


class PublicApiMixin:
    # Vue de l'API publique : accepte la clé API (Authorization: Token <clé>)
    # en plus de la session. Ordre important : Session en premier -> garde le 403.
    authentication_classes: ClassVar[list] = [
        SessionAuthentication,
        TokenAuthentication,
    ]
    # Rate limiting : scope "public_api" (limite définie dans settings.py)
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "public_api"
    # Affichée dans la doc Swagger (filtre : common/schema.py)
    public_api = True
