import decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.locations.models import State, District, MarketLocation
from apps.products.models import Product, ShrimpCount
from apps.buyers.models import BuyerProfile
from apps.subscriptions.models import SubscriptionPlan, BuyerSubscription
from apps.pricing.models import PriceSheet, PriceEntry, PriceRevision
from apps.payments.models import PaymentTransaction
from apps.audit.models import AuditLog

class Command(BaseCommand):
    help = 'Seeds initial administrative locations, products, shrimp counts, plans, and development demo data.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Delete existing pricing, buyers, and locations data before seeding.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding ANDHRA AQUA RATES Master Data..."))

        if options['clean']:
            self.stdout.write("Cleaning existing database records...")
            PriceRevision.objects.all().delete()
            PriceEntry.objects.all().delete()
            PriceSheet.objects.all().delete()
            PaymentTransaction.objects.all().delete()
            BuyerSubscription.objects.all().delete()
            BuyerProfile.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            MarketLocation.objects.all().delete()
            District.objects.all().delete()
            State.objects.all().delete()
            ShrimpCount.objects.all().delete()
            Product.objects.all().delete()

        now = timezone.now()

        # 1. State: Andhra Pradesh
        ap_state, _ = State.objects.get_or_create(
            code='AP',
            defaults={'name': 'Andhra Pradesh', 'is_active': True}
        )
        self.stdout.write(f"[OK] State: {ap_state.name}")

        # 2. All 26 Andhra Pradesh Districts & Shrimp Markets
        from apps.locations.management.commands.seed_all_ap_districts import ALL_AP_DISTRICTS_DATA
        district_data = ALL_AP_DISTRICTS_DATA

        created_markets = {}
        for dist_name, markets in district_data:
            district, _ = District.objects.get_or_create(
                state=ap_state,
                name=dist_name,
                defaults={'is_active': True}
            )
            for m_name, l_type in markets:
                loc, _ = MarketLocation.objects.get_or_create(
                    district=district,
                    name=m_name,
                    defaults={'location_type': l_type, 'is_active': True}
                )
                created_markets[m_name] = loc

        self.stdout.write(f"[OK] Configured {len(district_data)} AP districts and {len(created_markets)} market locations.")

        # 3. Products
        vannamei, _ = Product.objects.get_or_create(
            slug='vannamei',
            defaults={
                'name': 'Vannamei Shrimp',
                'description': 'Pacific white shrimp (Litopenaeus vannamei), the dominant commercial cultured shrimp in Andhra Pradesh.',
                'default_price_unit': '₹/kg',
                'is_active': True
            }
        )

        black_tiger, _ = Product.objects.get_or_create(
            slug='black-tiger',
            defaults={
                'name': 'Black Tiger Shrimp',
                'description': 'Giant tiger prawn (Penaeus monodon), premium brackish water cultured shrimp.',
                'default_price_unit': '₹/kg',
                'is_active': True
            }
        )

        # 4. Shrimp Counts
        standard_counts = [
            (30, '30 Count', 1),
            (40, '40 Count', 2),
            (50, '50 Count', 3),
            (60, '60 Count', 4),
            (70, '70 Count', 5),
            (80, '80 Count', 6),
            (90, '90 Count', 7),
            (100, '100 Count', 8),
            (120, '120 Count', 9),
            (150, '150 Count', 10),
        ]

        count_objs = {}
        for val, label, order in standard_counts:
            cnt, _ = ShrimpCount.objects.get_or_create(
                product=vannamei,
                count_value=val,
                defaults={'label': label, 'display_order': order, 'is_active': True}
            )
            count_objs[val] = cnt
        self.stdout.write(f"[OK] Configured {len(count_objs)} standard shrimp count grades.")

        # 5. Subscription Plan
        monthly_plan, _ = SubscriptionPlan.objects.get_or_create(
            name='ANDHRA AQUA RATES Buyer Monthly',
            defaults={
                'amount': decimal.Decimal('499.00'),
                'currency': 'INR',
                'billing_interval': 'MONTH',
                'billing_interval_count': 1,
                'description': 'Monthly buyer membership to publish and update daily shrimp purchasing rates across Andhra Pradesh.',
                'is_active': True,
            }
        )

        annual_plan, _ = SubscriptionPlan.objects.get_or_create(
            name='ANDHRA AQUA RATES Buyer Annual',
            defaults={
                'amount': decimal.Decimal('4999.00'),
                'currency': 'INR',
                'billing_interval': 'YEAR',
                'billing_interval_count': 1,
                'description': 'Annual membership with 2 months free discount for commercial processors and exporters.',
                'is_active': True,
            }
        )

        # 6. Admin Account
        admin_user, _ = User.objects.get_or_create(
            email='lakkunagasai1144@gmail.com',
            defaults={
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'email_verified': True,
            }
        )
        admin_user.role = 'ADMIN'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email_verified = True
        admin_user.set_password('Sai@7036114631')
        admin_user.save()
        self.stdout.write(f"[OK] Master Administrator account ready: lakkunagasai1144@gmail.com")

        # 7. Demo Buyers with Active Subscriptions
        demo_buyers_data = [
            {
                'email': 'bhimavaram.exports@example.com',
                'biz': 'Bhimavaram Aqua Exports Ltd',
                'contact': 'Satyanarayana Raju',
                'phone': '+919848012345',
                'wa': '+919848012345',
                'type': 'EXPORTER',
                'dist': 'West Godavari',
                'market': 'Bhimavaram Mandi & Trading Hub',
                'featured': True,
                'active': True,
                # Pricing variations
                'rates': {
                    30: 510, 40: 440, 50: 385, 60: 345, 70: 310, 80: 280, 90: 255, 100: 230, 120: 195, 150: 165
                },
                'note': 'Spot payment at farm gate. Count tolerance +/- 2.'
            },
            {
                'email': 'godavari.coldchain@example.com',
                'biz': 'Godavari Delta Cold Storage & Traders',
                'contact': 'Venkata Ramana Murthy',
                'phone': '+919848123456',
                'wa': '+919848123456',
                'type': 'PROCESSOR',
                'dist': 'Dr. B. R. Ambedkar Konaseema',
                'market': 'Amalapuram Market Center',
                'featured': True,
                'active': True,
                'rates': {
                    30: 505, 40: 435, 50: 380, 60: 340, 70: 305, 80: 275, 90: 250, 100: 225, 120: 190, 150: 160
                },
                'note': 'Bulk harvest purchasing. Immediate RTGS transfer upon weighment.'
            },
            {
                'email': 'kakinada.seafood@example.com',
                'biz': 'Kakinada Sea Breeze Exporters',
                'contact': 'Chaitanya Varma',
                'phone': '+919848234567',
                'wa': '+919848234567',
                'type': 'EXPORTER',
                'dist': 'Kakinada',
                'market': 'Kakinada Deepwater Fishing Harbor',
                'featured': False,
                'active': True,
                'rates': {
                    30: 515, 40: 445, 50: 390, 60: 345, 70: 310, 80: 282, 90: 252, 100: 228, 120: 192, 150: 162
                },
                'note': 'EU & US FDA grade export requirements. Ice boxes arranged by buyer.'
            },
            {
                'email': 'krishna.marine@example.com',
                'biz': 'Krishna Coast Marine Processors',
                'contact': 'Srinivasa Rao',
                'phone': '+919848345678',
                'wa': '+919848345678',
                'type': 'WHOLESALER',
                'dist': 'Krishna',
                'market': 'Machilipatnam Coastal Harbor',
                'featured': False,
                'active': True,
                'rates': {
                    30: 495, 40: 425, 50: 375, 60: 335, 70: 300, 80: 270, 90: 245, 100: 220, 120: 185, 150: 155
                },
                'note': 'Accepting small and large ponds. Daily weighing at landing center.'
            },
            {
                'email': 'nellore.seafoods@example.com',
                'biz': 'Nellore Coastal Seafoods & Wholesalers',
                'contact': 'Prasad Reddy',
                'phone': '+919848456789',
                'wa': '+919848456789',
                'type': 'WHOLESALER',
                'dist': 'Nellore',
                'market': 'Nellore City Wholesale Aqua Terminal',
                'featured': True,
                'active': True,
                'rates': {
                    30: 508, 40: 438, 50: 382, 60: 342, 70: 308, 80: 278, 90: 252, 100: 226, 120: 192, 150: 164
                },
                'note': 'Prompt settlement on the spot. Minimum quantity 500 kg.'
            },
            {
                'email': 'nizampatnam.traders@example.com',
                'biz': 'Nizampatnam Harbor Traders',
                'contact': 'Koteswara Rao',
                'phone': '+919848567890',
                'wa': '+919848567890',
                'type': 'COMMISSION_AGENT',
                'dist': 'Bapatla',
                'market': 'Nizampatnam Fishery Harbor',
                'featured': False,
                'active': False, # Inactive/Expired to test subscription rule!
                'rates': {
                    30: 480, 40: 410, 50: 360, 60: 320, 70: 290, 80: 260, 90: 235, 100: 210, 120: 180, 150: 150
                },
                'note': 'Test inactive buyer account.'
            }
        ]

        for b_data in demo_buyers_data:
            user, u_created = User.objects.get_or_create(
                email=b_data['email'],
                defaults={
                    'role': 'BUYER',
                    'email_verified': True,
                    'is_active': True,
                }
            )
            if u_created:
                user.set_password('BuyerPassword123!')
                user.save()

            dist = District.objects.get(name=b_data['dist'], state=ap_state)
            market = MarketLocation.objects.get(name=b_data['market'], district=dist)

            buyer, _ = BuyerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': b_data['biz'],
                    'contact_person': b_data['contact'],
                    'phone': b_data['phone'],
                    'whatsapp_number': b_data['wa'],
                    'business_type': b_data['type'],
                    'state': ap_state,
                    'district': dist,
                    'town_market': market.name,
                    'business_address': f"Door No. 4-12/A, Main Coastal Road, {market.name}, {dist.name}, AP",
                    'verification_status': 'VERIFIED',
                    'is_featured': b_data['featured'],
                }
            )

            # Subscription creation
            if b_data['active']:
                sub_end = now + timedelta(days=28)
                sub_status = 'ACTIVE'
            else:
                sub_end = now - timedelta(days=5) # Expired
                sub_status = 'EXPIRED'

            sub, _ = BuyerSubscription.objects.get_or_create(
                buyer=buyer,
                defaults={
                    'plan': monthly_plan,
                    'provider': 'RAZORPAY',
                    'provider_subscription_id': f"sub_demo_{buyer.id}",
                    'status': sub_status,
                    'started_at': now - timedelta(days=35),
                    'current_period_start': now - timedelta(days=3),
                    'current_period_end': sub_end,
                }
            )

            # Create payment transaction for active buyers
            if b_data['active']:
                PaymentTransaction.objects.get_or_create(
                    provider_order_id=f"order_demo_{buyer.id}",
                    defaults={
                        'buyer': buyer,
                        'subscription': sub,
                        'provider_payment_id': f"pay_demo_{buyer.id}",
                        'amount': monthly_plan.amount,
                        'currency': 'INR',
                        'status': 'SUCCESS',
                        'verified_at': now - timedelta(days=3),
                    }
                )

            # Create PriceSheet
            sheet, _ = PriceSheet.objects.get_or_create(
                buyer=buyer,
                product=vannamei,
                market_location=market,
                price_date=now.date(),
                defaults={
                    'status': 'PUBLISHED',
                    'published_at': now - timedelta(hours=2),
                }
            )

            for cnt_val, rate in b_data['rates'].items():
                shrimp_count = count_objs[cnt_val]
                entry, e_created = PriceEntry.objects.get_or_create(
                    price_sheet=sheet,
                    shrimp_count=shrimp_count,
                    defaults={
                        'price_per_kg': decimal.Decimal(str(rate)),
                        'quantity_capacity': 'Any quantity from 500kg up to 20 Tons',
                        'buyer_note': b_data['note'],
                        'buying_availability': True,
                    }
                )

                if e_created:
                    # Seed an audit revision to demonstrate revision tracking
                    PriceRevision.objects.create(
                        price_entry=entry,
                        previous_price=decimal.Decimal(str(rate - 5)),
                        new_price=decimal.Decimal(str(rate)),
                        changed_by=user,
                        changed_at=now - timedelta(hours=3),
                        change_source='BUYER_UPDATE'
                    )

            self.stdout.write(f"[OK] Seeded Buyer: {buyer.business_name} ({'Active' if b_data['active'] else 'Expired'})")

        self.stdout.write(self.style.SUCCESS("\nDatabase successfully seeded with Andhra Pradesh master data and verified demo listings!"))
