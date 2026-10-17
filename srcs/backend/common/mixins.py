from typing import ClassVar

from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.throttling import ScopedRateThrottle


class PublicApiMixin:
    """Fait partie de l'API publique : la vue accepte la clé API en plus de la session.

    - Front (navigateur) : cookie de session + CSRF, comme avant.
    - Client externe : header `Authorization: Token <clé>`.

    L'ordre compte : SessionAuthentication reste en premier pour garder
    le 403 (et non 401) sur les requêtes non authentifiées.

    Rate limiting : scope "public_api" (limite définie dans settings.py),
    un compteur par utilisateur partagé par toutes les vues publiques.

    À placer en premier dans les classes parentes de la vue.
    """

    authentication_classes: ClassVar[list] = [
        SessionAuthentication,
        TokenAuthentication,
    ]
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "public_api"
