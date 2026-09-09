from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import Travel
from .serializers import TravelSerializer

class TravelListCreateView(ListCreateAPIView):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer

class TravelDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer


