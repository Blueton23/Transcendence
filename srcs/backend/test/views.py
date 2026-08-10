from django.http import JsonResponse
from .models import User
import json


def create_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Méthode non autorisée"},
            status=405,
        )

    data = json.loads(request.body)

    user = User.objects.create(
        username=data["username"],
    )

    return JsonResponse({
        "id": user.id,
        "username": user.username,
    })