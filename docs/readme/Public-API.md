# Public API

Detailed version of the module described in the [README](../../README.md#public-api), including how to inspect the rate-limiting counters in Redis. Author: dle-fur.

| | |
|---|---|
| **Type** | Major · 2 pts |
| **Members** | dle-fur |
| **Why this module** | Lets the trip data be used outside the website (scripts, other tools), and made us secure and document our API properly. |
| **What it does** | An external program (script, Postman…) can read and modify **trips**, **steps**, **ideas** and **expenses** without a browser, with an **API key** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), with rate limiting and public Swagger documentation. |
| **How it is implemented** | • **The key**: `rest_framework.authtoken` (a random 40-character key per user). `POST /api/auth/token/` (`ApiTokenView`, no authentication needed) exchanges username + password for the key, then sent as `Authorization: Token <key>`. No CSRF needed: another site cannot add this header.<br>• **Per-view access**: `PublicApiMixin` (`common/mixins.py`) adds `TokenAuthentication` (after `SessionAuthentication`) and rate limiting, only on the views that use it. The others (profile, friends, votes, choosing an accommodation…) stay reserved for the website.<br>• **Rate limiting** (`ScopedRateThrottle`): `public_api` = **1000 requests/minute per user**; `auth_token` = **5 attempts/minute per IP** (anti brute-force). `NUM_PROXIES: 1`: the IP is read behind Nginx and cannot be spoofed with a fake `X-Forwarded-For`.<br>• **Documentation**: drf-spectacular generates the OpenAPI 3 schema (`/api/schema/`) and Swagger (`/api/docs/`), freely accessible; the `public_endpoints_only` hook shows **only** the public routes. |
| **Limits** | Keys are stored in plain text and never expire (how `authtoken` works); they are revoked by deleting them in the admin. |
| **How to test** | Open `https://peripl.app:8443/api/docs`, get a key with an existing account (`POST /api/auth/token/`), then click **Authorize** and enter `Token <key>`. Brute-force and rate-limiting checks: see the commands below. |

```bash
# Test 1: brute-force (6th attempt refused)
docker compose exec redis redis-cli -n 1 FLUSHDB
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://peripl.app:8443/api/auth/token/ \
    -H "Content-Type: application/json" -d '{"username": "<username>", "password": "wrong"}'
done
docker compose exec redis redis-cli -n 1 KEYS '*'
docker compose exec redis redis-cli -n 1 TTL ':1:throttle_auth_token_<ip>'
docker compose exec backend python manage.py shell -c "from django.core.cache import cache; print(len(cache.get('throttle_auth_token_<ip>') or []))"

# Test 2: rate limiting (1001st request refused)
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
