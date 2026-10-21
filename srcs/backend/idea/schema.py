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
            "Récupère les idées du voyage `travel_id`, de la plus récente à "
            "la plus ancienne.\n\n"
            "**Accès** : participants du voyage (sinon `403`).\n\n"
            "**Réponse** : `status` vaut `suggested` (dans le pool), `placed` "
            "(sur une étape) ou `chosen` (hébergement choisi) ; `voteCount` "
            "est le nombre de votes, `voted` indique si l'utilisateur a voté."
        ),
    ),
    post=extend_schema(
        summary="Créer une idée",
        description=(
            "Crée une idée dans le voyage `travel_id`. L'utilisateur en "
            "devient l'auteur (`travelerId`).\n\n"
            "**Accès** : participants du voyage (sinon `403`).\n\n"
            "**Body** :\n\n"
            "- `title` (obligatoire) : nom de l'idée, 255 caractères maximum.\n"
            "- `type` (obligatoire) : `r` restaurant, `l` hébergement, `a` "
            "activité, `s` lieu à visiter.\n"
            "- `stepId` (facultatif) : id d'une étape du même voyage (`GET "
            "/api/travels/{travel_id}/steps/`). Absent ou `null` : l'idée est "
            "dans le pool.\n"
            "- `startDate`, `endDate` (selon le cas, voir les règles) : "
            "format `AAAA-MM-JJ`, toujours envoyées ensemble.\n"
            "- `pricePerNight` (facultatif) : seulement pour un hébergement, "
            "supérieur ou égal à 0, 2 décimales, envoyé comme texte (ex. "
            "`85.00`).\n"
            "- `localisation` (facultatif) : adresse ou nom du lieu.\n"
            "- `note` (facultatif) : commentaire libre.\n"
            "- `url` (facultatif) : lien complet (`https://…`), 200 "
            "caractères maximum.\n"
            "- `latitude`, `longitude` (facultatives) : envoyées comme texte, "
            "fournies par le client (carte ou service de géocodage).\n"
            "- `travelerId`, `status`, `chosenAt`, `voteCount` et `voted` "
            "sont calculés par le serveur : inutile de les envoyer.\n\n"
            "**Règles selon le cas** :\n\n"
            "| Cas | `stepId` | Dates |\n"
            "|---|---|---|\n"
            "| Restaurant, activité, lieu **dans le pool** | absent ou `null` "
            "| aucune |\n"
            "| Restaurant, activité, lieu **sur une étape** | id de l'étape | "
            "un seul jour (`startDate` = `endDate`), dans les dates de "
            "l'étape |\n"
            "| Hébergement **dans le pool** | absent ou `null` | "
            "obligatoires, dans les dates du voyage |\n"
            "| Hébergement **sur une étape** | id de l'étape | obligatoires, "
            "dans les dates de l'étape |\n\n"
            "Choisir un hébergement et voter se font depuis le site.\n\n"
            "**Réponses** : `201` idée créée ; `400` règle non respectée (le "
            "champ fautif est dans `details`)."
        ),
        examples=IDEA_EXAMPLE,
    ),
)

