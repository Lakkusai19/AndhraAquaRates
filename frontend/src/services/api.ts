import axios from 'axios';
import {
  User, State, District, MarketLocation, Product, ShrimpCount,
  PublicComparisonItem, SubscriptionPlan, BuyerProfile, BuyerPriceSheet,
  PriceRevision, PaymentTransaction, FarmerLead
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ashp_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized if not during login
      if (!error.config.url.includes('/auth/login/')) {
        localStorage.removeItem('ashp_access_token');
        localStorage.removeItem('ashp_refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

// ----------------- API Endpoints -----------------

// Authentication
export const authApi = {
  register: (data: any) => {
    if (data instanceof FormData) {
      return apiClient.post<{ message: string; user: User; access: string; refresh: string }>(
        '/auth/register/',
        data,
        { headers: { 'Content-Type': undefined } }
      );
    }
    return apiClient.post<{ message: string; user: User; access: string; refresh: string }>('/auth/register/', data);
  },
  login: (data: any) => apiClient.post<{ message: string; user: User; access: string; refresh: string }>('/auth/login/', data),
  getMe: () => apiClient.get<User>('/auth/me/'),
  logout: (refresh?: string) => apiClient.post('/auth/logout/', { refresh }),
  resetPassword: (email: string) => apiClient.post('/auth/password-reset/', { email }),
  requestPasswordResetCode: (email: string) =>
    apiClient.post<{ message: string; email: string; dev_code?: string }>('/auth/password-reset/request-code/', { email }),
  verifyPasswordResetCode: (data: { email: string; code: string; new_password: string; confirm_password?: string }) =>
    apiClient.post<{ message: string; access: string; refresh: string; user: User }>('/auth/password-reset/verify-code/', data),
};

// Locations
export const locationsApi = {
  getStates: () => apiClient.get<State[]>('/locations/states/'),
  getDistricts: (stateId?: number) => apiClient.get<District[]>('/locations/districts/', { params: { state: stateId } }),
  getMarkets: (districtId?: number) => apiClient.get<MarketLocation[]>('/locations/markets/', { params: { district: districtId } }),
};

// Products & Counts
export const productsApi = {
  getProducts: () => apiClient.get<Product[]>('/products/'),
  getCounts: (slug: string = 'vannamei') => apiClient.get<ShrimpCount[]>('/products/counts/', { params: { product__slug: slug } }),
};

// Public Pricing (Farmers)
export const pricingApi = {
  getComparison: (params: {
    district?: string | number;
    market?: string | number;
    count?: number;
    min_price?: number;
    max_price?: number;
    buyer?: string;
    fresh_only?: boolean;
    sort?: string;
    page?: number;
  }) => apiClient.get<{ results: PublicComparisonItem[]; count: number }>('/prices/', { params }),
  
  getPriceSheetDetail: (id: number) => apiClient.get<any>(`/prices/${id}/`),
};

// Subscriptions
export const subscriptionsApi = {
  getPlans: () => apiClient.get<SubscriptionPlan[]>('/subscriptions/plans/'),
  getStatus: () => apiClient.get<{ has_active_subscription: boolean; active_subscription: any; history: any[] }>('/subscriptions/status/'),
};

// Payments (Razorpay)
export const paymentsApi = {
  checkout: (planId?: number) => apiClient.post<any>('/payments/checkout/', { plan_id: planId }),
  verifyPayment: (data: { order_id: string; payment_id: string; signature: string; plan_id?: number }) =>
    apiClient.post<any>('/payments/verify/', data),
  getHistory: () => apiClient.get<PaymentTransaction[]>('/payments/history/'),
};

// Buyer Management
export const buyerApi = {
  getDashboard: () => apiClient.get<any>('/buyers/dashboard/'),
  getProfile: () => apiClient.get<BuyerProfile>('/buyers/profile/'),
  updateProfile: (data: Partial<BuyerProfile> | FormData) => {
    if (data instanceof FormData) {
      return apiClient.patch<BuyerProfile>('/buyers/profile/', data, {
        headers: { 'Content-Type': undefined },
      });
    }
    return apiClient.patch<BuyerProfile>('/buyers/profile/', data);
  },
  
  // Price sheets
  getSheets: () => apiClient.get<BuyerPriceSheet[]>('/prices/buyer/sheets/'),
  createSheet: (data: any) => apiClient.post<any>('/prices/buyer/sheets/', data),
  getSheetDetail: (id: number) => apiClient.get<any>(`/prices/buyer/sheets/${id}/`),
  updateSheet: (id: number, data: any) => apiClient.patch<any>(`/prices/buyer/sheets/${id}/`, data),
  deleteSheet: (id: number) => apiClient.delete<any>(`/prices/buyer/sheets/${id}/`),
  deleteEntry: (entryId: number) => apiClient.delete<any>(`/prices/buyer/entries/${entryId}/`),
  getPriceHistory: () => apiClient.get<PriceRevision[]>('/prices/buyer/history/'),
};

// Farmer Leads & Inquiries
export const farmerLeadsApi = {
  submitInterest: (data: {
    buyer_id: number;
    seller_phone: string;
    seller_name?: string;
    shrimp_count?: string;
    offered_price?: number | string;
    payment_terms?: string;
    market_location?: string;
    district?: string;
    approx_quantity?: string;
    notes?: string;
  }) => apiClient.post<any>('/buyers/farmer-leads/submit/', data),

  getBuyerLeads: () => apiClient.get<FarmerLead[]>('/buyers/farmer-leads/'),
  updateLead: (leadId: number, data: { status?: string; notes?: string }) =>
    apiClient.patch<FarmerLead>(`/buyers/farmer-leads/${leadId}/`, data),
  deleteLead: (leadId: number) =>
    apiClient.delete<{ success: boolean; message: string }>(`/buyers/farmer-leads/${leadId}/`),
};

// Admin
export const adminApi = {
  getStats: () => apiClient.get<any>('/admin/stats/'),
  getBuyers: () => apiClient.get<any[]>('/admin/buyers/'),
  getBuyerDetail: (buyerId: number) => apiClient.get<any>(`/admin/buyers/${buyerId}/`),
  updateBuyer: (buyerId: number, data: any) =>
    apiClient.patch<{ message: string; buyer: any }>(`/admin/buyers/${buyerId}/`, data),
  updateBuyerStatus: (buyerId: number, status: string) =>
    apiClient.patch('/admin/buyers/', { buyer_id: buyerId, verification_status: status }),
  resetBuyerPassword: (buyerId: number, newPassword?: string) =>
    apiClient.post<{ message: string; buyer_id: number; email: string; new_password: string }>(
      `/admin/buyers/${buyerId}/reset-password/`,
      { new_password: newPassword }
    ),
  deleteBuyer: (buyerId: number) =>
    apiClient.delete<{ message: string }>(`/admin/buyers/${buyerId}/`),
  getAllPriceSheets: () => apiClient.get<any[]>('/admin/price-sheets/'),
  deletePriceSheet: (sheetId: number) => apiClient.delete<{ message: string; id: number }>(`/admin/price-sheets/${sheetId}/`),
  getAuditLogs: () => apiClient.get<any[]>('/admin/logs/'),
  getFarmerLeads: () => apiClient.get<FarmerLead[]>('/admin/farmer-leads/'),
};
