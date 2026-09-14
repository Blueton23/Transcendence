from rest_framework.permissions import BasePermission

from .models import Participation, ParticipationStatus


class IsTravelParticipant(BasePermission):
    def has_permission(self, request, view):
        travel_id = view.kwargs.get("travel_id")
        if travel_id is None:
            return True
        return Participation.objects.filter(
            travel_id=travel_id,
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        ).exists()
