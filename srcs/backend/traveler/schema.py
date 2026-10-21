from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
    inline_serializer,
)
from rest_framework import serializers

from .serializers import LoginSerializer

api_token_schema = extend_schema_view(
    post=extend_schema(
        summary="Obtenir sa clé API",
        description=(
            "**Accès** : sans authentification. Le compte doit déjà exister : "
            "l'inscription se fait sur le site.\n\n"
            "**Body** : `username` et `password` du compte (obligatoires).\n\n"
        ),
        request=LoginSerializer,
        responses={
            200: inline_serializer(
                name="ApiToken",
                fields={"token": serializers.CharField()},
            ),
            400: OpenApiResponse(description="Champ manquant dans le body."),
            401: OpenApiResponse(description="Identifiants invalides."),
            429: OpenApiResponse(description="Trop de tentatives (5/minute par IP)."),
        },
    )
)
