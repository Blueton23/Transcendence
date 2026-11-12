*This project has been created*

# Instructions

## 1. Set up the environment

Place the kit.tgz file at the root

Run the command:

```bash
make
```

The command sets up:
- The certificates
- Generates a .env and fills it in

Only on the first launch:

```bash
make seed             # (optional) fills the database with test data
make createsuperuser  # (optional) creates an admin account for /admin/
```

The application is then available at **https://peripl.app:8443**.

| URL | What you get |
|---|---|
| https://peripl.app:8443/api/ | Backend health check: `{"status": "ok"}` |
| https://peripl.app:8443/admin/ | Django administration |
| https://peripl.app:8443/api/docs/ | Public API documentation (Swagger) |

---

# Modules

---
### Frontend + backend framework - Docker foundation and 5 services (Major, 2 points)

**Done by:** dle-fur (technical foundation: Docker Compose, the 5 services, Nginx, Makefile).

**What it delivers.** The whole application starts with a single command (`make`) and runs the same way on every team member's machine. The backend uses **Django + Django REST Framework**, the frontend **React + TypeScript + Vite**. Nginx is the **single entry point** (port 8443 on the host, forwarded to port 443 in the container).

**How it is implemented.**

- `docker-compose.yml`: 5 services with pinned versions (`postgres:17-alpine`, `redis:7.4.9-alpine`, `python:3.13`, `node:22`, `nginx:1.30.3`) on a private network; only Nginx is exposed. The **health checks** + `depends_on: service_healthy` enforce the startup order: `db` and `redis` → `backend` and `frontend` → `nginx`. `restart: unless-stopped`.
- **Backend**: Django 5.2 + DRF + Channels, served by **Uvicorn** (ASGI: HTTP and WebSockets in the same server). Non-root user (UID/GID from the `.env`). `entrypoint.sh` runs `collectstatic` then Uvicorn with `--workers 4`. Quality: Ruff and Django tests.
- **Frontend**: React 19 + TypeScript + Tailwind, **production build** built into the image (`VITE_MAPBOX_TOKEN` is passed to the build) and served on port 3000. Dependencies with `npm ci`. Quality: ESLint and Prettier.
- **Nginx**: `/api/`, `/admin/`, `/ws/` → backend; `/static/`, `/media/` → read directly from the volumes; the rest → frontend. A single origin: no CORS, session cookies work naturally. Forwards the real IP (`X-Forwarded-For`). HTTPS on port 443 inside the container, exposed on port 8443 of the host (`8443:443` in `docker-compose.yml`), with the certificates from the `certs/` folder.
The certificates are requested by certbot and issued by Let's Encrypt for a period of 90 days
- **Data**: PostgreSQL (constraints, transactions, `select_for_update`) in the `postgres_data` volume; Redis database 0 for Django Channels, database 1 for the cache (API rate limiting).
- `Makefile`: wraps the Compose commands (`make up`, `make ps`, `make test`…).

**Limits.** The source code is not mounted in the containers: each change requires rebuilding the images (`make up`, which runs `--build`).

**How to test.** With the project running:

| Command / action | Expected result | What it proves |
|---|---|---|
| `make ps` | `db`, `redis`, `backend`, `frontend` **healthy**, `nginx` **running** | The 5 services are running, in the right order |
| `make test-db` then `make ping` | `✅ Connexion réussie à la base : …` then `PONG` | Django reaches PostgreSQL, Redis responds |

---
### Public API - API key, rate limiting and documentation (Major, 2 points)

**Done by:** dle-fur.

**What it delivers.** An external program (script, Postman…) can read and modify **trips**, **stages**, **ideas** and **expenses** without a browser, with an **API key**. Across several URLs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), with rate limiting and public Swagger documentation.

**How it is implemented.**

