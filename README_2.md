_This project has been created as part of the 42 curriculum by chpasqui, dle-fur, scuthber, sydubois._

<!--
HOW TO FILL THIS FILE (delete this comment at the end)
- Everything must be in English (subject, chapter VI).
- Replace every `<login>` / `<...>` placeholder and every "TODO" comment.
- Each member fills: their row in "Team Information", their features in "Features List",
  their modules in "Modules", and their own section in "Individual Contributions".
- Keep it short: one or two sentences per item. Long technical write-ups go in docs/readme/
  and are linked from here.
-->

# Peripl

## Description

**Peripl** is a web application to plan a **road trip with friends**. Instead of scattered messages, screenshots and expenses written on a scrap of paper, the whole trip lives in one place and everybody sees the same thing.

**Key features**

- **Trips**: create a trip with its dates, invite friends with a link, see upcoming and finished trips.
- **Itinerary**: steps ordered by date, the driving route drawn on a map, travel time between steps, and the nights that still have no step.
- **Ideas**: everyone pins ideas (restaurant, accommodation, activity, sightseeing) on a step or in a common pool, votes with a ❤️, and the group chooses the accommodation for each night.
- **Expenses**: who paid what, how each expense is shared, each person's balance and the transfers needed to settle up.
- **Chat**: one real-time chat per trip, with unread messages and system messages (someone joined or left).
- **Social**: profile, friends with online status, notifications ("while you were away").
- **Available in French, English and Spanish**, installable as an app (PWA), usable on desktop and mobile.

## Instructions

### Prerequisites

| Tool | Why | Check |
|---|---|---|
| **Docker** with **Compose v2** | Builds and runs every service in containers | `docker --version`, `docker compose version` |
| **Make** | Short commands for everything (`make up`, `make test`…) | `make --version` |

### 1. Configure the environment

```bash
cp .env.example .env
cp srcs/frontend/.env.example srcs/frontend/.env
```

Then edit both files:

| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Long random value: `python3 -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DJANGO_DEBUG` | `True` in development, `False` in production |
| `DJANGO_ALLOWED_HOSTS` | Must contain `localhost` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | PostgreSQL database and credentials (created on first start) |
| `POSTGRES_HOST`, `POSTGRES_PORT` | `db` and `5432` |
| `REDIS_HOST`, `REDIS_PORT` | `redis` and `6379` |
| `UID`, `GID` | Your user and group ids (`id -u`, `id -g`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google OAuth application (redirect: `http://localhost:8080/api/auth/google/callback/`) |
| `VITE_MAPBOX_TOKEN` (in `srcs/frontend/.env`) | Mapbox token for the map, place search and routing |

### 2. Run the project

```bash
make up               # build the images and start every service
make migrate          # first run only: create the tables
make seed             # optional: fill the database with test data
make createsuperuser  # optional: admin account for /admin/
```

| URL | What you get |
|---|---|
| http://localhost:8080 | The web application |
| http://localhost:8080/api/ | Backend health check: `{"status": "ok"}` |
| http://localhost:8080/api/docs/ | Public API documentation (Swagger) |
| http://localhost:8080/admin/ | Django administration |
| http://localhost:8080/design-system | Catalogue of the UI components |

### 3. Useful commands

| Command | Description |
|---|---|
| `make start` / `make stop` | Start in the background / stop |
| `make down` | Stop and remove the containers (data is kept) |
| `make logs`, `make ps` | Logs and health of every service |
| `make test` | Backend tests (`make test ARGS=travel` for one app) |
| `make check-back`, `make lint` | Lint backend (Ruff) and frontend (ESLint, Prettier) |
| `make fclean` | ⚠️ Remove containers, images **and all data** |

## Team Information

<!-- TODO(each member): one row each. Roles from the subject: PO, PM, Tech Lead, Developers. -->

| Member | Login | Role(s) | Responsibilities |
|---|---|---|---|
| Charlotte | `chpasqui` | Product Owner, Developer | Product Owner: defines and prioritises the features and the modules, writes and orders the GitHub issues, checks that deliveries match the mockups and the subject. Developer: design and frontend lead, full-stack on trips, itinerary, map and expenses. |
| David | `dle-fur` | Technical Lead / Architect, Developer | <!-- TODO --> |
| Sébastien | `scuthber` | <!-- TODO --> | <!-- TODO --> |
| Sylvain | `sydubois` | <!-- TODO --> | <!-- TODO --> |

## Project Management

<!-- TODO(team): check and complete together. -->

- **Organisation**: <!-- e.g. weekly meeting, who decides priorities, how tasks are split by domain -->
- **Tasks**: GitHub Issues, one branch per issue (`<name>/<issue>-<title>`), pull requests reviewed by at least one other member before merging into `main`.
- **Design**: mockups made before coding (`docs/mockups/`), then a shared design system (`/design-system`).
- **Communication**: Discord <!-- TODO: channels, frequency -->.

## Technical Stack

| Layer | Technologies | Why |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, i18next, Mapbox GL | Typed, component-based UI with instant reload; Tailwind tokens for a consistent design system |
| **Backend** | Python 3.13, Django 5.2, Django REST Framework, Django Channels, Uvicorn (ASGI) | ORM, migrations, auth, CSRF and admin out of the box; DRF for the REST API; ASGI to serve HTTP and WebSockets in one server |
| **Database** | PostgreSQL 17 | Strongly related data (trips, participants, steps, ideas, expenses) that must stay consistent: constraints, transactions, row locking |
| **Real time / cache** | Redis 7.4 | Channels layer for WebSockets, cache for API rate limiting |
| **Infrastructure** | Docker Compose, Nginx | One command to run everything; Nginx as single entry point (one origin, no CORS, static files, WebSocket upgrade) |
| **Other** | Authlib (Google OAuth), drf-spectacular (OpenAPI), vite-plugin-pwa (Workbox) | <!-- TODO if needed --> |

More details: [docs/readme/Architecture.md](docs/readme/Architecture.md), [Backend-DRF.md](docs/readme/Backend-DRF.md), [Frontend.md](docs/readme/Frontend.md), [Websockets.md](docs/readme/Websockets.md).

## Database Schema

![Data model](docs/data-model/model_v5.svg)

Full description of every table, field, constraint and deletion rule: [docs/data-model/model_v5.md](docs/data-model/model_v5.md).

Main tables: `Traveler` (account), `Travel` (trip), `Participation` (who is in which trip), `Step`, `Idea`, `Reaction` (❤️), `Friendship`, `Message`, `Spending` and `SpendingShare` (who owes what).

## Features List

<!-- TODO(each member): add your features and your name. Keep one line per feature. -->

| Feature | Description | Member(s) |
|---|---|---|
| Trips | Create, edit, leave a trip; upcoming / finished; invitation link and join flow | chpasqui (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Itinerary | Steps ordered by date, step detail day by day, nights without a step, add / edit step with a calendar limited to the trip dates | chpasqui (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Map and routing | Interactive map, place search, driving route leg by leg | chpasqui |
| Ideas and votes | Pin ideas, vote, place on a step, choose the accommodation | dle-fur (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Expenses | Expenses, shares, balances and settlements | chpasqui (serializers, views, frontend), scuthber (models, split and settlement services, seeds); tests: both |
| Chat | Real-time chat per trip, unread messages | sydubois, scuthber |
| Notifications | "While you were away": unread messages, new ideas, invitations, friend requests | scuthber |
| Profile and friends | Profile, avatar upload, friends, online status | sydubois (serializers, views, frontend), scuthber (models, seeds); tests: both |
| Authentication | Sign up, log in, Google OAuth | dle-fur |
| Public API | Secured, rate-limited, documented API | dle-fur |
| Design system | Mockups, shared UI components and tokens, every page redesigned for desktop and mobile | chpasqui |
| i18n | French, English, Spanish | chpasqui |
| PWA | Installable, usable offline in read-only mode | chpasqui |
| Error handling | Translated error messages, global error banner | sydubois |

## Modules

<!-- TODO(team): add a block for each of your modules, same table format as below: Type, Members, What it does, Why this module (modules of choice only), How it is implemented, Limits, How to test. -->

| Module | Type | Points | Member(s) |
|---|---|---|---|
| Framework for frontend and backend (React, Django) | Major | 2 | All |
| ORM for the database (Django ORM) | Minor | 1 | All |
| Real-time features (WebSockets) | Major | 2 | scuthber |
| Real-time collaborative features | Minor | 1 | scuthber |
| Notification system | Minor | 1 | scuthber |
| Standard user management and authentication | Major | 2 | sydubois |
| Remote authentication (OAuth 2.0, Google) | Minor | 1 | dle-fur |
| Allow users to interact (chat, profile, friends) | Major | 2 | sydubois, scuthber |
| Public API | Major | 2 | dle-fur |
| Progressive Web App | Minor | 1 | chpasqui |
| Custom-made design system | Minor | 1 | chpasqui |
| Multiple languages support (i18n) | Minor | 1 | chpasqui |
| **Module of choice: map and itinerary routing** | Major | 2 | chpasqui |
| **Module of choice: shared expenses** | Minor | 1 | chpasqui, scuthber |
| **Total** | | **20** | |

---

### Module of choice: map and itinerary routing

| | |
|---|---|
| **Type** | Module of choice · Major · 2 pts |
| **Members** | chpasqui |
| **What it does** | An interactive map of the trip with a marker per step, a place search to add a step, and the driving route between steps with its duration and distance. |
| **Why this module** | A road trip is first a route, and no module of the subject covers maps or routing. It is worth a Major because it combines an external API and its limits, asynchronous computation with caching, a map rendering library and backend validation, and the whole itinerary is built on it. |
| **How it is implemented** | • Mapbox Geocoding for the place search, Directions API for the route, Mapbox GL JS for the map.<br>• One Directions request per pair of consecutive steps, all in parallel, with a cache per pair so unchanged legs are never requested again.<br>• A place that cannot be reached by road gives "no route" for its leg only; the rest of the route is still drawn.<br>• The map frames all the steps automatically and its labels follow the app language.<br>• Steps store mandatory coordinates, validated by the backend. |
| **Limits** | Driving only. Needs a Mapbox token. Not available offline. |
| **How to test** | Create a trip with steps in several cities, then add one that cannot be reached by car: only that leg is missing. |

---

### Module of choice: shared expenses

| | |
|---|---|
| **Type** | Module of choice · Minor · 1 pt |
| **Members** | scuthber (models, services, seeds), chpasqui (API, frontend); tests: both |
| **What it does** | Each participant records what they paid and who it is for; the page shows the total, each person's share, the totals by category, everyone's balance and the transfers to settle up. |
| **Why this module** | Money is the classic source of tension on a trip with friends and no module of the subject covers it. It is a Minor because it is one well-delimited feature, with real logic behind it: exact shares, balances, minimal transfers. |
| **How it is implemented** | • `Spending` and `SpendingShare` models: shares stored in exact cents, so their sum always equals the amount.<br>• `split_equally` gives the remaining cents to the first travellers; `compute_balances` is paid minus owed; `compute_settlements` matches the biggest debtor with the biggest creditor until every balance is zero.<br>• A traveller who leaves keeps their balance, and a payer cannot be deleted (`PROTECT`).<br>• API: serializers, views, summary endpoint, model rules returned as translated error codes, WebSocket events so every open page updates.<br>• Frontend: expenses page, add / edit modal, filters. |
| **Limits** | One currency (CHF). A settlement is shown but not recorded as paid. |
| **How to test** | Add an expense shared with others and watch the balances update, also in a second window. |

---

### Progressive Web App

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **What it does** | Peripl can be installed as an app and stays usable offline in read-only mode: the user stays logged in, finds the trips already visited and sees a clear message when a feature needs the network. |
| **How it is implemented** | • `vite-plugin-pwa` (Workbox) generates the manifest and the service worker; app files are precached, `GET /api/travels…` is network-first.<br>• `AuthProvider` tells a lost network (`TypeError`: keep the user) from an expired session (401: log out); logout clears the saved user and the trips cache.<br>• A `useOnlineNetworkStatus` hook drives an "Offline" banner and placeholders for the map and the place search. |
| **Limits** | Read-only offline. Map unavailable offline. Production needs HTTPS. Firefox desktop cannot install PWAs. |
| **How to test** | `cd srcs/frontend && npx vite build && npx vite preview`, log in, tick "Offline" in the developer tools and reload. |

---

### Custom-made design system

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **What it does** | One consistent look on every page, desktop and mobile, built from reusable components. |
| **How it is implemented** | • Mockups first (`docs/mockups/`), then palette, typography, radii and shadows as Tailwind tokens, with colours per trip, idea type and expense category, checked for contrast.<br>• Components in `shared/ui`: `Button`, `IconButton`, `Card` (with a colour band), `Tag`, `Chip`, `Dot`, `Avatar`, `OnlineStatus`, `Text`, `Heading`, `Input`, `Select`, `Modal`, `OptionsMenu`, `DropdownMenu`, `DatePicker`, `Banner`…<br>• A rounded icon sprite used through `<Icon name="…" />`, and a living catalogue at `/design-system`. |
| **Limits** | No dark mode. |
| **How to test** | Open `/design-system`, then any page in the browser's responsive mode. |

---

### Multiple languages support

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | chpasqui |
| **What it does** | The whole app in French, English and Spanish, with a language switcher remembered between visits. |
| **How it is implemented** | • i18next with one `common.json` per language; every text goes through `t()`, with plurals and interpolation.<br>• Language read from `localStorage`, then the browser, then French; dates, calendar and map labels follow it.<br>• The backend returns error codes, translated by the frontend, so API errors appear in the user's language. |
| **How to test** | Switch the language in the sidebar (desktop) or the account menu (mobile). |

---

<!-- TODO: other modules -->

## Individual Contributions

<!-- TODO(each member): your own section, same structure: role, what you built (backend / frontend / modules), challenges and how you solved them. -->

### Charlotte (`chpasqui`)

**Backend (Django / DRF).** `Travel`, `Step` and `Spending` API: serializers, views filtered by participation, permissions, soft delete of steps, leaving a trip, expense summary and real-time events; business rules and validation (step dates inside the trip, no overlapping steps, lodging rules); camelCase API responses; tests, with Sébastien. The models, seeds and the split / settlement services of these features are Sébastien's.

**Frontend (React / TypeScript).** My trips, new trip and invitation flow; itinerary page, step cards and day-by-day step detail, nights without a step; add / edit step with a calendar limited to the trip dates; expenses page. Tested on Chrome, Firefox and Safari.

**Design.** Mockups of every screen (desktop and mobile), the colour palette and the design system, then the redesign of every page with it (trips, itinerary, ideas, expenses, profile, chat).

**Modules.** Map and itinerary routing, shared expenses (with Sébastien), design system, i18n, PWA.

**Challenges.**
- *Routing:* Mapbox answers "no route" for places not reachable by road; one unreachable step used to erase the whole route. Each leg is now handled separately.
- *Dates:* overlaps and bounds checked both in the calendar and in the models, so that one stay can end the day the next one starts.
- *Offline session:* telling a lost network from an expired session, so the user stays logged in offline.
- *Design system:* moving every page to shared components and tokens without breaking teammates' features, while keeping desktop and mobile consistent.

### David (`dle-fur`)

<!-- TODO -->

### Sébastien (`scuthber`)

**Backend (Django / DRF).** Data model of every app: `Traveler` and friendships, `Travel` / `Participation` / `Step`, `Idea` and votes, `Spending` and shares, chat `Message` with unread tracking. Split and settlement services for expenses, keeping cents exact. The `common` app: base models, error format, permissions and a Faker `seed` command.

**Real-time (WebSockets).** Django Channels with a Redis channel layer: a per-trip consumer and a per-user notification consumer, events sent only after the database commit; live chat, ideas, votes, steps, participants and friend requests. On the frontend, a socket provider with reconnection and `useTravelEvent` / `useNotificationEvent` hooks.

**Notifications.** Travel and idea notifications, the global notification dashboard and its live "while you were away" summary.

**CI/CD.** GitHub Actions for backend and frontend: Ruff lint, tests against a real Redis, missing-migration check, whole-stack smoke test.

**Modules.** Real-time features, real-time collaboration, notification system, user interaction (with Sylvain), shared expenses (with Charlotte).

**Challenges.**
- *Several workers:* two travelers of the same trip can be on different processes; a Redis channel layer makes events reach all of them.
- *Missed events:* Channels does not replay what was sent while a client was offline, so the frontend reloads over REST on every (re)connection, then applies live events.
- *Leaving a trip:* permissions are only checked on connect; a `travel.kick` event now closes the sockets of a traveler who left (code 4403).
- *Async tests:* consumer tests failed with "the connection is closed"; fixed with `TransactionTestCase` and a custom communicator, documented in `Websockets.md`.

### Sylvain (`sydubois`)

**Backend (Django / DRF).** Authentication, profile, friendship and chat API views, following Django and DRF standards whenever possible.

**Frontend (React / TypeScript).** Authentication, profile management, friendships and chat interfaces. Sébastien handled the WebSocket implementation.

**Modules.** Standard user management and authentication; user interaction (with Sébastien).

**Challenges.**

- **Error handling:** Reviewed and harmonised error handling across all features, working on `parseResponse.ts` and `errors.ts`, using `drf-standardized-errors` and `Accept-Language` for consistent, translated API errors.
- **Consistency:** Reusing framework standards to avoid unnecessary custom implementations and keep the code maintainable.

## Resources

<!-- TODO(team): add the references you actually used. -->

- [Django](https://docs.djangoproject.com/en/5.2/), [Django REST Framework](https://www.django-rest-framework.org/), [Django Channels](https://channels.readthedocs.io/)
- [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/), [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [i18next](https://www.i18next.com/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [PostgreSQL](https://www.postgresql.org/docs/17/), [Redis](https://redis.io/docs/), [Nginx](https://nginx.org/en/docs/)

### Use of AI

<!-- TODO(each member): say honestly what you used AI for, and for which parts. -->

- **Charlotte (chpasqui):** used Claude to explore design directions and build the mockups, to get explanations of concepts (React, Tailwind, Django), and to review code. At the very end of the project, it also generated the landing page for visitors, helped update the `/design-system` catalogue page to the final components, and sped up a few repetitive changes (translations, renaming, style harmonisation). The rest of my code I wrote myself; every AI-assisted change was reviewed and tested before I committed it.

## Known limitations

<!-- TODO(team) -->

- **Itinerary**: two steps on the same dates are ordered by creation; the API supports a manual order (`priority`) but the interface does not offer it yet.
- **Itinerary**: a step must stay within the trip dates; to add a step outside them, the trip dates have to be changed first (the trip is not extended automatically).
- **Routing**: driving routes only, no walking, cycling or public transport.
- **Ideas**: choosing an accommodation cannot be undone yet (the idea can be deleted instead).
- **Steps**: a deleted step goes to the trash, but there is no screen to restore it yet.
- **Expenses**: one currency (CHF), and a settlement is shown but cannot be marked as paid.
- **Offline**: read-only, and the map is not available offline (Mapbox tiles cannot be cached).
