from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'actor', 'action', 'entity_type', 'entity_id', 'ip_address')
    list_filter = ('action', 'entity_type', 'timestamp')
    search_fields = ('actor__email', 'action', 'entity_id')
    readonly_fields = ('timestamp', 'actor', 'action', 'entity_type', 'entity_id', 'ip_address', 'metadata')
