from django.contrib import admin
from .models import PriceSheet, PriceEntry, PriceRevision

class PriceEntryInline(admin.TabularInline):
    model = PriceEntry
    extra = 0
    fields = ('shrimp_count', 'price_per_kg', 'quantity_capacity', 'buyer_note', 'buying_availability')

@admin.register(PriceSheet)
class PriceSheetAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'product', 'market_location', 'price_date', 'status', 'is_fresh', 'updated_at')
    list_filter = ('status', 'price_date', 'product', 'market_location__district')
    search_fields = ('buyer__business_name', 'market_location__name')
    inlines = [PriceEntryInline]
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PriceEntry)
class PriceEntryAdmin(admin.ModelAdmin):
    list_display = ('price_sheet', 'shrimp_count', 'price_per_kg', 'buying_availability', 'updated_at')
    list_filter = ('buying_availability', 'shrimp_count')
    search_fields = ('price_sheet__buyer__business_name',)

@admin.register(PriceRevision)
class PriceRevisionAdmin(admin.ModelAdmin):
    list_display = ('price_entry', 'previous_price', 'new_price', 'changed_by', 'changed_at', 'change_source')
    list_filter = ('change_source', 'changed_at')
    readonly_fields = ('changed_at',)
