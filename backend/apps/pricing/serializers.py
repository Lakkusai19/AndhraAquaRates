from rest_framework import serializers
from .models import PriceSheet, PriceEntry, PriceRevision
from apps.products.serializers import ShrimpCountSerializer
from apps.products.models import ShrimpCount

class PriceRevisionSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.ReadOnlyField(source='changed_by.email')

    class Meta:
        model = PriceRevision
        fields = ['id', 'previous_price', 'new_price', 'changed_by_email', 'changed_at', 'change_source']


class PriceEntrySerializer(serializers.ModelSerializer):
    shrimp_count_detail = ShrimpCountSerializer(source='shrimp_count', read_only=True)
    count_value = serializers.ReadOnlyField(source='shrimp_count.count_value')
    count_label = serializers.ReadOnlyField(source='shrimp_count.label')
    revisions = PriceRevisionSerializer(many=True, read_only=True)

    class Meta:
        model = PriceEntry
        fields = [
            'id', 'shrimp_count', 'count_value', 'count_label', 'shrimp_count_detail',
            'price_per_kg', 'quantity_capacity', 'payment_terms', 'buyer_note', 'buying_availability',
            'updated_at', 'revisions'
        ]


class PriceEntryInputSerializer(serializers.Serializer):
    shrimp_count_id = serializers.IntegerField()
    price_per_kg = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=1)
    quantity_capacity = serializers.CharField(max_length=100, required=False, allow_blank=True)
    payment_terms = serializers.CharField(max_length=50, required=False, default='Spot Payment', allow_blank=True)
    buyer_note = serializers.CharField(required=False, allow_blank=True)
    buying_availability = serializers.BooleanField(default=True)


class PriceSheetCreateUpdateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    market_location_id = serializers.IntegerField()
    price_date = serializers.DateField(required=False)
    payment_terms = serializers.CharField(max_length=50, required=False, default='Spot Payment', allow_blank=True)
    status = serializers.ChoiceField(choices=['DRAFT', 'PUBLISHED'], default='PUBLISHED')
    entries = PriceEntryInputSerializer(many=True)

    def validate_entries(self, entries):
        if not entries:
            raise serializers.ValidationError("At least one shrimp count price must be provided.")
        count_ids = [e['shrimp_count_id'] for e in entries]
        if len(count_ids) != len(set(count_ids)):
            raise serializers.ValidationError("Duplicate shrimp counts found in submission.")
        return entries


class PublicComparisonItemSerializer(serializers.Serializer):
    sheet_id = serializers.IntegerField()
    entry_id = serializers.IntegerField()
    buyer_id = serializers.IntegerField()
    buyer_name = serializers.CharField()
    contact_person = serializers.CharField()
    business_type = serializers.CharField()
    shrimp_count = serializers.IntegerField()
    count_label = serializers.CharField()
    price_per_kg = serializers.DecimalField(max_digits=8, decimal_places=2)
    unit = serializers.CharField()
    state_name = serializers.CharField()
    district_name = serializers.CharField()
    market_name = serializers.CharField()
    price_date = serializers.DateField()
    updated_at = serializers.DateTimeField()
    is_fresh = serializers.BooleanField()
    freshness_status = serializers.CharField()
    is_highest = serializers.BooleanField()
    tel_link = serializers.CharField()
    whatsapp_link = serializers.CharField()
    payment_terms = serializers.CharField(default='Spot Payment')
    buyer_note = serializers.CharField()
    quantity_capacity = serializers.CharField()
    is_featured = serializers.BooleanField()
