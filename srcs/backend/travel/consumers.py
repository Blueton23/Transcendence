from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from common.realtime import travel_group

from .models import Participation, ParticipationStatus

# Custom close codes, sent after accept() so the browser sees them instead of
# a generic 1006: the frontend must not reconnect on these.
CLOSE_NOT_AUTHENTICATED = 4401
CLOSE_NOT_PARTICIPANT = 4403


class TravelConsumer(AsyncJsonWebsocketConsumer):
    """Live channel of a travel: joins `travel_<id>` and forwards every event
    broadcast to that group to the client.

    The permission is only checked at connect, with the same rule as
    IsTravelParticipant (ACCEPTED only, not LEFT).
    """

    group_name = None

    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.reject(CLOSE_NOT_AUTHENTICATED)
            return

        travel_id = self.scope["url_route"]["kwargs"]["travel_id"]
        if not await self.is_participant(travel_id, user):
            await self.reject(CLOSE_NOT_PARTICIPANT)
            return

        # Join before accepting: once the client sees the socket open it
        # reloads over REST, and no event may be lost in between.
        self.group_name = travel_group(travel_id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def reject(self, code):
        await self.accept()
        await self.close(code=code)

    async def disconnect(self, close_code):
        if self.group_name is not None:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Writes go through REST; nothing is read from the client for now.
        pass

    async def dispatch(self, message):
        # Events sent by common.realtime.broadcast are already the
        # `{"type", "payload"}` envelope the frontend expects, so they are
        # forwarded as-is instead of needing one handler per event type.
        if "payload" in message:
            await self.send_json(message)
        else:
            await super().dispatch(message)

    @database_sync_to_async
    def is_participant(self, travel_id, user):
        return Participation.objects.filter(
            travel_id=travel_id,
            traveler=user,
            status=ParticipationStatus.ACCEPTED,
        ).exists()
