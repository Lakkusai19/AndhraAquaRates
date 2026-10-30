import secrets
import string
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.buyers.models import BuyerProfile, FarmerLead
from apps.buyers.serializers import FarmerLeadSerializer
from apps.pricing.models import PriceSheet, PriceEntry
from apps.locations.models import District
from apps.payments.models import PaymentTransaction, WebhookEvent
from apps.subscriptions.models import BuyerSubscription

class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff))


class AdminStatsView(APIView):
    """Returns actual real-time platform statistics derived directly from the database."""
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        freshness_threshold = now - timedelta(hours=24)

        total_buyers = BuyerProfile.objects.count()
        verified_buyers = BuyerProfile.objects.filter(verification_status='VERIFIED').count()
        active_subscribers = BuyerSubscription.objects.filter(status='ACTIVE', current_period_end__gte=now).count()

        total_sheets = PriceSheet.objects.count()
        published_sheets = PriceSheet.objects.filter(status='PUBLISHED').count()
        fresh_sheets = PriceSheet.objects.filter(status='PUBLISHED', updated_at__gte=freshness_threshold).count()
        total_price_entries = PriceEntry.objects.count()

        successful_payments = PaymentTransaction.objects.filter(status='SUCCESS')
        total_revenue = successful_payments.aggregate(total=Sum('amount'))['total'] or 0

        webhook_stats = {
            'total': WebhookEvent.objects.count(),
            'processed': WebhookEvent.objects.filter(processing_status='PROCESSED').count(),
            'failed': WebhookEvent.objects.filter(processing_status='FAILED').count(),
        }

        total_leads = FarmerLead.objects.count()
        new_leads = FarmerLead.objects.filter(status='NEW').count()

        return Response({
            'buyers': {
                'total': total_buyers,
                'verified': verified_buyers,
                'active_subscribers': active_subscribers,
            },
            'listings': {
                'total_sheets': total_sheets,
                'published_sheets': published_sheets,
                'fresh_sheets_today': fresh_sheets,
                'total_price_entries': total_price_entries,
            },
            'leads': {
                'total': total_leads,
                'new': new_leads,
            },
            'financials': {
                'successful_transactions': successful_payments.count(),
                'total_revenue_inr': total_revenue,
            },
            'webhooks': webhook_stats,
            'generated_at': now,
        })


def serialize_buyer(b: BuyerProfile) -> dict:
    return {
        'id': b.id,
        'user_id': b.user_id,
        'email': b.user.email,
        'business_name': b.business_name,
        'contact_person': b.contact_person,
        'phone': b.phone,
        'whatsapp': b.whatsapp_number,
        'business_type': b.business_type,
        'business_type_display': b.get_business_type_display(),
        'district_id': b.district_id,
        'district_name': b.district.name if b.district else None,
        'town_market': b.town_market,
        'business_address': b.business_address,
        'aadhar_number': b.aadhar_number,
        'aadhar_card': b.aadhar_card.url if b.aadhar_card else None,
        'verification_status': b.verification_status,
        'is_featured': b.is_featured,
        'has_active_subscription': b.has_active_subscription(),
        'created_at': b.created_at,
        'updated_at': b.updated_at,
    }


