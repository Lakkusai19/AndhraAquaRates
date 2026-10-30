from django.contrib import admin
from .models import SubscriptionPlan, BuyerSubscription

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'currency', 'billing_interval', 'is_active')
    list_filter = ('billing_interval', 'is_active')
    search_fields = ('name',)

@admin.register(BuyerSubscription)
class BuyerSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'plan', 'status', 'current_period_start', 'current_period_end', 'is_valid')
    list_filter = ('status', 'plan')
    search_fields = ('buyer__business_name', 'provider_subscription_id')
    readonly_fields = ('created_at', 'updated_at')
