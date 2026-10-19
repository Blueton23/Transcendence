from drf_spectacular.utils import extend_schema, extend_schema_view

ideas_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister les idées d'un voyage",
        description=(
            "Récupère les idées du voyage, avec leur nombre de votes (`voteCount`) "
            "et si l'utilisateur a voté (`voted`)."
        ),
    ),
    post=extend_schema(
        summary="Créer une idée",
        description=("Créer une nouvelle idée. L'utilisateur en devient l'auteur."),
    ),
)

idea_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une idée",
        description="Récupère le détail d'une idée du voyage.",
    ),
    put=extend_schema(
        summary="Remplacer une idée",
        description="Remplace les données modifiables d'une idée.",
    ),
    patch=extend_schema(
        summary="Modifier une idée",
        description="Modifie partiellement les données d'une idée.",
    ),
    delete=extend_schema(
        summary="Supprimer une idée",
        description="Suppression définitive de l'idée et de ses votes.",
    ),
)
