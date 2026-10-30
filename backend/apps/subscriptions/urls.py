from django.urls import path
from .views import SubscriptionPlanListView, BuyerSubscriptionStatusView

urlpatterns = [
    path('plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('status/', BuyerSubscriptionStatusView.as_view(), name='subscription-status'),
]
