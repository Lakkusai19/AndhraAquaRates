from django.urls import path
from .views import (
    AdminStatsView, 
    AdminBuyersManageView, 
    AdminBuyerDetailManageView,
    AdminBuyerPasswordResetView,
    AdminAllPriceSheetsView,
    AdminAuditLogView,
    AdminFarmerLeadsView,
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('buyers/', AdminBuyersManageView.as_view(), name='admin-buyers-manage'),
    path('buyers/<int:pk>/', AdminBuyerDetailManageView.as_view(), name='admin-buyer-detail-manage'),
    path('buyers/<int:pk>/reset-password/', AdminBuyerPasswordResetView.as_view(), name='admin-buyer-reset-password'),
    path('farmer-leads/', AdminFarmerLeadsView.as_view(), name='admin-farmer-leads'),
    path('price-sheets/', AdminAllPriceSheetsView.as_view(), name='admin-price-sheets'),
    path('price-sheets/<int:pk>/', AdminAllPriceSheetsView.as_view(), name='admin-price-sheet-delete'),
    path('logs/', AdminAuditLogView.as_view(), name='admin-audit-logs'),
]

