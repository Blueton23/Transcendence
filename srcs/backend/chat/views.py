from typing import ClassVar

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from travel.models import Participation, ParticipationStatus, Travel

from .models import Message
from .serializers import MessageSerializer


class TravelMessageListCreateView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get_travel(self, travel_id):
        return get_object_or_404(Travel, pk=travel_id)

    def get_participation(self, travel, user):
        return Participation.objects.filter(
            travel=travel,
            traveler=user,
            status__in=[
                ParticipationStatus.ACCEPTED,
                ParticipationStatus.LEFT,
            ],
        ).first()

    def get(self, request, travel_id):
        travel = self.get_travel(travel_id)
        participation = self.get_participation(travel, request.user)

        if participation is None:
            return Response(
                {"detail": "Tu n'as pas accès à ce voyage."},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = (
            Message.objects.filter(
                travel=travel,
            )
            .select_related("traveler")
            .order_by("created_at", "id")
        )

        serializer = MessageSerializer(
            messages,
            many=True,
            context={"request": request, "participation": participation},
        )
        return Response(serializer.data)

    def post(self, request, travel_id):
        travel = self.get_travel(travel_id)

        is_active_member = Participation.objects.filter(
            travel=travel,
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        ).exists()

        if not is_active_member:
            return Response(
                {"detail": "Tu dois être membre du voyage pour envoyer un message."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = Message(
            travel=travel,
            traveler=request.user,
            body=serializer.validated_data["body"],
        )
        message.save()

        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )


class TravelUnreadCountView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request, travel_id):

        participation = Participation.objects.filter(
            travel_id=travel_id,
            traveler=request.user,
            status__in=[
                ParticipationStatus.ACCEPTED,
                ParticipationStatus.LEFT,
            ],
        ).first()

        if participation is None:
            return Response(
                {"detail": "Vous n'avez pas accès à ce voyage.."},
                status=403,
            )

        count = Message.objects.unread_for(participation).count()

        return Response({"unread_count": count})


class TravelMarkReadView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request, travel_id):

        participation = Participation.objects.filter(
            travel_id=travel_id,
            traveler=request.user,
            status__in=[
                ParticipationStatus.ACCEPTED,
                ParticipationStatus.LEFT,
            ],
        ).first()

        if participation is None:
            return Response(
                {"detail": "Vous n'avez pas accès à ce voyage."},
                status=403,
            )

        participation.mark_read()

        return Response({"success": True})
