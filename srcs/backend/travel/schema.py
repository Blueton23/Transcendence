from drf_spectacular.utils import OpenApiExample, extend_schema, extend_schema_view

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
    summary="Etape complète (tous les champs)",
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


travels_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister mes voyages",
        description=(
            "Récupère les voyages dont l'utilisateur est participant, du plus "
            "récent au plus ancien.\n\n"
            "**Accès** : tout utilisateur authentifié. Les voyages des autres "
            "utilisateurs n'apparaissent pas.\n\n"
            "**Réponse** : l'`id` de chaque voyage sert de `travel_id` dans "
            "les autres routes."
        ),
    ),
    post=extend_schema(
        summary="Créer un voyage",
        description=(
            "Crée un nouveau voyage. L'utilisateur qui le crée en devient "
            "automatiquement participant.\n\n"
            "**Accès** : tout utilisateur authentifié.\n\n"
            "**Body** :\n\n"
            "- `title` (obligatoire) : nom du voyage, 50 caractères maximum.\n"
            "- `startDate` (obligatoire) : premier jour du voyage, format "
            "`AAAA-MM-JJ`.\n"
            "- `endDate` (obligatoire) : dernier jour du voyage, format "
            "`AAAA-MM-JJ`, le même jour que `startDate` ou après.\n"
            "- `status`, `nights`, `travelers` et `inviteToken` sont calculés "
            "par le serveur : inutile de les envoyer.\n\n"
            "**Réponses** : `201` voyage créé (son `id` sert de `travel_id`) "
            "; `400` champ invalide (le champ fautif est dans `details`).\n\n"
            "Inviter d'autres participants se fait depuis le site (lien "
            "d'invitation)."
        ),
        examples=[TRAVEL_EXAMPLE],
    ),
)

travel_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter un voyage",
        description=(
            "Récupère le détail d'un voyage.\n\n"
            "**Accès** : participants du voyage (sinon `404`).\n\n"
            "Un voyage ne se supprime pas avec l'API : on le quitte depuis le "
            "site."
        ),
    ),
    put=extend_schema(
        summary="Remplacer un voyage",
        description=(
            "Remplace le titre et les dates du voyage : les 3 champs sont "
            "obligatoires.\n\n"
            "**Accès** : tout participant du voyage (sinon `404`).\n\n"
            "**Body** :\n\n"
            "- `title` (obligatoire) : nom du voyage, 50 caractères maximum.\n"
            "- `startDate` (obligatoire) : premier jour du voyage, format "
            "`AAAA-MM-JJ`.\n"
            "- `endDate` (obligatoire) : dernier jour du voyage, format "
            "`AAAA-MM-JJ`, le même jour que `startDate` ou après.\n"
            "- `status`, `nights`, `travelers` et `inviteToken` sont calculés "
            "par le serveur : inutile de les envoyer.\n\n"
            "**Attention** : changer les dates du voyage ne déplace pas ses "
            "étapes.\n\n"
            "**Réponses** : `200` voyage modifié ; `400` champ invalide."
        ),
        examples=[TRAVEL_EXAMPLE],
    ),
    patch=extend_schema(
        summary="Modifier un voyage",
        description=(
            "Modifie seulement les champs envoyés : le titre, les dates, ou "
            "les deux.\n\n"
            "**Accès** : tout participant du voyage (sinon `404`).\n\n"
            "**Body** : tous les champs sont facultatifs, n'envoyer que ceux "
            "qui changent.\n\n"
            "- `title` : nom du voyage, 50 caractères maximum.\n"
            "- `startDate` : premier jour du voyage, format `AAAA-MM-JJ`.\n"
            "- `endDate` : dernier jour du voyage, format `AAAA-MM-JJ`, le "
            "même jour que `startDate` ou après.\n"
            "- `status`, `nights`, `travelers` et `inviteToken` sont calculés "
            "par le serveur : inutile de les envoyer.\n\n"
            "Les règles s'appliquent au résultat final.\n\n"
            "**Attention** : changer les dates du voyage ne déplace pas ses "
            "étapes.\n\n"
            "**Réponses** : `200` voyage modifié ; `400` champ invalide."
        ),
        examples=TRAVEL_PATCH_EXAMPLE,
    ),
)


steps_list_schema = extend_schema_view(
    get=extend_schema(
        summary="Lister les étapes d'un voyage",
        description=(
            "Récupère les étapes du voyage `travel_id`, dans l'ordre "
            "chronologique. Les étapes supprimées n'apparaissent pas.\n\n"
            "**Accès** : participants du voyage (sinon `403`).\n\n"
            "**Réponse** : l'`id` de chaque étape sert de `stepId` pour "
            "placer une idée ; `nights` est le nombre de nuits, `ideaCount` "
            "le nombre d'idées placées sur l'étape."
        ),
    ),
    post=extend_schema(
        summary="Créer une étape",
        description=(
            "Crée une étape dans le voyage `travel_id`.\n\n"
            "**Accès** : participants du voyage (sinon `403`).\n\n"
            "**Body** :\n\n"
            "- `localisation` (obligatoire) : nom du lieu, 255 caractères "
            "maximum.\n"
            "- `startDate` (obligatoire) : premier jour de l'étape, format "
            "`AAAA-MM-JJ`, dans les dates du voyage.\n"
            "- `endDate` (obligatoire) : dernier jour de l'étape, format "
            "`AAAA-MM-JJ`, dans les dates du voyage, le même jour que "
            "`startDate` ou après.\n"
            "- `latitude` (obligatoire) : entre -90 et 90, 7 décimales "
            "maximum, envoyée comme texte entre guillemets (ex. "
            "`45.7640000`).\n"
            "- `longitude` (obligatoire) : entre -180 et 180, même format "
            "(ex. `4.8357000`).\n"
            "- `priority` (facultatif) : entier supérieur ou égal à 0, ordre "
            "entre des étapes aux mêmes dates.\n\n"
            "**Règles** :\n\n"
            "- Les étapes d'un voyage ne se chevauchent pas : une étape peut "
            "seulement commencer le jour où la précédente se termine.\n"
            "- Les coordonnées sont fournies par le client : sur une carte, "
            "ou avec un service de géocodage (par exemple Nominatim "
            "d'OpenStreetMap).\n\n"
            "**Réponses** : `201` étape créée ; `400` règle non respectée (le "
            "champ fautif est dans `details`)."
        ),
        examples=[STEP_EXAMPLE],
    ),
)

