import asyncio

from channels.layers import get_channel_layer
from django.test import SimpleTestCase

from common.testing import WebsocketCommunicator
from config.asgi import application

ALLOWED_ORIGIN = [(b"origin", b"http://localhost")]


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

    async def test_idle_receive_outlives_blocking_pop(self):
        # channels_redis blocks on BZPOPMIN for brpop_timeout seconds; a
        # shorter redis socket_timeout makes idle sockets crash (1006).
        layer = get_channel_layer()
        channel = await layer.new_channel()

        with self.assertRaises(asyncio.TimeoutError):
            await asyncio.wait_for(
                layer.receive(channel), timeout=layer.brpop_timeout + 1
            )
