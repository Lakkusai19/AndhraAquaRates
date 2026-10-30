from rest_framework import serializers
from .models import SubscriptionPlan, BuyerSubscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'amount', 'currency', 'billing_interval',
            'billing_interval_count', 'provider_plan_id', 'description', 'is_active'
        ]

class BuyerSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    is_valid = serializers.ReadOnlyField()

    class Meta:
        model = BuyerSubscription
        fields = [
            'id', 'buyer', 'plan', 'provider', 'provider_subscription_id',
            'status', 'started_at', 'current_period_start', 'current_period_end',
            'cancelled_at', 'is_valid', 'created_at'
        ]
