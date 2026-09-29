# urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from .views import (
    ApiHealthView,
    CsrfTokenView,
    LoginView,
    LogoutView,
    MeView,
    TravelerCreateView,
    TravelerPingView,
    TravelerUpdatePasswordView,
    TravelerUpdateProfilePictureView,
    TravelerUpdateView,
)

urlpatterns = [
    path("", ApiHealthView.as_view(), name="api-health"),
    path("auth/csrf/", CsrfTokenView.as_view(), name="auth-csrf"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("travelers/create/", TravelerCreateView.as_view(), name="traveler-create"),
    path("ping/", TravelerPingView.as_view(), name="traveler-ping"),
    path(
        "travelers/update-password/",
        TravelerUpdatePasswordView.as_view(),
        name="traveler-update-password",
    ),
    path(
        "travelers/update-profile-picture/",
        TravelerUpdateProfilePictureView.as_view(),
        name="traveler-update-profile-picture",
    ),
    path("travelers/update/", TravelerUpdateView.as_view(), name="traveler-update"),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)
