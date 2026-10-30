import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  CheckCircle2,
  Building2,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-3 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Transparent Market Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How ANDHRA AQUA RATES Works
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            A trusted bridge between shrimp pond farmers and genuine seafood buyers across Andhra Pradesh.
          </p>
        </div>

        {/* Section 1: For Farmers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">For Shrimp Farmers</h2>
              <p className="text-xs text-emerald-700 font-bold">100% Free • No Registration • No Login Needed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Compare Daily Rates</h3>
              <p>Filter purchase rates by shrimp count (30, 40, 50, 60, 70, 80, 90, 100, 120, 150) and local mandi location.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">2</span>
              <h3 className="font-bold text-slate-900 text-sm">Check Price Freshness</h3>
              <p>Every quote has a verified server timestamp and a freshness badge so you know exactly when the rate was published.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">3</span>
              <h3 className="font-bold text-slate-900 text-sm">Direct Contact</h3>
              <p>Call the buyer directly or click WhatsApp to send an inquiry prefilled with the specific count and published price.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Scale className="w-4 h-4" /> Go to Price Comparison Table
            </Link>
          </div>
        </div>

        {/* Section 2: For Buyers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">For Registered Buyers & Exporters</h2>
              <p className="text-xs text-sky-700 font-bold">Verified Business Profile • Paid Membership</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Register Business</h3>
              <p>Create your verified profile with company name, contact person, mobile, WhatsApp number, and procurement districts.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <h3 className="font-bold text-slate-900 text-sm">Subscribe with Razorpay</h3>
              <p>Activate your ₹499/month subscription. Our backend cryptographically validates the payment before granting access.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">3</span>
              <h3 className="font-bold text-slate-900 text-sm">Publish Daily Rates</h3>
              <p>Update purchase rates for multiple counts in one screen. Receive genuine pond-side harvest inquiries directly.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Building2 className="w-4 h-4" /> Register As A Buyer Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
