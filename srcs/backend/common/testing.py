import json

from asgiref.testing import ApplicationCommunicator


class WebsocketCommunicator(ApplicationCommunicator):
    # Extra `scope` entries (e.g. `user`, `url_route`) are merged into the
    # scope, which lets tests connect as a user without a session cookie.
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
