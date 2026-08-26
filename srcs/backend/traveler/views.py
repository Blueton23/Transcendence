from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import TravelerCreateSerializer


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

        # Temporaire : le mot de passe sera traité plus tard.
        traveler.set_unusable_password()

        traveler.save()

        return Response(
            {
                "traveler": TravelerCreateSerializer(traveler).data,
            },
            status=status.HTTP_201_CREATED,
        )