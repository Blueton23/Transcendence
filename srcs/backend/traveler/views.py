from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    TravelerCreateSerializer,
    TravelerUpdateSerializer,
)


Traveler = get_user_model()


class ApiHealthView(APIView):
    permission_classes = [AllowAny]

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
                "message": "[temp]Traveler API is running",
                "status": "ok",
            }
        )


class TravelerCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = TravelerCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        traveler = Traveler(
            username=serializer.validated_data["username"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data["last_name"],
            email=serializer.validated_data["email"],
        )

        traveler.set_unusable_password()
        traveler.save()

        return Response(
            {
                "traveler": TravelerCreateSerializer(traveler).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TravelerUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, pk: int) -> Response:

        try:
            traveler = Traveler.objects.get(pk=pk)
        except Traveler.DoesNotExist:
            return Response(
                {
                    "detail": "Utilisateur introuvable.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.id != traveler.id:
            return Response(
                {
                    "detail": "Vous ne pouvez modifier que votre propre profil.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TravelerUpdateSerializer(
            traveler,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        traveler = serializer.save()

        return Response(
            {
                "traveler": TravelerUpdateSerializer(traveler).data,
            },
            status=status.HTTP_200_OK,
        )