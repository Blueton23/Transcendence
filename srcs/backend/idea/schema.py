from drf_spectacular.utils import extend_schema, extend_schema_view

ideas_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Liste les idées.",
        description="Récupère la liste des idées du voyage auxquels l'utilisateur a accès.",
    ),
    post=extend_schema(
        summary="Créer une idée.",
        description="Créer une nouvelle idée.",
    ),
)

idea_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une idée.",
        description="Récupère les informations détaillées d'une idée accessible à l'utilisateur.",
    ),
    put=extend_schema(
        summary="Remplacer une idée.",
        description="Remplace les données modifiables d'une idée.",
    ),
    patch=extend_schema(
        summary="Modifier une idée.",
        description="Modifie partiellement les données d'une idée.",
    ),
    delete=extend_schema(
        summary="Supprime une idée.",
        description="Supprime une idée auxquels l'utilisateur a accès.",
    ),
)
