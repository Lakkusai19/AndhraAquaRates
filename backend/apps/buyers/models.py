import urllib.parse
from django.db import models
from django.conf import settings
from django.utils import timezone

class BuyerProfile(models.Model):
    BUSINESS_TYPE_CHOICES = (
        ('WHOLESALER', 'Wholesaler'),
        ('PROCESSOR', 'Processor'),
        ('EXPORTER', 'Exporter'),
        ('DISTRIBUTOR', 'Distributor'),
        ('COMMISSION_AGENT', 'Commission Agent / Trader'),
        ('OTHER', 'Other Buyer'),
    )

    VERIFICATION_STATUS_CHOICES = (
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified Buyer'),
        ('SUSPENDED', 'Suspended'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_profile')
    business_name = models.CharField(max_length=255, db_index=True)
    contact_person = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    whatsapp_number = models.CharField(max_length=20)
    business_type = models.CharField(max_length=50, choices=BUSINESS_TYPE_CHOICES, default='WHOLESALER')
    
    state = models.ForeignKey('locations.State', on_delete=models.PROTECT, null=True, blank=True, related_name='buyers')
    district = models.ForeignKey('locations.District', on_delete=models.PROTECT, null=True, blank=True, related_name='buyers')
    town_market = models.CharField(max_length=255, blank=True)
    business_address = models.TextField(blank=True)
    
    # KYC & Identity Verification
    aadhar_number = models.CharField(max_length=20, blank=True, null=True, help_text="12-digit Aadhaar number for KYC verification")
    aadhar_card = models.FileField(upload_to='aadhar_cards/%Y/%m/', blank=True, null=True, help_text="Aadhaar card document or image")

    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='VERIFIED')
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_buyer_profiles'
        ordering = ['business_name']

    def __str__(self):
        return f"{self.business_name} ({self.contact_person})"

    def clean_phone_number(self, number_str: str) -> str:
        """Strip non-numeric characters for tel: and wa.me links."""
        digits = ''.join(c for c in (number_str or '') if c.isdigit())
        if len(digits) == 10:
            return f"91{digits}"
        return digits

    @property
    def formatted_tel_link(self) -> str:
        clean = ''.join(c for c in (self.phone or '') if c.isdigit() or c == '+')
        return f"tel:{clean}"

    def get_whatsapp_chat_link(self, shrimp_count=None, rate=None) -> str:
        clean_num = self.clean_phone_number(self.whatsapp_number or self.phone)
        if not clean_num:
            return ""
        
        msg = f"Hello {self.business_name}, I found your shrimp price listing on ANDHRA AQUA RATES."
        if shrimp_count and rate:
            msg += f" Are you currently purchasing {shrimp_count} count shrimp at ₹{rate}/kg?"
        else:
            msg += " Could you please share your latest shrimp purchasing rates?"
            
        encoded = urllib.parse.quote(msg)
        return f"https://wa.me/{clean_num}?text={encoded}"

    def has_active_subscription(self) -> bool:
        """Check if buyer has an active subscription whose current period has not expired."""
        now = timezone.now()
        return self.subscriptions.filter(
            status='ACTIVE',
            current_period_end__gte=now
        ).exists()

    def get_active_subscription(self):
        now = timezone.now()
        return self.subscriptions.filter(
            status='ACTIVE',
            current_period_end__gte=now
        ).order_by('-current_period_end').first()


class FarmerLead(models.Model):
    STATUS_CHOICES = (
        ('NEW', 'New Enquiry'),
        ('CONTACTED', 'Contacted'),
        ('DEAL_CLOSED', 'Deal Closed'),
        ('REJECTED', 'Not Interested'),
    )

    buyer = models.ForeignKey(BuyerProfile, on_delete=models.CASCADE, related_name='farmer_leads')
    seller_phone = models.CharField(max_length=20, help_text="Farmer / Seller mobile phone number")
    seller_name = models.CharField(max_length=150, blank=True, default='Shrimp Farmer')
    
    shrimp_count = models.CharField(max_length=50, blank=True)
    offered_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    payment_terms = models.CharField(max_length=50, blank=True, default='Spot Payment')
    market_location = models.CharField(max_length=150, blank=True)
    district = models.CharField(max_length=150, blank=True)
    approx_quantity = models.CharField(max_length=100, blank=True, help_text="e.g. 2 Tons, 500 Kgs")
    notes = models.TextField(blank=True, help_text="Seller remarks or pond details")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ashp_farmer_leads'
        ordering = ['-created_at']

    def __str__(self):
        return f"Lead: {self.seller_phone} -> {self.buyer.business_name} ({self.shrimp_count} @ ₹{self.offered_price})"

    def clean_phone_number(self, number_str: str) -> str:
        digits = ''.join(c for c in (number_str or '') if c.isdigit())
        if len(digits) == 10:
            return f"91{digits}"
        return digits

    @property
    def formatted_tel_link(self) -> str:
        clean = ''.join(c for c in (self.seller_phone or '') if c.isdigit() or c == '+')
        return f"tel:{clean}"

    def get_whatsapp_chat_link(self) -> str:
        clean_num = self.clean_phone_number(self.seller_phone)
        if not clean_num:
            return ""
        msg = f"Hello {self.seller_name or 'Farmer'}, I received your inquiry on ANDHRA AQUA RATES for {self.shrimp_count} count shrimp at ₹{self.offered_price}/kg ({self.payment_terms}). Let's discuss your harvest details."
        encoded = urllib.parse.quote(msg)
        return f"https://wa.me/{clean_num}?text={encoded}"

