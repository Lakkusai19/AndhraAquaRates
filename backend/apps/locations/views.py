from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import State, District, MarketLocation
from .serializers import StateSerializer, DistrictSerializer, MarketLocationSerializer

class StateListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = State.objects.filter(is_active=True)
    serializer_class = StateSerializer
    pagination_class = None

class DistrictListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = District.objects.filter(is_active=True).select_related('state')
    serializer_class = DistrictSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['state', 'is_active']
    pagination_class = None

class MarketLocationListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = MarketLocation.objects.filter(is_active=True).select_related('district', 'district__state')
    serializer_class = MarketLocationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['district', 'district__state', 'is_active']
    pagination_class = None
