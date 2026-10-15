# urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from .views import (
    ApiHealthView,
    CsrfTokenView,
    FriendshipAcceptView,
    FriendshipListView,
    FriendshipRemoveView,
    FriendshipRequestsView,
    FriendshipRequestView,
    FriendshipSearchView,
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
    path(
        "friendships/search/", FriendshipSearchView.as_view(), name="friendship-search"
    ),
    path(
        "friendships/request/",
        FriendshipRequestView.as_view(),
        name="friendship-request",
    ),
    path(
        "friendships/requests/",
        FriendshipRequestsView.as_view(),
        name="friendship-requests",
    ),
    path(
        "friendships/<int:friendship_id>/accept/",
        FriendshipAcceptView.as_view(),
        name="friendship-accept",
    ),
    path(
        "friendships/<int:friendship_id>/remove/",
        FriendshipRemoveView.as_view(),
        name="friendship-remove",
    ),
    path(
        "friendships/",
        FriendshipListView.as_view(),
        name="friendship-list",
    ),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)
