from channels.db import database_sync_to_async

from common.consumers import (
    CLOSE_NOT_AUTHENTICATED,
    CLOSE_NOT_PARTICIPANT,
    GroupEventConsumer,
)
from common.realtime import send_on_commit, travel_group

from .models import Participation, ParticipationStatus

__all__ = [
    "CLOSE_NOT_AUTHENTICATED",
    "CLOSE_NOT_PARTICIPANT",
    "TravelConsumer",
    "kick_from_travel",
]


def kick_from_travel(travel_id, traveler_id):
    """Closes every open socket of `traveler_id` on this travel (after the
    commit). The permission is only checked at connect, so without this a
    traveler who left would keep receiving the travel's events."""
    send_on_commit(
        travel_group(travel_id),
        {"type": "travel.kick", "traveler_id": traveler_id},
    )


class TravelConsumer(GroupEventConsumer):
    """Live channel of a travel: joins `travel_<id>` and forwards every event
    broadcast to that group to the client.

    The permission is checked at connect, with the same rule as
    IsTravelParticipant (ACCEPTED only, not LEFT). A traveler who leaves
    afterwards is closed by `kick_from_travel`.
    """

    async def get_group_name(self):
        travel_id = self.scope["url_route"]["kwargs"]["travel_id"]
        if not await self.is_participant(travel_id, self.scope["user"]):
            await self.reject(CLOSE_NOT_PARTICIPANT)
            return None
        return travel_group(travel_id)

    async def travel_kick(self, event):
        # Internal event (no "payload"): never forwarded to the client.
        if event["traveler_id"] != self.scope["user"].id:
            return
        # Leave the group first so nothing else is sent to a closing socket.
        await self.leave_group()
        await self.close(code=CLOSE_NOT_PARTICIPANT)

    @database_sync_to_async
    def is_participant(self, travel_id, user):
        return Participation.objects.filter(
            travel_id=travel_id,
            traveler=user,
            status=ParticipationStatus.ACCEPTED,
        ).exists()
