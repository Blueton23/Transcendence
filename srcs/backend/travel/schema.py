from drf_spectacular.utils import OpenApiExample, extend_schema, extend_schema_view

# Affiche les valeurs obligatoire à entrer par le client externe dans swagger
TRAVEL_EXAMPLE = OpenApiExample(
    "Travel",
    summary="Voyage complet (titre et dates)",
    value={
        "title": "titre du voyage",
        "startDate": "2026-11-01",
        "endDate": "2026-11-10",
    },
    request_only=True,
)

TRAVEL_PATCH_EXAMPLE = [
    OpenApiExample(
        "RenameTravel",
        summary="Renommer le voyage",
        value={"title": "nouveau titre"},
        request_only=True,
    ),
    OpenApiExample(
        "ChangeTravelDates",
        summary="Changer les dates du voyage",
        value={"startDate": "2026-11-01", "endDate": "2026-11-12"},
        request_only=True,
    ),
]

STEP_EXAMPLE = OpenApiExample(
    "Step",
    summary="Étape complète (dans les dates du voyage)",
    value={
        "localisation": "lieu étape",
        "startDate": "2026-11-01",
        "endDate": "2026-11-03",
        "latitude": "45.7640000",
        "longitude": "4.8357000",
    },
    request_only=True,
)

STEP_PUT_EXAMPLE = OpenApiExample(
    "Step",
    summary="Étape complète (tous les champs)",
    value={**STEP_EXAMPLE.value, "priority": None},
    request_only=True,
)

STEP_PATCH_EXAMPLE = [
    OpenApiExample(
        "ChangeStepDates",
        summary="Changer les dates de l'étape",
        value={"startDate": "2026-11-01", "endDate": "2026-11-02"},
        request_only=True,
    ),
    OpenApiExample(
        "ChangeStepPlace",
        summary="Changer le lieu (nom et coordonnées ensemble)",
        value={
            "localisation": "lieu étape",
            "latitude": "45.7719000",
            "longitude": "4.8902000",
        },
        request_only=True,
    ),
]

# =====================================================================#

# Règles sur les données d'une étape : identiques pour POST, PUT et PATCH
STEP_RULES = (
    "- Dates comprises dans celles du voyage, `endDate` le même jour que "
    "`startDate` ou après.\n"
    "- Pas de chevauchement avec une autre étape : une étape peut "
    "commencer le jour où la précédente se termine.\n"
    "- `latitude` entre -90 et 90, `longitude` entre -180 et 180 : "
    "fournies par le client (carte ou géocodage).\n"
    "- `priority` (facultatif) : ordre entre des étapes aux mêmes dates."
)

# =====================================================================#

# Affiche les détails explicatifs de chaque vues
travels_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister mes voyages",
        description=(
            "Voyages dont l'utilisateur est participant, du plus récent au plus ancien."
        ),
    ),
    post=extend_schema(
        summary="Créer un voyage",
        description=(
            "Crée un voyage. L'utilisateur en devient participant.\n\n"
            "**Règles** :\n"
            "- `endDate` : le même jour que `startDate` ou après.\n"
            "- Inviter d'autres participants se fait depuis le site."
        ),
        examples=[TRAVEL_EXAMPLE],
    ),
)

travel_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter un voyage",
        description=(
            "Détail d'un voyage.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `404`)."
        ),
    ),
    put=extend_schema(
        summary="Remplacer un voyage",
        description=(
            "Remplace le titre et les dates du voyage.\n\n"
            "**Règles** :\n"
            "- Tout participant du voyage peut le modifier (sinon `404`).\n"
            "- `endDate` : le même jour que `startDate` ou après."
        ),
        examples=[TRAVEL_EXAMPLE],
    ),
    patch=extend_schema(
        summary="Modifier un voyage",
        description=(
            "Modifie le titre, les dates, ou les deux : seuls les champs envoyés "
            "changent.\n\n"
            "**Règles** :\n"
            "- Tout participant du voyage peut le modifier (sinon `404`).\n"
            "- `endDate` : le même jour que `startDate` ou après.\n"
            "- Changer les dates du voyage ne déplace pas ses étapes."
        ),
        examples=TRAVEL_PATCH_EXAMPLE,
    ),
)

steps_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister les étapes d'un voyage",
        description=(
            "Étapes du voyage, dans l'ordre chronologique.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `403`)."
        ),
    ),
    post=extend_schema(
        summary="Créer une étape",
        description=(
            "Crée une étape dans le voyage.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `403`).\n" + STEP_RULES
        ),
        examples=[STEP_EXAMPLE],
    ),
)

step_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une étape",
        description=(
            "Détail d'une étape du voyage.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `404`)."
        ),
    ),
    put=extend_schema(
        summary="Remplacer une étape",
        description=(
            "Remplace toute l'étape : envoyer tous les champs, `priority` compris "
            "(`null` s'il ne sert pas).\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `404`).\n" + STEP_RULES
        ),
        examples=[STEP_PUT_EXAMPLE],
    ),
    patch=extend_schema(
        summary="Modifier une étape",
        description=(
            "Modifie les champs envoyés. Pour changer de lieu, envoyer "
            "`localisation`, `latitude` et `longitude` ensemble.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `404`).\n" + STEP_RULES
        ),
        examples=STEP_PATCH_EXAMPLE,
    ),
    delete=extend_schema(
        summary="Supprimer une étape",
        description=(
            "Suppression douce : l'étape n'apparaît plus dans l'API et ne peut "
            "plus servir de `stepId`.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `404`).\n"
            "- Les idées de l'étape retournent dans le pool. Les restaurants, "
            "activités et lieux gardent leur date : pour les modifier ensuite, "
            "envoyer aussi `startDate` et `endDate` à `null`."
        ),
    ),
)
