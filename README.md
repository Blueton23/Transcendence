# Transcendence
Our repo for the 42 school project Transcendence

## stack
Containerization : Docker
Database : Postgres
Backend framework : Django
Frontend framework : React / vite / talwind
nginx : server web



===============================================================================


Ce projet a été créé dans le cadre du cursus 42 par <dle-fur[Technical Lead - Architect], [Developer]>

# Instructions

## Prérequis

| Outil | Pourquoi il est nécessaire | Vérification |
|---|---|---|
| **Docker** avec le plugin **Compose v2** | Construit et lance tous les services dans des conteneurs | `docker --version` et `docker compose version` |
| **Make** | Des commandes courtes pour tout (`make up`, `make test`…) | `make --version` |


## 1. Configurer l'environnement

Les réglages se trouvent dans un fichier `.env.example`.

```bash
cp .env.example .env
```

Puis modifie `.env` :

| Variable | Utilisée par | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | `backend` | Clé cryptographique de Django (sessions, CSRF). Mettre une longue valeur aléatoire |
| `DJANGO_DEBUG` | `backend` | `True` en développement, `False` en production |
| `DJANGO_ALLOWED_HOSTS` | `backend` | Noms d'hôte acceptés par Django. Doit contenir `localhost` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `db`, `backend` | Nom et identifiants de la base PostgreSQL (créée automatiquement au premier démarrage) |
| `POSTGRES_HOST`, `POSTGRES_PORT` | `backend` | Où Django trouve la base : `db` (le nom du service) et `5432` |
| `REDIS_HOST`, `REDIS_PORT` | `backend` | Où Django trouve Redis : `redis` (le nom du service) et `6379` |
| `UID`, `GID` | build du `backend` | Ton identifiant d'utilisateur et de groupe (`id -u`, `id -g`). Les fichiers créés par le conteneur dans `srcs/backend/` t'appartiendront |
| `DJANGO_CSRF_TRUSTED_ORIGINS` *(facultative)* | `backend` | Origines autorisées à envoyer des formulaires. Par défaut : `http://localhost:8080` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `backend` | Identifiants de l'application OAuth créée dans la Google Cloud Console (voir « Module : Authentification OAuth 2.0 avec Google ») |
| `GOOGLE_REDIRECT_URI` | `backend` | Adresse de retour après la connexion Google : `http://localhost:8080/api/auth/google/callback/`, identique à celle déclarée chez Google |

> Pour générer une clé secrète :
> `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`


Les fonctionnalités de carte du frontend ont aussi besoin d'un token Mapbox dans `srcs/frontend/.env` (modèle : `srcs/frontend/.env.example`, variable `VITE_MAPBOX_TOKEN`).

## 2. Lancer le projet

```bash
make up            # construit les images et lance tous les services (logs dans le terminal)
```

Uniquement au premier lancement :

```bash
make migrate          # crée les tables de la base
make seed             # (facultatif) remplit la base avec des données de test
make createsuperuser  # (facultatif) crée un compte admin pour /admin/
```

L'application est alors disponible sur **http://localhost:8080**.

| URL | Ce qu'on obtient |
|---|---|
| http://localhost:8080 | L'application web (frontend) |
| http://localhost:8080/api/ | Vérification de santé du backend : `{"status": "ok"}` |
| http://localhost:8080/admin/ | Administration Django |
| http://localhost:8080/api/docs/ | Documentation de l'API publique (Swagger) |

## 3. Vérifications rapides (est-ce que tout fonctionne ?)

Lance ces commandes pendant que le projet tourne. Chacune teste un maillon de la chaîne.

| # | Commande | Résultat attendu | Ce que ça prouve |
|---|---|---|---|
| 1 | `make ps` | `db`, `redis`, `backend` et `frontend` sont **healthy**, `nginx` est **running** | Tous les conteneurs ont démarré et passé leurs health checks |
| 2 | `curl http://localhost:8080/api/` | `{"status":"ok"}` | Navigateur → **Nginx** → **Django** fonctionne |
| 3 | `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:8080/` | `200 text/html` | Navigateur → **Nginx** → **frontend** fonctionne |
| 4 | `make test-db` | `✅ Connexion réussie à la base : <POSTGRES_DB>` | Django atteint **PostgreSQL** |
| 5 | `make ping` | `PONG` | **Redis** répond |
| 6 | Ouvrir http://localhost:8080/admin/ | Une page de connexion **mise en forme** (pas du HTML brut) | Les fichiers statiques sont collectés par Django et **servis par Nginx** |
| 7 | `make test` | `OK` à la fin | La suite de tests du backend passe |


## 4. Commandes utiles

| Commande | Description |
|---|---|
| `make up` | Construire et tout lancer (au premier plan) |
| `make start` / `make stop` | Lancer en arrière-plan / arrêter sans supprimer les conteneurs |
| `make down` | Arrêter et supprimer les conteneurs (les données sont conservées) |
| `make logs` | Suivre les logs de tous les services |
| `make ps` | État et santé de chaque service |
| `make migrate` / `make makemigrations` | Appliquer / créer les migrations de la base |
| `make seed` / `make unseed` | Ajouter / supprimer les données de test |
| `make createsuperuser` | Créer un compte admin |
| `make shell` | Shell Django dans le backend |
| `make psql` | Console PostgreSQL |
| `make test` | Lancer les tests du backend (`make test ARGS=travel` pour une seule app) |
| `make check-back` / `make fix-back` | Vérifier / corriger le lint et le formatage du backend (Ruff) |
| `make lint` / `make format-front` | Lint / formatage du frontend (ESLint, Prettier) |
| `make front-install` | Réinstaller les dépendances du frontend après une modification de `package.json` |
| `make fclean` | ⚠️ Supprime les conteneurs, les images **et toutes les données** (demande une confirmation) |
| `make re` | `fclean` puis `up` : redémarrage complet à zéro |

---

# Stack technique : Infrastructure

## Architecture

Le projet tourne sous forme de **5 services** orchestrés par Docker Compose. **Nginx est le seul point d'entrée** : le navigateur (ou tout client de l'API) ne parle qu'au port 8080, et Nginx transmet chaque requête au bon service.

```mermaid
flowchart LR
    client["Navigateur / client API"] -->|":8080"| nginx["nginx"]
    nginx -->|"/"| frontend["frontend<br/>React + Vite :5173"]
    nginx -->|"/api/ · /admin/ · /ws/"| backend["backend<br/>Django + Uvicorn :8000"]
    nginx -->|"/static/ · /media/"| files[("volumes<br/>static & media")]
    backend --> db[("db<br/>PostgreSQL :5432")]
    backend --> redis[("redis<br/>Redis :6379")]
    backend --> files
```

**Ordre de démarrage** (imposé par les health checks) : `db` et `redis` démarrent en premier → `backend` ne démarre que quand les deux sont **healthy** → `nginx` démarre quand `backend` est healthy et que `frontend` a démarré. Ça évite par exemple que Django essaie de se connecter à une base qui n'est pas encore prête.

## Les services

### Docker & Docker Compose : orchestration

- **Ce que c'est** : Docker emballe chaque partie de l'application avec tout ce dont elle a besoin (langage, bibliothèques, outils système) dans un **conteneur**. Docker Compose décrit et lance tous les conteneurs ensemble à partir d'un seul fichier, `docker-compose.yml`.
- **Pourquoi** : chaque membre de l'équipe, les évaluateurs et un futur serveur lancent **exactement le même environnement** avec une seule commande. Fini le « ça marche sur ma machine ».
- **Avantages** :
  - Des versions fixes pour chaque service (`postgres:17-alpine`, `redis:7.4.9-alpine`, `python:3.13`, `node:22`, `nginx:1.30.3`).
  - **Health checks** + `depends_on: condition: service_healthy` → les services démarrent dans le bon ordre.
  - `restart: unless-stopped` → un service qui plante redémarre automatiquement.
  - Les services communiquent entre eux par leur nom (`db`, `redis`, `backend`, `frontend`) sur un réseau privé ; seul Nginx est exposé.
- **Dans le projet** : `docker-compose.yml` à la racine, un dossier par service dans `srcs/`, et un **Makefile** qui enveloppe les commandes Compose.

### PostgreSQL 17 : base de données (`db`)

