from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Max, Q
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import PriceSheet, PriceEntry, PriceRevision
from .serializers import (
    PriceSheetCreateUpdateSerializer,
    PublicComparisonItemSerializer,
    PriceEntrySerializer
)
from apps.products.models import Product, ShrimpCount
from apps.locations.models import MarketLocation
from apps.buyers.models import BuyerProfile
from apps.audit.models import AuditLog

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PublicPriceComparisonView(APIView):
    """
    Public comparison engine for shrimp farmers.
    Requires no login, registration or fee.
    Returns count-wise purchasing rates from subscribed verified buyers.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        freshness_threshold = timezone.now() - timedelta(hours=24)

        # 1. Base query: Published sheets from verified buyers with an ACTIVE subscription
        entries = PriceEntry.objects.filter(
            price_sheet__status='PUBLISHED',
            price_sheet__buyer__verification_status='VERIFIED',
            price_sheet__buyer__subscriptions__status='ACTIVE',
            price_sheet__buyer__subscriptions__current_period_end__gte=now,
            buying_availability=True
        ).select_related(
            'price_sheet',
            'price_sheet__buyer',
            'price_sheet__buyer__district',
            'price_sheet__buyer__state',
            'price_sheet__market_location',
            'price_sheet__market_location__district',
            'price_sheet__product',
            'shrimp_count'
        ).distinct()

        # 2. Filtering
        district_param = request.query_params.get('district')
        if district_param:
            if district_param.isdigit():
                entries = entries.filter(price_sheet__market_location__district_id=int(district_param))
            else:
                entries = entries.filter(price_sheet__market_location__district__name__icontains=district_param)

        market_param = request.query_params.get('market')
        if market_param:
            if market_param.isdigit():
                entries = entries.filter(price_sheet__market_location_id=int(market_param))
            else:
                entries = entries.filter(price_sheet__market_location__name__icontains=market_param)

        count_param = request.query_params.get('count')
        if count_param and count_param.isdigit():
            entries = entries.filter(shrimp_count__count_value=int(count_param))

        min_price = request.query_params.get('min_price')
        if min_price:
            try:
                entries = entries.filter(price_per_kg__gte=Decimal(min_price))
            except Exception:
                pass

        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                entries = entries.filter(price_per_kg__lte=Decimal(max_price))
            except Exception:
                pass

        buyer_search = request.query_params.get('buyer')
        if buyer_search:
            entries = entries.filter(price_sheet__buyer__business_name__icontains=buyer_search)

        fresh_only = request.query_params.get('fresh_only')
        if fresh_only and fresh_only.lower() in ('true', '1', 'yes'):
            entries = entries.filter(price_sheet__updated_at__gte=freshness_threshold)

        # 3. Sorting
        sort_param = request.query_params.get('sort', 'highest_price')
        if sort_param == 'highest_price':
            entries = entries.order_by('-price_per_kg', '-price_sheet__updated_at')
        elif sort_param == 'lowest_price':
            entries = entries.order_by('price_per_kg', '-price_sheet__updated_at')
        elif sort_param == 'recently_updated':
            entries = entries.order_by('-price_sheet__updated_at', '-price_per_kg')
        elif sort_param == 'oldest_update':
            entries = entries.order_by('price_sheet__updated_at', '-price_per_kg')
        elif sort_param == 'location_asc':
            entries = entries.order_by('price_sheet__market_location__district__name', 'price_sheet__market_location__name')
        else:
            entries = entries.order_by('-price_per_kg', '-price_sheet__updated_at')

        # Find highest price in the currently filtered result set
        highest_rate = entries.aggregate(max_rate=Max('price_per_kg'))['max_rate']

        # 4. Pagination
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(entries, request)

        results = []
        for entry in (page if page is not None else entries):
            buyer = entry.price_sheet.buyer
            loc = entry.price_sheet.market_location
            is_fresh = (now - entry.price_sheet.updated_at) <= timedelta(hours=24)
            is_highest = (highest_rate is not None and entry.price_per_kg == highest_rate)

            results.append({
                'sheet_id': entry.price_sheet.id,
                'entry_id': entry.id,
                'buyer_id': buyer.id,
                'buyer_name': buyer.business_name,
                'contact_person': buyer.contact_person,
                'business_type': buyer.get_business_type_display(),
                'shrimp_count': entry.shrimp_count.count_value,
                'count_label': entry.shrimp_count.label,
                'price_per_kg': entry.price_per_kg,
                'unit': entry.price_sheet.product.default_price_unit,
                'state_name': loc.district.state.name,
                'district_name': loc.district.name,
                'market_name': loc.name,
                'price_date': entry.price_sheet.price_date,
                'updated_at': entry.price_sheet.updated_at,
                'is_fresh': is_fresh,
                'freshness_status': 'Fresh Today' if is_fresh else 'Stale / Needs Verification',
                'is_highest': is_highest,
                'tel_link': buyer.formatted_tel_link,
                'whatsapp_link': buyer.get_whatsapp_chat_link(
                    shrimp_count=entry.shrimp_count.count_value,
                    rate=entry.price_per_kg
                ),
                'payment_terms': entry.payment_terms or 'Spot Payment',
                'buyer_note': entry.buyer_note,
                'quantity_capacity': entry.quantity_capacity,
                'is_featured': buyer.is_featured,
            })

        if page is not None:
            return paginator.get_paginated_response(results)
        return Response({'results': results, 'count': len(results)})


class PublicPriceSheetDetailView(APIView):
    """View full details of a specific price sheet."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        sheet = PriceSheet.objects.filter(
            pk=pk,
            status='PUBLISHED',
            buyer__verification_status='VERIFIED'
        ).select_related('buyer', 'market_location', 'market_location__district', 'product').first()

        if not sheet:
            return Response({'error': 'Price sheet not found.'}, status=status.HTTP_404_NOT_FOUND)

        buyer = sheet.buyer
        entries = sheet.entries.filter(buying_availability=True).select_related('shrimp_count').order_by('shrimp_count__count_value')
        
        entries_data = []
        for e in entries:
            entries_data.append({
                'id': e.id,
                'count_value': e.shrimp_count.count_value,
                'count_label': e.shrimp_count.label,
                'price_per_kg': e.price_per_kg,
                'quantity_capacity': e.quantity_capacity,
                'buyer_note': e.buyer_note,
                'whatsapp_link': buyer.get_whatsapp_chat_link(e.shrimp_count.count_value, e.price_per_kg),
            })

        return Response({
            'id': sheet.id,
            'buyer_id': buyer.id,
            'buyer_name': buyer.business_name,
            'contact_person': buyer.contact_person,
            'business_type': buyer.get_business_type_display(),
            'tel_link': buyer.formatted_tel_link,
            'whatsapp_link': buyer.get_whatsapp_chat_link(),
            'state_name': sheet.market_location.district.state.name,
            'district_name': sheet.market_location.district.name,
            'market_name': sheet.market_location.name,
            'product_name': sheet.product.name,
            'default_unit': sheet.product.default_price_unit,
            'price_date': sheet.price_date,
            'updated_at': sheet.updated_at,
            'is_fresh': sheet.is_fresh,
            'entries': entries_data,
        })


