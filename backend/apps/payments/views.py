import json
import logging
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone

from .models import PaymentTransaction, WebhookEvent
from .serializers import PaymentTransactionSerializer, CheckoutInitiateSerializer, PaymentVerifySerializer
from .services import RazorpayService
from apps.subscriptions.models import SubscriptionPlan, BuyerSubscription
from apps.buyers.models import BuyerProfile
from apps.audit.models import AuditLog

logger = logging.getLogger(__name__)

class InitiateCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Only registered buyers can purchase subscriptions.'}, status=status.HTTP_403_FORBIDDEN)
        
        buyer = request.user.buyer_profile
        plan_id = request.data.get('plan_id')
        
        if plan_id:
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response({'error': 'Selected subscription plan does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Fallback to default active plan
            plan = SubscriptionPlan.objects.filter(is_active=True).first()
            if not plan:
                plan = SubscriptionPlan.objects.create(
                    name='ANDHRA AQUA RATES Buyer Monthly',
                    amount=499.00,
                    currency='INR',
                    billing_interval='MONTH',
                    billing_interval_count=1,
                    is_active=True
                )

        order_data = RazorpayService.create_order(buyer=buyer, plan=plan)
        order_data['plan_id'] = plan.id
        order_data['plan_name'] = plan.name

        AuditLog.objects.create(
            actor=request.user,
            action='CHECKOUT_INITIATED',
            entity_type='SubscriptionPlan',
            entity_id=str(plan.id),
            metadata={'order_id': order_data.get('order_id')}
        )

        return Response(order_data, status=status.HTTP_200_OK)


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Buyer profile required.'}, status=status.HTTP_403_FORBIDDEN)

        buyer = request.user.buyer_profile
        order_id = serializer.validated_data['order_id']
        payment_id = serializer.validated_data['payment_id']
        signature = serializer.validated_data['signature']
        plan_id = serializer.validated_data.get('plan_id')

        # 1. Verify cryptographic signature
        is_valid = RazorpayService.verify_payment_signature(order_id, payment_id, signature)
        if not is_valid:
            logger.warning(f"Payment signature verification failed for buyer {buyer.id}, order {order_id}")
            return Response({'error': 'Cryptographic payment signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Identify subscription plan
        if plan_id:
            plan = SubscriptionPlan.objects.filter(id=plan_id).first()
        else:
            plan = None
            
        if not plan:
            # Find from existing payment transaction or fallback to default
            tx = PaymentTransaction.objects.filter(provider_order_id=order_id).first()
            if tx and tx.subscription:
                plan = tx.subscription.plan
            else:
                plan = SubscriptionPlan.objects.filter(is_active=True).first()

        if not plan:
            plan = SubscriptionPlan.objects.create(
                name='ANDHRA AQUA RATES Buyer Monthly',
                amount=499.00,
                currency='INR',
                billing_interval='MONTH',
                billing_interval_count=1,
                is_active=True
            )

        # 3. Server-side activation
        subscription = RazorpayService.process_successful_payment(
            buyer=buyer,
            plan=plan,
            order_id=order_id,
            payment_id=payment_id
        )

        return Response({
            'message': 'Payment successfully verified. Subscription is now ACTIVE.',
            'status': 'ACTIVE',
            'subscription_id': subscription.id,
            'current_period_end': subscription.current_period_end,
            'can_publish_prices': True,
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        received_signature = request.headers.get('X-Razorpay-Signature', '')
        raw_body = request.body

        # 1. Signature check
        if not RazorpayService.verify_webhook_signature(raw_body, received_signature):
            logger.warning("Invalid Razorpay webhook signature received.")
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except Exception:
            return Response({'error': 'Malformed JSON'}, status=status.HTTP_400_BAD_REQUEST)

        event_id = payload.get('event_id') or payload.get('id') or f"evt_{int(timezone.now().timestamp())}"
        event_type = payload.get('event', 'unknown')

        # 2. Idempotency check: duplicate webhook handling
        if WebhookEvent.objects.filter(event_id=event_id).exists():
            return Response({'status': 'Duplicate webhook already received.'}, status=status.HTTP_200_OK)

        webhook_event = WebhookEvent.objects.create(
            event_id=event_id,
            event_type=event_type,
            payload=payload,
            processing_status='RECEIVED'
        )

        # 3. Handle supported payment events
        try:
            if event_type in ['payment.captured', 'order.paid']:
                payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
                order_id = payment_entity.get('order_id')
                payment_id = payment_entity.get('id')
                notes = payment_entity.get('notes', {})
                buyer_id = notes.get('buyer_id')

                if buyer_id and order_id and payment_id:
                    buyer = BuyerProfile.objects.filter(id=buyer_id).first()
                    plan = SubscriptionPlan.objects.filter(id=notes.get('plan_id')).first() or SubscriptionPlan.objects.filter(is_active=True).first()
                    if buyer and plan:
                        RazorpayService.process_successful_payment(
                            buyer=buyer,
                            plan=plan,
                            order_id=order_id,
                            payment_id=payment_id,
                            payment_method=payment_entity.get('method', 'Razorpay')
                        )

            webhook_event.processing_status = 'PROCESSED'
            webhook_event.processed_at = timezone.now()
            webhook_event.save()
            return Response({'status': 'Webhook processed successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error processing webhook {event_id}: {e}")
            webhook_event.processing_status = 'FAILED'
            webhook_event.error_summary = str(e)
            webhook_event.save()
            return Response({'status': 'Webhook recorded with processing error.'}, status=status.HTTP_200_OK)


class PaymentHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Only buyers have payments.'}, status=status.HTTP_403_FORBIDDEN)
        
        payments = PaymentTransaction.objects.filter(buyer=request.user.buyer_profile).order_by('-created_at')
        serializer = PaymentTransactionSerializer(payments, many=True)
        return Response(serializer.data)
