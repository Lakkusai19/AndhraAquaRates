from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ShrimpCount
from .serializers import ProductSerializer, ShrimpCountSerializer

class ProductListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Product.objects.filter(is_active=True).prefetch_related('counts')
    serializer_class = ProductSerializer
    pagination_class = None

class ShrimpCountListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = ShrimpCount.objects.filter(is_active=True).select_related('product')
    serializer_class = ShrimpCountSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'product__slug', 'is_active']
    pagination_class = None
