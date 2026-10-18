from drf_spectacular.utils import extend_schema, extend_schema_view

travels_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Liste des voyages",
        description="Récupère la liste des voyages auxquels l'utilisateur a accès.",
    ),
    post=extend_schema(
        summary="Créer un voyage",
        description="Crée un nouveau voyage",
    ),
)

travel_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter un voyage",
        description="Récupère les informations détaillées d'un voyage accessible à l'utilisateur.",
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
        summary="Liste des étapes",
        description="Récupère la liste des étapes auxquels l'utilisateur a accès.",
    ),
    post=extend_schema(
        summary="Créer une étape",
        description="Crée une nouvelle étape.",
    ),
)

step_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une étape",
        description="Récupère les informations détaillées d'une étape accessible à l'utilisateur.",
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
        summary="Supprime l'étape",
        description="Supprime l'étape auxquels l'utilisateur a accès.",
    ),
)
