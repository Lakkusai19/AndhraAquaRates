from django.urls import path
from .views import ProductListView, ShrimpCountListView

urlpatterns = [
    path('', ProductListView.as_view(), name='products-list'),
    path('counts/', ShrimpCountListView.as_view(), name='products-counts-list'),
]
