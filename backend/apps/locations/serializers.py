from rest_framework import serializers
from .models import State, District, MarketLocation

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'name', 'code', 'is_active']

class DistrictSerializer(serializers.ModelSerializer):
    state_name = serializers.ReadOnlyField(source='state.name')
    state_code = serializers.ReadOnlyField(source='state.code')

    class Meta:
        model = District
        fields = ['id', 'state', 'state_name', 'state_code', 'name', 'is_active']

class MarketLocationSerializer(serializers.ModelSerializer):
    district_name = serializers.ReadOnlyField(source='district.name')
    state_name = serializers.ReadOnlyField(source='district.state.name')

    class Meta:
        model = MarketLocation
        fields = ['id', 'district', 'district_name', 'state_name', 'name', 'location_type', 'is_active']
