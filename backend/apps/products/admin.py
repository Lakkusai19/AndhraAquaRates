from django.contrib import admin
from .models import Product, ShrimpCount

class ShrimpCountInline(admin.TabularInline):
    model = ShrimpCount
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'default_price_unit', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ShrimpCountInline]

@admin.register(ShrimpCount)
class ShrimpCountAdmin(admin.ModelAdmin):
    list_display = ('label', 'count_value', 'product', 'display_order', 'is_active')
    list_filter = ('product', 'is_active')
    ordering = ('display_order', 'count_value')