- **The key**: `rest_framework.authtoken` (a random 40-character key per user). `POST /api/auth/token/` (`ApiTokenView`) exchanges username + password for the key, which is then sent in `Authorization: Token <key>`. No CSRF needed: another site cannot add this header.
- **Per-view access**: `PublicApiMixin` (`common/mixins.py`) adds `TokenAuthentication` (after `SessionAuthentication`) and rate limiting. Applied only to the views using `PublicApiMixin`. The others (profile, friends, votes, choosing an accommodation…) remain reserved for the website.
- **Rate limiting** (`ScopedRateThrottle`): `public_api` = **1000 requests/minute per user**; `auth_token` = **5 attempts/minute per IP** (anti brute-force). `NUM_PROXIES: 1`: the IP is read behind Nginx and cannot be spoofed with a fake `X-Forwarded-For`.
- **Documentation**: drf-spectacular generates the OpenAPI 3 schema (`/api/schema/`) and Swagger (`/api/docs/`), freely accessible. The `public_endpoints_only` hook shows **only** the public routes there.

| Route | Methods | Note |
|---|---|---|
| `/api/auth/token/` | `POST` | get your key (without authentication) |

**Limits.** Keys stored in plain text and without expiration (how `authtoken` works); they are revoked by deleting them in the admin.

**How to test.** Go to `https://peripl.app:8443/api/docs`. Replace `<username>` / `<password>` with an existing account, then retrieve the key. Save the key in `Authorize`, with `<Token>` before the key.

```bash
# Test 1: brute-force
docker compose exec redis redis-cli -n 1 FLUSHDB
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://peripl.app:8443/api/auth/token/ \
    -H "Content-Type: application/json" -d '{"username": "<username>", "password": "wrong"}'
done

docker compose exec redis redis-cli -n 1 KEYS '*'

docker compose exec redis redis-cli -n 1 TTL ':1:throttle_auth_token_<ip>'
docker compose exec backend python manage.py shell -c "from django.core.cache import cache; print(len(cache.get('throttle_auth_token_<ip>') or []))"

# Test 2: rate limiting
TOKEN=<key>
docker compose exec redis redis-cli -n 1 FLUSHDB
for i in $(seq 1 1001); do
  curl -s -o /dev/null -w "%{http_code}\n" https://peripl.app:8443/api/travels/ \
    -H "Authorization: Token $TOKEN"
done | sort | uniq -c

docker compose exec redis redis-cli -n 1 KEYS '*'

docker compose exec backend python manage.py shell -c "from django.core.cache import cache; print(len(cache.get('throttle_public_api_<id>') or []))"
docker compose exec redis redis-cli -n 1 TTL ':1:throttle_public_api_<id>'
```

---
### OAuth 2.0 - sign in with Google (Minor, 1 point)

**Done by:** dle-fur.

