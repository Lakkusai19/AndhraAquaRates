from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    default_price_unit = models.CharField(max_length=30, default='₹/kg')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_products'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.default_price_unit})"

class ShrimpCount(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='counts')
    count_value = models.IntegerField(help_text="Shrimp pieces per kg, e.g. 30, 40, 50")
    label = models.CharField(max_length=50, help_text="e.g. '30 Count' or '50 Count'")
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ashp_shrimp_counts'
        ordering = ['display_order', 'count_value']
        unique_together = ('product', 'count_value')

    def __str__(self):
        return f"{self.label} ({self.product.name})"
