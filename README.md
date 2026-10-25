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
| **Docker Engine** avec le plugin **Compose v2** | Construit et lance tous les services dans des conteneurs | `docker --version` et `docker compose version` |
| **GNU Make** | Des commandes courtes pour tout (`make up`, `make test`…) | `make --version` |
| **Git** | Cloner le dépôt | `git --version` |

Rien d'autre n'est nécessaire sur ta machine : Python, Node.js, PostgreSQL, Redis et Nginx tournent tous **dans des conteneurs**.
Le port **8080** doit être libre sur ta machine.

## 1. Configurer l'environnement

Tous les secrets et réglages se trouvent dans un fichier **`.env` à la racine du dépôt**. Ce fichier est ignoré par Git ; un modèle est fourni dans `.env.example`.

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

> Pour générer une clé secrète :
> `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`

Les changements à faire pour la production sont indiqués en commentaire en haut de `.env.example`.

Les fonctionnalités de carte du frontend ont aussi besoin d'un token Mapbox dans `srcs/frontend/.env` (modèle : `srcs/frontend/.env.example`, variable `VITE_MAPBOX_TOKEN`). Le reste de l'application fonctionne sans.

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
| 7 | Test WebSocket (ci-dessous) | `{"message": "pong: hello"}` | Les **WebSockets** passent par Nginx jusqu'à Django Channels |
| 8 | `make test` | `OK` à la fin | La suite de tests du backend passe |

**Test WebSocket** : ouvre http://localhost:8080 dans un navigateur, ouvre la console développeur (F12) et colle :

```js
const ws = new WebSocket("ws://localhost:8080/ws/ping/");
ws.onmessage = (e) => console.log(e.data);
ws.onopen = () => ws.send(JSON.stringify({ message: "hello" }));
```

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
- **Pourquoi** : les données du projet sont fortement liées entre elles — voyageurs, voyages, participations, étapes, idées, réactions, amitiés — et doivent rester cohérentes.
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
  - **Base 0 — Django Channels** (channel layer) : transporte les messages temps réel des WebSockets entre les processus du backend.
  - **Base 1 — cache Django** : stocke les compteurs du **rate limiting** de l'API publique.

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