**What it delivers.** A "Continue with Google" button on `auth/components/login`. The user signs in **with Google** (the site never sees their Google password) and comes back **logged in** on their profile. Their `Traveler` account is created on the first login, then found again on the following ones. The login ends like a classic login (Django's `login()`, session cookie): the rest of the application sees no difference.

**How it is implemented.**

- **Google Cloud Console**: "Web application" OAuth client, redirect URI `https://peripl.app:8443/api/auth/google/callback/`. Credentials in the `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- **Authlib handles the protocol**: `state` (anti-CSRF, single use, expires after 1 h), `nonce` (anti-replay), exchange of the `code` with the `client_secret`, verification of the `id_token` (signature with Google's public keys).
- **Our code handles the account** (`GoogleLoginView`, `GoogleCallbackView` in `traveler/views.py`):
  - `email_verified` required;
  - account found by email; otherwise created **without a password** (generated username: `user`, then `user1` if taken);
  - a **classic account (with an address associated with Google) is refused**: classic sign-up does not verify the email, otherwise an attacker could pre-create an account with the victim's email;
  - any failure redirects to `/login?error=google` or `/login?error=google_email_exists`.
- **Frontend** (`login.tsx`): the button performs a real navigation (`window.location.href = "/api/auth/google/"`).

**Limits.** Account found by email and not by the Google identifier (`sub`). `sub` is a sequence of digits that allows an additional authentication check.

**How to test.** Use a **private browsing window**, with the console open (F12) on the **Network** tab.

To follow the logs: `make logs-backend`.

**1.** Click **"Continue with Google"**. **Don't choose an account yet**, and run:

```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; s = Session.objects.order_by('-expire_date').first(); print(s.get_decoded())"
```

Expected result: in F12, the `google/` request responded `302`, and its `Location` header contains `state=AbC123…` and `nonce=xYz789…`: **the same values** as in the Django session.

**2. The login.** Choose your Google account. `302` redirect to `/profile`.

**3. The account:** in F12 → **Application** → **Cookies** → `https://peripl.app:8443`, copy the value of `sessionid`, then run:

```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; from traveler.models import Traveler; s = Session.objects.get(session_key='<sessionid>').get_decoded(); t = Traveler.objects.get(pk=s['_auth_user_id']); print(t.username, t.email, t.first_name, t.last_name, t.has_usable_password())"
```

Expected result: for example `david.lf david.lf@gmail.com David Lf False`. The browser cookie corresponds to a Django session opened for this account, created from Google, **without a password** (`False`).

---

# General contribution

---
### Ideas and votes (`idea` / `reaction`)

**Done by:** dle-fur for the REST API (serializers, views, URLs) and frontend.

**What it delivers.** Within a trip, each participant **pins ideas** (restaurant, accommodation, activity, place to see), the group **votes** for its favorites, **places** them on the itinerary stages and **chooses** an accommodation. The status is computed by the backend: `suggested` (in the pool) → `placed` (on a stage) → `chosen` (accommodation selected).

**How it is implemented.**

- **Routes** under `/api/travels/{travel_id}/ideas/`: list / create, detail (`GET`, `PUT`, `PATCH`, `DELETE`), `…/{id}/choice/` (choose an accommodation), `…/{id}/reaction/` (`GET`, `POST`, `DELETE`: the votes).
- `IdeaListView`: the number of votes and "have I voted?" are computed **in a single SQL query** (`annotate` + `Exists`, no N+1). The trip and the author are enforced by the server.
- `IdeaChoiceView`: **transaction** + `select_for_update`: two simultaneous clicks cannot bypass the rules (a placed accommodation, no overlapping dates). Idempotent action.
- `ReactionView`: **a single vote per person and per idea**, guaranteed by a unique constraint in the database (otherwise `400`).
- `IdeaSerializer`: author, status and choice are **read-only**; model validation errors become detailed per-field `400`s, instead of a `500`.
- **Access**: logged in + accepted participant of the trip (`IsTravelParticipant`, `ParticipantScopedMixin`); an idea from another trip returns `404`. CSRF on all writes.
- **Frontend** (`src/features/idea/`): separated layers, a component never calls `fetch`. `ideaMapper.ts` converts the API format (`r`/`l`/`a`/`s`, decimals as text, dates); `useIdeas.ts` handles loading, errors and late responses; `validateIdeaForm.ts` validates on the client side (the backend revalidates everything); `ideaErrors.ts` translates the backend errors; `useSubmitAction` disables the button during the request (no double vote).

**Limits.** Voting and choosing an accommodation are not part of the public API: they are site-only actions.

**How to test.** Logged in, open a trip then the **Ideas** tab (`/travel/{id}/ideas`).


---

# Resources
https://docs.djangoproject.com/fr/6.1/
https://docs.djangoproject.com/en/6.1/ref/
https://medium.com/@sibyamara95/cr%C3%A9er-votre-premier-projet-django-61f3100b2cb7
https://medium.com/tag/django
https://www.docstring.fr/blog/creer-une-api-rest-avec-django-rest-framework/
https://www.kienso.fr/comment-rediger-documentation-dapi-sur-django/
https://docs.document360.com/docs/fr/how-to-use-swagger
https://support.google.com/cloud/answer/15549257?hl=en
https://www.microsoft.com/fr-ch/security/business/security-101/what-is-openid-connect-oidc
https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-google-apis-dead94d6866d
https://flowbite.com/docs/getting-started/typescript/

