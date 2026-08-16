from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


# todo : remove temp class
class TravelerPingView(APIView):
    def get(self, request: Request) -> Response:
        return Response({"message": "[temp]Traveler API is running", "status": "ok"})
