from drf_spectacular.utils import OpenApiExample, extend_schema, extend_schema_view

SPENDING_EXAMPLE = [
    OpenApiExample(
        "EqualSplit",
        summary="Dépense partagée à parts égales entre les participants",
        value={
            "travelerId": 1,
            "category": "m",
            "label": "Restaurant",
            "amount": "90.00",
            "paidDate": "2026-06-03",
        },
        request_only=True,
    ),
    OpenApiExample(
        "CustomShares",
        summary="Dépense avec des parts personnalisées (leur total = le montant)",
        value={
            "travelerId": 1,
            "category": "m",
            "amount": "90.00",
            "shares": [
                {"travelerId": 1, "amount": "30.00"},
                {"travelerId": 2, "amount": "60.00"},
            ],
        },
        request_only=True,
    ),
    OpenApiExample(
        "OnStepAndIdea",
        summary="Dépense rattachée à une étape et à une idée du voyage",
        value={
            "travelerId": 1,
            "category": "a",
            "amount": "45.00",
            "stepId": 1,
            "ideaId": 1,
        },
        request_only=True,
    ),
]

SPENDING_EMPTY_BODY = {
    "stepId": None,
    "ideaId": None,
    "label": "",
    "paidDate": None,
}

SPENDING_PUT_EXAMPLE = [
    OpenApiExample(
        example.name,
        summary=example.summary,
        value={**SPENDING_EMPTY_BODY, **example.value},
        request_only=True,
    )
    for example in SPENDING_EXAMPLE
]

SPENDING_PATCH_EXAMPLE = [
    OpenApiExample(
        "ChangeAmount",
        summary="Modifier le montant (les parts sont recalculées à parts égales)",
        value={"amount": "100.00"},
        request_only=True,
    ),
    OpenApiExample(
        "ChangeShares",
        summary="Modifier les parts (leur total doit égaler le montant)",
        value={
            "shares": [
                {"travelerId": 1, "amount": "50.00"},
                {"travelerId": 2, "amount": "40.00"},
            ]
        },
        request_only=True,
    ),
    OpenApiExample(
        "ChangePayer",
        summary="Changer le payeur",
        value={"travelerId": 2},
        request_only=True,
    ),
]

# =====================================================================#

# Règles sur les données d'une dépense : identiques pour POST, PUT et PATCH
SPENDING_RULES = (
    "- `travelerId` : le payeur, un participant du voyage (pas forcément "
    "l'utilisateur connecté).\n"
    "- `category` : `l` hébergement, `f` carburant, `a` activités, `m` repas, "
    "`t` péages, `o` autre.\n"
    "- `stepId` et `ideaId` : facultatifs, de ce voyage. Avec les deux, l'idée "
    "doit être sur cette étape.\n"
    "- `shares` : facultatif. Absent = parts égales entre les participants ; "
    "sinon le total des parts doit égaler le montant (sinon `400`)."
)

# =====================================================================#


spendings_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister les dépenses d'un voyage",
        description=(
            "Dépenses du voyage, de la plus récente à la plus ancienne, avec "
            "leurs parts (`shares`).\n\n"
            "### Règles\n\n"
            "- Réservé aux participants du voyage (sinon `403`)."
        ),
    ),
    post=extend_schema(
        summary="Créer une dépense",
        description=(
            "Crée une dépense dans le voyage, avec ses parts.\n\n"
            "### Règles\n\n"
            "- Réservé aux participants du voyage (sinon `403`).\n" + SPENDING_RULES
        ),
        examples=SPENDING_EXAMPLE,
    ),
)

spending_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une dépense",
        description=(
            "Détail d'une dépense du voyage, avec ses parts.\n\n"
            "### Règles\n\n"
            "- Réservé aux participants du voyage (sinon `404`)."
        ),
    ),
    put=extend_schema(
        summary="Remplacer une dépense",
        description=(
            "Remplace toute la dépense : envoyer tous les champs, `null` ou "
            "vides s'ils ne servent pas (voir les exemples).\n\n"
            "### Règles\n\n"
            "- Tout participant du voyage peut la modifier (sinon `404`).\n"
            + SPENDING_RULES
        ),
        examples=SPENDING_PUT_EXAMPLE,
    ),
    patch=extend_schema(
        summary="Modifier une dépense",
        description=(
            "Modifie les champs envoyés. Si le montant change sans `shares`, "
            "les parts sont recalculées à parts égales.\n\n"
            "### Règles\n\n"
            "- Tout participant du voyage peut la modifier (sinon `404`).\n"
            + SPENDING_RULES
        ),
        examples=SPENDING_PATCH_EXAMPLE,
    ),
    delete=extend_schema(
        summary="Supprimer une dépense",
        description=(
            "Suppression définitive de la dépense et de ses parts.\n\n"
            "### Règles\n\n"
            "- Tout participant du voyage peut la supprimer (sinon `404`)."
        ),
    ),
)
