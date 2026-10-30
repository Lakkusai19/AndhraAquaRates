from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from apps.buyers.models import BuyerProfile

class UserResponseSerializer(serializers.ModelSerializer):
    buyer_profile_id = serializers.SerializerMethodField()
    business_name = serializers.SerializerMethodField()
    has_active_subscription = serializers.SerializerMethodField()
    active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'is_active', 'email_verified',
            'created_at', 'buyer_profile_id', 'business_name',
            'has_active_subscription', 'active_subscription'
        ]

    def get_buyer_profile_id(self, obj):
        if hasattr(obj, 'buyer_profile'):
            return obj.buyer_profile.id
        return None

    def get_business_name(self, obj):
        if hasattr(obj, 'buyer_profile'):
            return obj.buyer_profile.business_name
        return None

    def get_has_active_subscription(self, obj):
        if hasattr(obj, 'buyer_profile'):
            return obj.buyer_profile.has_active_subscription()
        return False

    def get_active_subscription(self, obj):
        if hasattr(obj, 'buyer_profile'):
            sub = obj.buyer_profile.get_active_subscription()
            if sub:
                return {
                    'id': sub.id,
                    'plan_name': sub.plan.name,
                    'status': sub.status,
                    'current_period_end': sub.current_period_end,
                }
        return None


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['BUYER', 'FARMER'], default='BUYER')
    
    # Profile fields for Buyer
    business_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    contact_person = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    whatsapp_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    business_type = serializers.CharField(max_length=50, required=False, default='WHOLESALER')
    state_id = serializers.IntegerField(required=False, allow_null=True)
    district_id = serializers.IntegerField(required=False, allow_null=True)
    town_market = serializers.CharField(max_length=255, required=False, allow_blank=True)
    business_address = serializers.CharField(required=False, allow_blank=True)
    
    # KYC / Identity Verification
    aadhar_number = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    aadhar_card = serializers.FileField(required=False, allow_null=True)
    
    terms_agreed = serializers.BooleanField()

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if not data.get('terms_agreed'):
            raise serializers.ValidationError({"terms_agreed": "You must agree to the Terms and Conditions."})
        if User.objects.filter(email__iexact=data.get('email')).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})
        if data.get('role') == 'BUYER':
            if not data.get('business_name'):
                raise serializers.ValidationError({"business_name": "Business name is required for buyers."})
            if not data.get('contact_person'):
                raise serializers.ValidationError({"contact_person": "Contact person name is required."})
            if not data.get('phone'):
                raise serializers.ValidationError({"phone": "Phone number is required."})
        return data

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        role = validated_data.get('role', 'BUYER')

        user = User.objects.create_user(
            email=email,
            password=password,
            role=role,
            email_verified=True # Auto-verified for frictionless buyer onboarding
        )

        if role == 'BUYER':
            BuyerProfile.objects.create(
                user=user,
                business_name=validated_data.get('business_name', ''),
                contact_person=validated_data.get('contact_person', ''),
                phone=validated_data.get('phone', ''),
                whatsapp_number=validated_data.get('whatsapp_number') or validated_data.get('phone', ''),
                business_type=validated_data.get('business_type', 'WHOLESALER'),
                state_id=validated_data.get('state_id'),
                district_id=validated_data.get('district_id'),
                town_market=validated_data.get('town_market', ''),
                business_address=validated_data.get('business_address', ''),
                aadhar_number=validated_data.get('aadhar_number', ''),
                aadhar_card=validated_data.get('aadhar_card', None),
                verification_status='VERIFIED'
            )

        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        user = authenticate(username=email, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email__iexact=email)
                if not user_obj.check_password(password):
                    raise serializers.ValidationError("Invalid email or password.")
                user = user_obj
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is currently disabled.")

        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
