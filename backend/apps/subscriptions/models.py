from decimal import Decimal
from django.db import models
from django.utils import timezone

class SubscriptionPlan(models.Model):
    INTERVAL_CHOICES = (
        ('DAY', 'Daily'),
        ('WEEK', 'Weekly'),
        ('MONTH', 'Monthly'),
        ('YEAR', 'Yearly'),
    )

    name = models.CharField(max_length=150, default='ANDHRA AQUA RATES Buyer Monthly')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('499.00'))
    currency = models.CharField(max_length=10, default='INR')
    billing_interval = models.CharField(max_length=20, choices=INTERVAL_CHOICES, default='MONTH')
    billing_interval_count = models.IntegerField(default=1)
    provider_plan_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True, default='Full access to publish and update daily shrimp purchasing prices.')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_subscription_plans'
        ordering = ['amount']

    def __str__(self):
        return f"{self.name} - ₹{self.amount} / {self.billing_interval.lower()}"

class BuyerSubscription(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Payment'),
        ('ACTIVE', 'Active Subscription'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
        ('PAST_DUE', 'Past Due'),
    )

    buyer = models.ForeignKey('buyers.BuyerProfile', on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    provider = models.CharField(max_length=50, default='RAZORPAY')
    provider_subscription_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    
    started_at = models.DateTimeField(default=timezone.now)
    current_period_start = models.DateTimeField(default=timezone.now)
    current_period_end = models.DateTimeField(db_index=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_buyer_subscriptions'
        ordering = ['-current_period_end']

    def __str__(self):
        return f"{self.buyer.business_name} - {self.status} (Ends {self.current_period_end.strftime('%d-%b-%Y')})"

    @property
    def is_valid(self) -> bool:
        return self.status == 'ACTIVE' and self.current_period_end >= timezone.now()
