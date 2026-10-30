from rest_framework import serializers
from .models import PaymentTransaction

class PaymentTransactionSerializer(serializers.ModelSerializer):
    plan_name = serializers.ReadOnlyField(source='subscription.plan.name')

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'provider_order_id', 'provider_payment_id', 'amount',
            'currency', 'status', 'payment_method', 'verified_at',
            'plan_name', 'created_at'
        ]

class CheckoutInitiateSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=False)

class PaymentVerifySerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=150)
    payment_id = serializers.CharField(max_length=150)
    signature = serializers.CharField(max_length=255)
    plan_id = serializers.IntegerField(required=False)
