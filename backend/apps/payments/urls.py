from django.urls import path
from .views import InitiateCheckoutView, VerifyPaymentView, RazorpayWebhookView, PaymentHistoryView

urlpatterns = [
    path('checkout/', InitiateCheckoutView.as_view(), name='payments-checkout'),
    path('verify/', VerifyPaymentView.as_view(), name='payments-verify'),
    path('webhooks/razorpay/', RazorpayWebhookView.as_view(), name='payments-webhook-razorpay'),
    path('history/', PaymentHistoryView.as_view(), name='payments-history'),
]
