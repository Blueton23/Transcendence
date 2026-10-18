from typing import ClassVar

from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.throttling import ScopedRateThrottle


class PublicApiMixin:
    authentication_classes: ClassVar[list] = [
        SessionAuthentication,
        TokenAuthentication,
    ]
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "public_api"
    public_api = True


# La vue accepte la clé API en plus de la session
# Rate limiting : scope "public_api"
# Affichée dans la doc Swagger (filtre : common/schema.py)
