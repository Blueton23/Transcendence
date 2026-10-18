from drf_spectacular.utils import extend_schema, extend_schema_view

travels_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Liste mes voyages",
        description="Récupère les voyages dont l'utilisateur est participant.",
    ),
    post=extend_schema(
        summary="Créer un voyage",
        description=(
            "Crée un nouveau voyage"
            "L'utilisateur qui le crée en devient automatiquement participant."
        ),
    ),
)

travel_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter un voyage",
        description="Récupère le détail d'un voyage dont l'utilisateur est participant.",
    ),
    put=extend_schema(
        summary="Remplacer un voyage",
        description="Remplace les données modifiables d'un voyage.",
    ),
    patch=extend_schema(
        summary="Modifier un voyage",
        description="Modifie partiellement les données d'un voyage.",
    ),
)

steps_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Liste des étapes d'un voyage.",
        description="Récupère les étapes du voyage.",
    ),
    post=extend_schema(
        summary="Créer une étape",
        description=(
            "Crée une nouvelle étape."
            "Les dates doivent être comprises dans celles du voyage et ne pas chevaucher une autre étape."
        ),
    ),
)

step_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une étape",
        description="Récupère le détail d'une étape du voyage.",
    ),
    put=extend_schema(
        summary="Remplacer une étape",
        description="Remplace les données modifiables d'une étape.",
    ),
    patch=extend_schema(
        summary="Modifier une étape",
        description="Modifie partiellement les données d'une étape.",
    ),
    delete=extend_schema(
        summary="Supprimer une étape",
        description=(
            "Suppression douce : l'étape part à la corbeille et n'apparaît plus "
            "dans l'API. Les idées qui y étaient placées retournent dans le pool."
        ),
    ),
)
