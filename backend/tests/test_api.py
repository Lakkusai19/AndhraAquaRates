import json
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User
from apps.locations.models import State, District, MarketLocation
from apps.products.models import Product, ShrimpCount
from apps.buyers.models import BuyerProfile
from apps.subscriptions.models import SubscriptionPlan, BuyerSubscription
from apps.pricing.models import PriceSheet, PriceEntry, PriceRevision
from apps.payments.models import PaymentTransaction, WebhookEvent
from apps.payments.services import RazorpayService

class AndhraShrimpHubTests(APITestCase):
    def setUp(self):
        # 1. Location setup
        self.state = State.objects.create(name='Andhra Pradesh', code='AP')
        self.district = District.objects.create(state=self.state, name='West Godavari')
        self.market = MarketLocation.objects.create(district=self.district, name='Bhimavaram Mandi')

        # 2. Product setup
        self.product = Product.objects.create(name='Vannamei Shrimp', slug='vannamei', default_price_unit='₹/kg')
        self.count50 = ShrimpCount.objects.create(product=self.product, count_value=50, label='50 Count', display_order=1)
        self.count80 = ShrimpCount.objects.create(product=self.product, count_value=80, label='80 Count', display_order=2)

        # 3. Plan setup
        self.plan = SubscriptionPlan.objects.create(
            name='Buyer Monthly',
            amount=Decimal('499.00'),
            currency='INR',
            billing_interval='MONTH',
            billing_interval_count=1
        )

        # 4. Buyer User & Profile (Active Subscriber)
        self.active_user = User.objects.create_user(email='buyer_active@example.com', password='Password123!', role='BUYER')
        self.active_buyer = BuyerProfile.objects.create(
            user=self.active_user,
            business_name='Bhimavaram Aqua Prime',
            contact_person='Ramana Rao',
            phone='+919848011223',
            whatsapp_number='+919848011223',
            district=self.district,
            state=self.state,
            verification_status='VERIFIED'
        )
        self.active_sub = BuyerSubscription.objects.create(
            buyer=self.active_buyer,
            plan=self.plan,
            status='ACTIVE',
            current_period_start=timezone.now() - timedelta(days=2),
            current_period_end=timezone.now() + timedelta(days=28)
        )

        # Published PriceSheet for active buyer
        self.active_sheet = PriceSheet.objects.create(
            buyer=self.active_buyer,
            product=self.product,
            market_location=self.market,
            price_date=timezone.now().date(),
            status='PUBLISHED',
            published_at=timezone.now() - timedelta(hours=1)
        )
        self.active_entry = PriceEntry.objects.create(
            price_sheet=self.active_sheet,
            shrimp_count=self.count50,
            price_per_kg=Decimal('380.00'),
            quantity_capacity='10 Tons',
            buying_availability=True
        )

        # 5. Buyer User & Profile (Expired Subscriber)
        self.expired_user = User.objects.create_user(email='buyer_expired@example.com', password='Password123!', role='BUYER')
        self.expired_buyer = BuyerProfile.objects.create(
            user=self.expired_user,
            business_name='Stale Aqua Traders',
            contact_person='Gopal Krishna',
            phone='+919848099887',
            whatsapp_number='+919848099887',
            district=self.district,
            state=self.state,
            verification_status='VERIFIED'
        )
        self.expired_sub = BuyerSubscription.objects.create(
            buyer=self.expired_buyer,
            plan=self.plan,
            status='EXPIRED',
            current_period_start=timezone.now() - timedelta(days=40),
            current_period_end=timezone.now() - timedelta(days=10)
        )
        self.expired_sheet = PriceSheet.objects.create(
            buyer=self.expired_buyer,
            product=self.product,
            market_location=self.market,
            price_date=timezone.now().date(),
            status='PUBLISHED',
            published_at=timezone.now() - timedelta(days=10)
        )
        self.expired_entry = PriceEntry.objects.create(
            price_sheet=self.expired_sheet,
            shrimp_count=self.count50,
            price_per_kg=Decimal('350.00'),
            buying_availability=True
        )

        # 6. Admin User
        self.admin_user = User.objects.create_superuser(email='admin@example.com', password='AdminPassword123!')

    def test_01_public_farmer_can_browse_prices_without_auth(self):
        """Farmers can browse prices without any login or token."""
        url = reverse('pricing-public-comparison')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify only active subscriber listing is returned, expired is excluded
        results = response.data.get('results', [])
        buyer_ids = [r['buyer_id'] for r in results]
        self.assertIn(self.active_buyer.id, buyer_ids)
        self.assertNotIn(self.expired_buyer.id, buyer_ids)

    def test_02_public_farmer_filter_and_sort(self):
        """Farmers can filter by count, location and price."""
        url = reverse('pricing-public-comparison')
        response = self.client.get(url, {'count': 50, 'district': 'West Godavari', 'sort': 'highest_price'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', [])
        self.assertTrue(len(results) >= 1)
        self.assertEqual(results[0]['shrimp_count'], 50)
        self.assertTrue(results[0]['is_highest'])
        self.assertIn('tel:', results[0]['tel_link'])
        self.assertIn('wa.me', results[0]['whatsapp_link'])

    def test_03_buyer_registration_and_login(self):
        """New buyer registers, profile is created, and receives JWT token."""
        reg_url = reverse('auth-register')
        payload = {
            'email': 'new_buyer@example.com',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': 'BUYER',
            'business_name': 'Konaseema Cold Storage',
            'contact_person': 'Anand Varma',
            'phone': '+919848555444',
            'business_type': 'PROCESSOR',
            'terms_agreed': True
        }
        res = self.client.post(reg_url, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertTrue(BuyerProfile.objects.filter(business_name='Konaseema Cold Storage').exists())

        # Test Login
        login_url = reverse('auth-login')
        login_res = self.client.post(login_url, {'email': 'new_buyer@example.com', 'password': 'SecurePassword123!'})
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)

        # Test Registration with Aadhaar upload
        from django.core.files.uploadedfile import SimpleUploadedFile
        aadhar_file = SimpleUploadedFile("sample_aadhar.pdf", b"%PDF-1.4 mock aadhar content", content_type="application/pdf")
        payload_with_aadhar = {
            'email': 'aadhar_buyer@example.com',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': 'BUYER',
            'business_name': 'Kakinada Aqua Mart',
            'contact_person': 'Venkat Raman',
            'phone': '+919848555777',
            'business_type': 'EXPORTER',
            'aadhar_number': '123456789012',
            'aadhar_card': aadhar_file,
            'terms_agreed': True
        }
        res_aadhar = self.client.post(reg_url, payload_with_aadhar, format='multipart')
        self.assertEqual(res_aadhar.status_code, status.HTTP_201_CREATED)
        created_buyer = BuyerProfile.objects.get(business_name='Kakinada Aqua Mart')
        self.assertEqual(created_buyer.aadhar_number, '123456789012')
        self.assertTrue(bool(created_buyer.aadhar_card))

    def test_04_unsubscribed_buyer_cannot_publish_prices(self):
        """A buyer without an active subscription receives HTTP 403 when trying to publish prices."""
        self.client.force_authenticate(user=self.expired_user)
        url = reverse('pricing-buyer-sheets')
        payload = {
            'product_id': self.product.id,
            'market_location_id': self.market.id,
            'status': 'PUBLISHED',
            'entries': [
                {'shrimp_count_id': self.count50.id, 'price_per_kg': '390.00'}
            ]
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.data.get('code'), 'SUBSCRIPTION_INACTIVE')

    def test_05_active_buyer_can_publish_and_update_prices_with_revisions(self):
        """Subscribed buyer publishes prices and updates record with revision history."""
        self.client.force_authenticate(user=self.active_user)
        url = reverse('pricing-buyer-sheets')
        payload = {
            'product_id': self.product.id,
            'market_location_id': self.market.id,
            'status': 'PUBLISHED',
            'entries': [
                {'shrimp_count_id': self.count50.id, 'price_per_kg': '385.00', 'quantity_capacity': '5 Tons', 'buyer_note': 'Grade A only'},
                {'shrimp_count_id': self.count80.id, 'price_per_kg': '275.00'}
            ]
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Verify entry update created revision
        entry = PriceEntry.objects.get(price_sheet__buyer=self.active_buyer, shrimp_count=self.count50)
        self.assertEqual(entry.price_per_kg, Decimal('385.00'))
        self.assertTrue(PriceRevision.objects.filter(price_entry=entry).exists())

    def test_06_razorpay_checkout_and_verification(self):
        """Buyer initiates checkout, verifies payment with signature, and unlocks publishing."""
        # Unsubscribed buyer
        user = User.objects.create_user(email='fresh_buyer@example.com', password='Password123!', role='BUYER')
        buyer = BuyerProfile.objects.create(
            user=user,
            business_name='Delta Seafoods',
            contact_person='Raghu',
            phone='+919848111222'
        )
        self.client.force_authenticate(user=user)

        # 1. Initiate checkout
        checkout_url = reverse('payments-checkout')
        res = self.client.post(checkout_url, {'plan_id': self.plan.id})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        order_id = res.data['order_id']
        self.assertTrue(order_id)

        # 2. Verify payment signature
        verify_url = reverse('payments-verify')
        verify_payload = {
            'order_id': order_id,
            'payment_id': f"pay_test_{order_id}",
            'signature': 'mock_valid_signature',
            'plan_id': self.plan.id
        }
        verify_res = self.client.post(verify_url, verify_payload)
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_res.data['can_publish_prices'])
        self.assertTrue(buyer.has_active_subscription())

    def test_07_razorpay_webhook_idempotency(self):
        """Webhook receives event, processes it, and duplicate events are safely handled."""
        webhook_url = reverse('payments-webhook-razorpay')
        payload = {
            'event_id': 'evt_test_unique_12345',
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_wh_123',
                        'order_id': 'order_wh_123',
                        'method': 'UPI',
                        'notes': {
                            'buyer_id': str(self.expired_buyer.id),
                            'plan_id': str(self.plan.id),
                        }
                    }
                }
            }
        }
        raw_body = json.dumps(payload).encode('utf-8')
        
        # Post first time with valid mock signature
        res1 = self.client.post(
            webhook_url,
            data=raw_body,
            content_type='application/json',
            HTTP_X_RAZORPAY_SIGNATURE='mock_webhook_valid'
        )
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(WebhookEvent.objects.filter(event_id='evt_test_unique_12345').exists())

        # Post duplicate event
        res2 = self.client.post(
            webhook_url,
            data=raw_body,
            content_type='application/json',
            HTTP_X_RAZORPAY_SIGNATURE='mock_webhook_valid'
        )
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertIn('Duplicate', res2.data.get('status', ''))

    def test_08_admin_stats_and_moderation(self):
        """Admin can access stats and moderate buyer verification status."""
        self.client.force_authenticate(user=self.admin_user)
        stats_url = reverse('admin-stats')
        res = self.client.get(stats_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('buyers', res.data)
        self.assertIn('listings', res.data)
        self.assertIn('financials', res.data)

        # Moderate buyer status
        manage_url = reverse('admin-buyers-manage')
        mod_res = self.client.patch(manage_url, {
            'buyer_id': self.active_buyer.id,
            'verification_status': 'SUSPENDED'
        })
        self.assertEqual(mod_res.status_code, status.HTTP_200_OK)
        self.active_buyer.refresh_from_db()
        self.assertEqual(self.active_buyer.verification_status, 'SUSPENDED')

    def test_09_forgot_password_6_digit_code_flow(self):
        """Buyer requests 6-digit OTP code to email, verifies code, and resets password."""
        # Step 1: Request 6-digit code
        request_url = reverse('auth-password-reset-request')
        req_res = self.client.post(request_url, {'email': self.active_user.email})
        self.assertEqual(req_res.status_code, status.HTTP_200_OK)
        
        # Verify code was stored in database
        from apps.accounts.models import PasswordResetCode
        reset_obj = PasswordResetCode.objects.filter(user=self.active_user, is_used=False).latest('created_at')
        self.assertEqual(len(reset_obj.code), 6)
        self.assertTrue(reset_obj.code.isdigit())

        # Step 2: Verify code and set new password
        verify_url = reverse('auth-password-reset-verify')
        new_pass = 'BrandNewSecretPass456!'
        verify_res = self.client.post(verify_url, {
            'email': self.active_user.email,
            'code': reset_obj.code,
            'new_password': new_pass,
            'confirm_password': new_pass,
        })
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', verify_res.data)

        # Step 3: Login with new password
        login_url = reverse('auth-login')
        login_res = self.client.post(login_url, {
            'email': self.active_user.email,
            'password': new_pass,
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_10_admin_edit_buyer_and_reset_buyer_password(self):
        """Admin can edit full buyer details and directly reset any buyer's password."""
        self.client.force_authenticate(user=self.admin_user)

        # 1. Edit buyer details
        detail_url = reverse('admin-buyer-detail-manage', kwargs={'pk': self.active_buyer.id})
        edit_res = self.client.patch(detail_url, {
            'business_name': 'Bhimavaram Aqua Prime Super Exports',
            'contact_person': 'Ramana Rao Executive',
            'phone': '+919988776655',
            'town_market': 'Bhimavaram Aqua Port',
            'is_featured': True
        })
        self.assertEqual(edit_res.status_code, status.HTTP_200_OK)
        self.active_buyer.refresh_from_db()
        self.assertEqual(self.active_buyer.business_name, 'Bhimavaram Aqua Prime Super Exports')
        self.assertEqual(self.active_buyer.phone, '+919988776655')
        self.assertTrue(self.active_buyer.is_featured)

        # 2. Admin directly resets buyer's password
        reset_url = reverse('admin-buyer-reset-password', kwargs={'pk': self.active_buyer.id})
        admin_pass = 'AdminSetPass789!'
        reset_res = self.client.post(reset_url, {'new_password': admin_pass})
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)
        self.assertEqual(reset_res.data['new_password'], admin_pass)

        # Verify buyer can now log in with the admin-set password
        self.client.logout()
        login_url = reverse('auth-login')
        login_res = self.client.post(login_url, {
            'email': self.active_user.email,
            'password': admin_pass
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_11_admin_delete_price_sheet(self):
        """Admin can view all price sheets and delete any price sheet."""
        self.client.force_authenticate(user=self.admin_user)

        # List all sheets
        sheets_url = reverse('admin-price-sheets')
        list_res = self.client.get(sheets_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.data), 1)

        # Delete sheet
        sheet_to_delete = self.expired_sheet
        delete_url = reverse('admin-price-sheet-delete', kwargs={'pk': sheet_to_delete.id})
        del_res = self.client.delete(delete_url)
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(PriceSheet.objects.filter(id=sheet_to_delete.id).exists())

    def test_12_farmer_lead_submission_and_buyer_access(self):
        """Farmer submits interest in a buyer's count rate, buyer receives lead, and admin inspects leads."""
        submit_url = reverse('farmer-lead-submit')
        lead_payload = {
            'buyer_id': self.active_buyer.id,
            'seller_phone': '9848099888',
            'seller_name': 'K. Venkat Rao (Farmer)',
            'shrimp_count': '30 Count',
            'offered_price': 520.00,
            'payment_terms': 'Spot Payment',
            'market_location': 'Bhimavaram Mandi',
            'district': 'West Godavari',
            'approx_quantity': '3 Tons',
            'notes': 'Harvest ready tomorrow morning',
        }
        res = self.client.post(submit_url, lead_payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertIn('whatsapp_url', res.data)
        lead_id = res.data['lead']['id']

        # Buyer logs in and checks their incoming leads
        self.client.force_authenticate(user=self.active_user)
        buyer_leads_url = reverse('buyer-farmer-leads')
        b_res = self.client.get(buyer_leads_url)
        self.assertEqual(b_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(b_res.data), 1)
        self.assertEqual(b_res.data[0]['seller_phone'], '9848099888')

        # Buyer marks lead as CONTACTED
        patch_url = reverse('buyer-farmer-lead-detail', kwargs={'pk': lead_id})
        patch_res = self.client.patch(patch_url, {'status': 'CONTACTED'})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['status'], 'CONTACTED')

        # Admin inspects all farmer leads
        self.client.force_authenticate(user=self.admin_user)
        admin_leads_url = reverse('admin-farmer-leads')
        a_res = self.client.get(admin_leads_url)
        self.assertEqual(a_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(a_res.data), 1)

    def test_13_price_revision_logging_and_7_day_auto_cleanup(self):
        """Verify price changes are timestamped and revisions older than 1 week (7 days) are auto-deleted."""
        self.client.force_authenticate(user=self.active_user)
        sheets_url = reverse('pricing-buyer-sheets')

        # 1. Publish initial price sheet
        post_payload = {
            'product_id': self.product.id,
            'market_location_id': self.market.id,
            'status': 'PUBLISHED',
            'entries': [
                {'shrimp_count_id': self.count50.id, 'price_per_kg': '400.00'}
            ]
        }
        res = self.client.post(sheets_url, post_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        sheet_id = res.data['id']

        entry = PriceEntry.objects.get(price_sheet_id=sheet_id, shrimp_count=self.count50)
        self.assertEqual(entry.price_per_kg, Decimal('400.00'))

        # 2. Update price from 400.00 to 425.00
        patch_payload = {
            'entries': [
                {'shrimp_count_id': self.count50.id, 'price_per_kg': '425.00'}
            ]
        }
        update_url = reverse('pricing-buyer-sheet-detail', kwargs={'pk': sheet_id})
        res2 = self.client.patch(update_url, patch_payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        # Verify revision was recorded with exact time and old/new prices
        latest_rev = PriceRevision.objects.filter(price_entry=entry).order_by('-changed_at').first()
        self.assertIsNotNone(latest_rev)
        self.assertEqual(latest_rev.previous_price, Decimal('400.00'))
        self.assertEqual(latest_rev.new_price, Decimal('425.00'))
        self.assertIsNotNone(latest_rev.changed_at)

        # 3. Create an old revision from 8 days ago
        old_time = timezone.now() - timedelta(days=8)
        old_rev = PriceRevision.objects.create(
            price_entry=entry,
            previous_price=Decimal('350.00'),
            new_price=Decimal('400.00'),
            changed_by=self.active_user
        )
        PriceRevision.objects.filter(id=old_rev.id).update(changed_at=old_time)
        self.assertTrue(PriceRevision.objects.filter(id=old_rev.id).exists())

        # 4. Access history endpoint (triggers automatic 1-week cleanup)
        history_url = reverse('pricing-buyer-history')
        h_res = self.client.get(history_url)
        self.assertEqual(h_res.status_code, status.HTTP_200_OK)

        # Verify the 8-day-old revision was automatically purged, while the fresh revision exists
        self.assertFalse(PriceRevision.objects.filter(id=old_rev.id).exists())
        self.assertTrue(PriceRevision.objects.filter(id=latest_rev.id).exists())

        # 5. Verify management command runs
        from django.core.management import call_command
        call_command('cleanup_price_revisions', days=7)



