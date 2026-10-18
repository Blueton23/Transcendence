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
            "Échange le username et le password contre la clé API de l'utilisateur "
            "(toujours la même clé pour un utilisateur).\n\n"
            "La clé s'envoie ensuite dans le header `Authorization: Token <clé>`."
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
