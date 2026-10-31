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
    latitude = models.FloatField(null=True, blank=True, help_text="Geographic latitude coordinate")
    longitude = models.FloatField(null=True, blank=True, help_text="Geographic longitude coordinate")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_districts'
        ordering = ['name']
        unique_together = ('state', 'name')

    def __str__(self):
        return f"{self.name}, {self.state.code}"

    @property
    def coords(self):
        if self.latitude is not None and self.longitude is not None:
            return (self.latitude, self.longitude)
        return None

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
    latitude = models.FloatField(null=True, blank=True, help_text="Specific latitude if available")
    longitude = models.FloatField(null=True, blank=True, help_text="Specific longitude if available")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_market_locations'
        ordering = ['name']
        unique_together = ('district', 'name')

    def __str__(self):
        return f"{self.name} ({self.district.name})"

    @property
    def coords(self):
        lat = self.latitude if self.latitude is not None else (self.district.latitude if self.district else None)
        lng = self.longitude if self.longitude is not None else (self.district.longitude if self.district else None)
        if lat is not None and lng is not None:
            return (lat, lng)
        return None