step_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une étape",
        description=(
            "Récupère le détail d'une étape du voyage.\n\n"
            "**Accès** : participants du voyage (sinon `404`)."
        ),
    ),
    put=extend_schema(
        summary="Remplacer une étape",
        description=(
            "Remplace toutes les données de l'étape : envoyer tous les "
            "champs, y compris `priority` (`null` s'il ne sert pas), sinon il "
            "garde son ancienne valeur.\n\n"
            "**Accès** : participants du voyage (sinon `404`).\n\n"
            "**Body** :\n\n"
            "- `localisation` (obligatoire) : nom du lieu, 255 caractères "
            "maximum.\n"
            "- `startDate` (obligatoire) : premier jour de l'étape, format "
            "`AAAA-MM-JJ`, dans les dates du voyage.\n"
            "- `endDate` (obligatoire) : dernier jour de l'étape, format "
            "`AAAA-MM-JJ`, dans les dates du voyage, le même jour que "
            "`startDate` ou après.\n"
            "- `latitude` (obligatoire) : entre -90 et 90, 7 décimales "
            "maximum, envoyée comme texte entre guillemets (ex. "
            "`45.7640000`).\n"
            "- `longitude` (obligatoire) : entre -180 et 180, même format "
            "(ex. `4.8357000`).\n"
            "- `priority` (facultatif) : entier supérieur ou égal à 0, ordre "
            "entre des étapes aux mêmes dates.\n\n"
            "**Règles** :\n\n"
            "- Les étapes d'un voyage ne se chevauchent pas : une étape peut "
            "seulement commencer le jour où la précédente se termine.\n"
            "- Les coordonnées sont fournies par le client : sur une carte, "
            "ou avec un service de géocodage (par exemple Nominatim "
            "d'OpenStreetMap).\n\n"
            "**Réponses** : `200` étape modifiée ; `400` règle non respectée."
        ),
        examples=[STEP_PUT_EXAMPLE],
    ),
    patch=extend_schema(
        summary="Modifier une étape",
        description=(
            "Modifie seulement les champs envoyés. Pour changer de lieu, "
            "envoyer `localisation`, `latitude` et `longitude` ensemble.\n\n"
            "**Accès** : participants du voyage (sinon `404`).\n\n"
            "**Body** : tous les champs sont facultatifs, n'envoyer que ceux "
            "qui changent.\n\n"
            "- `localisation` : nom du lieu, 255 caractères maximum.\n"
            "- `startDate` : premier jour de l'étape, format `AAAA-MM-JJ`, "
            "dans les dates du voyage.\n"
            "- `endDate` : dernier jour de l'étape, format `AAAA-MM-JJ`, dans "
            "les dates du voyage, le même jour que `startDate` ou après.\n"
            "- `latitude` : entre -90 et 90, 7 décimales maximum, envoyée "
            "comme texte entre guillemets (ex. `45.7640000`).\n"
            "- `longitude` : entre -180 et 180, même format (ex. "
            "`4.8357000`).\n"
            "- `priority` : entier supérieur ou égal à 0, ordre entre des "
            "étapes aux mêmes dates.\n\n"
            "**Règles** :\n\n"
            "- Les étapes d'un voyage ne se chevauchent pas : une étape peut "
            "seulement commencer le jour où la précédente se termine.\n"
            "- Les coordonnées sont fournies par le client : sur une carte, "
            "ou avec un service de géocodage (par exemple Nominatim "
            "d'OpenStreetMap).\n\n"
            "Les règles s'appliquent au résultat final.\n\n"
            "**Réponses** : `200` étape modifiée ; `400` règle non respectée."
        ),
        examples=STEP_PATCH_EXAMPLE,
    ),
    delete=extend_schema(
        summary="Supprimer une étape",
        description=(
            "Suppression douce : l'étape part à la corbeille. Elle n'apparaît "
            "plus dans l'API (`404`), et son id ne peut plus servir de "
            "`stepId`.\n\n"
            "**Accès** : participants du voyage (sinon `404`).\n\n"
            "**Conséquence** : les idées placées sur l'étape retournent dans "
            "le pool. Les restaurants, activités et lieux gardent leur date : "
            "pour les modifier ensuite, envoyer aussi `startDate` et "
            "`endDate` à `null`.\n\n"
            "**Réponse** : `204` étape supprimée."
        ),
    ),
)
