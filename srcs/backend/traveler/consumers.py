from channels.db import database_sync_to_async

from common.consumers import GroupEventConsumer
from common.realtime import user_group

from .presence import traveler_connected, traveler_disconnected


class NotificationConsumer(GroupEventConsumer):
    """Personal channel of the logged-in traveler: joins `user_<id>` and
    forwards what concerns them outside of any travel page (friend requests,
    friends going online or offline). Every tab of the same user shares the
    group.

    It is open on every logged-in page, so it also drives presence: the
    traveler is online while at least one of these sockets is open."""

    tracks_presence = False

    async def get_group_name(self):
        return user_group(self.scope["user"].id)

    async def connect(self):
        await super().connect()
        if self.group_name is not None:
            self.tracks_presence = True
            await database_sync_to_async(traveler_connected)(self.scope["user"].id)

    async def disconnect(self, close_code):
        await super().disconnect(close_code)
        if self.tracks_presence:
            self.tracks_presence = False
            await database_sync_to_async(traveler_disconnected)(self.scope["user"].id)
