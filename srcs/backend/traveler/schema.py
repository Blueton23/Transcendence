from drf_spectacular.utils import extend_schema, extend_schema_view

traveler_auth_schema = extend_schema_view(
    post=extend_schema(
        summary="Création clé token",
        description=(
            "Échange le username et le password contre une clé API. \n\n"
            "La clé s'ajoute ensuite dans le header : Authorization: Token <clé>."
        ),
        tags=["auth token"],
    ),
)
