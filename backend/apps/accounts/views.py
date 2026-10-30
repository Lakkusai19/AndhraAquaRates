from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserResponseSerializer
from apps.audit.models import AuditLog

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserResponseSerializer(user).data
            
            # Log registration
            AuditLog.objects.create(
                actor=user,
                action='USER_REGISTERED',
                entity_type='User',
                entity_id=str(user.id),
                metadata={'email': user.email, 'role': user.role}
            )

            return Response({
                'message': 'Registration successful.',
                'user': user_data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            access = serializer.validated_data['access']
            refresh = serializer.validated_data['refresh']
            user_data = UserResponseSerializer(user).data

            AuditLog.objects.create(
                actor=user,
                action='USER_LOGGED_IN',
                entity_type='User',
                entity_id=str(user.id),
                metadata={'email': user.email}
            )

            return Response({
                'message': 'Login successful.',
                'user': user_data,
                'access': access,
                'refresh': refresh,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserResponseSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Optional refresh token blacklisting if provided
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


from django.conf import settings
from django.core.mail import send_mail
from .models import User, PasswordResetCode

class PasswordResetRequestView(APIView):
    """Generates and dispatches a 6-digit verification code to the user's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        dev_code = None

        if user:
            reset_code = PasswordResetCode.generate_code_for_user(user)
            dev_code = reset_code.code

            # Dispatch verification email
            subject = f"Your Password Reset Code: {reset_code.code} - ANDHRA AQUA RATES"
            body = (
                f"Hello,\n\n"
                f"You requested to reset your password for ANDHRA AQUA RATES ({user.email}).\n\n"
                f"Your 6-Digit Verification Code is:\n\n"
                f"    {reset_code.code}\n\n"
                f"This code will expire in 15 minutes. Enter this code on the verification screen to set your new password.\n\n"
                f"If you did not request this, please ignore this email or contact support.\n\n"
                f"— ANDHRA AQUA RATES Security Team\n"
                f"Andhra Pradesh, India"
            )

            try:
                send_mail(
                    subject=subject,
                    message=body,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@andhraaquarates.com'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log dispatch error but do not crash
                print(f"[EMAIL_DISPATCH_WARNING] {e}")

            AuditLog.objects.create(
                actor=user,
                action='PASSWORD_RESET_CODE_REQUESTED',
                entity_type='User',
                entity_id=str(user.id),
                metadata={'email': user.email}
            )

        resp = {
            'message': 'A 6-digit verification code has been dispatched to your email address.',
            'email': email,
        }
        if getattr(settings, 'DEBUG', False) and dev_code:
            resp['dev_code'] = dev_code

        return Response(resp, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Verifies the 6-digit code and sets the user's new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = str(request.data.get('code', '')).strip()
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not email or not code:
            return Response({'error': 'Email and 6-digit verification code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password or len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'error': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

        code_obj = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).first()
        if not code_obj or not code_obj.is_valid():
            return Response({
                'error': 'Invalid or expired 6-digit verification code. Please request a new code.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        # Invalidate code
        code_obj.is_used = True
        code_obj.save()

        AuditLog.objects.create(
            actor=user,
            action='PASSWORD_RESET_COMPLETED',
            entity_type='User',
            entity_id=str(user.id),
            metadata={'email': user.email}
        )

        refresh = RefreshToken.for_user(user)
        user_data = UserResponseSerializer(user).data

        return Response({
            'message': 'Password has been reset successfully. You are now logged in.',
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)
