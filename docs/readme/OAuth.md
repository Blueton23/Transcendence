# Remote authentication (OAuth 2.0, Google)

Detailed version of the module described in the [README](../../README.md#remote-authentication-oauth-20-google), with step-by-step checks. Author: dle-fur.

| | |
|---|---|
| **Type** | Minor · 1 pt |
| **Members** | dle-fur |
| **Why this module** | Friends often join from an invitation link: signing in with an account they already have removes the step of creating a new password. |
| **What it does** | A "Continue with Google" button on the login and sign-up pages. The user signs in **with Google** (the site never sees their Google password) and comes back **logged in**. Their `Traveler` account is created on the first login, then found again on the next ones. The login ends like a classic one (Django's `login()`, session cookie), so the rest of the app sees no difference. |
| **How it is implemented** | • **Google Cloud Console**: "Web application" OAuth client, redirect URI `https://peripl.app:8443/api/auth/google/callback/`; credentials in the `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`).<br>• **Authlib handles the protocol**: `state` (anti-CSRF, single use, expires after 1 h), `nonce` (anti-replay), exchange of the `code` with the `client_secret`, verification of the `id_token` signature with Google's public keys.<br>• **Our code handles the account** (`GoogleLoginView`, `GoogleCallbackView` in `traveler/views.py`): `email_verified` required; account found by email, otherwise created **without a password** (generated username `user`, then `user1` if taken); a **classic account with the same email is refused**, since classic sign-up does not verify the email and an attacker could otherwise pre-create an account with the victim's email; any failure redirects to `/login?error=google` or `/login?error=google_email_exists`.<br>• **Frontend**: the button performs a real navigation (`window.location.href = "/api/auth/google/"`). |
| **Limits** | The account is found by email, not by Google's stable identifier (`sub`), which would allow an extra check. |
| **How to test** | In a **private window**, with the developer tools open on **Network** (`make logs-backend` to follow the logs): see the three steps below. |

**1. The start.** Click **"Continue with Google"**, **don't choose an account yet**, and run:

```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; s = Session.objects.order_by('-expire_date').first(); print(s.get_decoded())"
```

Expected: the `google/` request answered `302`, and its `Location` header contains `state=…` and `nonce=…`, **the same values** as in the Django session.

**2. The login.** Choose your Google account: `302` redirect to `/profile`.

**3. The account.** In **Application** → **Cookies** → `https://peripl.app:8443`, copy the value of `sessionid`, then run:

```bash
docker compose exec backend python manage.py shell -c "from django.contrib.sessions.models import Session; from traveler.models import Traveler; s = Session.objects.get(session_key='<sessionid>').get_decoded(); t = Traveler.objects.get(pk=s['_auth_user_id']); print(t.username, t.email, t.first_name, t.last_name, t.has_usable_password())"
```

Expected: for example `david.lf david.lf@gmail.com David Lf False`. The browser cookie belongs to a Django session opened for this account, created from Google, **without a password** (`False`).
