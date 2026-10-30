from django.contrib import admin
from .models import PaymentTransaction, WebhookEvent

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'amount', 'currency', 'status', 'provider_order_id', 'provider_payment_id', 'verified_at')
    list_filter = ('status', 'currency')
    search_fields = ('buyer__business_name', 'provider_order_id', 'provider_payment_id')
    readonly_fields = ('created_at', 'updated_at', 'raw_response')

@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'event_type', 'provider', 'processing_status', 'received_at', 'processed_at')
    list_filter = ('processing_status', 'event_type', 'provider')
    search_fields = ('event_id', 'event_type')
    readonly_fields = ('received_at', 'processed_at', 'payload')