- **Ce que c'est** : une base de données relationnelle (tables, relations, contraintes, transactions).
- **Pourquoi** : les données du projet sont fortement liées entre elles, voyageurs, voyages, participations, étapes, idées, réactions, amitiés et doivent rester cohérentes.
- **Avantages** :
  - Des **contraintes** au niveau de la base, utilisées par nos modèles (`UniqueConstraint`, `CheckConstraint`, par exemple « date de fin ≥ date de début », « une seule réaction par utilisateur et par idée »).
  - Des **transactions** fiables et le **verrouillage de lignes** (`select_for_update`, utilisé lors du choix d'un hébergement), pour que deux utilisateurs ne puissent pas casser les données en même temps.
  - Un support complet par l'ORM de Django, via le driver `psycopg` 3.
- **Dans le projet** : les identifiants viennent du `.env` ; les données sont stockées dans le **volume `postgres_data`** et survivent aux redémarrages ; le health check utilise `pg_isready`.

### Redis 7.4 : stockage en mémoire (`redis`)

- **Ce que c'est** : un stockage clé-valeur très rapide, gardé en mémoire.
- **Pourquoi** : deux fonctionnalités ont besoin de données partagées, rapides et temporaires, qui n'ont pas leur place dans PostgreSQL.
- **Avantages** : très rapide, partagé par tous les processus du backend, expiration automatique des clés.
- **Dans le projet**, deux bases Redis séparées :
  - **Base 0 - Django Channels** (channel layer) : transporte les messages temps réel des WebSockets entre les processus du backend.
  - **Base 1 - cache Django** : stocke les compteurs du **rate limiting** de l'API publique.

### Backend : Django 5.2 + Django REST Framework, servi par Uvicorn (`backend`)

- **Ce que c'est** : le serveur applicatif. **Django** gère les données, les règles métier, l'authentification et l'admin ; **Django REST Framework** expose l'API REST (`/api/...`) ; **Django Channels** ajoute les WebSockets (`/ws/...`) ; **Uvicorn** est le serveur ASGI qui fait tourner l'ensemble.
- **Pourquoi** : Django fournit dès le départ un ORM, les migrations, l'authentification, le hachage des mots de passe, la protection CSRF et une interface d'administration ; DRF ajoute les serializers, les permissions et le throttling pour l'API. **ASGI** (au lieu du WSGI classique) est nécessaire pour gérer à la fois HTTP et WebSockets dans le même serveur.
- **Avantages** : des réglages sécurisés par défaut, un développement rapide, un seul langage (Python 3.13) pour tout le backend.
- **Dans le projet** :
  - Image basée sur `python:3.13-slim-bookworm`, dépendances fixées dans `requirements.txt`.
  - Tourne avec un **utilisateur non-root** (`appuser`), dont l'UID/GID vient du `.env`, pour que les fichiers créés dans le dossier monté appartiennent au développeur.
  - Au démarrage, `entrypoint.sh` lance `collectstatic` (copie le CSS et le JS de l'admin et de DRF dans le volume partagé `static_data`), puis démarre Uvicorn avec **`--reload`** : le code est monté en volume (`./srcs/backend:/app`), donc chaque modification est appliquée immédiatement.
  - Les fichiers envoyés par les utilisateurs (photos de profil) sont stockés dans le volume **`media_data`**.
  - Health check : `curl http://localhost:8000/api/` doit répondre.
  - Qualité du code : **Ruff** (lint + formatage), **tests Django** (`make test`).

### Frontend : React 19 + TypeScript + Vite (`frontend`)

- **Ce que c'est** : l'interface utilisateur, une application monopage (SPA) écrite en **React** et **TypeScript**, mise en forme avec **Tailwind CSS**, construite et servie par **Vite**.
- **Pourquoi** : React est la bibliothèque d'interface la plus utilisée ; TypeScript détecte les erreurs avant l'exécution du code ; Vite démarre instantanément et applique les modifications dans le navigateur sans recharger la page (**HMR**, hot module replacement).
- **Avantages** : un retour immédiat pendant le développement, du code typé, des composants réutilisables.
- **Dans le projet** :
  - Image basée sur `node:22-alpine` ; dépendances installées avec `npm ci` à partir de `package-lock.json` (exactement les mêmes versions pour tout le monde).
  - Lance le serveur de développement Vite sur le port 5173 (accessible uniquement via Nginx).
  - Le code est monté en volume pour le rechargement à chaud ; **`node_modules` est un volume nommé séparé** (`frontend_node_modules`), pour que les dépendances installées dans le conteneur ne soient pas masquées par le dossier de la machine hôte.
  - Qualité : **ESLint** et **Prettier** (`make lint`, `make format-front`).

### Nginx 1.30 : reverse proxy, point d'entrée unique (`nginx`)

- **Ce que c'est** : un serveur web placé devant tous les autres services.
- **Pourquoi** : le navigateur a besoin d'**une seule adresse** pour toute l'application ; Nginx envoie chaque URL vers le bon service et sert les fichiers directement.
- **Avantages** :
  - **Une seule origine** pour le frontend et l'API → pas de configuration CORS, les cookies de session fonctionnent naturellement.
  - Sert les **fichiers statiques et media** directement depuis les volumes, beaucoup plus vite que Django et sans le solliciter.
  - Transmet la vraie IP du client (`X-Forwarded-For`), utilisée par le rate limiting de l'API.
  - Gère le **passage en WebSocket** pour `/ws/` (Django Channels) et pour le rechargement à chaud de Vite.
  - C'est l'endroit naturel pour mettre en place **HTTPS**.
- **Dans le projet** (`srcs/nginx/nginx.conf`) :

  | URL | Envoyée vers |
  |---|---|
  | `/api/`, `/admin/` | `backend` (Django) |
  | `/ws/` | `backend` (WebSocket, délais d'attente longs) |
  | `/static/`, `/media/` | fichiers lus directement dans les volumes (lecture seule) |
  | tout le reste (`/`) | `frontend` (Vite) |

  `client_max_body_size 10M` autorise l'envoi d'images (les photos de profil sont limitées à 5 Mo par le backend).

### Volumes : données persistantes et partagées

| Volume | Contenu | Pourquoi un volume |
|---|---|---|
| `postgres_data` | Les fichiers de la base de données | Les données survivent à `make down` et aux redémarrages (seul `make fclean` les supprime) |
| `static_data` | Les fichiers statiques de Django (`collectstatic`) | Écrits par `backend`, lus par `nginx` |
| `media_data` | Les fichiers envoyés par les utilisateurs (photos de profil) | Écrits par `backend`, lus par `nginx` |
| `frontend_node_modules` | Les dépendances du frontend | Sépare le `node_modules` du conteneur du dossier de la machine hôte |

## Développement vs production

La configuration actuelle est faite pour le **développement** (rechargement à chaud, code source monté, HTTP sur le port 8080). Les changements prévus pour la production sont écrits en commentaires `# POUR LA PROD` en haut de `docker-compose.yml`, des Dockerfiles, de `nginx.conf` et de `.env.example` : HTTPS sur le port 443 dans Nginx, construire le frontend au lieu de lancer le serveur de développement, lancer Uvicorn avec plusieurs workers au lieu de `--reload`, ne plus monter le code source, et de vraies valeurs secrètes dans le `.env`.

#
#

# Fonctionnalité : Idées et votes (`idea` / `reaction`)

## Présentation

Dans un voyage, chaque participant peut **épingler des idées** : un restaurant, un hébergement, une activité ou un lieu à voir. Les autres participants **votent** pour les idées qui leur plaisent, puis le groupe **place** les idées sur les étapes de l'itinéraire. Pour les hébergements, on **choisit** celui qu'on retient.

| Type (API) | Type (interface) | Exemple |
|---|---|---|
| `r` | Restaurant | « Pizzeria du port » |
| `l` | Hébergement | « Airbnb vieille ville », avec un prix par nuit et des dates d'arrivée / de départ |
| `a` | Activité | « Kayak sur le lac » |
| `s` | Lieu à voir | « Musée des Beaux-Arts » |

**Le cycle de vie d'une idée** (le statut est **calculé** par le backend, jamais envoyé par le client) :

```mermaid
stateDiagram-v2
    [*] --> suggested : épinglée (pas d'étape)
    suggested --> placed : placée sur une étape
    placed --> suggested : retirée de l'étape / étape supprimée
    placed --> chosen : hébergement choisi
```

- **suggested** : l'idée est dans le « pool » du voyage, sans étape.
- **placed** : l'idée est rattachée à une étape (avec une date, ou des dates pour un hébergement).
- **chosen** : réservé aux **hébergements** placés : c'est celui que le groupe retient pour ces dates.

## Périmètre de ma contribution

| Partie | Réalisé par | Fichiers |
|---|---|---|
| Modèles `Idea` et `Reaction` et leurs règles de validation | un autre membre de l'équipe | `idea/models.py` |
| **API REST** (serializers, vues, URLs) | **moi** | `idea/serializers.py`, `idea/views.py`, `idea/urls.py` |
| **Frontend complet** de la fonctionnalité | **moi** | `src/features/idea/`, `src/pages/IdeasPage.tsx` |

## Architecture : du clic à la base de données

```mermaid
flowchart LR
    ui["Composants React<br/>(page, cartes, modals)"] --> hook["useIdeas<br/>(état de la page)"]
    hook --> api["api.ideas.ts<br/>(appels fetch)"]
    api -->|"JSON camelCase<br/>+ cookie de session + CSRF"| nginx["Nginx"]
    nginx --> view["Vues DRF<br/>(idea/views.py)"]
    view --> ser["Serializers<br/>(idea/serializers.py)"]
    ser --> model["Modèles<br/>Idea / Reaction"]
    model --> db[("PostgreSQL")]
```

Au retour, la réponse JSON repasse par **`ideaMapper.ts`**, qui la convertit au format attendu par les composants. `useIdeas` met ensuite à jour l'état, et React réaffiche la page.

---

## Backend : l'API REST

### Les routes

Toutes les routes sont sous `/api/travels/{travel_id}/ideas/` : une idée appartient **toujours** à un voyage.

| Méthode | URL | Rôle | Réponse |
|---|---|---|---|
| `GET` | `/api/travels/{travel_id}/ideas/` | Lister les idées du voyage (avec votes) | `200` |
| `POST` | `/api/travels/{travel_id}/ideas/` | Épingler une nouvelle idée | `201` |
| `GET` | `/api/travels/{travel_id}/ideas/{id}/` | Consulter une idée | `200` |
| `PUT` / `PATCH` | `/api/travels/{travel_id}/ideas/{id}/` | Modifier une idée (ou la placer sur une étape) | `200` |
| `DELETE` | `/api/travels/{travel_id}/ideas/{id}/` | Supprimer une idée (et ses votes) | `204` |
| `POST` | `/api/travels/{travel_id}/ideas/{id}/choice/` | Choisir un hébergement placé | `200` |
| `GET` | `/api/travels/{travel_id}/ideas/{id}/reaction/` | Lister les votes d'une idée | `200` |
| `POST` | `/api/travels/{travel_id}/ideas/{id}/reaction/` | Voter pour une idée | `201` |
| `DELETE` | `/api/travels/{travel_id}/ideas/{id}/reaction/` | Retirer son vote | `204` |

### Les vues (`idea/views.py`)

#### `IdeaListView` - lister et créer
- **Ce que c'est** : une vue générique DRF `ListCreateAPIView` (GET + POST).
- **Pourquoi** : la vue générique gère déjà la lecture du body, la validation par le serializer et les bons codes HTTP (`200`, `201`). On n'écrit que ce qui est propre au projet.
- **Avantages** :
  - **Le nombre de votes et « ai-je voté ? » sont calculés en une seule requête SQL**, grâce à `annotate(vote_count=Count("reactions"), voted=Exists(...))`. Sans ça, il faudrait une requête de plus par idée affichée (le problème du « N+1 »).
  - `perform_create` remplit lui-même **le voyage** (depuis l'URL) et **l'auteur** (l'utilisateur connecté) : un client ne peut pas créer une idée au nom de quelqu'un d'autre ni dans un autre voyage.
- **Dans le projet** : protégée par `IsAuthenticated` + `IsTravelParticipant`. Seul un participant **accepté** du voyage peut lister ou créer, les autres reçoivent `403`. Les idées sont triées de la plus récente à la plus ancienne.

#### `IdeaDetailView` - consulter, modifier, supprimer
- **Ce que c'est** : une `RetrieveUpdateDestroyAPIView` (GET, PUT, PATCH, DELETE).
- **Pourquoi** : une seule vue pour toutes les opérations sur **une** idée. Le placement sur une étape est aussi un simple `PATCH` (`stepId` + dates).
- **Avantages** : avec `ParticipantScopedMixin`, le queryset ne contient **que** les idées des voyages de l'utilisateur. Une idée d'un autre voyage renvoie `404`, sans même révéler qu'elle existe.
- **Dans le projet** : la suppression est **définitive** et entraîne celle des votes (`on_delete=CASCADE`).

#### `IdeaChoiceView` - choisir un hébergement
- **Ce que c'est** : une action dédiée, `POST .../choice/`.
- **Pourquoi** : choisir un hébergement n'est pas une modification libre. C'est une action avec ses propres règles (uniquement un hébergement placé, pas deux hébergements choisis sur des dates qui se chevauchent).
- **Avantages** : la vue tourne dans une **transaction** (`@transaction.atomic`) avec un **verrou sur les lignes** (`select_for_update`) de l'idée et de l'étape. Si deux participants cliquent en même temps, les requêtes passent l'une après l'autre, et les règles ne peuvent pas être contournées.
- **Dans le projet** : l'action est **idempotente**. Choisir un hébergement déjà choisi ne change rien et renvoie l'idée telle quelle. L'auteur du choix et la date sont enregistrés (`chosenById`, `chosenAt`).

#### `ReactionView` - les votes
- **Ce que c'est** : une vue avec trois méthodes sur `.../reaction/` : `GET` (liste des votes), `POST` (voter), `DELETE` (retirer son vote).
- **Pourquoi** : le vote est une ressource liée à une idée et à l'utilisateur connecté. Le client n'envoie **aucune donnée** : l'idée vient de l'URL, l'utilisateur de la session.
- **Avantages** : **un seul vote par personne et par idée**, garanti par une contrainte unique en base. Un second `POST` renvoie `400` (« You have already reacted to this idea. »). Le `DELETE` ne supprime **que** le vote de l'utilisateur connecté.
- **Dans le projet** : même règle d'accès que le détail (`ParticipantScopedMixin`).

### Les serializers (`idea/serializers.py`)

#### `IdeaSerializer`
- **Ce que c'est** : la traduction entre une idée en base et son JSON.
- **Pourquoi** : il définit **ce que le client peut lire et écrire**, et transforme les erreurs du modèle en réponses HTTP propres.
- **Avantages / rôle dans le projet** :
  - **Champs en lecture seule** : `id`, `travelId`, `travelerId`, `chosenById`, `status`, `chosenAt`, `createdAt`, `updatedAt`. Le client ne peut ni changer l'auteur, ni forcer un statut, ni « choisir » un hébergement sans passer par `/choice/`.
  - **`status` lisible** : le code interne (`s`, `p`, `c`) devient `suggested`, `placed` ou `chosen`.
  - **`voteCount` et `voted`** : il réutilise les valeurs calculées par la vue de liste ; sinon (vue de détail), il les calcule.
  - **`stepId`** : il n'accepte que des étapes **non supprimées** (`Step.objects.alive()`).
  - **Les règles métier du modèle** (dates d'un hébergement dans le voyage, une seule date pour une activité placée…) lèvent une `ValidationError` Django. Le serializer la **convertit en erreur `400` DRF**, avec le détail par champ, au lieu d'une erreur serveur `500`.

#### `ReactionSerializer`
- **Rôle** : renvoie le vote créé (`id`, `travelerId`, `ideaId`, `createdAt`). Une violation de la contrainte « un vote par personne » (`IntegrityError`) est convertie en `400` avec un message clair.

### Sécurité, en résumé
| Règle | Où | Effet |
|---|---|---|
| Être connecté | `IsAuthenticated` | sinon `403` |
| Être participant du voyage | `IsTravelParticipant` (liste) / `ParticipantScopedMixin` (détail, choix, votes) | sinon `403` ou `404` |
| Protection CSRF sur les écritures | `SessionAuthentication` de DRF + header `X-CSRFToken` envoyé par le frontend | une requête forgée par un autre site est refusée |
| Auteur et voyage imposés par le serveur | `perform_create`, champs en lecture seule | impossible d'usurper un auteur ou un voyage |

---

## Frontend : la fonctionnalité dans React

### Organisation des fichiers

Le code suit une organisation **par fonctionnalité** : tout ce qui concerne les idées est dans `src/features/idea/`.

```text
src/features/idea/
├── types.ts           → types TypeScript (format API et format interface)
├── api/
│   ├── api.ideas.ts   → les appels HTTP vers le backend
│   ├── ideaMapper.ts  → conversion API ⇄ interface
│   └── ideaErrors.ts  → traduction des erreurs du backend en français
├── hooks/
│   └── useIdeas.ts    → l'état de la page (liste, chargement, erreurs, actions)
├── components/
│   ├── page/          → bouton « Épingler une idée », filtres par type et par étape
│   ├── card/          → la carte d'une idée (vote, étape, menu d'options…)
│   ├── modal/         → modals « Épingler », « Modifier », « Placer »
│   └── forms/         → formulaires et leurs champs (type, dates, hébergement)
└── utils/             → filtres, validation du formulaire, formats de date, icônes
src/pages/IdeasPage.tsx → la page /travel/:id/ideas qui assemble le tout
```

**Pourquoi cette organisation** : en ouvrant un seul dossier, on trouve tout ce qui concerne une fonctionnalité. Les couches sont séparées (appels réseau, état, affichage) : un composant n'appelle jamais `fetch` directement.

### Les couches, de la plus proche du serveur à la plus proche de l'écran

#### `types.ts` - deux formats de données
- **Ce que c'est** : les types TypeScript d'une idée, **en deux versions** : `IdeaApiResponse` (exactement le JSON reçu) et `Idea` (le format pratique pour les composants).
- **Pourquoi** : le format de l'API est pensé pour la base (types `r`/`l`/`a`/`s`, décimaux en texte, une seule paire de dates), alors que l'interface a besoin de valeurs lisibles et typées.
- **Avantage** : TypeScript signale à la compilation toute utilisation d'un champ qui n'existe pas, ou avec le mauvais type.

#### `ideaMapper.ts` - la conversion API ⇄ interface
- **Rôle** :
  - `r`/`l`/`a`/`s` ⇄ `restaurant`/`accommodation`/`activity`/`sightseeing` ;
  - les décimaux reçus en texte (`"45.7640000"`, `"120.00"`) deviennent des **nombres** ;
  - `startDate`/`endDate` deviennent `date` (une journée) **ou** `arrivalDate`/`departureDate` (un hébergement), et inversement à l'envoi.
- **Avantage** : si le format de l'API change, **un seul fichier** est à modifier. Les composants ne sont pas touchés.

#### `api.ideas.ts` - les appels au backend
- **Rôle** : une fonction par action (`fetchIdeas`, `postIdea`, `patchIdea`, `removeIdea`, `patchIdeaPlacement`, `chooseIdea`, `addIdeaReaction`, `removeIdeaReaction`).
- **Dans le projet** :
  - `credentials: "include"` envoie le **cookie de session** ;
  - chaque écriture (`POST`, `PATCH`, `DELETE`) ajoute le header **`X-CSRFToken`**, lu dans le cookie `csrftoken` ;
  - les réponses passent par `parseResponse` (partagé, `src/shared/api/errors.ts`), qui lit l'enveloppe d'erreur du backend (`{status, code, message, details}`) et en fait un message lisible.

#### `ideaErrors.ts` - des erreurs en français
- **Rôle** : traduit les messages métier du backend (« The idea dates must be within the step dates. »…) en messages compréhensibles pour l'utilisateur.

#### `useIdeas.ts` - l'état de la page
- **Ce que c'est** : un hook React qui charge les idées d'un voyage et expose les actions (`handleCreateIdea`, `handleEditIdea`, `handleDeleteIdea`, `handlePlaceIdea`, `handleChooseIdea`, `handleVote`).
- **Pourquoi** : toute la logique est au même endroit. La page et les composants se contentent d'afficher et d'appeler des fonctions.
- **Avantages** :
  - **Chargement et erreurs gérés** (`isLoading`, `error`) ;
  - **protection contre les réponses en retard** (drapeau `ignore`) : si l'utilisateur change de voyage pendant un chargement, l'ancienne réponse n'écrase pas la nouvelle ;
  - **après un vote**, le compteur est **relu depuis le serveur**, qui reste la source de vérité, même si un autre participant a voté en même temps.
- **Dans le projet** : utilisé par `IdeasPage` et par `ItineraryPage`, qui permet aussi d'épingler une idée depuis l'itinéraire.

#### Les composants
| Dossier | Composants | Rôle |
|---|---|---|
| `page/` | `PinIdeaButton`, `IdeaTypeFilter`, `IdeaStepFilter` | bouton d'ajout (version mobile et bureau), filtres « Type » et « Étape » |
| `card/` | `IdeaCard`, `VoteButton`, `StepButton`, `StepLabel`, `SecondaryInfo`, `IdeaOptionsMenu` | une carte par idée : vote (cœur + compteur), « Placer » / « Voir l'étape », pool ou nom de l'étape, prix ou initiales de l'auteur, menu « Choisir cet hébergement / Modifier / Supprimer » |
| `modal/` | `CreateIdeaModal`, `EditIdeaModal`, `PlaceIdeaModal` | les fenêtres « Épingler une idée », « Modifier l'idée », « Placer l'idée » |
| `forms/` | `CreateIdeaForm`, `PlaceIdeaForm`, `TypeSelector`, `DateField`, `AccommodationFields` | les champs, qui s'adaptent au type choisi (dates et prix pour un hébergement, une date pour le reste) |

Les boutons d'action utilisent `useSubmitAction` (partagé) : le bouton est **désactivé pendant la requête**, ce qui évite les doubles clics (double vote, double création), et l'erreur éventuelle s'affiche sur place.

#### `utils/`
- `filterIdeas.ts` : combine le filtre **Type** et le filtre **Étape** (« toutes », « sans étape », ou une étape précise).
- `validateIdeaForm.ts` : **validation côté client** avant l'envoi (titre obligatoire, dates obligatoires et cohérentes pour un hébergement, date obligatoire si une étape est choisie). Le backend **revalide tout** : le sujet exige une validation **des deux côtés**, et un client ne peut pas contourner les règles en appelant l'API directement.

---

## Utilisation

1. Connecte-toi, ouvre un voyage, puis l'onglet **Idées** (`/travel/{id}/ideas`).
2. **Épingler une idée** : choisis un type, un titre, et éventuellement une étape et une date. Pour un hébergement : les dates d'arrivée et de départ, et le prix par nuit.
3. **Voter** : clique sur le cœur d'une carte. Le compteur augmente ; un deuxième clic retire ton vote.
4. **Placer** : bouton « Placer » → choisis une étape (et une date pour une idée qui n'est pas un hébergement). La carte affiche alors le nom de l'étape.
5. **Choisir un hébergement placé** : menu `…` → « Choisir cet hébergement ».
6. **Modifier / Supprimer** : menu `…` de la carte.
7. **Filtrer** : par type et/ou par étape, en haut de la page.

## Vérifications rapides

| # | Ce que tu fais | Résultat attendu | Ce que ça prouve |
|---|---|---|---|
| 1 | `make test ARGS=idea` | `OK` | Les tests des modèles, serializers et vues des idées et des votes passent |
| 2 | `make check-back` | `All checks passed!` | Le code backend respecte le lint et le formatage |
| 3 | `make lint` et `make format-check-front` | aucune erreur | Le code frontend respecte ESLint et Prettier |
| 4 | Épingler une idée « Lieu à voir » sans étape | La carte apparaît en haut de la liste, dans le pool | `POST` → `201`, ajout à l'état sans recharger la page |
| 5 | Voter, puis revoter sur la même carte | Le compteur passe à 1, puis revient à 0 | `POST` puis `DELETE` sur `/reaction/`, compteur relu depuis le serveur |
| 6 | Épingler un hébergement **sans dates** | Message « Les dates d'arrivée et de départ sont obligatoires. », rien n'est envoyé | Validation côté client |
| 7 | Placer une idée sur une étape avec une date **hors de l'étape** | Message en français : « Les dates de l'idée doivent être comprises dans les dates de l'étape sélectionnée. » | Validation côté backend (`400`) traduite par `ideaErrors.ts` |
| 8 | Placer un hébergement, puis menu `…` → « Choisir cet hébergement » | L'hébergement est marqué comme choisi | `POST /choice/` → `200`, statut `chosen` |
| 9 | Connecté, ouvrir `http://localhost:8080/api/travels/{id}/ideas/` dans le navigateur | La page de l'API navigable de DRF affiche la liste en JSON camelCase, avec `voteCount` et `voted` | Le backend répond directement, sans le frontend |

#
#

# Module : API publique (Major, 2 points)

## Présentation

Le sujet demande :

> *Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints: GET, POST, PUT, DELETE.*

Ce module permet à **un programme extérieur** (un script, Postman, une autre application) d'utiliser les données de Transcendence (**voyages**, **étapes** et **idées**) **sans passer par le navigateur**, grâce à une **clé API**.

| Exigence du sujet | Ce qui est en place |
|---|---|
| Interagir avec la base de données | 18 opérations sur les voyages, les étapes et les idées |
| Clé API sécurisée | `POST /api/auth/token/` donne une clé, envoyée ensuite dans `Authorization: Token <clé>` |
| Rate limiting | 100 requêtes/minute par utilisateur sur l'API, 5 tentatives/minute par IP sur la route de la clé |
| Documentation | `/api/docs/` (Swagger) et `/api/schema/` (OpenAPI 3), en accès libre |
| Au moins 5 endpoints GET, POST, PUT, DELETE | 7 URL, 18 opérations, les 4 verbes |

**Le choix d'implémentation** : Les routes existantes, déjà utilisées par le frontend, **acceptent aussi la clé API**, et ce **vue par vue** : seules les vues choisies comme publiques l'acceptent, toutes les autres (profil, amis, mot de passe…) restent réservées au site. La documentation, elle, n'est pas protégée et ne décrit **que** ces routes publiques.

## Périmètre de ma contribution

Le module entier : clé API, accès par vue, rate limiting, documentation et tests.

## Architecture : le parcours d'une requête

```mermaid
flowchart LR
    client["Client externe<br/>(script, Postman…)"] -->|"Authorization: Token &lt;clé&gt;"| nginx["Nginx"]
    nginx --> auth["1. Authentification<br/>Session, puis Token"]
    auth --> perm["2. Permissions<br/>participant du voyage ?"]
    perm --> throttle["3. Rate limiting<br/>compteur dans Redis"]
    throttle --> view["4. Vue<br/>(lecture / écriture)"]
    view --> db[("PostgreSQL")]
```

Django REST Framework fait ces vérifications **dans cet ordre**, pour chaque requête. Un client sans clé valide est arrêté à l'étape 1 ou 2 (`403`), un client qui dépasse sa limite à l'étape 3 (`429`). La vue n'est exécutée que si tout est passé.

---

## Les éléments du module

### 1. La clé API : `rest_framework.authtoken` et `POST /api/auth/token/`

- **Ce que c'est** : l'app `rest_framework.authtoken` fournie avec DRF (une table `authtoken_token` : **une clé par utilisateur**, 40 caractères aléatoires générés avec `secrets`), et une vue `ApiTokenView` qui échange **username + mot de passe** contre cette clé.
- **Pourquoi** : le site utilise une **session** (un cookie que le navigateur envoie tout seul, protégé par CSRF). Un programme extérieur n'a pas de navigateur : il lui faut un identifiant qu'il **ajoute lui-même** dans un header. Comme un autre site ne peut pas ajouter ce header à la place de l'utilisateur, il n'y a pas d'attaque CSRF possible avec la clé.
- **Avantages** :
  - fourni par DRF, donc rien à réinventer ;
  - une clé impossible à deviner, révocable depuis l'admin Django ;
  - **les mêmes droits que sur le site** : la clé identifie l'utilisateur, et ce sont ensuite les permissions habituelles qui s'appliquent.
- **Dans le projet** (`traveler/views.py`, `traveler/urls.py`) :
  - `authentication_classes = []` : la route n'utilise pas de session, l'identité est prouvée par le mot de passe envoyé dans le body ;
  - `permission_classes = [AllowAny]` : il faut pouvoir l'appeler sans être connecté ;
  - le body est validé par le `LoginSerializer` existant, et le mot de passe vérifié par `authenticate()` de Django ;
  - `Token.objects.get_or_create(...)` : la clé est créée au premier appel, puis **la même** est renvoyée ;
  - réponses : `200 {"token": "…"}`, `401` « Identifiants invalides. », `400` si un champ manque, `429` après 5 essais par minute.
- **Pourquoi une vue à nous plutôt que `obtain_auth_token` de DRF** : la vue fournie par DRF répond `400` au lieu du `401` du projet, contourne le format camelCase, et **n'a aucun rate limiting** (le brute-force du mot de passe serait possible).

### 2. L'accès par vue : `PublicApiMixin`

- **Ce que c'est** : un mixin (`common/mixins.py`), c'est-à-dire une petite classe qu'on ajoute aux vues publiques pour leur donner trois choses d'un coup :
  ```python
  authentication_classes = [SessionAuthentication, TokenAuthentication]  # session OU clé
  throttle_classes = [ScopedRateThrottle]                                 # rate limiting
  throttle_scope = "public_api"
  public_api = True                                                       # affichée dans la doc
  ```
- **Pourquoi** : le réglage global de DRF ne contient **que** `SessionAuthentication`. Mettre `TokenAuthentication` en global ouvrirait **toutes** les routes à la clé. Avec le mixin, on choisit **précisément** les vues publiques.
- **Avantages** :
  - **une seule source de vérité** : tout ce qui définit une vue publique est écrit à un seul endroit ;
  - **lisible** : `class TravelListView(PublicApiMixin, …)` montre tout de suite qu'une vue est publique ;
  - **rien ne change pour le frontend**, qui continue d'utiliser la session.
- **Dans le projet** : appliqué à **6 vues** : `TravelListView`, `TravelDetailView`, `StepListView`, `StepDetailView`, `IdeaListView`, `IdeaDetailView`.
  - **L'ordre compte** : `SessionAuthentication` reste **en premier**. Sinon, DRF répondrait `401` au lieu de `403` aux requêtes non authentifiées, et le comportement existant (et ses tests) changerait.
  - Le mixin est placé **en premier** dans les classes parentes, pour que ses attributs remplacent ceux des vues génériques.
- **Vues volontairement non publiques** : rejoindre / quitter un voyage, choisir un hébergement, voter. Ce sont des **actions** liées au parcours du site, pas des ressources.

### 3. Le rate limiting : `ScopedRateThrottle` + Redis

- **Ce que c'est** : une limite au nombre de requêtes qu'un client peut faire par minute. Au-delà, DRF répond **`429 Too Many Requests`** avec un header **`Retry-After`** (le nombre de secondes à attendre), sans exécuter la vue.
- **Pourquoi** : une API ouverte à des programmes doit se protéger contre le **brute-force** du mot de passe et contre les **abus** (un script en boucle qui surcharge le serveur).
- **Avantages** : des limites **par groupe de vues** (« scope »), sans toucher au reste du site ; une **fenêtre glissante** (au plus N requêtes sur **n'importe quelle** période de 60 secondes).
- **Dans le projet** (`config/settings.py`) :

  | Scope | Limite | Compté par | Appliqué à |
  |---|---|---|---|
  | `public_api` | 100 / minute | utilisateur (id) | les 6 vues publiques, compteur partagé |
  | `auth_token` | 5 / minute | adresse IP | `POST /api/auth/token/` |

  - **Les compteurs sont dans Redis** (base n°1, séparée de la base n°0 de Channels) via le cache Django. Ils sont **partagés par tous les processus** du backend, et expirent tout seuls.
  - **`NUM_PROXIES: 1`** : la requête passe par Nginx, donc DRF lit l'IP du client dans `X-Forwarded-For`. Sans ce réglage, un client pourrait envoyer un faux `X-Forwarded-For` et obtenir un nouveau compteur à chaque requête. Avec lui, DRF ne lit **que** la dernière adresse, celle ajoutée par Nginx.
  - 100 / minute laisse une large marge au frontend, qui utilise les mêmes vues ; 5 / minute suffit pour obtenir sa clé (elle est permanente), mais rend le brute-force irréaliste.

### 4. La documentation : drf-spectacular, Swagger et OpenAPI

- **Ce que c'est** : **drf-spectacular** lit le code (URLs, vues, serializers, authentification) et **génère automatiquement** un schéma **OpenAPI 3**, le format standard pour décrire une API. **Swagger UI** est la page web qui affiche ce schéma et permet d'**essayer les routes** directement depuis le navigateur.
- **Pourquoi** : un client extérieur n'a pas accès au code. La doc lui dit quelles routes existent, quels champs envoyer et recevoir, comment s'authentifier et quelles limites s'appliquent. drf-spectacular est l'outil recommandé par la doc de DRF (la génération de schéma intégrée à DRF est dépréciée).
- **Avantages** : la doc est **toujours synchronisée** avec le code (elle est régénérée à chaque chargement) ; le bouton **Authorize** permet de tester avec sa clé ; le schéma peut être importé dans Postman ou servir à générer un client.
- **Dans le projet** :

  | Élément | Où | Rôle |
  |---|---|---|
  | `/api/schema/` et `/api/docs/` | `config/urls.py` | le schéma (YAML, ou JSON avec `?format=json`) et la page Swagger, **sans authentification** |
  | Titre, description, version | `SPECTACULAR_SETTINGS` | l'introduction de la doc : comment obtenir et envoyer la clé, limites, format, erreurs |
  | Hook `public_endpoints_only` | `common/schema.py` | ne garde **que** les vues `public_api = True` : aucune route privée dans la doc |
  | Hook `camelize_serializer_fields` | `SPECTACULAR_SETTINGS` | affiche les champs en camelCase (`startDate`), comme dans les vraies réponses |
  | `extend_schema_view` (résumé, description) | `travel/schema.py`, `idea/schema.py`, `traveler/schema.py` | un texte écrit pour le client sur chaque opération ; le DELETE précise s'il est doux (étape) ou définitif (idée) |
  | `@extend_schema(tags=[...])` | les vues | 4 sections dans Swagger : `Auth`, `Travels`, `Steps`, `Ideas` |
  | Annotations `-> int`, `-> bool`… | `travel/serializers.py`, `idea/serializers.py` | les bons types pour les champs calculés (`nights`, `voteCount`…) |

  Résultat : `python manage.py spectacular` génère le schéma **sans aucune erreur ni aucun avertissement**.

### 5. Les tests

- **Pourquoi** : rejouer automatiquement, à chaque `make test`, les vérifications faites à la main, et détecter tout de suite une régression (par exemple un coéquipier qui retire le mixin d'une vue, ou qui inverse l'ordre des authentifications).
- **Dans le projet** :

  | Classe | Fichier | Tests |
  |---|---|---|
  | `ApiTokenViewTest` | `traveler/tests.py` | **obtenir** la clé avec les bons identifiants ; **aucune clé** avec un mauvais mot de passe |
  | `PublicApiKeyTest` | `common/tests.py` | la clé ouvre **les 6 vues publiques** ; une **fausse clé** est refusée ; la clé n'ouvre **pas** une vue privée ; elle ne donne **pas accès** au voyage d'un autre |

  `PublicApiKeyTest` est dans `common/` parce qu'il protège le `PublicApiMixin`, partagé par les apps `travel` et `idea`. Chaque test commence par `cache.clear()`, pour que les compteurs du rate limiting stockés dans Redis ne faussent pas le test suivant.

---

## Les routes publiques

| Méthode | Route | Succès | Remarque |
|---|---|---|---|
| `POST` | `/api/auth/token/` | `200` | obtenir sa clé (sans authentification) |
| `GET` / `POST` | `/api/travels/` | `200` / `201` | mes voyages / créer un voyage |
| `GET` / `PUT` / `PATCH` | `/api/travels/{id}/` | `200` | pas de `DELETE` sur un voyage : on le quitte |
| `GET` / `POST` | `/api/travels/{travel_id}/steps/` | `200` / `201` | |
| `GET` / `PUT` / `PATCH` / `DELETE` | `/api/travels/{travel_id}/steps/{id}/` | `200` / `204` | `DELETE` = suppression **douce** (corbeille) |
| `GET` / `POST` | `/api/travels/{travel_id}/ideas/` | `200` / `201` | |
| `GET` / `PUT` / `PATCH` / `DELETE` | `/api/travels/{travel_id}/ideas/{id}/` | `200` / `204` | `DELETE` = suppression **définitive** |

Erreurs communes : `400` données invalides, `403` non authentifié ou accès refusé, `404` introuvable (ou voyage d'un autre utilisateur), `429` trop de requêtes. Les erreurs suivent le format du projet : `{status, code, message, details}`.

## Les fichiers du module

| Fichier | Ajout |
|---|---|
| `requirements.txt` | `drf-spectacular`, `redis` |
| `config/settings.py` | `rest_framework.authtoken` et `drf_spectacular` dans `INSTALLED_APPS`, `CACHES` (Redis base 1), `DEFAULT_THROTTLE_RATES`, `NUM_PROXIES`, `DEFAULT_SCHEMA_CLASS`, `SPECTACULAR_SETTINGS` |
| `config/urls.py` | `/api/schema/` et `/api/docs/` |
| `common/mixins.py` | `PublicApiMixin` |
| `common/schema.py` | hook `public_endpoints_only` |
| `traveler/views.py`, `traveler/urls.py`, `traveler/schema.py` | `ApiTokenView`, la route `auth/token/` et sa doc |
| `travel/views.py`, `idea/views.py` | le mixin et les tags sur les 6 vues publiques |
| `travel/schema.py`, `idea/schema.py` | résumés et descriptions des opérations |
| `travel/serializers.py`, `idea/serializers.py` | annotations de type des champs calculés |
| `traveler/tests.py`, `common/tests.py` | `ApiTokenViewTest`, `PublicApiKeyTest` |

---

## Utilisation

### Depuis un terminal (un client externe)

```bash
# 1. Obtenir sa clé
curl -X POST http://localhost:8080/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "<username>", "password": "<password>"}'
# → {"token":"9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"}

# 2. L'utiliser
curl http://localhost:8080/api/travels/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"

# 3. Écrire (pas de CSRF nécessaire avec la clé)
curl -X POST http://localhost:8080/api/travels/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -H "Content-Type: application/json" \
  -d '{"title": "Voyage API", "startDate": "2026-11-01", "endDate": "2026-11-10"}'
```

> ⚠️ Le header doit contenir **le mot `Token`, un espace, puis la clé**. Sans le mot `Token`, la clé est ignorée et la requête est refusée (`403`).

### Depuis Swagger

1. Ouvre **http://localhost:8080/api/docs/**, de préférence dans une **fenêtre privée** (sinon le cookie de session du site est envoyé, et ce n'est plus la clé qui est testée).
2. Section **Auth** → `POST /api/auth/token/` → **Try it out** → saisis ton username et ton mot de passe → **Execute** → copie la clé.
3. Bouton **Authorize** → champ **`tokenAuth`** → saisis `Token <clé>` → **Authorize**.
4. Toutes les routes sont maintenant utilisables avec **Try it out**.

## Vérifications rapides

| # | Commande / action | Résultat attendu | Ce que ça prouve |
|---|---|---|---|
| 1 | `make test ARGS="traveler.tests.ApiTokenViewTest common.tests.PublicApiKeyTest"` | `Ran 6 tests … OK` | Obtention et utilisation de la clé, testées automatiquement |
| 2 | `curl -X POST …/api/auth/token/` (bons identifiants) | `200` et `{"token": "…"}` | La clé s'obtient sans session ni CSRF |
| 3 | `curl …/api/travels/ -H "Authorization: Token <clé>"` | `200` et la liste des voyages | La clé ouvre l'API publique |
| 4 | `curl -i …/api/travels/` (sans clé) | `403` | Sans authentification, l'accès est refusé |
| 5 | `curl -i …/api/travels/ -H "Authorization: Token fausse-cle"` | `403`, `"Invalid token."` | Une fausse clé est refusée |
| 6 | 6 × `POST /api/auth/token/` avec un mauvais mot de passe | 5 × `401`, puis `429` avec `Retry-After` | Protection contre le brute-force |
| 7 | `docker compose exec redis redis-cli -n 1 FLUSHDB`, puis 101 × `GET /api/travels/` avec la clé | 100 × `200`, puis `429` | Rate limiting de l'API (compteurs dans Redis) |
| 8 | Ouvrir http://localhost:8080/api/docs/ en fenêtre privée | La page Swagger s'affiche, avec 4 sections : `Auth`, `Ideas`, `Steps`, `Travels` | La doc est publique et ne montre que l'API publique |
| 9 | `docker compose exec backend python manage.py spectacular --file /tmp/schema.yml` | aucune ligne `Warning` ni `Error` | Le schéma est complet et valide |

**La commande pour le test 7** :
```bash
for i in $(seq 1 101); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/travels/ \
    -H "Authorization: Token <clé>"
done | sort | uniq -c
```

**Voir les compteurs : KEYS**
```bash
docker compose exec redis redis-cli -n 1 KEYS '*'
```

**Voir le temps restant : TTL**
```bash
docker compose exec redis redis-cli -n 1 TTL ':1:throttle_public_api_1'
```

**Après le test remet les compteurs à zéro**
```bash
docker compose exec redis redis-cli -n 1 FLUSHDB
```

---

### Ressources
- https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication
- https://www.django-rest-framework.org/api-guide/throttling/
- https://drf-spectacular.readthedocs.io/en/latest/customization.html
- https://swagger.io/docs/specification/v3_0/authentication/api-keys/

## Choix techniques et limites connues

- **Clés stockées en clair, sans expiration** : c'est le fonctionnement de `rest_framework.authtoken`. Une clé se révoque en la supprimant dans l'admin (une nouvelle sera générée au prochain appel). Une amélioration possible serait `django-rest-knox` (clés hachées en SHA-512, expiration), au prix d'un changement de comportement : une nouvelle clé à chaque appel, montrée une seule fois.
- **`403` plutôt que `401`** pour une requête non authentifiée : on conserve le comportement existant du projet (et de ses tests), parce que `SessionAuthentication` est la première méthode d'authentification. Le message du body (`not_authenticated`, `Invalid token.`) reste explicite.
- **Compteurs partagés** : le front et l'API d'un même utilisateur partagent le compteur `public_api` ; des clients derrière une même IP (réseau d'école, d'entreprise) partagent le compteur `auth_token`.
- **`NUM_PROXIES` dépend de l'infrastructure** : à passer à `2` si un autre proxy est ajouté devant Nginx.
- **Swagger UI est chargé depuis un CDN** : le navigateur a besoin d'Internet pour afficher `/api/docs/` (le schéma `/api/schema/`, lui, est servi par le backend).
- **HTTP en développement** : le projet tourne actuellement en HTTP sur le port 8080. En HTTP, la clé circule en clair : HTTPS (exigé par le sujet pour toute connexion au backend, y compris depuis un script) doit être en place pour l'évaluation.


#
#

# Module : Authentification OAuth 2.0 avec Google (Minor, 1 point)

## Présentation

Le sujet demande :

> *Minor: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).*

Ce module permet de **se connecter avec son compte Google**, sans mot de passe sur Transcendence. L'utilisateur clique sur « Continuer avec Google », se connecte **chez Google** (le site ne voit jamais son mot de passe Google), puis revient **connecté** sur son profil.

| Exigence du sujet | Ce qui est en place |
|---|---|
| Authentification distante | L'utilisateur se connecte **chez Google** ; le backend reçoit ensuite son identité, **vérifiée** |
| OAuth 2.0 | Flux **Authorization Code** côté serveur, avec **OpenID Connect** (`id_token` signé par Google) |
| Un fournisseur | **Google** |
| Lié à la gestion des utilisateurs | Un compte `Traveler` est **créé** à la 1re connexion, puis **retrouvé** aux suivantes |

**Le choix d'implémentation** : la connexion classique du projet utilise les **sessions Django** (cookie `sessionid`). La connexion Google **finit au même endroit** : `login(request, traveler)`, exactement comme `LoginView`. Le frontend, `/api/auth/me/` et les permissions ne voient **aucune différence** entre un utilisateur Google et un utilisateur classique.

Le travail est partagé en deux :

| Partie | Qui s'en occupe | Contenu |
|---|---|---|
| **Le protocole OAuth** | la bibliothèque **Authlib** | `state`, `nonce`, échange du code, vérification de l'`id_token` |
| **Les règles de l'application** | **notre code** | email vérifié, retrouver ou créer le compte, refuser un compte classique, ouvrir la session |

## Périmètre de ma contribution

Le module entier : l'application déclarée chez Google, le client Authlib, les deux vues, les règles de compte, le bouton et les messages d'erreur du frontend (3 langues), et les tests.

## Architecture : le parcours d'une connexion Google

Une connexion Google, ce sont **2 allers-retours** : le navigateur part chez Google, puis Google le renvoie chez nous avec un **code**, que le backend échange **directement** avec Google.

**① Le départ : `GoogleLoginView` (`GET /api/auth/google/`)**

1. **L'utilisateur clique sur « Continuer avec Google ».** Le frontend fait une vraie navigation vers le backend : `window.location.href = "/api/auth/google/"` (`login.tsx`).
2. **Authlib prépare la connexion.** Il génère un `state` (protection CSRF) et un `nonce` (protection contre le rejeu de l'`id_token`), puis les garde dans la **session Django**, avec une expiration d'1 heure.
3. **Le backend redirige vers Google** (`302`) avec `client_id`, `redirect_uri`, `response_type=code`, `scope=openid email profile`, `state` et `nonce`.

**② Chez Google**

4. **L'utilisateur se connecte sur le site de Google** et accepte de partager son nom et son email. Transcendence ne voit jamais son mot de passe Google.
5. **Google renvoie le navigateur vers notre adresse de retour**, et uniquement vers celle déclarée dans la console : `/api/auth/google/callback/?state=…&code=…`. Le `code` est temporaire et à usage unique.

**③ Le retour, partie Authlib : `GoogleCallbackView` (`authorize_access_token`)**

6. **Vérification du `state`** : il doit exister dans la session, puis il est supprimé (usage unique). Sinon : refus.
7. **Échange du `code`, de serveur à serveur** : le backend envoie à Google le `code`, le `client_id` et le **`client_secret`**. Le navigateur ne participe pas, et le secret ne quitte jamais le backend.
8. **Google renvoie un `access_token` et un `id_token`**, un JWT signé par Google qui contient l'identité de l'utilisateur.
9. **Vérification de l'`id_token`** :
   - sa **signature**, avec les clés publiques de Google ;
   - `iss` : il vient bien de Google ;
   - `aud` : il est fait pour **notre** application ;
   - `exp` : il n'est pas expiré ;
   - `nonce` : c'est celui de l'étape 2.

   Si une seule vérification échoue : refus.

**④ Le compte et la session, notre code : suite de `GoogleCallbackView`**

10. **Email vérifié ?** `email_verified` doit valoir `true`. Sinon : refus.
11. **Retrouver ou créer le compte** :
    - aucun `Traveler` avec cet email → on le crée, **sans mot de passe** ;
    - un compte créé par Google (sans mot de passe) → on le reprend ;
    - un compte classique (avec mot de passe) → refus (`google_email_exists`).
12. **Ouverture de la session** : `login(request, traveler)`, comme pour la connexion classique. Django pose le cookie `sessionid`.
13. **Redirection vers `/profile`.** React appelle `/api/auth/me/` avec le cookie, et voit l'utilisateur connecté.

À chaque refus (étapes 6, 7, 9, 10 et 11), l'utilisateur est renvoyé vers `/login?error=google` ou `/login?error=google_email_exists`, et la raison est écrite dans les logs du backend.

### Les protections

| Risque | Protection | Assurée par | Vérifiée par |
|---|---|---|---|
| Un autre site fait arriver dans notre navigateur un `code` qui n'est pas le nôtre (CSRF de connexion) | `state` aléatoire, gardé en session, comparé au retour | Authlib | `test_oauth_error_is_refused`, vérifications 3 et 6 |
| Rouvrir une ancienne URL de retour (rejeu) | `state` **supprimé** dès son 1er usage, et expiré après 1 h | Authlib | vérification 6 |
| Voler le `code` dans l'URL | le `code` ne s'échange qu'avec le `client_secret`, de serveur à serveur | Google + `.env` | |
| Envoyer le `code` vers un autre site | Google ne redirige que vers l'adresse **déclarée** dans la console | Google | |
| Un faux `id_token`, ou un token émis pour une autre application | signature vérifiée avec les clés de Google, `iss`, `aud`, `exp` | Authlib | `test_invalid_id_token_is_refused` |
| Rejouer un `id_token` volé | `nonce` de la session, qui doit se retrouver dans l'`id_token` | Authlib | vérifications 2 et 3 |
| Un email que Google n'a pas vérifié | `email_verified` obligatoire | notre code | `test_unverified_email_is_refused` |
| Pré-créer un compte classique avec l'email de la victime (élément 5) | Google n'ouvre **jamais** un compte qui a un mot de passe | notre code | `test_password_account_is_refused`, vérification 7 |

---

## Les éléments du module

### 1. L'application déclarée chez Google

- **Ce que c'est** : un client OAuth de type **« Web application »**, créé dans la **Google Cloud Console** (*Google Auth Platform*). Google fournit un **Client ID** (public, il apparaît dans l'URL) et un **Client secret** (privé).
- **Pourquoi** : Google ne parle qu'aux applications qu'il connaît, et ne renvoie l'utilisateur **que** vers les adresses de retour déclarées. Un attaquant ne peut donc pas détourner le `code` vers son propre site.
- **Dans le projet** :
  - **Authorized redirect URI** : `http://localhost:8080/api/auth/google/callback/` (exactement, **avec le `/` final**). Google n'accepte `http://` que pour `localhost` ;
  - **Audience → External**, en mode **Testing**. Comme l'application ne demande que les scopes de base (`openid email profile`), Google n'impose pas la liste **Test users** : n'importe quel compte Google (Gmail, autre adresse, Google Workspace) peut se connecter, sans validation de l'application par Google ;
  - les identifiants sont dans le **`.env`** (jamais commité), lus par `config/settings.py` :

  | Variable | Contenu |
  |---|---|
  | `GOOGLE_CLIENT_ID` | le Client ID (`….apps.googleusercontent.com`) |
  | `GOOGLE_CLIENT_SECRET` | le Client secret |
  | `GOOGLE_REDIRECT_URI` | `http://localhost:8080/api/auth/google/callback/` |

### 2. Le client OAuth : Authlib

- **Ce que c'est** : **Authlib** implémente OAuth 2.0 et OpenID Connect. Son module `authlib.integrations.django_client` est fait pour Django : il garde ses données dans **`request.session`** et renvoie des réponses Django.
- **Pourquoi** : c'est une bibliothèque **client**. Elle gère le protocole, puis nous rend l'identité vérifiée : nos comptes, notre session et nos règles restent les nôtres.
- **Avantages** :
  - elle fait correctement la partie difficile : **vérifier l'`id_token`** avec les clés publiques de Google ;
  - pas de table, pas de migration, pas de page imposée ;
  - **aucune adresse Google écrite en dur** : elles sont lues dans la configuration publiée par Google.
- **Pourquoi pas django-allauth** : allauth est un **système de comptes complet** (inscription, connexion, vérification d'email, comptes sociaux, avec ses propres tables). Il aurait fait doublon avec `Traveler`, `LoginView` et l'inscription existante, pour un seul fournisseur.
- **Dans le projet** (`traveler/views.py`) : le client est déclaré **une seule fois**, au chargement du module, et partagé par les deux vues.
  ```python
  oauth = OAuth()
  oauth.register(
      "google",
      client_id=settings.GOOGLE_CLIENT_ID,
      client_secret=settings.GOOGLE_CLIENT_SECRET,
      server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
      client_kwargs={"scope": "openid email profile"},
  )
  ```

  | Paramètre | Rôle |
  |---|---|
  | `client_id`, `client_secret` | nos identifiants, lus dans `settings` |
  | `server_metadata_url` | le document public où Google liste ses adresses : `authorization_endpoint` (page de connexion), `token_endpoint` (échange du code), `jwks_uri` (clés publiques), `issuer`. Authlib le lit au 1er usage |
  | `scope` | `openid` (identité et `id_token`), `email`, `profile` (prénom, nom). Rien de plus |

  `requests` reste dans `requirements.txt` : Authlib s'en sert pour parler à Google, mais ne l'installe pas lui-même.

### 3. Le départ : `GoogleLoginView`

- **Ce que c'est** : la vue qui envoie le navigateur vers la page de connexion Google.
  ```python
  return oauth.google.authorize_redirect(
      request,
      settings.GOOGLE_REDIRECT_URI,
      prompt="select_account",
  )
  ```
- **Ce que fait `authorize_redirect`** :

  | # | Action | Pourquoi |
  |---|---|---|
  | 1 | Génère un **`state`** aléatoire | Protection CSRF : au retour, Google doit renvoyer exactement le même |
  | 2 | Génère un **`nonce`** aléatoire (car le scope contient `openid`) | Google le recopie dans l'`id_token` : un `id_token` volé ne peut pas être rejoué |
  | 3 | Garde dans la session, sous la clé `_state_google_<state>`, le `nonce`, le `redirect_uri` et une **expiration d'1 heure** | Pour tout vérifier au retour |
  | 4 | Redirige (`302`) vers Google | L'utilisateur se connecte chez Google |

- **Dans le projet** :
  - `permission_classes = [AllowAny]` : le réglage par défaut du projet est `IsAuthenticated`, alors que l'utilisateur n'est justement pas encore connecté ;
  - `prompt="select_account"` : Google affiche toujours le choix du compte ;
  - avec `SESSION_COOKIE_SAMESITE = "Lax"`, le retour de Google (une navigation `GET`) envoie bien le cookie de session : le `state` est retrouvé.

### 4. Le retour : `GoogleCallbackView`, partie Authlib

- **Ce que c'est** : l'adresse où Google renvoie le navigateur, avec `?state=…&code=…`, ou `?error=access_denied` si l'utilisateur annule.
  ```python
  try:
      token = oauth.google.authorize_access_token(request)
  except (OAuthError, JoseError, requests.RequestException) as error:
      logger.warning("Google OAuth : connexion échouée : %s", error)
      return redirect("/login?error=google")

  userinfo = token["userinfo"]
  ```
- **Ce que fait `authorize_access_token`**, dans l'ordre :

  | # | Vérification | Si elle échoue | Message dans les logs |
  |---|---|---|---|
  | 1 | L'utilisateur n'a pas annulé | `OAuthError` | `access_denied` |
  | 2 | Le `state` reçu existe dans la session (puis il est **supprimé** : usage unique) | `OAuthError` | `mismatching_state: CSRF Warning! …` |
  | 3 | Google accepte le `code` (envoyé avec `client_id` et `client_secret`, dans l'en-tête `Authorization: Basic`) | `OAuthError` | `invalid_grant`, `invalid_client` |
  | 4 | La **signature** de l'`id_token` est valide (clés de Google, gardées en mémoire après le 1er téléchargement) | `JoseError` | `bad_signature` |
  | 5 | Son contenu est correct : `iss` = Google, `aud` = **notre** `client_id`, `exp` non dépassé, `nonce` = celui de la session | `JoseError` | `invalid_claim`, `missing_claim` |
  | | Google injoignable, à n'importe quelle étape | `requests.RequestException` | |

  Si tout passe, `token["userinfo"]` contient le contenu **vérifié** de l'`id_token` : `sub`, `email`, `email_verified`, `given_name`, `family_name`… La liste de ces champs est écrite dans les logs à chaque connexion (`Google UserInfo : champs=[…]`).
- **Pourquoi l'`id_token` et pas l'endpoint `userinfo` de Google** : l'`id_token` contient déjà l'identité, signée par Google. Une fois vérifié, un appel de plus est inutile.
- **Un seul message pour l'utilisateur** : dans tous ces cas, il ne peut que réessayer, donc il est renvoyé vers `/login?error=google`. La vraie raison est dans les logs.

### 5. Le compte : retrouver, créer, connecter (notre code)

```mermaid
flowchart TD
    A["authorize_access_token()"] -->|"erreur OAuth, id_token invalide,<br/>Google injoignable"| KO1["❌ /login?error=google"]
    A -->|"identité vérifiée"| B{"email_verified ?"}
    B -->|"non"| KO1
    B -->|"oui"| C{"Un Traveler a cet email ?"}
    C -->|"non"| NEW["create_user()<br/>sans mot de passe"]
    C -->|"oui, sans mot de passe<br/>(créé par Google)"| LOGIN["login()<br/>cookie sessionid"]
    C -->|"oui, avec mot de passe<br/>(compte classique)"| KO2["❌ /login?error=google_email_exists"]
    NEW --> LOGIN
    LOGIN --> OK["✅ /profile"]

    classDef ok fill:#d9f2e0,stroke:#2e7d32,color:#1b4d20
    classDef ko fill:#fbe0df,stroke:#c62828,color:#7a1612
    class OK ok
    class KO1,KO2 ko
```

| Règle | Pourquoi |
|---|---|
| **`email_verified` obligatoire** | On retrouve le compte par l'email : on n'accepte donc qu'un email que Google a prouvé. Un compte Google peut utiliser une adresse non Gmail, parfois non vérifiée |
| **Recherche par email** (`email__iexact`, sans tenir compte des majuscules) | C'est ce qui permet de **retrouver** à la 2e connexion le compte créé à la 1re, sans doublon |
| **Création sans mot de passe** (`create_user()` sans `password`) | Django enregistre un mot de passe inutilisable (`has_usable_password()` vaut `False`) : ce compte ne s'ouvre **qu'avec Google** |
| **`username` généré** par `generate_username()` | Le modèle exige un username unique : `david.lf@gmail.com` donne `david.lf`, puis `david.lf1`, `david.lf2`… s'il est déjà pris |
| **Prénom et nom** | `given_name` et `family_name` de Google (vides s'ils ne sont pas fournis) |
| **Refus d'un compte avec mot de passe** | Voir ci-dessous |
| **`login(request, traveler)`** | Comme `LoginView` : Django ouvre la session et pose le cookie `sessionid` |

**Pourquoi refuser un compte classique** : l'inscription classique **ne vérifie pas l'email** (le sujet demande seulement email et mot de passe hachés). Si Google se connectait à un compte classique qui a le même email :
1. un attaquant s'inscrit avec **l'email de la victime** et **son propre** mot de passe ;
2. la victime clique sur « Continuer avec Google », arrive dans ce compte et y crée ses voyages ;
3. l'attaquant se connecte avec son mot de passe et voit tout.

Un compte **avec** mot de passe n'est donc jamais ouvert par Google : l'utilisateur est renvoyé vers `/login?error=google_email_exists` et doit utiliser son mot de passe.

Chaque refus écrit une ligne dans les logs : `email non vérifié par Google`, `email déjà utilisé par un compte classique`.

### 6. Le frontend : le bouton et les messages

- **Le bouton** (`src/features/auth/components/login.tsx`), sous « Se connecter » :
  ```tsx
  <Button
    type="button"
    variant="outline"
    onClick={() => {
      window.location.href = "/api/auth/google/";
    }}
  >
    {t("auth.continueWithGoogle")}
  </Button>
  ```

  | Choix | Pourquoi |
  |---|---|
  | `window.location.href`, pas `fetch()` | Le navigateur doit **quitter le site** pour afficher la page de Google |
  | Pas `navigate()` de React Router | Il change de page **dans React** : la requête n'atteindrait jamais Django |
  | `type="button"` | Le bouton est dans le `<form>` de connexion, où un `<button>` soumet le formulaire par défaut |
  | Pas de CSRF ni de token | C'est une simple navigation `GET`, protégée par le `state` |

- **Les messages d'erreur** : le composant lit `?error=…` dans l'URL avec `useSearchParams()`.

  | URL | Clé de traduction | Message (fr) |
  |---|---|---|
  | `/login?error=google` | `auth.errors.googleFailed` | « La connexion avec Google a échoué. Veuillez réessayer. » |
  | `/login?error=google_email_exists` | `auth.errors.googleEmailExists` | « Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe. » |
  | autre code, ou rien | | aucun message |

  - **2 codes seulement** : un message précis n'a de sens que si l'utilisateur peut agir différemment. Pour un compte classique, il doit **changer de méthode** ; dans tous les autres cas, il ne peut que réessayer.
  - `const errorMessage = error ?? googleError;` : **un seul message à la fois**. Une erreur du formulaire classique remplace le message Google.
  - Les 3 clés existent en **français, anglais et espagnol** (`src/i18n/locales/*/common.json`).

### 7. Les tests

- **Pourquoi** : vérifier à chaque `make test` que **notre code** réagit correctement à chaque cas.
- **Comment** : Authlib et Google sont remplacés par des **faux** (`@patch`). Les tests ne dépendent ni d'Internet ni de vrais identifiants, et on vérifie **ce que notre code fait** de la réponse d'Authlib, pas Authlib lui-même (il a ses propres tests).
- **Dans le projet** (`traveler/tests.py`) :

  | Test | Ce qu'on simule | Ce qu'on vérifie |
  |---|---|---|
  | `GoogleLoginViewTest.test_redirects_to_google` | la configuration de Google | `302` vers `accounts.google.com`, avec `redirect_uri`, `response_type=code`, `scope`, `prompt`, un `state` et un `nonce` |
  | `test_oauth_error_is_refused` | Authlib lève `OAuthError` (`state` invalide, annulation…) | `/login?error=google`, personne n'est connecté |
  | `test_invalid_id_token_is_refused` | Authlib lève `BadSignatureError` | `/login?error=google`, personne n'est connecté |
  | `test_google_unreachable` | Authlib lève `ConnectionError` | `/login?error=google` |
  | `test_creates_traveler_and_logs_in` | une identité Google vérifiée | compte créé (`david.lf`, prénom, nom), **sans mot de passe**, session ouverte, `/profile` |
  | `test_existing_traveler_is_reused` | 2 connexions avec le même compte Google | **un seul** compte en base |
  | `test_username_already_taken` | le username `david.lf` est déjà pris | le compte reçoit `david.lf1` |
  | `test_unverified_email_is_refused` | `email_verified` vaut `False` | `/login?error=google`, **aucun** compte créé |
  | `test_password_account_is_refused` | un compte classique a déjà cet email | `/login?error=google_email_exists`, personne n'est connecté |

  Sauf le premier, tous ces tests sont dans `GoogleCallbackViewTest`.

---

## Les routes

| Méthode | Route | Résultat | Quand |
|---|---|---|---|
| `GET` | `/api/auth/google/` | `302` vers Google | toujours : démarre la connexion |
| `GET` | `/api/auth/google/callback/` | `302` vers `/profile` | succès : compte retrouvé ou créé, session ouverte |
| | | `302` vers `/login?error=google` | annulation, `state` invalide, code refusé, `id_token` invalide, Google injoignable, email non vérifié |
| | | `302` vers `/login?error=google_email_exists` | l'email appartient à un compte classique |

Ce sont des routes de **navigation** (le navigateur les ouvre et suit les redirections), pas des routes d'API qui renvoient du JSON. Elles ne font pas partie de l'API publique et n'apparaissent pas dans `/api/docs/`.

## Les fichiers du module

| Fichier | Ajout |
|---|---|
| `.env.example`, `.env` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| `requirements.txt` | `requests`, `Authlib` |
| `config/settings.py` | lecture des 3 variables `GOOGLE_...` |
| `traveler/views.py` | le client `oauth` (Authlib), `GoogleLoginView`, `GoogleCallbackView`, `generate_username()` |
| `traveler/urls.py` | les routes `auth/google/` et `auth/google/callback/` |
| `traveler/tests.py` | `GoogleLoginViewTest`, `GoogleCallbackViewTest` |
| `src/features/auth/components/login.tsx` | le bouton « Continuer avec Google » et l'affichage des erreurs `?error=…` |
| `src/i18n/locales/{fr,en,es}/common.json` | `auth.continueWithGoogle`, `auth.errors.googleFailed`, `auth.errors.googleEmailExists` |

---

## Utilisation

1. Remplis les 3 variables `GOOGLE_...` du `.env` (voir l'élément 1), puis lance `make down && make start` : le `.env` n'est relu qu'à la **création** des conteneurs.
2. Ouvre **http://localhost:8080/login** et clique sur **« Continuer avec Google »**.
3. Choisis ton compte : tu arrives sur ton **profil**, connecté.

> ⚠️ Pour tester, utilise une **fenêtre de navigation privée**. Si tu es déjà connecté, `GuestRoute` te renvoie hors de `/login`, et un refus de Google te laisse **dans la session déjà ouverte** : tu pourrais croire que la connexion Google a réussi.

## Vérifications rapides

Avant de commencer, ouvre les logs dans un second terminal. Le filtre masque les appels du healthcheck Docker :
```bash
docker compose logs -f backend | grep -v '"GET /api/ HTTP'
```

| # | Commande / action | Résultat attendu | Ce que ça prouve |
|---|---|---|---|
| 1 | `make test ARGS="-v 2 traveler.tests.GoogleLoginViewTest traveler.tests.GoogleCallbackViewTest"` | les 9 tests de l'élément 7, chacun suivi de `... ok`, puis `Ran 9 tests … OK` | Toutes les règles du module, testées automatiquement |
| 2 | `curl -s -o /dev/null -w '%{redirect_url}\n' http://localhost:8080/api/auth/google/` | une URL `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=…&redirect_uri=…&scope=openid+email+profile&state=…&prompt=select_account&nonce=…` | Ce que le backend envoie à Google : on demande un **code**, avec un `state` et un `nonce` |
| 3 | Fenêtre privée → `http://localhost:8080/api/auth/google/` **sans choisir de compte**, puis la commande **« Voir le state »** ci-dessous | `{'_state_google_…': {'data': {'redirect_uri': '…', 'nonce': '…', 'url': '…'}, 'exp': …}}` | Le `state` (dans le nom de la clé), le `nonce` et l'expiration sont gardés dans la session Django |
| 4 | Fenêtre privée → `/login` → **« Continuer avec Google »** → choisir son compte | arrivée sur `/profile`, connecté ; dans les logs, **une seule** ligne, par exemple : `Google UserInfo : champs=['iss', 'azp', 'aud', 'sub', 'email', 'email_verified', 'at_hash', 'nonce', 'name', 'picture', 'given_name', 'family_name', 'iat', 'exp']` | Le flux complet fonctionne avec le vrai Google. La ligne montre le contenu de l'`id_token` vérifié : `iss`, `aud` et `nonce` sont bien dedans |
| 5 | La commande **« Voir le compte »** ci-dessous | par exemple `david.lf david.lf@gmail.com David Lf False` | Le compte a été créé à partir de l'identité Google, **sans mot de passe** (`False`) |
| 6 | Rouvrir une ancienne URL `…/api/auth/google/callback/?state=…&code=…` (historique du navigateur) | `/login` avec « La connexion avec Google a échoué » ; log `connexion échouée : mismatching_state: CSRF Warning! …` | Le `state` ne sert qu'**une fois** : un retour ne peut pas être rejoué |
| 7 | Commande **« Simuler un compte classique »**, se reconnecter avec Google, puis commande **« Remettre le compte »** | `/login` avec « Un compte existe déjà avec cet email… » ; log `email déjà utilisé par un compte classique`. Après la 2e commande, la connexion Google refonctionne | Google n'ouvre **jamais** un compte qui a un mot de passe (élément 5) |
| 8 | Ouvrir `/login?error=google`, puis `/login?error=google_email_exists`, en changeant de langue | les 2 messages de l'élément 6, en français, anglais et espagnol | L'affichage des erreurs côté frontend |
| 9 | `make check-back`, `make lint` et `make format-check-front` | aucune erreur | Le code respecte le lint et le formatage |

Dans les commandes suivantes, remplace `david.lf@gmail.com` par l'email de ton compte Google.

**Voir le state** (test 3) : le contenu de la dernière session.
```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; s = Session.objects.order_by('-expire_date').first(); print(s.get_decoded())"
```

**Voir le compte** (test 5) : username, email, prénom, nom, et « a-t-il un mot de passe ? ».
```bash
docker compose exec backend python manage.py shell -c "from traveler.models import Traveler; t = Traveler.objects.get(email='david.lf@gmail.com'); print(t.username, t.email, t.first_name, t.last_name, t.has_usable_password())"
```

**Simuler un compte classique** (test 7) : donner un mot de passe au compte Google. La commande affiche `True`.
```bash
docker compose exec backend python manage.py shell -c "from traveler.models import Traveler; t = Traveler.objects.get(email='david.lf@gmail.com'); t.set_password('Test12345!'); t.save(); print(t.has_usable_password())"
```

**Remettre le compte** (test 7, **à ne pas oublier**) : retirer le mot de passe. La commande affiche `False`.
```bash
docker compose exec backend python manage.py shell -c "from traveler.models import Traveler; t = Traveler.objects.get(email='david.lf@gmail.com'); t.set_unusable_password(); t.save(); print(t.has_usable_password())"
```

---

### Ressources
- https://developers.google.com/identity/openid-connect/openid-connect
- https://support.google.com/cloud/answer/15549945
- https://docs.authlib.org/en/latest/oauth2/client/web/django.html
- https://datatracker.ietf.org/doc/html/rfc6749#section-4.1
- https://docs.djangoproject.com/en/5.2/topics/auth/default/#how-to-log-a-user-in

## Choix techniques et limites connues

- **Authlib plutôt qu'une implémentation à la main** : une première version faisait tout avec `requests` (state, échange du code, appel à `userinfo`), sans vérifier l'`id_token`. Authlib ajoute cette vérification (signature, `iss`, `aud`, `exp`, `nonce`), l'expiration du `state`, et lit les adresses de Google dans sa configuration publiée, pour deux vues beaucoup plus courtes.
- **Authlib plutôt que django-allauth** : allauth aurait pu gérer toute l'authentification si on l'avait choisi dès le départ (inscription, vérification d'email, mot de passe oublié, plusieurs fournisseurs). Ici, les comptes existaient déjà et le module ne demande qu'un fournisseur : on a seulement ajouté la partie OAuth.
- **Compte retrouvé par l'email, pas par le `sub`** : le `sub` (identifiant Google permanent) demanderait un nouveau champ et une migration. Conséquence : si un utilisateur change l'email de son compte Google, il obtient un nouveau compte chez nous.
- **Pas de liaison avec un compte classique** : un utilisateur inscrit avec un mot de passe ne peut pas ajouter Google à son compte. C'est le prix de la protection de l'élément 5, tant que l'inscription classique ne vérifie pas l'email.
- **Pas de mot de passe pour les comptes Google** : « Modifier le mot de passe » demande l'ancien mot de passe, qu'un compte Google n'a pas. Ces utilisateurs se connectent uniquement avec Google.
- **Toujours redirigé vers `/profile`** : après une connexion Google, la page demandée avant la connexion n'est pas retrouvée (par exemple un lien d'invitation `/join/…`, qu'il faut rouvrir). La connexion classique, elle, y renvoie.
- **Application Google en mode Testing** : avec les seuls scopes de base, n'importe quel compte Google peut se connecter. Un compte Google Workspace (école, entreprise) peut toutefois être bloqué par les règles de son organisation : utiliser alors un compte personnel, ou l'ajouter dans **Test users**.
- **Internet nécessaire côté backend** : au 1er usage, le backend télécharge la configuration et les clés publiques de Google, puis les garde en mémoire.
- **HTTP en développement** : Google accepte `http://` seulement pour `localhost`. Avec HTTPS (exigé par le sujet pour l'évaluation), il faudra déclarer la nouvelle adresse de retour (par exemple `https://localhost:8443/api/auth/google/callback/`) dans la console Google, mettre à jour `GOOGLE_REDIRECT_URI`, et activer `SESSION_COOKIE_SECURE`.


---
### PWA — installable and offline-capable (Minor, 1 point)

**Done by:** Charlotte.

**What it delivers.** Peripl can be installed as an app (Chrome, Edge, Safari) and stays usable offline in read-only mode: the user remains logged in, finds the trips already visited, and sees a clear message when a feature needs the network.

**How it is implemented.**

- `vite-plugin-pwa` (Workbox) in `vite.config.ts` generates the web manifest and the service worker. The app files are precached in the production build; `GET /api/travels…` uses a `NetworkFirst` strategy, so the last known trips are shown without network.
- `AuthProvider` tells apart a network failure (`TypeError`: keep the user saved in `localStorage`) from a server error (401: log out). On logout, the saved user and the trips cache are deleted, so nothing leaks on a shared device.
- A `useOnlineNetworkStatus` hook drives an "Offline" banner, a placeholder in place of the Mapbox map, and a message in the place search. Texts are translated (fr/en/es).

**Limits.** Offline use is read-only (no queue for changes). Mapbox tiles cannot be cached (terms of service), so the map is unavailable offline. Production needs HTTPS. Firefox desktop cannot install PWAs.

**How to test.** `cd srcs/frontend && npx vite build && npx vite preview` (http://localhost:4173), log in, tick "Offline" in the browser developer tools and reload. Add `http://localhost:4173` to `DJANGO_CSRF_TRUSTED_ORIGINS` in `.env` to be able to log out from this port.


=========================

Avant de toucher au premier fichier, il faut trancher un point qui conditionne tout le reste : le certificat TLS.

Le problème : .app est un domaine HSTS préchargé dans Chrome. Avec un certificat auto-signé sur peripl.app, Chrome affiche l’erreur sans bouton « Continuer quand même » : le correcteur est bloqué. De plus, votre PWA enregistre un service worker. Avec un certificat non reconnu, ce service worker échoue et produit une erreur dans la console, ce que le sujet interdit.

La solution que je recommande :

un enregistrement DNS peripl.app → 127.0.0.1 ;
un vrai certificat Let’s Encrypt obtenu par challenge DNS, donc sans hébergement.

Résultat : sur n’importe quelle machine qui lance make, https://peripl.app ouvre le projet local avec un cadenas vert. Il n’y a rien à installer et /etc/hosts ne change pas. Le certificat est valable 90 jours, donc il faudra le générer peu avant la soutenance.

Plan global (on le fera une étape à la fois) :

DNS + certificat
nginx : TLS sur 443, redirection 80 → 443, server_name peripl.app
docker-compose : port 443, montage des certificats, retrait des volumes de dev
frontend : build de prod (vos notes : serve sur le port 3000)
backend : uvicorn avec workers, migrate automatique, réglages de sécurité Django (cookies secure, proxy SSL, hosts, CSRF), .env.example
Google OAuth : redirect URI en https://peripl.app/...
Vérification finale : une seule commande, console Chrome propre
Étape 1 : DNS

Chez votre registrar (là où vous avez acheté peripl.app), dans la zone DNS, créez :

Type	Nom	Valeur
A	@ (peripl.app)	127.0.0.1

Puis vérifiez depuis un terminal :

bash
dig +short peripl.app

La commande doit répondre 127.0.0.1. La propagation peut prendre quelques minutes.




==========================================

etape 1 : modifier nginx.conf

frontend : 3000
le conteneur frontend, port 3000, où serve distribuera le build React

Vite en développement : exécute un serveur de développement avec rechargement automatique.
Vite en production : compile ton application React.
serve en production : distribue le résultat de cette compilation.


ajout 443 et ssl
nom de domain
http2 pour la gere plusieurs requete rapidement


ssl_certificate : le certificat public. fullchain.pem contient votre certificat suivi de celui de l’autorité Let’s Encrypt, ce qui permet à Chrome de remonter la chaîne de confiance.
ssl_certificate_key : la clé privée qui va avec. Elle ne doit jamais aller sur Git.
Les deux chemins correspondent à la structure que certbot génère. On montera ce dossier dans le conteneur à l’étape 2.
ssl_protocols TLSv1.2 TLSv1.3; : seules ces deux versions de TLS sont acceptées. Les anciennes (TLS 1.0 et 1.1) sont considérées comme non sûres.


etape 2
modifer dockerfile nginx et mettre 443

