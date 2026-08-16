from django.contrib import admin
from django.http import JsonResponse
from django.urls import path


def api_test(request):
    return JsonResponse(
        {
            "message": "L'API Django fonctionne",
            "status": "ok",
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_test, name="api-test"),
]