class AdminBuyersManageView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        buyers = BuyerProfile.objects.select_related('user', 'district').order_by('-created_at')
        results = [serialize_buyer(b) for b in buyers]
        return Response(results)

    def patch(self, request, buyer_pk=None):
        buyer_id = buyer_pk or request.data.get('buyer_id') or request.data.get('id')
        if not buyer_id:
            return Response({'error': 'buyer_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        buyer = BuyerProfile.objects.select_related('user', 'district').filter(id=buyer_id).first()
        if not buyer:
            return Response({'error': 'Buyer not found.'}, status=status.HTTP_404_NOT_FOUND)

        updated_fields = []

        # Editable profile fields
        if 'business_name' in request.data:
            buyer.business_name = request.data['business_name'].strip()
            updated_fields.append('business_name')

        if 'contact_person' in request.data:
            buyer.contact_person = request.data['contact_person'].strip()
            updated_fields.append('contact_person')

        if 'phone' in request.data:
            buyer.phone = request.data['phone'].strip()
            updated_fields.append('phone')

        if 'whatsapp' in request.data or 'whatsapp_number' in request.data:
            buyer.whatsapp_number = (request.data.get('whatsapp') or request.data.get('whatsapp_number', '')).strip()
            updated_fields.append('whatsapp_number')

        if 'business_type' in request.data:
            buyer.business_type = request.data['business_type']
            updated_fields.append('business_type')

        if 'district_id' in request.data and request.data['district_id']:
            district = District.objects.filter(id=request.data['district_id']).first()
            if district:
                buyer.district = district
                buyer.state = district.state
                updated_fields.append('district')

        if 'town_market' in request.data:
            buyer.town_market = request.data['town_market'].strip()
            updated_fields.append('town_market')

        if 'business_address' in request.data:
            buyer.business_address = request.data['business_address'].strip()
            updated_fields.append('business_address')

        if 'aadhar_number' in request.data:
            buyer.aadhar_number = request.data['aadhar_number'].strip()
            updated_fields.append('aadhar_number')

        if 'verification_status' in request.data:
            new_status = request.data['verification_status']
            if new_status in ['PENDING', 'VERIFIED', 'SUSPENDED']:
                buyer.verification_status = new_status
                updated_fields.append('verification_status')

        if 'is_featured' in request.data:
            buyer.is_featured = bool(request.data['is_featured'])
            updated_fields.append('is_featured')

        # Admin can also update the buyer's login email if requested
        if 'email' in request.data:
            new_email = request.data['email'].strip().lower()
            if new_email and new_email != buyer.user.email:
                buyer.user.email = new_email
                buyer.user.save(update_fields=['email'])
                updated_fields.append('user_email')

        buyer.save()

        AuditLog.objects.create(
            actor=request.user,
            action='ADMIN_UPDATED_BUYER',
            entity_type='BuyerProfile',
            entity_id=str(buyer.id),
            metadata={'updated_fields': updated_fields, 'buyer_name': buyer.business_name}
        )

        return Response({
            'message': f"Buyer '{buyer.business_name}' details updated successfully.",
            'buyer': serialize_buyer(buyer)
        })

    def delete(self, request, buyer_pk=None):
        buyer_id = buyer_pk or request.data.get('buyer_id') or request.query_params.get('buyer_id')
        if not buyer_id:
            return Response({'error': 'buyer_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        buyer = BuyerProfile.objects.select_related('user').filter(id=buyer_id).first()
        if not buyer:
            return Response({'error': 'Buyer not found.'}, status=status.HTTP_404_NOT_FOUND)

        buyer_name = buyer.business_name
        buyer_email = buyer.user.email
        user = buyer.user

        # Deleting the user automatically cascades to BuyerProfile and related records
        user.delete()

        AuditLog.objects.create(
            actor=request.user,
            action='ADMIN_DELETED_BUYER',
            entity_type='BuyerProfile',
            entity_id=str(buyer_id),
            metadata={'business_name': buyer_name, 'email': buyer_email}
        )

        return Response({'message': f"Buyer '{buyer_name}' ({buyer_email}) has been permanently deleted."})


class AdminBuyerDetailManageView(APIView):
    """Handles single buyer retrieval, updates, and deletion by ID."""
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        buyer = BuyerProfile.objects.select_related('user', 'district').filter(id=pk).first()
        if not buyer:
            return Response({'error': 'Buyer not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_buyer(buyer))

    def patch(self, request, pk):
        view = AdminBuyersManageView()
        return view.patch(request, buyer_pk=pk)

    def delete(self, request, pk):
        view = AdminBuyersManageView()
        return view.delete(request, buyer_pk=pk)


class AdminBuyerPasswordResetView(APIView):
    """
    Direct Admin tool to reset or change any buyer's password.
    Admin can specify a new password, or leave empty to auto-generate a secure temporary password.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        buyer = BuyerProfile.objects.select_related('user').filter(id=pk).first()
        if not buyer:
            return Response({'error': 'Buyer not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_password = (request.data.get('new_password') or '').strip()
        if not new_password:
            # Generate a secure 10-char temporary password (e.g. Shrimp@8291)
            random_digits = ''.join(secrets.choice(string.digits) for _ in range(4))
            new_password = f"Shrimp@{random_digits}"

        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        user = buyer.user
        user.set_password(new_password)
        user.save()

        AuditLog.objects.create(
            actor=request.user,
            action='ADMIN_RESET_BUYER_PASSWORD',
            entity_type='User',
            entity_id=str(user.id),
            metadata={
                'buyer_id': buyer.id,
                'business_name': buyer.business_name,
                'email': user.email
            }
        )

        return Response({
            'message': f"Password for {buyer.business_name} ({user.email}) successfully changed.",
            'buyer_id': buyer.id,
            'email': user.email,
            'new_password': new_password
        })


class AdminAllPriceSheetsView(APIView):
    """
    Gives Admin full visibility and control over all price sheets posted on the platform.
    Admin can review any price sheet and delete spam/invalid sheets directly.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        sheets = PriceSheet.objects.select_related(
            'buyer', 'market_location', 'market_location__district', 'product'
        ).prefetch_related('entries', 'entries__shrimp_count').order_by('-price_date', '-updated_at')

        results = []
        for s in sheets:
            results.append({
                'id': s.id,
                'buyer_id': s.buyer.id,
                'buyer_name': s.buyer.business_name,
                'buyer_phone': s.buyer.phone,
                'buyer_email': s.buyer.user.email,
                'market_name': s.market_location.name,
                'district_name': s.market_location.district.name,
                'product_name': s.product.name,
                'price_date': s.price_date,
                'status': s.status,
                'payment_terms': s.payment_terms or 'Spot Payment',
                'is_fresh': s.is_fresh,
                'entries_count': s.entries.count(),
                'updated_at': s.updated_at,
            })
        return Response(results)

    def delete(self, request, pk):
        sheet = PriceSheet.objects.select_related('buyer', 'market_location').filter(id=pk).first()
        if not sheet:
            return Response({'error': 'Price sheet not found.'}, status=status.HTTP_404_NOT_FOUND)

        sheet_id = sheet.id
        buyer_name = sheet.buyer.business_name
        market = sheet.market_location.name
        price_date = str(sheet.price_date)

        sheet.delete()

        AuditLog.objects.create(
            actor=request.user,
            action='ADMIN_DELETED_PRICE_SHEET',
            entity_type='PriceSheet',
            entity_id=str(sheet_id),
            metadata={'buyer': buyer_name, 'market': market, 'date': price_date}
        )

        return Response({
            'message': f"Price sheet #{sheet_id} ({buyer_name} - {market}) permanently deleted.",
            'id': sheet_id
        })


class AdminAuditLogView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        logs = AuditLog.objects.select_related('actor').order_by('-timestamp')[:100]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class AdminFarmerLeadsView(APIView):
    """
    Admin view to inspect all farmer inquiries across buyers.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        leads = FarmerLead.objects.select_related('buyer').order_by('-created_at')[:200]
        serializer = FarmerLeadSerializer(leads, many=True)
        return Response(serializer.data)


