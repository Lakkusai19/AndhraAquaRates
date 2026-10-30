from django.contrib import admin
from .models import State, District, MarketLocation

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active')
    search_fields = ('name', 'code')

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name', 'state', 'is_active')
    list_filter = ('state', 'is_active')
    search_fields = ('name',)

@admin.register(MarketLocation)
class MarketLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'district', 'location_type', 'is_active')
    list_filter = ('location_type', 'district', 'is_active')
    search_fields = ('name', 'district__name')
