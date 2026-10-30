import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsApi, paymentsApi } from '../services/api';
import { SubscriptionPlan } from '../types';
import {
  CreditCard,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  Check
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser, hasActiveSubscription } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simulation modal for test environment
  const [showSimModal, setShowSimModal] = useState(false);
  const [simOrderData, setSimOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await subscriptionsApi.getPlans();
        setPlans(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedPlan(res.data[0]);
        }
      } catch (err) {
        setError('Failed to load subscription plans.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleInitiatePayment = async () => {
    if (!selectedPlan) return;
    setError(null);
    setCheckoutLoading(true);

    try {
      const orderRes = await paymentsApi.checkout(selectedPlan.id);
      const orderData = orderRes.data;

      // Check if real Razorpay checkout window is loaded
      if (typeof (window as any).Razorpay !== 'undefined' && !orderData.is_mock) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount_in_paise,
          currency: orderData.currency,
          name: 'ANDHRA AQUA RATES',
          description: selectedPlan.name,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            await handleVerifyPayment(
              orderData.order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: orderData.contact_person,
            email: orderData.email,
            contact: orderData.phone,
          },
          theme: {
            color: '#0284c7',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Open safe test simulation dialog
        setSimOrderData(orderData);
        setShowSimModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to initiate Razorpay checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    setCheckoutLoading(true);
    setShowSimModal(false);
    try {
      const verifyRes = await paymentsApi.verifyPayment({
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        plan_id: selectedPlan?.id,
      });

      setSuccessMessage(verifyRes.data.message || 'Payment verified. Subscription ACTIVE!');
      await refreshUser();
      setTimeout(() => {
        navigate('/buyer/prices');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment signature verification failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const planBenefits = [
    'Publish unlimited daily shrimp purchasing price sheets',
    'Update count-wise rates for 30 to 150 counts anytime',
    'Prominent listing with direct Phone and WhatsApp inquiry buttons',
    'Reach thousands of Andhra Pradesh shrimp farmers directly',
    'Historical price audit trail and market transparency badge',
    'Verified Buyer security checkmark on all market quotes',
  ];

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-lg shadow-sky-500/20 mx-auto mb-4 hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="ANDHRA AQUA RATES Official Logo"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-3 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Commercial Buyer Membership
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Transparent Pricing Plans For Buyers
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Publish your daily purchasing prices to farmers across West Godavari, Konaseema, Kakinada, Krishna, Bapatla, Prakasam, and Nellore.
          </p>
        </div>

        {/* Status Alerts */}
        {hasActiveSubscription && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <strong>Active Membership:</strong> Your subscription is active. You have full publishing privileges.
              </div>
            </div>
            <button
              onClick={() => navigate('/buyer/prices')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
            >
              Publish Daily Prices →
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{successMessage} Redirecting to price publisher...</span>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="h-96 bg-slate-200 rounded-3xl" />
            <div className="h-96 bg-slate-200 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const isAnnual = plan.billing_interval === 'YEAR';

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-3xl border-2 p-6 sm:p-8 cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-sky-600 bg-white shadow-xl shadow-sky-500/10'
                      : 'border-slate-200 bg-white/60 hover:border-slate-300'
                  }`}
                >
                  {isAnnual && (
                    <div className="absolute -top-3 right-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Best Value (Save ₹989)
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 my-4">
                      <span className="text-4xl font-black text-slate-900 tracking-tight">
                        ₹{plan.amount}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        / {plan.billing_interval.toLowerCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-6">
                      {plan.description || 'Full access to publish and update daily shrimp purchasing prices.'}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      {planBenefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan);
                        handleInitiatePayment();
                      }}
                      disabled={checkoutLoading}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-sky-600 hover:bg-sky-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {hasActiveSubscription ? 'Renew Subscription' : 'Subscribe via Razorpay'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Policy & Trust Guarantee */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
            <div>
              <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Verified Server Processing
              </div>
              <p>All subscription payments are cryptographically verified with Razorpay HMAC-SHA256 signatures before publishing access is granted.</p>
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                Transparent Renewal Policy
              </div>
              <p>Subscriptions remain active for 30 days. No surprise auto-debits without explicit authorization.</p>
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Instant Publishing Unlock
              </div>
              <p>As soon as payment confirmation arrives, your daily price sheet publisher is unlocked immediately.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Razorpay Test Modal (For Developer / Test Mode) */}
      {showSimModal && simOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Razorpay Checkout Test Mode</h3>
                <span className="text-[11px] text-slate-500">Order ID: {simOrderData.order_id}</span>
              </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 my-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Plan:</span>
                <strong className="text-slate-900">{simOrderData.plan_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Payable:</span>
                <strong className="text-sky-900 text-sm">₹{simOrderData.amount} {simOrderData.currency}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Buyer Business:</span>
                <span className="text-slate-800">{simOrderData.business_name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              In test mode, clicking <strong>Confirm & Complete Payment</strong> simulates Razorpay's payment callback, computes cryptographic verification, and activates your subscription on Django REST backend.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleVerifyPayment(
                    simOrderData.order_id,
                    `pay_sim_${Date.now()}`,
                    'mock_valid_signature'
                  )
                }
                disabled={checkoutLoading}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                {checkoutLoading ? 'Verifying...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