#### `IdeaListView` — lister et créer
- **Ce que c'est** : une vue générique DRF `ListCreateAPIView` (GET + POST).
- **Pourquoi** : la vue générique gère déjà la lecture du body, la validation par le serializer et les bons codes HTTP (`200`, `201`). On n'écrit que ce qui est propre au projet.
- **Avantages** :
  - **Le nombre de votes et « ai-je voté ? » sont calculés en une seule requête SQL**, grâce à `annotate(vote_count=Count("reactions"), voted=Exists(...))`. Sans ça, il faudrait une requête de plus par idée affichée (le problème du « N+1 »).
  - `perform_create` remplit lui-même **le voyage** (depuis l'URL) et **l'auteur** (l'utilisateur connecté) : un client ne peut pas créer une idée au nom de quelqu'un d'autre ni dans un autre voyage.
- **Dans le projet** : protégée par `IsAuthenticated` + `IsTravelParticipant`. Seul un participant **accepté** du voyage peut lister ou créer, les autres reçoivent `403`. Les idées sont triées de la plus récente à la plus ancienne.

#### `IdeaDetailView` — consulter, modifier, supprimer
- **Ce que c'est** : une `RetrieveUpdateDestroyAPIView` (GET, PUT, PATCH, DELETE).
- **Pourquoi** : une seule vue pour toutes les opérations sur **une** idée. Le placement sur une étape est aussi un simple `PATCH` (`stepId` + dates).
- **Avantages** : avec `ParticipantScopedMixin`, le queryset ne contient **que** les idées des voyages de l'utilisateur. Une idée d'un autre voyage renvoie `404`, sans même révéler qu'elle existe.
- **Dans le projet** : la suppression est **définitive** et entraîne celle des votes (`on_delete=CASCADE`).

#### `IdeaChoiceView` — choisir un hébergement
- **Ce que c'est** : une action dédiée, `POST .../choice/`.
- **Pourquoi** : choisir un hébergement n'est pas une modification libre. C'est une action avec ses propres règles (uniquement un hébergement placé, pas deux hébergements choisis sur des dates qui se chevauchent).
- **Avantages** : la vue tourne dans une **transaction** (`@transaction.atomic`) avec un **verrou sur les lignes** (`select_for_update`) de l'idée et de l'étape. Si deux participants cliquent en même temps, les requêtes passent l'une après l'autre, et les règles ne peuvent pas être contournées.
- **Dans le projet** : l'action est **idempotente**. Choisir un hébergement déjà choisi ne change rien et renvoie l'idée telle quelle. L'auteur du choix et la date sont enregistrés (`chosenById`, `chosenAt`).

#### `ReactionView` — les votes
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

#### `types.ts` — deux formats de données
- **Ce que c'est** : les types TypeScript d'une idée, **en deux versions** : `IdeaApiResponse` (exactement le JSON reçu) et `Idea` (le format pratique pour les composants).
- **Pourquoi** : le format de l'API est pensé pour la base (types `r`/`l`/`a`/`s`, décimaux en texte, une seule paire de dates), alors que l'interface a besoin de valeurs lisibles et typées.
- **Avantage** : TypeScript signale à la compilation toute utilisation d'un champ qui n'existe pas, ou avec le mauvais type.

#### `ideaMapper.ts` — la conversion API ⇄ interface
- **Rôle** :
  - `r`/`l`/`a`/`s` ⇄ `restaurant`/`accommodation`/`activity`/`sightseeing` ;
  - les décimaux reçus en texte (`"45.7640000"`, `"120.00"`) deviennent des **nombres** ;
  - `startDate`/`endDate` deviennent `date` (une journée) **ou** `arrivalDate`/`departureDate` (un hébergement), et inversement à l'envoi.
- **Avantage** : si le format de l'API change, **un seul fichier** est à modifier. Les composants ne sont pas touchés.

#### `api.ideas.ts` — les appels au backend
- **Rôle** : une fonction par action (`fetchIdeas`, `postIdea`, `patchIdea`, `removeIdea`, `patchIdeaPlacement`, `chooseIdea`, `addIdeaReaction`, `removeIdeaReaction`).
- **Dans le projet** :
  - `credentials: "include"` envoie le **cookie de session** ;
  - chaque écriture (`POST`, `PATCH`, `DELETE`) ajoute le header **`X-CSRFToken`**, lu dans le cookie `csrftoken` ;
  - les réponses passent par `parseResponse` (partagé, `src/shared/api/errors.ts`), qui lit l'enveloppe d'erreur du backend (`{status, code, message, details}`) et en fait un message lisible.

#### `ideaErrors.ts` — des erreurs en français
- **Rôle** : traduit les messages métier du backend (« The idea dates must be within the step dates. »…) en messages compréhensibles pour l'utilisateur.

#### `useIdeas.ts` — l'état de la page
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

```
ordre des requêtes
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

#
#

# Module : OAuth 2.0 (Minor, 1 point)

Comprendre OAuth 2.0 (le flux « Authorization Code »)
L’utilisateur clique sur « Continuer avec Google » → le navigateur va sur ton backend (/api/auth/google/).
Le backend le redirige vers Google avec ton client_id, l’URL de retour (redirect_uri), ce que tu demandes (scope : email, nom) et un state aléatoire.
L’utilisateur se connecte chez Google (ton site ne voit jamais son mot de passe Google) et accepte.
Google renvoie le navigateur vers ton redirect_uri avec un code temporaire.
Ton backend échange ce code contre un access_token, directement auprès de Google, en prouvant qui il est avec le client_secret. Le navigateur ne voit jamais ce secret.
Avec le token, le backend demande à Google « qui est-ce ? » (email, prénom, nom), trouve ou crée le Traveler, appelle login(), puis redirige vers /profile.


Le state sert à se protéger d’une attaque CSRF : on le stocke dans la session et on vérifie que Google renvoie bien le même.
uiliser une seule fois


Étape 1 : déclarer l’application chez Google (console.cloud.google.com)

Comprendre : Google ne parle qu’aux applications qu’il connaît. Tu vas obtenir un Client ID (public, il apparaît dans l’URL) et un Client secret (privé, uniquement dans le .env). Tu déclares aussi l’URL de retour exacte. Google refuse toute autre URL, ce qui empêche quelqu’un de détourner le code vers son propre site.

https://support.google.com/cloud/answer/15549257?hl=en

Implémenter :

Va sur console.cloud.google.com et crée un projet (par exemple « Transcendence »).
Ouvre Google Auth Platform (le menu « Écran de consentement OAuth » y mène aussi) et clique sur Get started :
Branding : nom de l’app et ton email de support.
Audience : choisis External.
Donne ton email de contact et valide.
Audience → Test users : ajoute ton Gmail, ceux de tes coéquipiers et, plus tard, ceux des évaluateurs. Tant que l’app est en mode « Testing », seuls ces comptes peuvent se connecter. C’est voulu et suffisant pour le projet.
Clients → Create client :
Type : Web application.
Authorized redirect URIs : http://localhost:8080/api/auth/google/callback/ (exactement ceci, avec le / final).
Laisse « Authorized JavaScript origins » vide : ce champ ne sert qu’à la connexion faite en JavaScript, pas à notre méthode.
Copie le Client ID et le Client secret tout de suite, car Google ne réaffiche plus le secret ensuite.

Les trois scopes nécessaires sont :
- openid : identifier l'utilisateur.
- email : récupérer son adresse e-mail.
- profile : récupérer ses informations de profil.
Pourquoi ?
Ces scopes sont non sensibles et sont demandés directement lors de l'authentification OAuth, dans ton code Django.

https://developers.google.com/identity/openid-connect/openid-connect?utm_source=chatgpt.com&hl=fr#python

https://developer.auth0.com/resources/guides/web-app/django/basic-authentication?utm_source=chatgpt.com

Ajouter au .env les variable
les x a remplacer avec les vrai valeur

ajout dans settings le get pour récupérer les valeurs

Tester : le fichier env_file n’est relu que quand le conteneur est recréé
docker compose exec backend python -c "import os; print(os.environ['GOOGLE_CLIENT_ID'][:15], bool(os.environ['GOOGLE_CLIENT_SECRET']), os.environ['GOOGLE_REDIRECT_URI'])"


Étape 2 : la vue qui envoie l’utilisateur chez Google
l’utilisateur arrive sur /api/auth/google/, et le backend le redirige (réponse HTTP 302) vers la page de connexion Google, avec dans l’URL tout ce dont Google a besoin.
Le navigateur doit afficher la page de Google pour que l’utilisateur s’y connecte

Les paramètres envoyés à Google :

Paramètre	Rôle
client_id	« C’est l’application Transcendence » (le Client ID de l’étape 1).
redirect_uri	Où Google doit renvoyer l’utilisateur. Doit être identique à celle déclarée dans la console.
response_type=code	« Renvoie-moi un code temporaire » : c’est le flux Authorization Code.
scope=openid email profile	Ce que tu demandes : l’identité, l’email, le prénom et le nom. Rien de plus.
state	Valeur aléatoire anti-CSRF (détails ci-dessous).
prompt=select_account	Google affiche toujours le choix du compte. Pratique pour tester avec plusieurs comptes et en soutenance.


Le state, concrètement : on génère une chaîne aléatoire, on la stocke dans la session Django de l’utilisateur et on l’envoie à Google. Google la renverra telle quelle au retour. À l’étape 3, on vérifiera que la valeur reçue est la même que celle en session. Sans ça, un attaquant pourrait te faire ouvrir un lien de callback contenant son code Google, et tu serais connecté sur son compte.

Ça fonctionne avec ta config actuelle : SESSION_COOKIE_SAMESITE = "Lax" laisse passer le cookie sessionid quand Google redirige le navigateur vers ton site, car c’est une navigation GET.

Nouveau fichier traveler/oauth.py

https://waracle.com/insights/development/adding-google-login-to-your-existing-django-and-django-rest-framework-applications/?ht-comment-id=13848725&utm_source=chatgpt.com

https://developers.google.com/identity/protocols/oauth2/


ajout de GoogleLoginView dans traveler view
et url auth-google dans url.py

GoogleLoginView(APIView): redidirge le state en code 302 au nav a google
moment ou on clique pour se connecter

Utilisateur
    │
    │ Clique sur "Se connecter avec Google"
    ▼
GoogleLoginView
    │
    ├── Génère un state
    ├── Sauvegarde le state
    ├── Prépare les paramètres OAuth
    └── Renvoie une redirection HTTP 302
    │
    ▼
Google
    │
    └── Affiche la sélection du compte Google


Exemple :
1. L'utilisateur commence une connexion Google.
2. Django génère state = ABC123.
3. Django envoie ABC123 à Google.
4. Google redirige le navigateur vers Django avec state=ABC123.
5. Django vérifie que les deux valeurs sont identiques.

state enregistrer dans django_session


return redirect(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")
sert à rediriger le navigateur de l'utilisateur vers la page de connexion Google, avec tous les paramètres OAuth nécessaires.

verif

curl -i http://localhost:8080/api/auth/google/

-----

moment ou la fenetre se connecter a "projet"
peut verifier le state

et view callback

On récupère le state gardé en session, et on le supprime (usage unique) avec pop
pop permet de supprimer un element d une liste et de l utiliser
ici le state est unique, une fois utiliser il est supprimer


échanger le code contre un token

ta vue reçoit le code. Mais ce code ne dit pas qui est l’utilisateur. C’est juste un ticket temporaire. Il faut l’échanger auprès de Google contre un access token : une clé qui permet ensuite de demander à Google les infos de l’utilisateur

Comment se fait l’échange : ton backend envoie lui-même une requête POST à Google, à l’adresse https://oauth2.googleapis.com/token. Le navigateur ne participe pas. Il y met 5 informations :

Champ	Rôle
code	Le ticket reçu dans l’URL.
client_id	« C’est l’application Transcendence. »
client_secret	La preuve que c’est vraiment ton serveur qui demande.
redirect_uri	La même adresse qu’à l’étape 2. Google vérifie qu’elles correspondent.
grant_type=authorization_code	« Je t’échange un code. »

Deux choses peuvent mal tourner, et dans les deux cas on renvoie vers /login?error=google :

Google refuse le code : il répond autre chose que 200 (code expiré ou déjà utilisé, mauvais secret…).
Google ne répond pas : problème réseau, ou plus de 10 secondes d’attente. C’est timeout=10 qui fixe cette limite : sans lui, la requête pourrait attendre indéfiniment.

Si tout va bien, Google répond 200 avec un JSON comme celui-ci :
{ "access_token": "ya29.a0Af...", "expires_in": 3599, "scope": "...", "token_type": "Bearer", "id_token": "eyJhbGci..." }

installation de requests dans requirement pour les requete http

ca se verifie dans les logs

Différence essentielle
Élément	Rôle	Qui effectue le contrôle ?
state	Vérifier que le callback correspond à une demande initiée par le navigateur	Ton backend Django
GOOGLE_TOKEN_URL	Échanger le code d'autorisation contre des tokens	Le serveur Google
id_token	Prouver l'identité Google de l'utilisateur	Django, après vérification cryptographique

Le state permet à Django de vérifier la cohérence de la demande OAuth.

GOOGLE_TOKEN_URL permet à Google de vérifier le code et de délivrer les tokens.



https://requests.readthedocs.io/en/latest/user/quickstart/?utm_source=chatgpt.com
https://docs.python.org/3/howto/logging.html?utm_source=chatgpt.com


afficher state
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; s = Session.objects.order_by('-expire_date').first(); print(s.get_decoded().get('google_oauth2_state'))"

http://localhost:8080/api/auth/google/callback/?state=COLLE_ICI&code=faux

permet de voir le code faux


Étape 3.3 : demander à Google qui est l’utilisateur


