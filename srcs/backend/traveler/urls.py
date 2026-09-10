# urls.py

from django.urls import path

from .views import (
    ApiHealthView,
    CsrfTokenView,
    LoginView,
    LogoutView,
    MeView,
    TravelerCreateView,
    TravelerPingView,
    TravelerUpdateView,
)

urlpatterns = [
    path("", ApiHealthView.as_view(), name="api-health"),
    path("auth/csrf/", CsrfTokenView.as_view(), name="auth-csrf"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("travelers/", TravelerCreateView.as_view(), name="traveler-create"),
    path("ping/", TravelerPingView.as_view(), name="traveler-ping"),
    path("travelers/<int:pk>/", TravelerUpdateView.as_view(), name="traveler-update"),
]
