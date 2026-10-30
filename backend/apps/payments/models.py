from django.db import models
from django.utils import timezone

class PaymentTransaction(models.Model):
    STATUS_CHOICES = (
        ('CREATED', 'Created / Initiated'),
        ('SUCCESS', 'Payment Success'),
        ('FAILED', 'Payment Failed'),
        ('REFUNDED', 'Refunded'),
    )

    buyer = models.ForeignKey('buyers.BuyerProfile', on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey('subscriptions.BuyerSubscription', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_transactions')
    
    provider_order_id = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)
    provider_payment_id = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED', db_index=True)
    
    payment_method = models.CharField(max_length=50, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_payment_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.buyer.business_name} - ₹{self.amount} ({self.status}) - {self.provider_payment_id or self.provider_order_id}"

class WebhookEvent(models.Model):
    STATUS_CHOICES = (
        ('RECEIVED', 'Received'),
        ('PROCESSED', 'Processed Successfully'),
        ('FAILED', 'Processing Failed'),
        ('IGNORED', 'Ignored / Skipped'),
    )

    provider = models.CharField(max_length=50, default='RAZORPAY')
    event_id = models.CharField(max_length=150, unique=True, db_index=True)
    event_type = models.CharField(max_length=100, db_index=True)
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RECEIVED')
    
    received_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    error_summary = models.TextField(blank=True)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'ashp_webhook_events'
        ordering = ['-received_at']

    def __str__(self):
        return f"Webhook {self.event_type} - {self.event_id} ({self.processing_status})"
