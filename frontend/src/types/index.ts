export interface User {
  id: number;
  email: string;
  role: 'FARMER' | 'BUYER' | 'ADMIN';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  buyer_profile_id?: number | null;
  business_name?: string | null;
  has_active_subscription?: boolean;
  active_subscription?: {
    id: number;
    plan_name: string;
    status: string;
    current_period_end: string;
  } | null;
}

export interface State {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface District {
  id: number;
  state: number;
  state_name: string;
  state_code: string;
  name: string;
  is_active: boolean;
}

export interface MarketLocation {
  id: number;
  district: number;
  district_name: string;
  state_name: string;
  name: string;
  location_type: string;
  is_active: boolean;
}

export interface ShrimpCount {
  id: number;
  product: number;
  product_name: string;
  count_value: number;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  default_price_unit: string;
  is_active: boolean;
  counts: ShrimpCount[];
}

export interface PublicComparisonItem {
  sheet_id: number;
  entry_id: number;
  buyer_id: number;
  buyer_name: string;
  contact_person: string;
  business_type: string;
  shrimp_count: number;
  count_label: string;
  price_per_kg: string | number;
  unit: string;
  state_name: string;
  district_name: string;
  market_name: string;
  price_date: string;
  updated_at: string;
  is_fresh: boolean;
  freshness_status: string;
  is_highest: boolean;
  tel_link: string;
  whatsapp_link: string;
  payment_terms?: string;
  buyer_note: string;
  quantity_capacity: string;
  is_featured: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  amount: string | number;
  currency: string;
  billing_interval: string;
  billing_interval_count: number;
  description: string;
  is_active: boolean;
}

export interface BuyerProfile {
  id: number;
  email?: string;
  business_name: string;
  contact_person: string;
  phone: string;
  whatsapp_number: string;
  business_type: string;
  state?: number;
  state_name?: string;
  district?: number;
  district_name?: string;
  town_market: string;
  business_address: string;
  aadhar_number?: string;
  aadhar_card?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  is_featured: boolean;
  has_active_subscription: boolean;
  active_subscription?: {
    id: number;
    plan_name: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    amount: string | number;
  } | null;
  created_at?: string;
}

export interface PriceEntryDetail {
  id: number;
  shrimp_count: number;
  count_value: number;
  count_label: string;
  price_per_kg: string | number;
  quantity_capacity: string;
  payment_terms?: string;
  buyer_note: string;
  buying_availability: boolean;
}

export interface BuyerPriceSheet {
  id: number;
  price_date: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  is_fresh: boolean;
  product_id: number;
  product_name: string;
  market_location_id: number;
  market_name: string;
  district_name: string;
  updated_at: string;
  entries: PriceEntryDetail[];
}

export interface PriceRevision {
  id: number;
  count_label: string;
  market_name: string;
  previous_price: string | number | null;
  new_price: string | number;
  changed_at: string;
  change_source: string;
}

export interface PaymentTransaction {
  id: number;
  provider_order_id: string;
  provider_payment_id: string;
  amount: string | number;
  currency: string;
  status: string;
  payment_method: string;
  verified_at: string | null;
  plan_name: string;
  created_at: string;
}

export interface FarmerLead {
  id: number;
  buyer: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_whatsapp: string;
  seller_phone: string;
  seller_name: string;
  shrimp_count: string;
  offered_price: number | string;
  payment_terms: string;
  market_location: string;
  district: string;
  approx_quantity: string;
  notes: string;
  status: 'NEW' | 'CONTACTED' | 'DEAL_CLOSED' | 'REJECTED';
  created_at: string;
  whatsapp_url?: string;
  tel_link?: string;
}

