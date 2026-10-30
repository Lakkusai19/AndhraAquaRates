from rest_framework import serializers
from .models import Product, ShrimpCount

class ShrimpCountSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = ShrimpCount
        fields = ['id', 'product', 'product_name', 'count_value', 'label', 'display_order', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    counts = ShrimpCountSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'default_price_unit', 'is_active', 'counts']
