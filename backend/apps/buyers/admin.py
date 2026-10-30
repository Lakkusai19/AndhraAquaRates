from django.contrib import admin
from .models import BuyerProfile

@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'contact_person', 'phone', 'business_type', 'district', 'aadhar_number', 'verification_status', 'is_featured')
    list_filter = ('verification_status', 'business_type', 'is_featured', 'district')
    search_fields = ('business_name', 'contact_person', 'phone', 'whatsapp_number', 'user__email', 'aadhar_number')
    readonly_fields = ('created_at', 'updated_at')
