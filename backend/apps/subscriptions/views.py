from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SubscriptionPlan, BuyerSubscription
from .serializers import SubscriptionPlanSerializer, BuyerSubscriptionSerializer

class SubscriptionPlanListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    pagination_class = None

class BuyerSubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'buyer_profile'):
            return Response({'error': 'Only buyers have subscription records.'}, status=status.HTTP_403_FORBIDDEN)
        
        subscriptions = BuyerSubscription.objects.filter(buyer=request.user.buyer_profile).order_by('-current_period_end')
        active_sub = request.user.buyer_profile.get_active_subscription()

        return Response({
            'has_active_subscription': request.user.buyer_profile.has_active_subscription(),
            'active_subscription': BuyerSubscriptionSerializer(active_sub).data if active_sub else None,
            'history': BuyerSubscriptionSerializer(subscriptions[:10], many=True).data,
        })