class BuyerPriceSheetListCreateView(APIView):
    """
    Authenticated Buyer endpoint to manage daily price sheets.
    Strictly blocked if subscription is inactive/expired!
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Buyer profile required.'}, status=status.HTTP_403_FORBIDDEN)

        sheets = PriceSheet.objects.filter(buyer=request.user.buyer_profile).select_related(
            'market_location', 'market_location__district', 'product'
        ).prefetch_related('entries', 'entries__shrimp_count').order_by('-price_date', '-updated_at')

        data = []
        for s in sheets:
            entries_list = [
                {
                    'id': e.id,
                    'shrimp_count_id': e.shrimp_count_id,
                    'count_value': e.shrimp_count.count_value,
                    'count_label': e.shrimp_count.label,
                    'price_per_kg': e.price_per_kg,
                    'quantity_capacity': e.quantity_capacity,
                    'payment_terms': e.payment_terms or 'Spot Payment',
                    'buyer_note': e.buyer_note,
                    'buying_availability': e.buying_availability,
                }
                for e in s.entries.all()
            ]
            data.append({
                'id': s.id,
                'price_date': s.price_date,
                'status': s.status,
                'payment_terms': s.payment_terms or 'Spot Payment',
                'is_fresh': s.is_fresh,
                'product_id': s.product_id,
                'product_name': s.product.name,
                'market_location_id': s.market_location_id,
                'market_name': s.market_location.name,
                'district_name': s.market_location.district.name,
                'updated_at': s.updated_at,
                'entries': entries_list,
            })
        return Response(data)

    def post(self, request):
        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Buyer profile required.'}, status=status.HTTP_403_FORBIDDEN)

        buyer = request.user.buyer_profile

        # CRITICAL PRINCIPLE: Verify active subscription on backend!
        if not buyer.has_active_subscription():
            return Response({
                'error': 'Active subscription required. Please subscribe or renew your subscription to publish prices.',
                'code': 'SUBSCRIPTION_INACTIVE',
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = PriceSheetCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        price_date = data.get('price_date') or timezone.now().date()
        target_status = data.get('status', 'PUBLISHED')

        try:
            product = Product.objects.get(id=data['product_id'], is_active=True)
            market_loc = MarketLocation.objects.get(id=data['market_location_id'], is_active=True)
        except (Product.DoesNotExist, MarketLocation.DoesNotExist):
            return Response({'error': 'Invalid product or market location.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            sheet, created = PriceSheet.objects.get_or_create(
                buyer=buyer,
                product=product,
                market_location=market_loc,
                price_date=price_date,
                defaults={
                    'status': target_status,
                    'payment_terms': data.get('payment_terms', 'Spot Payment'),
                    'published_at': timezone.now() if target_status == 'PUBLISHED' else None,
                }
            )

            if not created:
                sheet.status = target_status
                if 'payment_terms' in data:
                    sheet.payment_terms = data['payment_terms']
                if target_status == 'PUBLISHED' and not sheet.published_at:
                    sheet.published_at = timezone.now()
                sheet.save()

            # Process entries and audit revisions
            for entry_data in data['entries']:
                count_id = entry_data['shrimp_count_id']
                new_price = entry_data['price_per_kg']
                shrimp_count = ShrimpCount.objects.get(id=count_id)

                entry, entry_created = PriceEntry.objects.get_or_create(
                    price_sheet=sheet,
                    shrimp_count=shrimp_count,
                    defaults={
                        'price_per_kg': new_price,
                        'quantity_capacity': entry_data.get('quantity_capacity', ''),
                        'payment_terms': entry_data.get('payment_terms') or data.get('payment_terms', 'Spot Payment'),
                        'buyer_note': entry_data.get('buyer_note', ''),
                        'buying_availability': entry_data.get('buying_availability', True),
                    }
                )

                if not entry_created:
                    old_price = entry.price_per_kg
                    if old_price != new_price:
                        PriceRevision.objects.create(
                            price_entry=entry,
                            previous_price=old_price,
                            new_price=new_price,
                            changed_by=request.user,
                            change_source='BUYER_UPDATE',
                            changed_at=timezone.now()
                        )
                    entry.price_per_kg = new_price
                    entry.quantity_capacity = entry_data.get('quantity_capacity', '')
                    entry.payment_terms = entry_data.get('payment_terms') or data.get('payment_terms', 'Spot Payment')
                    entry.buyer_note = entry_data.get('buyer_note', '')
                    entry.buying_availability = entry_data.get('buying_availability', True)
                    entry.save()
                else:
                    PriceRevision.objects.create(
                        price_entry=entry,
                        previous_price=None,
                        new_price=new_price,
                        changed_by=request.user,
                        change_source='INITIAL_RATE',
                        changed_at=timezone.now()
                    )

            # Automatically purge price revision history older than 1 week (7 days)
            PriceRevision.cleanup_expired_revisions(days=7)

            if not created:
                submitted_count_ids = [entry_data['shrimp_count_id'] for entry_data in data['entries']]
                PriceEntry.objects.filter(price_sheet=sheet).exclude(shrimp_count_id__in=submitted_count_ids).delete()

            AuditLog.objects.create(
                actor=request.user,
                action='PRICE_SHEET_SAVED',
                entity_type='PriceSheet',
                entity_id=str(sheet.id),
                metadata={'date': str(price_date), 'status': target_status, 'entries_count': len(data['entries'])}
            )

        return Response({
            'message': 'Price sheet successfully saved and updated.',
            'id': sheet.id,
            'sheet_id': sheet.id,
            'status': sheet.status,
            'updated_at': sheet.updated_at,
        }, status=status.HTTP_201_CREATED)


class BuyerPriceSheetDetailUpdateView(APIView):
    """Update or retrieve an individual price sheet."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            sheet = PriceSheet.objects.select_related('product', 'market_location', 'market_location__district').get(
                pk=pk, buyer=request.user.buyer_profile
            )
        except PriceSheet.DoesNotExist:
            return Response({'error': 'Price sheet not found.'}, status=status.HTTP_404_NOT_FOUND)

        entries = sheet.entries.select_related('shrimp_count').all()
        serializer = PriceEntrySerializer(entries, many=True)
        return Response({
            'id': sheet.id,
            'product_id': sheet.product_id,
            'market_location_id': sheet.market_location_id,
            'price_date': sheet.price_date,
            'status': sheet.status,
            'updated_at': sheet.updated_at,
            'entries': serializer.data,
        })

    def patch(self, request, pk):
        if not request.user.buyer_profile.has_active_subscription():
            return Response({'error': 'Active subscription required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            sheet = PriceSheet.objects.get(pk=pk, buyer=request.user.buyer_profile)
        except PriceSheet.DoesNotExist:
            return Response({'error': 'Price sheet not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PriceSheetCreateUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update sheet entries and record revisions
        with transaction.atomic():
            if 'entries' in serializer.validated_data:
                submitted_count_ids = [e['shrimp_count_id'] for e in serializer.validated_data['entries']]
                PriceEntry.objects.filter(price_sheet=sheet).exclude(shrimp_count_id__in=submitted_count_ids).delete()

            for entry_data in serializer.validated_data.get('entries', []):
                count_id = entry_data['shrimp_count_id']
                new_price = entry_data['price_per_kg']
                shrimp_count = ShrimpCount.objects.get(id=count_id)
                entry, entry_created = PriceEntry.objects.get_or_create(
                    price_sheet=sheet,
                    shrimp_count=shrimp_count,
                    defaults={
                        'price_per_kg': new_price,
                        'quantity_capacity': entry_data.get('quantity_capacity', ''),
                        'buyer_note': entry_data.get('buyer_note', ''),
                        'buying_availability': entry_data.get('buying_availability', True),
                    }
                )
                if not entry_created:
                    if entry.price_per_kg != new_price:
                        PriceRevision.objects.create(
                            price_entry=entry,
                            previous_price=entry.price_per_kg,
                            new_price=new_price,
                            changed_by=request.user,
                            change_source='BUYER_UPDATE',
                            changed_at=timezone.now()
                        )
                    entry.price_per_kg = new_price
                    entry.quantity_capacity = entry_data.get('quantity_capacity', entry.quantity_capacity)
                    entry.buyer_note = entry_data.get('buyer_note', entry.buyer_note)
                    entry.buying_availability = entry_data.get('buying_availability', entry.buying_availability)
                    entry.save()
                else:
                    PriceRevision.objects.create(
                        price_entry=entry,
                        previous_price=None,
                        new_price=new_price,
                        changed_by=request.user,
                        change_source='INITIAL_RATE',
                        changed_at=timezone.now()
                    )
            sheet.status = 'PUBLISHED'
            sheet.save()
            # Automatically purge price revision history older than 1 week (7 days)
            PriceRevision.cleanup_expired_revisions(days=7)

        return Response({'message': 'Price sheet updated successfully.', 'id': sheet.id})

    def delete(self, request, pk):
        is_admin = request.user and (request.user.role == 'ADMIN' or request.user.is_staff)
        if not is_admin and not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Buyer profile required.'}, status=status.HTTP_403_FORBIDDEN)

        if is_admin:
            sheet = PriceSheet.objects.select_related('market_location').filter(pk=pk).first()
        else:
            sheet = PriceSheet.objects.select_related('market_location').filter(pk=pk, buyer=request.user.buyer_profile).first()

        if not sheet:
            return Response({'error': 'Price sheet not found.'}, status=status.HTTP_404_NOT_FOUND)

        sheet_id = sheet.id
        sheet_date = str(sheet.price_date)
        market_name = sheet.market_location.name
        
        # Delete sheet (cascades to PriceEntries)
        sheet.delete()

        AuditLog.objects.create(
            actor=request.user,
            action='PRICE_SHEET_DELETED',
            entity_type='PriceSheet',
            entity_id=str(sheet_id),
            metadata={'date': sheet_date, 'market': market_name, 'by_admin': is_admin}
        )

        return Response({
            'message': 'Price sheet deleted successfully.',
            'id': sheet_id
        }, status=status.HTTP_200_OK)


class BuyerPriceEntryDetailDeleteView(APIView):
    """Delete an individual count price entry from a price sheet."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Buyer profile required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            entry = PriceEntry.objects.select_related('price_sheet', 'shrimp_count').get(
                pk=pk, price_sheet__buyer=request.user.buyer_profile
            )
        except PriceEntry.DoesNotExist:
            return Response({'error': 'Price entry not found.'}, status=status.HTTP_404_NOT_FOUND)

        count_label = entry.shrimp_count.label
        entry_id = entry.id
        sheet_id = entry.price_sheet_id
        entry.delete()

        AuditLog.objects.create(
            actor=request.user,
            action='PRICE_ENTRY_DELETED',
            entity_type='PriceEntry',
            entity_id=str(entry_id),
            metadata={'sheet_id': sheet_id, 'count_label': count_label}
        )

        return Response({
            'message': f'Price for {count_label} deleted successfully.',
            'entry_id': entry_id,
            'sheet_id': sheet_id
        }, status=status.HTTP_200_OK)


class BuyerPriceHistoryView(APIView):
    """Listing historical price revisions and trend entries for buyer with automatic 7-day cleanup."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        is_admin = request.user and (request.user.role == 'ADMIN' or request.user.is_staff)
        if not is_admin and not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Buyer profile required.'}, status=status.HTTP_403_FORBIDDEN)

        # Automatic 1-week cleanup: Purge revisions older than 7 days
        PriceRevision.cleanup_expired_revisions(days=7)

        if is_admin:
            revisions = PriceRevision.objects.select_related(
                'price_entry__shrimp_count', 
                'price_entry__price_sheet__market_location',
                'price_entry__price_sheet__buyer',
                'changed_by'
            ).order_by('-changed_at')[:100]
        else:
            revisions = PriceRevision.objects.filter(
                price_entry__price_sheet__buyer=request.user.buyer_profile
            ).select_related(
                'price_entry__shrimp_count', 
                'price_entry__price_sheet__market_location',
                'changed_by'
            ).order_by('-changed_at')[:100]

        data = [
            {
                'id': rev.id,
                'count_label': rev.price_entry.shrimp_count.label if rev.price_entry and rev.price_entry.shrimp_count else '',
                'market_name': rev.price_entry.price_sheet.market_location.name if rev.price_entry and rev.price_entry.price_sheet and rev.price_entry.price_sheet.market_location else 'Coastal AP Hub',
                'buyer_name': rev.price_entry.price_sheet.buyer.business_name if rev.price_entry and rev.price_entry.price_sheet and rev.price_entry.price_sheet.buyer else '',
                'previous_price': str(rev.previous_price) if rev.previous_price is not None else None,
                'new_price': str(rev.new_price),
                'changed_at': rev.changed_at,
                'change_source': rev.change_source,
                'changed_by_email': rev.changed_by.email if rev.changed_by else None,
            }
            for rev in revisions
        ]
        return Response(data)

