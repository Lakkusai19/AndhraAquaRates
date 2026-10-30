from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class PriceSheet(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published Live'),
        ('ARCHIVED', 'Archived'),
    )

    buyer = models.ForeignKey('buyers.BuyerProfile', on_delete=models.CASCADE, related_name='price_sheets')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='price_sheets')
    market_location = models.ForeignKey('locations.MarketLocation', on_delete=models.PROTECT, related_name='price_sheets')
    price_date = models.DateField(default=timezone.now, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', db_index=True)
    payment_terms = models.CharField(max_length=50, default='Spot Payment', blank=True, help_text="Payment terms e.g. 'Spot Payment', '1-2 Days', '3-5 Days', 'Within 7 Days'")
    
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_price_sheets'
        ordering = ['-price_date', '-updated_at']
        unique_together = ('buyer', 'product', 'market_location', 'price_date')

    def __str__(self):
        return f"{self.buyer.business_name} - {self.product.name} ({self.market_location.name}) on {self.price_date}"

    @property
    def is_fresh(self) -> bool:
        """Determines if the listing was updated within the configured freshness threshold."""
        threshold_hours = getattr(settings, 'PRICE_FRESHNESS_HOURS', 24)
        reference_time = self.updated_at or self.published_at
        if not reference_time or self.status != 'PUBLISHED':
            return False
        return (timezone.now() - reference_time) <= timedelta(hours=threshold_hours)

    @property
    def freshness_status(self) -> str:
        if self.status != 'PUBLISHED':
            return 'UNPUBLISHED'
        return 'FRESH' if self.is_fresh else 'STALE'


class PriceEntry(models.Model):
    price_sheet = models.ForeignKey(PriceSheet, on_delete=models.CASCADE, related_name='entries')
    shrimp_count = models.ForeignKey('products.ShrimpCount', on_delete=models.PROTECT, related_name='price_entries')
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2, help_text="Rate in ₹ per kg")
    quantity_capacity = models.CharField(max_length=100, blank=True, help_text="e.g. '5 Tons' or 'Any volume'")
    payment_terms = models.CharField(max_length=50, default='Spot Payment', blank=True, help_text="e.g. 'Spot Payment', '1-2 Days', '3-5 Days'")
    buyer_note = models.TextField(blank=True, help_text="Buyer specific requirements e.g. Count +/- 2, spot payment")
    buying_availability = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_price_entries'
        ordering = ['shrimp_count__display_order', 'shrimp_count__count_value']
        unique_together = ('price_sheet', 'shrimp_count')

    def __str__(self):
        return f"{self.shrimp_count.label}: ₹{self.price_per_kg}/kg - {self.price_sheet.buyer.business_name}"


class PriceRevision(models.Model):
    price_entry = models.ForeignKey(PriceEntry, on_delete=models.CASCADE, related_name='revisions')
    previous_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    new_price = models.DecimalField(max_digits=8, decimal_places=2)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(default=timezone.now)
    change_source = models.CharField(max_length=50, default='BUYER_UPDATE')

    class Meta:
        db_table = 'ashp_price_revisions'
        ordering = ['-changed_at']

    def __str__(self):
        return f"Revision on Entry {self.price_entry_id}: ₹{self.previous_price} -> ₹{self.new_price} at {self.changed_at}"

    @classmethod
    def cleanup_expired_revisions(cls, days=7):
        """
        Automatically deletes price revision records older than 1 week (7 days).
        Returns the number of deleted records.
        """
        cutoff = timezone.now() - timedelta(days=days)
        deleted_count, _ = cls.objects.filter(changed_at__lt=cutoff).delete()
        return deleted_count

