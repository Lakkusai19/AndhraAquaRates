from rest_framework import serializers
from .models import BuyerProfile, FarmerLead

class BuyerPublicProfileSerializer(serializers.ModelSerializer):
    district_name = serializers.ReadOnlyField(source='district.name')
    state_name = serializers.ReadOnlyField(source='state.name')
    tel_link = serializers.ReadOnlyField(source='formatted_tel_link')
    has_active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = BuyerProfile
        fields = [
            'id', 'business_name', 'contact_person', 'phone', 'whatsapp_number',
            'business_type', 'district', 'district_name', 'state_name',
            'town_market', 'business_address', 'verification_status',
            'is_featured', 'tel_link', 'has_active_subscription'
        ]

    def get_has_active_subscription(self, obj):
        return obj.has_active_subscription()


class BuyerPrivateProfileSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source='user.email')
    district_name = serializers.ReadOnlyField(source='district.name')
    state_name = serializers.ReadOnlyField(source='state.name')
    has_active_subscription = serializers.SerializerMethodField()
    active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = BuyerProfile
        fields = [
            'id', 'email', 'business_name', 'contact_person', 'phone', 'whatsapp_number',
            'business_type', 'state', 'state_name', 'district', 'district_name',
            'town_market', 'business_address', 'aadhar_number', 'aadhar_card',
            'verification_status', 'is_featured', 'created_at',
            'has_active_subscription', 'active_subscription'
        ]
        read_only_fields = ['id', 'email', 'verification_status', 'is_featured', 'created_at']

    def get_has_active_subscription(self, obj):
        return obj.has_active_subscription()

    def get_active_subscription(self, obj):
        sub = obj.get_active_subscription()
        if sub:
            return {
                'id': sub.id,
                'plan_name': sub.plan.name,
                'status': sub.status,
                'current_period_start': sub.current_period_start,
                'current_period_end': sub.current_period_end,
                'amount': sub.plan.amount,
            }
        return None


class FarmerLeadSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source='buyer.business_name')
    buyer_phone = serializers.ReadOnlyField(source='buyer.phone')
    buyer_whatsapp = serializers.ReadOnlyField(source='buyer.whatsapp_number')
    whatsapp_url = serializers.ReadOnlyField(source='get_whatsapp_chat_link')
    tel_link = serializers.ReadOnlyField(source='formatted_tel_link')

    class Meta:
        model = FarmerLead
        fields = [
            'id', 'buyer', 'buyer_name', 'buyer_phone', 'buyer_whatsapp',
            'seller_phone', 'seller_name', 'shrimp_count', 'offered_price',
            'payment_terms', 'market_location', 'district', 'approx_quantity',
            'notes', 'status', 'created_at', 'whatsapp_url', 'tel_link'
        ]
        read_only_fields = ['id', 'created_at', 'buyer_name', 'buyer_phone', 'buyer_whatsapp', 'whatsapp_url', 'tel_link']

