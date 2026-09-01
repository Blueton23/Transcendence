#urls.py

from django.urls import path

from .views import (
    ApiHealthView,
    TravelerCreateView,
    TravelerPingView,
    TravelerUpdateView,
    LoginView,
    MeView,
    LogoutView,
    CsrfTokenView,
)

urlpatterns = [
    path("", ApiHealthView.as_view(), name="api-health"),

    path("ping/", TravelerPingView.as_view(), name="traveler-ping"),

    path(
        "travelers/",
        TravelerCreateView.as_view(),
        name="traveler-create",
    ),

    path(
        "travelers/<int:pk>/",
        TravelerUpdateView.as_view(),
        name="traveler-update",
    ),

    path( "auth/login/", LoginView.as_view(), name="auth-login", ),

    path( "auth/me/", MeView.as_view(), name="auth-me", ),

    path( "auth/logout/", LogoutView.as_view(), name="auth-logout", ),

    path(
    "auth/csrf/",
    CsrfTokenView.as_view(),
    name="auth-csrf", ),

    
]