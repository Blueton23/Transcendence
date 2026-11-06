*This project has been created*

# Instructions

## 1. Configurer l'environnement

Lancez la commande suivante :

```bash
make env                  # Cette commande génère un .env pré-rempli
```

- Le reste des variables comme `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` et `VITE_MAPBOX_TOKEN` doivent être remplies manuellement

Puis :
- Glissez certs.tgz à la racine du projet
- Ouvrez un terminal dans ce dossier et lancez :

```bash
sudo tar xzf certs.tgz    # Cette commande va créer le dossier certs/ et enregistrer les certificats et la clé
```

## 2. Lancer le projet

```bash
make up                   # construit les images et lance tous les services, migration des modèles automatique
```

Uniquement au premier lancement :

```bash
make seed             # (facultatif) remplit la base avec des données de test
make createsuperuser  # (facultatif) crée un compte admin pour /admin/
```

L'application est alors disponible sur **https://peripl.app**.

| URL | Ce qu'on obtient |
|---|---|
| https://peripl.app/api/ | Vérification de santé du backend : `{"status": "ok"}` |
| https://peripl.app/admin/ | Administration Django |
| https://peripl.app/api/docs/ | Documentation de l'API publique (Swagger) |

---

# Modules

---
### Framework frontend + backend - socle Docker et 5 services (Major, 2 points)

**Réalisé par :** dle-fur (socle technique : Docker Compose, les 5 services, Nginx, Makefile).

**Ce que ça apporte.** Toute l'application démarre avec une seule commande (`make up`) et tourne de la même façon chez chaque membre de l'équipe. Le backend utilise **Django + Django REST Framework**, le frontend **React + TypeScript + Vite**. Nginx est le **seul point d'entrée** (port 443).

**Comment c'est implémenté.**

