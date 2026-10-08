import json

from asgiref.testing import ApplicationCommunicator
from channels.layers import get_channel_layer
from django.test import SimpleTestCase

from config.asgi import application

ALLOWED_ORIGIN = [(b"origin", b"http://localhost")]


# channels.testing.WebsocketCommunicator would need daphne installed,
# so this is a minimal equivalent on top of asgiref.
class WebsocketCommunicator(ApplicationCommunicator):
    def __init__(self, app, path, headers=None):
        super().__init__(
            app,
            {
                "type": "websocket",
                "path": path,
                "headers": headers or [],
                "query_string": b"",
                "subprotocols": [],
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


class PingConsumerTests(SimpleTestCase):
    async def test_ping_replies_pong(self):
        communicator = WebsocketCommunicator(
            application, "/ws/ping/", headers=ALLOWED_ORIGIN
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.send_json_to({"message": "hello"})
        response = await communicator.receive_json_from()
        self.assertEqual(response, {"message": "pong: hello"})

        await communicator.disconnect()

    async def test_rejects_unknown_origin(self):
        communicator = WebsocketCommunicator(
            application, "/ws/ping/", headers=[(b"origin", b"http://evil.example")]
        )
        connected, _ = await communicator.connect()
        self.assertFalse(connected)


class ChannelLayerTests(SimpleTestCase):
    """Hits the real Redis channel layer configured in settings."""

    async def test_send_and_receive_on_channel(self):
        layer = get_channel_layer()
        channel = await layer.new_channel()

        await layer.send(channel, {"type": "test.message", "text": "hi"})
        message = await layer.receive(channel)

        self.assertEqual(message, {"type": "test.message", "text": "hi"})

    async def test_group_send_reaches_members(self):
        layer = get_channel_layer()
        channel = await layer.new_channel()
        await layer.group_add("ci-test-group", channel)

        await layer.group_send("ci-test-group", {"type": "test.message", "n": 1})
        message = await layer.receive(channel)

        self.assertEqual(message, {"type": "test.message", "n": 1})
        await layer.group_discard("ci-test-group", channel)
