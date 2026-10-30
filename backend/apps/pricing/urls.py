from django.urls import path
from .views import (
    PublicPriceComparisonView,
    PublicPriceSheetDetailView,
    BuyerPriceSheetListCreateView,
    BuyerPriceSheetDetailUpdateView,
    BuyerPriceEntryDetailDeleteView,
    BuyerPriceHistoryView,
)

urlpatterns = [
    # Public farmer endpoints (no auth needed)
    path('', PublicPriceComparisonView.as_view(), name='pricing-public-comparison'),
    path('<int:pk>/', PublicPriceSheetDetailView.as_view(), name='pricing-public-detail'),

    # Buyer endpoints (auth & subscription enforced)
    path('buyer/sheets/', BuyerPriceSheetListCreateView.as_view(), name='pricing-buyer-sheets'),
    path('buyer/sheets/<int:pk>/', BuyerPriceSheetDetailUpdateView.as_view(), name='pricing-buyer-sheet-detail'),
    path('buyer/entries/<int:pk>/', BuyerPriceEntryDetailDeleteView.as_view(), name='pricing-buyer-entry-delete'),
    path('buyer/history/', BuyerPriceHistoryView.as_view(), name='pricing-buyer-history'),
]
