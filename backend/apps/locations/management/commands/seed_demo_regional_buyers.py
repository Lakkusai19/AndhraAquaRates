import os
import decimal
import secrets
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.locations.models import District, MarketLocation
from apps.products.models import Product, ShrimpCount
from apps.buyers.models import BuyerProfile
from apps.subscriptions.models import SubscriptionPlan, BuyerSubscription
from apps.pricing.models import PriceSheet, PriceEntry
from apps.payments.models import PaymentTransaction

DEMO_REGIONAL_BUYERS = [
    {
        'email': 'vizag.marine@example.com',
        'biz': 'Vizag Bay Marine Exports',
        'contact': 'Ramesh Varma',
        'phone': '+919849112233',
        'wa': '+919849112233',
        'type': 'EXPORTER',
        'dist': 'Visakhapatnam',
        'market': 'Visakhapatnam Major Fishing Harbor',
        'payment_terms': 'Spot Payment',
        'rates': {
            30: 520, 40: 450, 50: 395, 60: 350, 70: 315, 80: 285, 90: 255, 100: 230, 120: 195, 150: 165
        },
        'note': 'Direct harbor export gate delivery. Spot RTGS on weighment.'
    },
    {
        'email': 'srikakulam.aqua@example.com',
        'biz': 'Bhavanapadu Aqua Traders',
        'contact': 'Jagannadham Naidu',
        'phone': '+919849223344',
        'wa': '+919849223344',
        'type': 'WHOLESALER',
        'dist': 'Srikakulam',
        'market': 'Bhavanapadu Fishing Harbor',
        'payment_terms': 'Within 2 Days',
        'rates': {
            30: 500, 40: 430, 50: 380, 60: 338, 70: 302, 80: 272, 90: 245, 100: 220, 120: 188, 150: 158
        },
        'note': 'North coastal procurement. Weighment at harbor point.'
    },
    {
        'email': 'tirupati.seafood@example.com',
        'biz': 'Swarnamukhi Coastal Aqua Merchants',
        'contact': 'Subramanyam Reddy',
        'phone': '+919849334455',
        'wa': '+919849334455',
        'type': 'WHOLESALER',
        'dist': 'Tirupati',
        'market': 'Sullurpeta Coastal Aqua Center',
        'payment_terms': 'Spot Payment',
        'rates': {
            30: 512, 40: 442, 50: 388, 60: 345, 70: 310, 80: 280, 90: 252, 100: 225, 120: 190, 150: 162
        },
        'note': 'Pulicat lake and coastal belt ponds. Spot cash or bank transfer.'
    },
    {
        'email': 'guntur.delta@example.com',
        'biz': 'Guntur Delta Seafood Processors',
        'contact': 'Venkateswara Rao',
        'phone': '+919849445566',
        'wa': '+919849445566',
        'type': 'PROCESSOR',
        'dist': 'Guntur',
        'market': 'Guntur Aqua Trade Terminal',
        'payment_terms': 'Within 3 Days',
        'rates': {
            30: 508, 40: 438, 50: 384, 60: 342, 70: 306, 80: 276, 90: 248, 100: 222, 120: 188, 150: 160
        },
        'note': 'Large processing plant requirements. Insulated tankers supplied.'
    },
    {
        'email': 'eluru.kolleru@example.com',
        'biz': 'Kolleru Fresh Aqua Buyers',
        'contact': 'Satyanarayana Murthy',
        'phone': '+919849556677',
        'wa': '+919849556677',
        'type': 'WHOLESALER',
        'dist': 'Eluru',
        'market': 'Eluru Wholesale Aquaculture Mandi',
        'payment_terms': 'Spot Payment',
        'rates': {
            30: 510, 40: 440, 50: 386, 60: 344, 70: 308, 80: 278, 90: 250, 100: 224, 120: 190, 150: 162
        },
        'note': 'Kolleru region pond procurement. Instant weighbridge slip and payout.'
    },
    {
        'email': 'ntr.vijayawada@example.com',
        'biz': 'Krishna Valley Aqua Traders',
        'contact': 'Madhava Rao',
        'phone': '+919849667788',
        'wa': '+919849667788',
        'type': 'COMMISSION_AGENT',
        'dist': 'NTR (Vijayawada)',
        'market': 'Vijayawada Wholesale Aqua & Fishery Terminal',
        'payment_terms': 'Spot Payment',
        'rates': {
            30: 514, 40: 444, 50: 390, 60: 346, 70: 310, 80: 280, 90: 252, 100: 226, 120: 192, 150: 164
        },
        'note': 'Central trading hub. Immediate NEFT/RTGS payment.'
    },
    {
        'email': 'prakasam.marine@example.com',
        'biz': 'Ongole Coastal Marine Buyers',
        'contact': 'Siva Kumar Reddy',
        'phone': '+919849778899',
        'wa': '+919849778899',
        'type': 'EXPORTER',
        'dist': 'Prakasam',
        'market': 'Ongole Commercial Aqua Mandi',
        'payment_terms': 'Within 7 Days',
        'rates': {
            30: 518, 40: 448, 50: 392, 60: 348, 70: 312, 80: 282, 90: 254, 100: 228, 120: 194, 150: 164
        },
        'note': 'Direct exporter rates. Premium rates for export quality count.'
    },
    {
        'email': 'anakapalli.coast@example.com',
        'biz': 'Anakapalli Fishery & Aqua Hub',
        'contact': 'Appala Raju',
        'phone': '+919849889900',
        'wa': '+919849889900',
        'type': 'WHOLESALER',
        'dist': 'Anakapalli',
        'market': 'Anakapalli Commercial Mandi & Aqua Hub',
        'payment_terms': 'Spot Payment',
        'rates': {
            30: 505, 40: 435, 50: 382, 60: 340, 70: 305, 80: 275, 90: 246, 100: 222, 120: 188, 150: 158
        },
        'note': 'Local pond collection. Spot cash payment upon weighment.'
    },
]

