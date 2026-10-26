from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Documentation de l'API publique (accès libre, sans authentification)
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
    path("api/", include("traveler.urls")),
    path("api/travels/", include("travel.urls")),
    path("api/travels/", include("idea.urls")),
    path("api/travels/", include("chat.urls")),
]
