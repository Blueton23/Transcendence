from django.contrib import admin
from django.urls import include, include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("traveler.urls")),
    path("api/travels/", include("travel.urls")),
]
