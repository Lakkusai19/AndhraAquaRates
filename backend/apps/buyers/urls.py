from django.urls import path
from .views import (
    BuyerPublicDetailView,
    BuyerProfileView,
    BuyerDashboardView,
    FarmerLeadCreatePublicView,
    BuyerFarmerLeadsView,
    BuyerFarmerLeadDetailView,
)

urlpatterns = [
    # Public farmer lead submission
    path('farmer-leads/submit/', FarmerLeadCreatePublicView.as_view(), name='farmer-lead-submit'),
    
    # Authenticated buyer leads endpoints
    path('farmer-leads/', BuyerFarmerLeadsView.as_view(), name='buyer-farmer-leads'),
    path('farmer-leads/<int:pk>/', BuyerFarmerLeadDetailView.as_view(), name='buyer-farmer-lead-detail'),

    # Profile & Dashboard
    path('profile/', BuyerProfileView.as_view(), name='buyer-profile'),
    path('dashboard/', BuyerDashboardView.as_view(), name='buyer-dashboard'),
    path('<int:pk>/', BuyerPublicDetailView.as_view(), name='buyer-public-detail'),
]

