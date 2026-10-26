from typing import ClassVar

from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.realtime import broadcast, travel_group
from travel.models import Participation, ParticipationStatus
from travel.permissions import IsTravelParticipant

from .models import Message
from .serializers import MessageSerializer


class ChatParticipationMixin:
    """Reading the chat is open to ACCEPTED and LEFT members: a member who
    left keeps the history. Writing stays ACCEPTED only (IsTravelParticipant).
    """

    def get_participation(self):
        participation = Participation.objects.filter(
            travel_id=self.kwargs["travel_id"],
            traveler=self.request.user,
            status__in=[ParticipationStatus.ACCEPTED, ParticipationStatus.LEFT],
        ).first()
        if participation is None:
            raise PermissionDenied("Vous n'avez pas accès à ce voyage.")
        return participation


def broadcast_message(message):
    payload = MessageSerializer(message).data
    # "is_unread" depends on who reads it: each client works it out.
    del payload["is_unread"]
    broadcast(travel_group(message.travel_id), "chat.message", payload)


class TravelMessageListCreateView(ChatParticipationMixin, APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsTravelParticipant()]
        return [IsAuthenticated()]

    def get(self, request, travel_id):
        participation = self.get_participation()
        messages = (
            Message.objects.filter(travel_id=travel_id)
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
        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = Message(
            travel_id=travel_id,
            traveler=request.user,
            body=serializer.validated_data["body"],
        )
        message.save()
        broadcast_message(message)

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class TravelUnreadCountView(ChatParticipationMixin, APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request, travel_id):
        participation = self.get_participation()
        count = Message.objects.unread_for(participation).count()
        return Response({"unread_count": count})


class TravelMarkReadView(ChatParticipationMixin, APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request, travel_id):
        self.get_participation().mark_read()
        return Response({"success": True})