- `docker-compose.yml` : 5 services aux versions fixées (`postgres:17-alpine`, `redis:7.4.9-alpine`, `python:3.13`, `node:22`, `nginx:1.30.3`) sur un réseau privé ; seul Nginx est exposé. Les **health checks** + `depends_on: service_healthy` imposent l'ordre de démarrage : `db` et `redis` → `backend` et `frontend` → `nginx`. `restart: unless-stopped`.
- **Backend** : Django 5.2 + DRF + Channels, servi par **Uvicorn** (ASGI : HTTP et WebSockets dans le même serveur). Utilisateur non-root (UID/GID du `.env`). `entrypoint.sh` lance `collectstatic` puis Uvicorn avec `--workers 4`. Qualité : Ruff et tests Django.
- **Frontend** : React 19 + TypeScript + Tailwind, **build de production** construit dans l'image (`VITE_MAPBOX_TOKEN` est passé au build) et servi sur le port 3000. Dépendances avec `npm ci`. Qualité : ESLint et Prettier.
- **Nginx** : `/api/`, `/admin/`, `/ws/` → backend ; `/static/`, `/media/` → lus directement dans les volumes ; le reste → frontend. Une seule origine : pas de CORS, les cookies de session fonctionnent naturellement. Transmet la vraie IP (`X-Forwarded-For`). HTTPS sur le port 443, avec les certificats du dossier `certs/`.
- **Données** : PostgreSQL (contraintes, transactions, `select_for_update`) dans le volume `postgres_data` ; Redis base 0 pour Django Channels, base 1 pour le cache (rate limiting de l'API).
- `Makefile` : enveloppe les commandes Compose (`make up`, `make ps`, `make test`…).

**Limites.** Le code source n'est pas monté dans les conteneurs : chaque modification demande de reconstruire les images (`make up`, qui lance `--build`).

**Comment tester.** Projet lancé (`make up`) :

| Commande / action | Résultat attendu | Ce que ça prouve |
|---|---|---|
| `make ps` | `db`, `redis`, `backend`, `frontend` **healthy**, `nginx` **running** | Les 5 services tournent, dans le bon ordre |
| `curl https://peripl.app/api/` | `{"status":"ok"}` | Nginx → Django |
| `make test-db` puis `make ping` | `✅ Connexion réussie à la base : …` puis `PONG` | Django atteint PostgreSQL, Redis répond |
| Ouvrir https://peripl.app/admin/ | page de connexion **mise en forme** | Fichiers statiques servis par Nginx |

---
### API publique - clé API, rate limiting et documentation (Major, 2 points)

**Réalisé par :** dle-fur.

**Ce que ça apporte.** Un programme extérieur (script, Postman…) peut lire et modifier les **voyages**, **étapes**, **idées** et **dépenses** sans navigateur, avec une **clé API**. Sur plusieurs url (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), un rate limiting et une documentation Swagger publique.

**Comment c'est implémenté.**

- **La clé** : `rest_framework.authtoken` (une clé aléatoire de 40 caractères par utilisateur). `POST /api/auth/token/` (`ApiTokenView`) échange username + mot de passe contre la clé, ensuite envoyée dans `Authorization: Token <clé>`. Pas de CSRF nécessaire : un autre site ne peut pas ajouter ce header.
- **Accès vue par vue** : `PublicApiMixin` (`common/mixins.py`) ajoute `TokenAuthentication` (après `SessionAuthentication`) et le rate limiting. Appliqué seulement sur les vues utilisant `PublicApiMixin`. Les autres (profil, amis, votes, choix d'un hébergement…) restent réservées au site.
- **Rate limiting** (`ScopedRateThrottle`) : `public_api` = **1000 requêtes/heure par utilisateur** ; `auth_token` = **5 essais/minute par IP** (anti brute-force). `NUM_PROXIES: 1` : l'IP est lue derrière Nginx et ne peut pas être falsifiée avec un faux `X-Forwarded-For`.
- **Documentation** : drf-spectacular génère le schéma OpenAPI 3 (`/api/schema/`) et Swagger (`/api/docs/`), en accès libre. Le hook `public_endpoints_only` n'y montre **que** les routes publiques.

| Route | Méthodes | Remarque |
|---|---|---|
| `/api/auth/token/` | `POST` | obtenir sa clé (sans authentification) |

**Limites.** Clés stockées en clair et sans expiration (fonctionnement de `authtoken`) ; on les révoque en les supprimant dans l'admin.

**Comment tester.** Accéder à `https://peripl.app/api/docs`. Remplacer `<username>` / `<password>` par un compte existant, puis récupérer la clé. Enregistrer la clé dans `Authorize`, `<Token>` avant la clé.

```bash
# Test 1 : brute-force
docker compose exec redis redis-cli -n 1 FLUSHDB
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://peripl.app/api/auth/token/ \
    -H "Content-Type: application/json" -d '{"username": "<username>", "password": "faux"}'
done

docker compose exec redis redis-cli -n 1 KEYS '*'

docker compose exec redis redis-cli -n 1 TTL ':1:throttle_auth_token_<ip>'
docker compose exec backend python manage.py shell -c "from django.core.cache import cache; print(len(cache.get('throttle_auth_token_<ip>') or []))"

# Test 2 : rate limiting
TOKEN=<clé>
docker compose exec redis redis-cli -n 1 FLUSHDB
for i in $(seq 1 1001); do
  curl -s -o /dev/null -w "%{http_code}\n" https://peripl.app/api/travels/ \
    -H "Authorization: Token $TOKEN"
done | sort | uniq -c

docker compose exec redis redis-cli -n 1 KEYS '*'

docker compose exec backend python manage.py shell -c "from django.core.cache import cache; print(len(cache.get('throttle_public_api_<id>') or []))"
docker compose exec redis redis-cli -n 1 TTL ':1:throttle_public_api_<id>'
```

---
### OAuth 2.0 - connexion avec Google (Minor, 1 point)

**Réalisé par :** dle-fur.

**Ce que ça apporte.** Un bouton « Continuer avec Google » sur `auth/components/login`. L'utilisateur se connecte **chez Google** (le site ne voit jamais son mot de passe Google) et revient **connecté** sur son profil. Son compte `Traveler` est créé à la première connexion, puis retrouvé aux suivantes. La connexion finit comme une connexion classique (`login()` de Django, cookie de session) : le reste de l'application ne voit aucune différence.

**Comment c'est implémenté.**

- **Google Cloud Console** : client OAuth « Web application », adresse de retour `https://peripl.app/api/auth/google/callback/`. Identifiants dans le `.env` : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- **Authlib gère le protocole** : `state` (anti-CSRF, usage unique, expire après 1 h), `nonce` (anti-rejeu), échange du `code` avec le `client_secret`, vérification de l'`id_token` (signature avec les clés publiques de Google).
- **Notre code gère le compte** (`GoogleLoginView`, `GoogleCallbackView` dans `traveler/views.py`) :
  - `email_verified` obligatoire ;
  - compte retrouvé par l'email ; sinon créé **sans mot de passe** (username généré : `user`, puis `user1` s'il est pris) ;
  - un **compte classique (avec une adresse associée à Google) est refusé** : l'inscription classique ne vérifie pas l'email, un attaquant pourrait sinon pré-créer un compte avec l'email de la victime ;
  - tout échec renvoie vers `/login?error=google` ou `/login?error=google_email_exists`.
- **Frontend** (`login.tsx`) : le bouton fait une vraie navigation (`window.location.href = "/api/auth/google/"`).

**Limites.** Compte retrouvé par l'email et non par l'identifiant Google (`sub`). `sub` est une suite de chiffres qui permet un contrôle supplémentaire d'authentification.

**Comment tester.** Utilise une **fenêtre de navigation privée**, avec la console ouverte (F12) sur l'onglet **Network**.

Pour suivre les logs : `make logs-backend`.

**1.** Clique sur **« Continuer avec Google »**. **Ne choisis pas encore de compte**, et lance :

```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; s = Session.objects.order_by('-expire_date').first(); print(s.get_decoded())"
```

Résultat attendu : dans F12, la requête `google/` a répondu `302`, et son en-tête `Location` contient `state=AbC123…` et `nonce=xYz789…` : **les mêmes valeurs** que dans la session Django.

**2. La connexion.** Choisis ton compte Google. Redirection `302` vers `/profile`.

**3. Le compte :** dans F12 → **Application** → **Cookies** → `https://peripl.app`, copie la valeur de `sessionid`, puis lance :

```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; from traveler.models import Traveler; s = Session.objects.get(session_key='<sessionid>').get_decoded(); t = Traveler.objects.get(pk=s['_auth_user_id']); print(t.username, t.email, t.first_name, t.last_name, t.has_usable_password())"
```

Résultat attendu : par exemple `david.lf david.lf@gmail.com David Lf False`. Le cookie du navigateur correspond à une session Django ouverte pour ce compte, créé depuis Google, **sans mot de passe** (`False`).

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

---

# Contribution générale

---
### Idées et votes (`idea` / `reaction`)

**Réalisé par :** dle-fur pour l'API REST (serializers, vues, URLs) et frontend.

**Ce que ça apporte.** Dans un voyage, chaque participant **épingle des idées** (restaurant, hébergement, activité, lieu à voir), le groupe **vote** pour ses préférées, les **place** sur les étapes de l'itinéraire et **choisit** un hébergement. Le statut est calculé par le backend : `suggested` (dans le pool) → `placed` (sur une étape) → `chosen` (hébergement retenu).

**Comment c'est implémenté.**

- **Routes** sous `/api/travels/{travel_id}/ideas/` : liste / création, détail (`GET`, `PUT`, `PATCH`, `DELETE`), `…/{id}/choice/` (choisir un hébergement), `…/{id}/reaction/` (`GET`, `POST`, `DELETE` : les votes).
- `IdeaListView` : le nombre de votes et « ai-je voté ? » sont calculés **en une seule requête SQL** (`annotate` + `Exists`, pas de N+1). Le voyage et l'auteur sont imposés par le serveur.
- `IdeaChoiceView` : **transaction** + `select_for_update` : deux clics simultanés ne peuvent pas contourner les règles (un hébergement placé, pas de chevauchement de dates). Action idempotente.
- `ReactionView` : **un seul vote par personne et par idée**, garanti par une contrainte unique en base (sinon `400`).
- `IdeaSerializer` : auteur, statut et choix en **lecture seule** ; les erreurs de validation du modèle deviennent des `400` détaillés par champ, au lieu d'une `500`.
- **Accès** : connecté + participant accepté du voyage (`IsTravelParticipant`, `ParticipantScopedMixin`) ; une idée d'un autre voyage renvoie `404`. CSRF sur toutes les écritures.
- **Frontend** (`src/features/idea/`) : couches séparées, un composant n'appelle jamais `fetch`. `ideaMapper.ts` convertit le format API (`r`/`l`/`a`/`s`, décimaux en texte, dates) ; `useIdeas.ts` gère chargement, erreurs et réponses en retard ; `validateIdeaForm.ts` valide côté client (le backend revalide tout) ; `ideaErrors.ts` traduit les erreurs du backend ; `useSubmitAction` désactive le bouton pendant la requête (pas de double vote).

**Limites.** Le vote et le choix d'un hébergement ne font pas partie de l'API publique : ce sont des actions du site uniquement.

**Comment tester.** Connecté, ouvre un voyage puis l'onglet **Idées** (`/travel/{id}/ideas`).
