from django.urls import path
from .views import StateListView, DistrictListView, MarketLocationListView

urlpatterns = [
    path('states/', StateListView.as_view(), name='locations-states'),
    path('districts/', DistrictListView.as_view(), name='locations-districts'),
    path('markets/', MarketLocationListView.as_view(), name='locations-markets'),
]
