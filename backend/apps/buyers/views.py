from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import BuyerProfile, FarmerLead
from .serializers import BuyerPublicProfileSerializer, BuyerPrivateProfileSerializer, FarmerLeadSerializer
from apps.pricing.models import PriceSheet
from apps.audit.models import AuditLog

class BuyerPublicDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = BuyerProfile.objects.filter(verification_status='VERIFIED').select_related('district', 'state')
    serializer_class = BuyerPublicProfileSerializer

class BuyerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.buyer_profile
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BuyerPrivateProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        try:
            profile = request.user.buyer_profile
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BuyerPrivateProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            AuditLog.objects.create(
                actor=request.user,
                action='BUYER_PROFILE_UPDATED',
                entity_type='BuyerProfile',
                entity_id=str(profile.id),
                metadata=request.data
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BuyerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            buyer = request.user.buyer_profile
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found for this user.'}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        active_sub = buyer.get_active_subscription()
        has_active = buyer.has_active_subscription()

        sheets = PriceSheet.objects.filter(buyer=buyer)
        published_sheets = sheets.filter(status='PUBLISHED')
        
        # Today's published sheet
        today = now.date()
        today_sheet = published_sheets.filter(price_date=today).first()
        today_prices_count = today_sheet.entries.count() if today_sheet else 0

        latest_updated = sheets.order_by('-updated_at').first()
        new_leads_count = buyer.farmer_leads.filter(status='NEW').count()
        total_leads_count = buyer.farmer_leads.count()

        data = {
            'buyer_id': buyer.id,
            'business_name': buyer.business_name,
            'verification_status': buyer.verification_status,
            'has_active_subscription': has_active,
            'subscription': {
                'id': active_sub.id if active_sub else None,
                'status': active_sub.status if active_sub else 'INACTIVE',
                'plan_name': active_sub.plan.name if active_sub else None,
                'expires_at': active_sub.current_period_end if active_sub else None,
            } if active_sub else None,
            'today_published': bool(today_sheet),
            'today_price_entries_count': today_prices_count,
            'total_sheets_count': sheets.count(),
            'last_updated_at': latest_updated.updated_at if latest_updated else None,
            'can_publish_prices': has_active,
            'new_leads_count': new_leads_count,
            'total_leads_count': total_leads_count,
        }
        return Response(data)


class FarmerLeadCreatePublicView(APIView):
    """
    Public endpoint: Shrimp farmers express interest in a buyer's published count rate.
    No login or farmer registration required.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import urllib.parse
        data = request.data
        buyer_id = data.get('buyer_id')
        seller_phone = (data.get('seller_phone') or '').strip()

        if not buyer_id:
            return Response({'error': 'Buyer ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        clean_digits = ''.join(c for c in seller_phone if c.isdigit())
        if len(clean_digits) < 10:
            return Response({'error': 'Please provide a valid 10-digit mobile phone number.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            buyer = BuyerProfile.objects.get(id=buyer_id)
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        lead = FarmerLead.objects.create(
            buyer=buyer,
            seller_phone=seller_phone,
            seller_name=(data.get('seller_name') or 'Shrimp Farmer').strip(),
            shrimp_count=(data.get('shrimp_count') or '').strip(),
            offered_price=data.get('offered_price'),
            payment_terms=(data.get('payment_terms') or 'Spot Payment').strip(),
            market_location=(data.get('market_location') or '').strip(),
            district=(data.get('district') or '').strip(),
            approx_quantity=(data.get('approx_quantity') or '').strip(),
            notes=(data.get('notes') or '').strip(),
            status='NEW',
        )

        # Build WhatsApp link for direct chat between farmer and buyer
        clean_buyer_phone = buyer.clean_phone_number(buyer.whatsapp_number or buyer.phone)
        wa_text = f"Hello {buyer.business_name}, I am interested in selling shrimp at your rate of ₹{lead.offered_price}/kg for {lead.shrimp_count} ({lead.payment_terms}). My mobile number is {lead.seller_phone}."
        if lead.seller_name and lead.seller_name != 'Shrimp Farmer':
            wa_text += f" - {lead.seller_name}"
        if lead.approx_quantity:
            wa_text += f" (Approx Qty: {lead.approx_quantity})"
        
        wa_url = f"https://wa.me/{clean_buyer_phone}?text={urllib.parse.quote(wa_text)}" if clean_buyer_phone else ""

        serializer = FarmerLeadSerializer(lead)
        return Response({
            'success': True,
            'message': f"Your contact number has been sent to {buyer.business_name}! The buyer will reach out shortly.",
            'lead': serializer.data,
            'buyer_name': buyer.business_name,
            'buyer_phone': buyer.phone,
            'whatsapp_url': wa_url,
        }, status=status.HTTP_201_CREATED)


class BuyerFarmerLeadsView(APIView):
    """
    Authenticated buyer endpoint to view all incoming seller leads and inquiries.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            buyer = request.user.buyer_profile
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        leads = buyer.farmer_leads.all().order_by('-created_at')
        serializer = FarmerLeadSerializer(leads, many=True)
        return Response(serializer.data)


class BuyerFarmerLeadDetailView(APIView):
    """
    Update status or delete a lead.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            buyer = request.user.buyer_profile
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            lead = buyer.farmer_leads.get(pk=pk)
        except FarmerLead.DoesNotExist:
            return Response({'error': 'Lead not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status:
            lead.status = new_status
        if 'notes' in request.data:
            lead.notes = request.data['notes']
        lead.save()

        return Response(FarmerLeadSerializer(lead).data)

    def delete(self, request, pk):
        try:
            buyer = request.user.buyer_profile
        except BuyerProfile.DoesNotExist:
            return Response({'error': 'Buyer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            lead = buyer.farmer_leads.get(pk=pk)
            lead.delete()
            return Response({'success': True, 'message': 'Lead deleted successfully.'})
        except FarmerLead.DoesNotExist:
            return Response({'error': 'Lead not found.'}, status=status.HTTP_404_NOT_FOUND)