idea_detail_schema = extend_schema_view(
    get=extend_schema(
        summary="Consulter une idée",
        description=(
            "Récupère le détail d'une idée du voyage.\n\n"
            "**Accès** : participants du voyage (sinon `404`)."
        ),
    ),
    put=extend_schema(
        summary="Remplacer une idée",
        description=(
            "Remplace toutes les données de l'idée. **Envoyer tous les "
            "champs** (voir les exemples) : un champ facultatif absent "
            "garderait son ancienne valeur.\n\n"
            "**Accès** : tout participant du voyage, pas seulement l'auteur "
            "(sinon `404`).\n\n"
            "**Body** :\n\n"
            "- `title` (obligatoire) : nom de l'idée, 255 caractères maximum.\n"
            "- `type` (obligatoire) : `r` restaurant, `l` hébergement, `a` "
            "activité, `s` lieu à visiter.\n"
            "- `stepId` (facultatif) : id d'une étape du même voyage (`GET "
            "/api/travels/{travel_id}/steps/`). Absent ou `null` : l'idée est "
            "dans le pool.\n"
            "- `startDate`, `endDate` (selon le cas, voir les règles) : "
            "format `AAAA-MM-JJ`, toujours envoyées ensemble.\n"
            "- `pricePerNight` (facultatif) : seulement pour un hébergement, "
            "supérieur ou égal à 0, 2 décimales, envoyé comme texte (ex. "
            "`85.00`).\n"
            "- `localisation` (facultatif) : adresse ou nom du lieu.\n"
            "- `note` (facultatif) : commentaire libre.\n"
            "- `url` (facultatif) : lien complet (`https://…`), 200 "
            "caractères maximum.\n"
            "- `latitude`, `longitude` (facultatives) : envoyées comme texte, "
            "fournies par le client (carte ou service de géocodage).\n"
            "- `travelerId`, `status`, `chosenAt`, `voteCount` et `voted` "
            "sont calculés par le serveur : inutile de les envoyer.\n\n"
            "**Règles selon le cas** :\n\n"
            "| Cas | `stepId` | Dates |\n"
            "|---|---|---|\n"
            "| Restaurant, activité, lieu **dans le pool** | absent ou `null` "
            "| aucune |\n"
            "| Restaurant, activité, lieu **sur une étape** | id de l'étape | "
            "un seul jour (`startDate` = `endDate`), dans les dates de "
            "l'étape |\n"
            "| Hébergement **dans le pool** | absent ou `null` | "
            "obligatoires, dans les dates du voyage |\n"
            "| Hébergement **sur une étape** | id de l'étape | obligatoires, "
            "dans les dates de l'étape |\n\n"
            "Choisir un hébergement et voter se font depuis le site.\n\n"
            "**Réponses** : `200` idée modifiée ; `400` règle non respectée."
        ),
        examples=IDEA_PUT_EXAMPLE,
    ),
    patch=extend_schema(
        summary="Modifier une idée",
        description=(
            "Modifie seulement les champs envoyés. Actions courantes :\n\n"
            "- **placer** un restaurant, une activité ou un lieu : `stepId` + "
            "le jour (`startDate` = `endDate`) ;\n"
            "- **placer** un hébergement : `stepId` seul (ses dates doivent "
            "être dans l'étape) ;\n"
            "- **remettre dans le pool** : `stepId` à `null`, et les dates à "
            "`null` sauf pour un hébergement.\n\n"
            "**Accès** : tout participant du voyage, pas seulement l'auteur "
            "(sinon `404`).\n\n"
            "**Body** : tous les champs sont facultatifs, n'envoyer que ceux "
            "qui changent.\n\n"
            "- `title` : nom de l'idée, 255 caractères maximum.\n"
            "- `type` : `r` restaurant, `l` hébergement, `a` activité, `s` "
            "lieu à visiter.\n"
            "- `stepId` : id d'une étape du même voyage (`GET "
            "/api/travels/{travel_id}/steps/`). Absent ou `null` : l'idée est "
            "dans le pool.\n"
            "- `startDate`, `endDate` (selon le cas, voir les règles) : "
            "format `AAAA-MM-JJ`, toujours envoyées ensemble.\n"
            "- `pricePerNight` : seulement pour un hébergement, supérieur ou "
            "égal à 0, 2 décimales, envoyé comme texte (ex. `85.00`).\n"
            "- `localisation` : adresse ou nom du lieu.\n"
            "- `note` : commentaire libre.\n"
            "- `url` : lien complet (`https://…`), 200 caractères maximum.\n"
            "- `latitude`, `longitude` : envoyées comme texte, fournies par "
            "le client (carte ou service de géocodage).\n"
            "- `travelerId`, `status`, `chosenAt`, `voteCount` et `voted` "
            "sont calculés par le serveur : inutile de les envoyer.\n\n"
            "**Règles selon le cas** :\n\n"
            "| Cas | `stepId` | Dates |\n"
            "|---|---|---|\n"
            "| Restaurant, activité, lieu **dans le pool** | absent ou `null` "
            "| aucune |\n"
            "| Restaurant, activité, lieu **sur une étape** | id de l'étape | "
            "un seul jour (`startDate` = `endDate`), dans les dates de "
            "l'étape |\n"
            "| Hébergement **dans le pool** | absent ou `null` | "
            "obligatoires, dans les dates du voyage |\n"
            "| Hébergement **sur une étape** | id de l'étape | obligatoires, "
            "dans les dates de l'étape |\n\n"
            "Choisir un hébergement et voter se font depuis le site.\n\n"
            "Les règles s'appliquent à l'idée obtenue après la modification.\n\n"
            "**Réponses** : `200` idée modifiée ; `400` règle non respectée."
        ),
        examples=IDEA_PATCH_EXAMPLE,
    ),
    delete=extend_schema(
        summary="Supprimer une idée",
        description=(
            "Suppression définitive de l'idée et de ses votes.\n\n"
            "**Accès** : tout participant du voyage, pas seulement l'auteur "
            "(sinon `404`).\n\n"
            "**Réponse** : `204` idée supprimée."
        ),
    ),
)
