import asyncio
import json

from asgiref.sync import async_to_sync
from asgiref.testing import ApplicationCommunicator
from channels.layers import get_channel_layer


class WebsocketCommunicator(ApplicationCommunicator):
    # Extra `scope` entries (e.g. `user`, `url_route`) are merged into the
    # scope, which lets tests connect as a user without a session cookie.
    # tldr if we used daphne we would not have to do that
    def __init__(self, app, path, headers=None, scope=None):
        super().__init__(
            app,
            {
                "type": "websocket",
                "path": path,
                "headers": headers or [],
                "query_string": b"",
                "subprotocols": [],
                **(scope or {}),
            },
        )

    async def connect(self):
        await self.send_input({"type": "websocket.connect"})
        response = await self.receive_output(timeout=2)
        return response["type"] == "websocket.accept", response

    async def send_json_to(self, data):
        await self.send_input({"type": "websocket.receive", "text": json.dumps(data)})

    async def receive_json_from(self):
        response = await self.receive_output(timeout=2)
        return json.loads(response["text"])

    async def disconnect(self):
        await self.send_input({"type": "websocket.disconnect", "code": 1000})
        await self.wait(timeout=2)


class BroadcastListenerMixin:
    """Subscribes a channel to a group on the real channel layer, so a test
    can check what a view broadcast. Wrap the request in
    `self.captureOnCommitCallbacks(execute=True)`: broadcast waits for the
    commit, which TestCase never does on its own.
    """

    def listen_to(self, group):
        layer = get_channel_layer()
        self.listen_channel = async_to_sync(layer.new_channel)()
        async_to_sync(layer.group_add)(group, self.listen_channel)
        self.addCleanup(async_to_sync(layer.group_discard), group, self.listen_channel)

    def receive_event(self, timeout=2):
        async def receive():
            return await asyncio.wait_for(
                get_channel_layer().receive(self.listen_channel), timeout
            )

        return async_to_sync(receive)()
