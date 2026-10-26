# commande: python3 demo_api.py

import getpass
import sys
from decimal import Decimal, InvalidOperation

import requests

API = "http://localhost:8080/api"

TRAVEL = {
    "title": "Démo",
    "startDate": "2026-11-01",
    "endDate": "2026-11-03",
}
STEP = {
    "localisation": "Renens (VD), Suisse",
    "startDate": "2026-11-01",
    "endDate": "2026-11-03",
    "latitude": "46.5390000",
    "longitude": "6.5880000",
}
IDEA = {
    "title": "Visite de l'école 42",
    "type": "s",
    "localisation": "42 Lausanne, Rue de Lausanne 64, 1020 Renens",
    "url": "https://42lausanne.ch",
    "startDate": "2026-11-02",
    "endDate": "2026-11-02",
    "latitude": "46.532323",
    "longitude": "6.591994",
}


def get_token() -> str:
    """Échange username + mot de passe contre la clé API."""
    username = input("Username : ")
    password = getpass.getpass("Mot de passe : ")
    response = requests.post(
        f"{API}/auth/token/",
        json={"username": username, "password": password},
        timeout=10,
    )
    if response.status_code != 200:
        sys.exit(f"Clé refusée ({response.status_code}) : {response.json()}")
    return response.json()["token"]


def same(sent: str, stored: object) -> bool:
    """Compare une valeur envoyée et la valeur relue (45.764 == 45.7640000)."""
    try:
        return Decimal(str(sent)) == Decimal(str(stored))
    except InvalidOperation:
        return sent == stored


def check(label: str, sent: dict, stored: dict) -> None:
    """Affiche chaque champ envoyé à côté de sa valeur relue dans l'API."""
    print(f"\n{label}")
    for field, value in sent.items():
        mark = "✅" if same(value, stored[field]) else "❌"
        print(f"  {mark} {field:12} envoyé {value!s:16} relu {stored[field]}")


def post(session: requests.Session, url: str, body: dict) -> dict:
    """POST qui arrête la démo avec le message de l'API si la donnée est refusée."""
    response = session.post(url, json=body, timeout=10)
    if response.status_code != 201:
        sys.exit(f"Refusé ({response.status_code}) : {response.json()}")
    return response.json()


def main() -> None:
    session = requests.Session()
    session.headers["Authorization"] = f"Token {get_token()}"

    # 1. Création : voyage -> étape dans le voyage -> idée placée sur l'étape
    travel_id = post(session, f"{API}/travels/", TRAVEL)["id"]
    url = f"{API}/travels/{travel_id}"
    step_id = post(session, f"{url}/steps/", STEP)["id"]
    idea_id = post(session, f"{url}/ideas/", {**IDEA, "stepId": step_id})["id"]
    print(f"Créés : voyage {travel_id}, étape {step_id}, idée {idea_id}")

    # 2. Vérification : on relit chaque objet avec l'API
    check("Voyage", TRAVEL, session.get(f"{url}/", timeout=10).json())
    step = session.get(f"{url}/steps/{step_id}/", timeout=10).json()
    check("Étape", STEP, step)
    idea = session.get(f"{url}/ideas/{idea_id}/", timeout=10).json()
    check("Idée", {**IDEA, "stepId": step_id}, idea)
    print(f"\nL'idée est placée sur {step['localisation']}, status {idea['status']}")


if __name__ == "__main__":
    main()
