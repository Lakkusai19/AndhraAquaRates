from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.ReadOnlyField(source='actor.email')

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'actor_email', 'action', 'entity_type', 'entity_id', 'ip_address', 'timestamp', 'metadata']
