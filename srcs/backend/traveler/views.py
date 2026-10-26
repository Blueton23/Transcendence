from typing import ClassVar

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
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Friendship, Status
from .schema import api_token_schema
from .serializers import (
    LoginSerializer,
    TravelerCreateSerializer,
    TravelerSerializer,
    TravelerUpdatePasswordSerializer,
    TravelerUpdateProfilePictureSerializer,
    TravelerUpdateSerializer,
)

Traveler = get_user_model()


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
                "code": "traveler_api_running",
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

        traveler.set_password(
            serializer.validated_data["password"],
        )
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

        serializer = TravelerUpdateSerializer(
            traveler,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        traveler = serializer.save()

        return Response(
            {
                "traveler": TravelerUpdateSerializer(
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
            {
                "code": "password_updated",
                "detail": "Password updated successfully.",
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        traveler = authenticate(
            request=request,
            username=username,
            password=password,
        )

        if traveler is None:
            return Response(
                {
                    "code": "invalid_credentials",
                    "detail": "Invalid username or password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
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
            return Response(
                {
                    "code": "invalid_credentials",
                    "detail": "Invalid username or password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
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
            {
                "code": "logout_success",
                "message": "Logged out successfully.",
            },
            status=status.HTTP_200_OK,
        )


class CsrfTokenView(APIView):
    permission_classes: ClassVar[list] = [AllowAny]

    def get(self, request: Request) -> Response:
        get_token(request)

        return Response(
            {
                "code": "csrf_initialized",
                "message": "CSRF protection initialized successfully.",
            },
            status=status.HTTP_200_OK,
        )


class FriendshipSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response({"travelers": []})

        travelers = (
            Traveler.objects.filter(Q(username__icontains=query))
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
        user = request.user
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {
                    "code": "user_id_required",
                    "detail": "User ID is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return Response(
                {
                    "code": "invalid_user_id",
                    "detail": "Invalid user ID.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target = Traveler.objects.get(pk=user_id)
        except Traveler.DoesNotExist:
            return Response(
                {
                    "code": "user_not_found",
                    "detail": "User not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if target.pk == user.pk:
            return Response(
                {
                    "code": "cannot_friend_yourself",
                    "detail": "You cannot send a friend request to yourself.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user1_id = min(user.pk, target.pk)
        user2_id = max(user.pk, target.pk)

        if Friendship.objects.filter(
            user1_id=user1_id,
            user2_id=user2_id,
        ).exists():
            return Response(
                {
                    "code": "relationship_exists",
                    "detail": "A friendship or friend request already exists.",
                },
                status=status.HTTP_409_CONFLICT,
            )

        try:
            friendship = Friendship.objects.create(
                user1_id=user1_id,
                user2_id=user2_id,
                requested_by=user,
                status=Status.PENDING,
            )
        except IntegrityError:
            return Response(
                {
                    "code": "relationship_exists",
                    "detail": "A friendship or friend request already exists.",
                },
                status=status.HTTP_409_CONFLICT,
            )

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
        except Friendship.DoesNotExist:
            return Response(
                {
                    "code": "request_not_found",
                    "detail": "Friend request not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.pk == friendship.requested_by_id:
            return Response(
                {
                    "code": "cannot_accept_own_request",
                    "detail": "You cannot accept your own friend request.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.pk not in {
            friendship.user1_id,
            friendship.user2_id,
        }:
            return Response(
                {
                    "code": "not_request_participant",
                    "detail": "You are not a participant in this friend request.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        friendship.status = Status.ACCEPTED
        friendship.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "code": "friendship_request_accepted",
                "detail": "Friend request accepted successfully.",
            },
            status=status.HTTP_200_OK,
        )


class FriendshipRemoveView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def delete(self, request: Request, friendship_id: int) -> Response:
        try:
            friendship = Friendship.objects.get(
                pk=friendship_id,
            )
        except Friendship.DoesNotExist:
            return Response(
                {
                    "code": "friendship_not_found",
                    "detail": "Friendship not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.pk not in {
            friendship.user1_id,
            friendship.user2_id,
        }:
            return Response(
                {
                    "code": "not_friendship_participant",
                    "detail": "You are not a participant in this friendship.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        friendship.delete()

        return Response(
            {
                "code": "friendship_removed",
                "detail": "Friendship removed successfully.",
            },
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
