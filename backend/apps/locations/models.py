from django.db import models

class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_states'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class District(models.Model):
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_districts'
        ordering = ['name']
        unique_together = ('state', 'name')

    def __str__(self):
        return f"{self.name}, {self.state.code}"

class MarketLocation(models.Model):
    LOCATION_TYPE_CHOICES = (
        ('MANDI', 'Mandi / Auction Center'),
        ('HARBOR', 'Fishing Harbor / Coastal Center'),
        ('TRADING_CENTER', 'Trading Hub / Junction'),
        ('COLD_STORAGE', 'Cold Storage Unit'),
        ('PROCESSING_PLANT', 'Processing Plant Gate'),
        ('OTHER', 'General Market'),
    )

    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='market_locations')
    name = models.CharField(max_length=150)
    location_type = models.CharField(max_length=50, choices=LOCATION_TYPE_CHOICES, default='TRADING_CENTER')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_market_locations'
        ordering = ['name']
        unique_together = ('district', 'name')

    def __str__(self):
        return f"{self.name} ({self.district.name})"
