from drf_spectacular.utils import OpenApiExample, extend_schema, extend_schema_view

IDEA_EXAMPLE = [
    OpenApiExample(
        "IdeaInPool",
        summary="Idée dans le pool (restaurant, activité ou lieu, sans dates)",
        value={"title": "nom idée", "type": "s"},
        request_only=True,
    ),
    OpenApiExample(
        "IdeaOnStep",
        summary="Restaurant, activité ou lieu placé sur une étape (un seul jour)",
        value={
            "stepId": 1,
            "title": "nom idée",
            "type": "r",
            "localisation": "lieu idée",
            "note": "Réserver",
            "url": "https://example.com",
            "latitude": "45.767000",
            "longitude": "4.834000",
            "startDate": "2026-11-02",
            "endDate": "2026-11-02",
        },
        request_only=True,
    ),
    OpenApiExample(
        "LodgingInPool",
        summary="Hébergement dans le pool (dates obligatoires)",
        value={
            "title": "nom hébérgement",
            "type": "l",
            "pricePerNight": "70.00",
            "startDate": "2026-11-03",
            "endDate": "2026-11-05",
        },
        request_only=True,
    ),
    OpenApiExample(
        "LodgingOnStep",
        summary="Hébergement placé sur une étape (dans les dates de l'étape)",
        value={
            "stepId": 1,
            "title": "nom hébérgement",
            "type": "l",
            "pricePerNight": "85.00",
            "startDate": "2026-11-01",
            "endDate": "2026-11-03",
        },
        request_only=True,
    ),
]

IDEA_EMPTY_BODY = {
    "stepId": None,
    "title": "",
    "type": "",
    "localisation": "",
    "note": "",
    "url": "",
    "latitude": None,
    "longitude": None,
    "pricePerNight": None,
    "startDate": None,
    "endDate": None,
}

IDEA_PUT_EXAMPLE = [
    OpenApiExample(
        example.name,
        summary=example.summary,
        value={**IDEA_EMPTY_BODY, **example.value},
        request_only=True,
    )
    for example in IDEA_EXAMPLE
]

IDEA_PATCH_EXAMPLE = [
    OpenApiExample(
        "PlaceIdea",
        summary="Placer un restaurant, une activité ou un lieu sur une étape",
        value={"stepId": 1, "startDate": "2026-11-02", "endDate": "2026-11-02"},
        request_only=True,
    ),
    OpenApiExample(
        "PlaceLodging",
        summary="Placer un hébergement sur une étape (ses dates doivent être dans l'étape)",
        value={"stepId": 1},
        request_only=True,
    ),
    OpenApiExample(
        "BackToPool",
        summary="Remettre un restaurant, une activité ou un lieu dans le pool",
        value={"stepId": None, "startDate": None, "endDate": None},
        request_only=True,
    ),
    OpenApiExample(
        "LodgingBackToPool",
        summary="Remettre un hébergement dans le pool (il garde ses dates)",
        value={"stepId": None},
        request_only=True,
    ),
    OpenApiExample(
        "EditNote",
        summary="Modifier la note",
        value={"note": "Réserver une table pour 4"},
        request_only=True,
    ),
]

ideas_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister les idées d'un voyage",
        description=(
            "Idées du voyage, de la plus récente à la plus ancienne. \n\n"
            "`status` vaut : \n\n"
            "- `suggested` (dans le pool) \n\n"
            "- `placed` (sur une étape) \n\n"
            "- `chosen` (hébergement choisi). \n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `403`)."
        ),
    ),
    post=extend_schema(
        summary="Créer une idée",
        description=(
            "Crée une idée dans le voyage. L'utilisateur en devient l'auteur.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `403`).\n"
            "- `stepId` : une étape du même voyage ; absent ou `null` = idée "
            "dans le pool.\n"
            "- `startDate` et `endDate` : toujours ensemble.\n"
            "- Restaurant, activité, lieu (`r`, `a`, `s`) : sans dates dans le "
            "pool ; un seul jour dans l'étape s'ils sont placés.\n"
            "- Hébergement (`l`) : dates obligatoires, dans le voyage (pool) ou "
            "dans l'étape (placé).\n"
            "- `pricePerNight` : seulement pour un hébergement.\n"
            "- Choisir un hébergement et voter se font depuis le site."
        ),
        examples=IDEA_EXAMPLE,
    ),
)

idea_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une idée",
        description=(
            "Détail d'une idée du voyage.\n\n"
            "**Règles** :\n"
            "- Réservé aux participants du voyage (sinon `404`)."
        ),
    ),
    put=extend_schema(
        summary="Remplacer une idée",
        description=(
            "Remplace toute l'idée : envoyer tous les champs, `null` ou vides "
            "s'ils ne servent pas (voir les exemples).\n\n"
            "**Règles** :\n"
            "- Tout participant du voyage peut la modifier (sinon `404`).\n"
            "- `stepId` : une étape du même voyage ; `null` = idée dans le pool.\n"
            "- `startDate` et `endDate` : toujours ensemble.\n"
            "- Restaurant, activité, lieu (`r`, `a`, `s`) : sans dates dans le "
            "pool ; un seul jour dans l'étape s'ils sont placés.\n"
            "- Hébergement (`l`) : dates obligatoires, dans le voyage (pool) ou "
            "dans l'étape (placé).\n"
            "- `pricePerNight` : seulement pour un hébergement."
        ),
        examples=IDEA_PUT_EXAMPLE,
    ),
    patch=extend_schema(
        summary="Modifier une idée",
        description=(
            "Modifie les champs envoyés. Actions courantes :\n"
            "- **placer** un restaurant, une activité ou un lieu : `stepId` et "
            "le jour (`startDate` = `endDate`) ;\n"
            "- **placer** un hébergement : `stepId` seul ;\n"
            "- **remettre dans le pool** : `stepId` à `null`, et les dates à "
            "`null` sauf pour un hébergement.\n\n"
            "**Règles** :\n"
            "- Tout participant du voyage peut la modifier (sinon `404`).\n"
            "- `stepId` : une étape du même voyage.\n"
            "- Restaurant, activité, lieu : un seul jour, dans l'étape.\n"
            "- Hébergement : ses dates doivent être dans l'étape.\n"
            "- `pricePerNight` : seulement pour un hébergement."
        ),
        examples=IDEA_PATCH_EXAMPLE,
    ),
    delete=extend_schema(
        summary="Supprimer une idée",
        description=(
            "Suppression définitive de l'idée et de ses votes.\n\n"
            "**Règles** :\n"
            "- Tout participant du voyage peut la supprimer (sinon `404`)."
        ),
    ),
)
