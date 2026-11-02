import logging
from typing import ClassVar

import requests
from authlib.integrations.django_client import OAuth, OAuthError
from django.conf import settings
from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    logout,
    update_session_auth_hash,
)
from django.db import IntegrityError
from django.db.models import Q
from django.middleware.csrf import get_token
from django.shortcuts import redirect
from drf_spectacular.utils import extend_schema
from joserfc.errors import JoseError
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Friendship, Status
from .schema import api_token_schema
from .serializers import (
    FriendshipCreateSerializer,
    LoginSerializer,
    TravelerCreateSerializer,
    TravelerSerializer,
    TravelerUpdatePasswordSerializer,
    TravelerUpdateProfilePictureSerializer,
)

Traveler = get_user_model()

logger = logging.getLogger(__name__)


class ApiHealthView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "status": "ok",
            }
        )


class TravelerPingView(APIView):
    def get(self, request: Request) -> Response:
        return Response(
            {
                "message": "The traveler API is running.",
                "status": "ok",
            }
        )


class TravelerCreateView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = TravelerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        traveler = Traveler(
            username=serializer.validated_data["username"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data["last_name"],
            email=serializer.validated_data["email"],
        )

        traveler.set_password(serializer.validated_data["password"])
        traveler.save()

        return Response(
            {
                "traveler": TravelerSerializer(
                    traveler,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TravelerUpdateView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def patch(self, request: Request) -> Response:
        traveler = request.user

        serializer = TravelerSerializer(
            traveler,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        traveler = serializer.save()

        return Response(
            {
                "traveler": TravelerSerializer(
                    traveler,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class TravelerUpdateProfilePictureView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        traveler = request.user

        serializer = TravelerUpdateProfilePictureSerializer(
            traveler,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        traveler = serializer.save()

        return Response(
            {
                "traveler": TravelerSerializer(
                    traveler,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class TravelerUpdatePasswordView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = TravelerUpdatePasswordSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )
        serializer.is_valid(raise_exception=True)

        password_change_form = serializer.validated_data["_password_change_form"]

        password_change_form.save()
        update_session_auth_hash(request, request.user)

        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        traveler = authenticate(
            request=request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if traveler is None:
            raise AuthenticationFailed(
                "Invalid username or password.",
                code="invalid_credentials",
            )

        login(request, traveler)

        return Response(
            {
                "traveler": TravelerSerializer(
                    traveler,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Auth"])
@api_token_schema
class ApiTokenView(APIView):
    authentication_classes: ClassVar[list] = []
    permission_classes: ClassVar[list] = [AllowAny]
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "auth_token"
    public_api = True

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        traveler = authenticate(
            request=request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if traveler is None:
            raise AuthenticationFailed(
                "Invalid username or password.",
                code="invalid_credentials",
            )

        token, _ = Token.objects.get_or_create(user=traveler)

        return Response(
            {
                "token": token.key,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "traveler": TravelerSerializer(
                    request.user,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        logout(request)

        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


class CsrfTokenView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def get(self, request: Request) -> Response:
        get_token(request)

        return Response(
            {"message": "CSRF protection initialized successfully."},
            status=status.HTTP_200_OK,
        )


class FriendshipSearchView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response({"travelers": []})

        travelers = (
            Traveler.objects.filter(
                username__icontains=query,
            )
            .exclude(pk=request.user.pk)
            .order_by("username")[:10]
        )

        return Response(
            {
                "travelers": TravelerSerializer(
                    travelers,
                    many=True,
                    context={"request": request},
                ).data
            }
        )


class FriendshipRequestView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = FriendshipCreateSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user_id = serializer.validated_data["user_id"]

        try:
            target = Traveler.objects.get(pk=user_id)
        except Traveler.DoesNotExist as exc:
            raise NotFound(
                "User not found.",
                code="user_not_found",
            ) from exc

        if target.pk == user.pk:
            raise ValidationError(
                "You cannot send a friend request to yourself.",
                code="cannot_friend_yourself",
            )

        user1_id = min(user.pk, target.pk)
        user2_id = max(user.pk, target.pk)

        try:
            friendship = Friendship.objects.create(
                user1_id=user1_id,
                user2_id=user2_id,
                requested_by=user,
                status=Status.PENDING,
            )
        except IntegrityError as exc:
            raise ValidationError(
                "A friendship or friend request already exists.",
                code="relationship_exists",
            ) from exc

        return Response(
            {
                "friendship": friendship.id,
            },
            status=status.HTTP_201_CREATED,
        )


class FriendshipRequestsView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        friendships = (
            Friendship.objects.filter(
                status=Status.PENDING,
            )
            .filter(
                Q(user1=request.user) | Q(user2=request.user),
            )
            .exclude(requested_by=request.user)
            .select_related("user1", "user2", "requested_by")
            .order_by("-created_at")
        )

        requests = []

        for friendship in friendships:
            user1 = friendship.requested_by

            requests.append(
                {
                    "id": friendship.id,
                    "traveler": TravelerSerializer(
                        user1,
                        context={"request": request},
                    ).data,
                    "created_at": friendship.created_at,
                }
            )

        return Response(
            {"requests": requests},
            status=status.HTTP_200_OK,
        )


class FriendshipAcceptView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request: Request, friendship_id: int) -> Response:
        try:
            friendship = Friendship.objects.select_related(
                "user1",
                "user2",
                "requested_by",
            ).get(
                pk=friendship_id,
                status=Status.PENDING,
            )
        except Friendship.DoesNotExist as exc:
            raise NotFound(
                "Friend request not found.",
                code="friend_request_not_found",
            ) from exc

        if request.user.pk == friendship.requested_by_id:
            raise PermissionDenied(
                "You cannot accept your own friend request.",
                code="cannot_accept_own_request",
            )

        if request.user.pk not in {
            friendship.user1_id,
            friendship.user2_id,
        }:
            raise PermissionDenied(
                "You are not a participant in this friend request.",
                code="not_friend_request_participant",
            )

        friendship.status = Status.ACCEPTED
        friendship.save(update_fields=["status", "updated_at"])

        return Response(
            {"detail": "Friend request accepted successfully."},
            status=status.HTTP_200_OK,
        )


class FriendshipRemoveView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def delete(self, request: Request, friendship_id: int) -> Response:
        try:
            friendship = Friendship.objects.get(
                pk=friendship_id,
            )
        except Friendship.DoesNotExist as exc:
            raise NotFound(
                "Friendship not found.",
                code="friendship_not_found",
            ) from exc

        if request.user.pk not in {
            friendship.user1_id,
            friendship.user2_id,
        }:
            raise PermissionDenied(
                "You are not a participant in this friendship.",
                code="not_friendship_participant",
            )

        friendship.delete()

        return Response(
            {"detail": "Friendship removed successfully."},
            status=status.HTTP_200_OK,
        )


class FriendshipListView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        friendships = (
            Friendship.objects.filter(
                status=Status.ACCEPTED,
            )
            .filter(
                Q(user1=request.user) | Q(user2=request.user),
            )
            .select_related("user1", "user2")
            .order_by("created_at")
        )

        friendship_list = []

        for friendship in friendships:
            friend = (
                friendship.user2
                if friendship.user1_id == request.user.pk
                else friendship.user1
            )

            friendship_list.append(
                {
                    "friendship_id": friendship.id,
                    "friend": TravelerSerializer(
                        friend,
                        context={"request": request},
                    ).data,
                }
            )

        return Response(
            {"friendships": friendship_list},
            status=status.HTTP_200_OK,
        )


# ===================================================================#

# Connexion avec Token (swagger)


@extend_schema(tags=["Auth"])
@api_token_schema
class ApiTokenView(APIView):
    authentication_classes: ClassVar[list] = []
    permission_classes: ClassVar[list] = [AllowAny]
    throttle_classes: ClassVar[list] = [ScopedRateThrottle]
    throttle_scope = "auth_token"
    public_api = True

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        traveler = authenticate(
            request=request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if traveler is None:
            return Response(
                {"detail": "Identifiants invalides."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=traveler)

        return Response(
            {
                "token": token.key,
            },
            status=status.HTTP_200_OK,
        )


# ===================================================================#


# Client OAuth Google : Authlib lit la configuration de Google
oauth = OAuth()
oauth.register(
    "google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


# Démarre la connexion Google (OAuth 2.0)
# Authlib crée le state et le nonce, les garde en session, puis redirige
class GoogleLoginView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def get(self, request: Request):
        return oauth.google.authorize_redirect(
            request,
            settings.GOOGLE_REDIRECT_URI,
            prompt="select_account",
        )


# Termine la connexion Google
class GoogleCallbackView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def get(self, request: Request):
        try:
            token = oauth.google.authorize_access_token(request)
        except (OAuthError, JoseError, requests.RequestException) as error:
            logger.warning("Google OAuth : connexion échouée : %s", error)
            return redirect("/login?error=google")

        userinfo = token["userinfo"]

        if not userinfo.get("email_verified"):
            logger.warning("Google OAuth : email non vérifié par Google")
            return redirect("/login?error=google")

        traveler = Traveler.objects.filter(email__iexact=userinfo["email"]).first()

        if traveler is None:
            traveler = Traveler.objects.create_user(
                username=generate_username(userinfo["email"]),
                email=userinfo["email"],
                first_name=userinfo.get("given_name", ""),
                last_name=userinfo.get("family_name", ""),
            )
        elif traveler.has_usable_password():
            logger.warning("Google OAuth : email déjà utilisé par un compte classique")
            return redirect("/login?error=google_email_exists")

        login(request, traveler)
        return redirect("/profile")


def generate_username(email: str) -> str:
    base = email.split("@")[0]
    username = base
    number = 1

    while Traveler.objects.filter(username=username).exists():
        username = f"{base}{number}"
        number += 1

    return username