class Command(BaseCommand):
    help = 'Seeds verified buyers and published price sheets for regional AP districts.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding regional AP verified buyers..."))
        now = timezone.now()

        vannamei = Product.objects.get(slug='vannamei')
        monthly_plan = SubscriptionPlan.objects.first()
        if not monthly_plan:
            monthly_plan = SubscriptionPlan.objects.create(
                name='Standard Monthly Buyer Plan',
                description='Full access to publish daily shrimp procurement prices.',
                amount=decimal.Decimal('499.00'),
                currency='INR',
                billing_interval='MONTH',
                billing_interval_count=1,
                is_active=True
            )
        count_objs = {c.count_value: c for c in ShrimpCount.objects.all()}

        created_count = 0
        for b in DEMO_REGIONAL_BUYERS:
            district = District.objects.get(name=b['dist'])
            market = MarketLocation.objects.get(district=district, name=b['market'])

            user, _ = User.objects.get_or_create(
                email=b['email'],
                defaults={
                    'role': 'BUYER',
                    'is_active': True,
                    'email_verified': True
                }
            )
            if not user.has_usable_password():
                buyer_password = os.getenv('DEMO_BUYER_PASSWORD') or secrets.token_urlsafe(16)
                user.set_password(buyer_password)
                user.save()

            buyer, _ = BuyerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': b['biz'],
                    'contact_person': b['contact'],
                    'phone': b['phone'],
                    'whatsapp_number': b['wa'],
                    'business_type': b['type'],
                    'state': district.state,
                    'district': district,
                    'town_market': market.name,
                    'verification_status': 'VERIFIED',
                    'is_featured': True
                }
            )

            # Subscription
            sub, _ = BuyerSubscription.objects.get_or_create(
                buyer=buyer,
                defaults={
                    'plan': monthly_plan,
                    'provider': 'RAZORPAY',
                    'provider_subscription_id': f"sub_reg_{buyer.id}",
                    'status': 'ACTIVE',
                    'started_at': now - timedelta(days=5),
                    'current_period_start': now - timedelta(days=2),
                    'current_period_end': now + timedelta(days=28),
                }
            )

            # Payment
            PaymentTransaction.objects.get_or_create(
                provider_order_id=f"order_reg_{buyer.id}",
                defaults={
                    'buyer': buyer,
                    'subscription': sub,
                    'provider_payment_id': f"pay_reg_{buyer.id}",
                    'amount': monthly_plan.amount,
                    'currency': 'INR',
                    'status': 'SUCCESS',
                    'verified_at': now - timedelta(days=2),
                }
            )

            # PriceSheet
            sheet, _ = PriceSheet.objects.get_or_create(
                buyer=buyer,
                product=vannamei,
                market_location=market,
                price_date=now.date(),
                defaults={
                    'status': 'PUBLISHED',
                    'payment_terms': b.get('payment_terms', 'Spot Payment'),
                    'published_at': now - timedelta(hours=1),
                }
            )

            for cnt_val, rate in b['rates'].items():
                if cnt_val in count_objs:
                    PriceEntry.objects.get_or_create(
                        price_sheet=sheet,
                        shrimp_count=count_objs[cnt_val],
                        defaults={
                            'price_per_kg': decimal.Decimal(str(rate)),
                            'quantity_capacity': 'Any quantity from 500kg up to 20 Tons',
                            'buyer_note': b['note'],
                            'payment_terms': b.get('payment_terms', 'Spot Payment'),
                            'buying_availability': True,
                        }
                    )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully configured {created_count} regional verified buyers with live prices!"))
