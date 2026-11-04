from channels.generic.websocket import AsyncJsonWebsocketConsumer

# Custom close codes, sent after accept() so the browser sees them instead of
# a generic 1006: the frontend must not reconnect on these.
CLOSE_NOT_AUTHENTICATED = 4401
CLOSE_NOT_PARTICIPANT = 4403


class GroupEventConsumer(AsyncJsonWebsocketConsumer):
    """Base of the server-to-client sockets: joins one group and forwards
    every event broadcast to it (see common.realtime.broadcast).

    Subclasses implement `get_group_name()`, which returns the group to join
    or None after closing the socket with `reject()`.
    """

    group_name = None

    async def get_group_name(self):
        raise NotImplementedError

    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.reject(CLOSE_NOT_AUTHENTICATED)
            return

        group_name = await self.get_group_name()
        if group_name is None:
            return

        # Join before accepting: once the client sees the socket open it
        # reloads over REST, and no event may be lost in between.
        self.group_name = group_name
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def reject(self, code):
        await self.accept()
        await self.close(code=code)

    async def leave_group(self):
        if self.group_name is not None:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            self.group_name = None

    async def disconnect(self, close_code):
        await self.leave_group()

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
