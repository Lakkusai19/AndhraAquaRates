import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buyerApi, pricingApi, farmerLeadsApi } from '../services/api';
import { BuyerProfile, BuyerPriceSheet, PriceRevision, FarmerLead } from '../types';
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  History,
  Scale,
  Sparkles,
  Phone,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Trash2,
  Pencil,
  FileCheck,
  FileText,
  UploadCloud,
  X,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  Zap,
  UserCheck,
  Copy
} from 'lucide-react';
import { BackButton } from '../components/common/BackButton';
import { ImportantDisclaimerTicker } from '../components/common/ImportantDisclaimerTicker';

export const BuyerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser, hasActiveSubscription } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [sheets, setSheets] = useState<BuyerPriceSheet[]>([]);
  const [history, setHistory] = useState<PriceRevision[]>([]);
  const [leads, setLeads] = useState<FarmerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetToDelete, setSheetToDelete] = useState<any | null>(null);
  const [deletingSheet, setDeletingSheet] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Aadhaar Modal States
  const [showAadharModal, setShowAadharModal] = useState(false);
  const [modalAadharNumber, setModalAadharNumber] = useState('');
  const [modalAadharFile, setModalAadharFile] = useState<File | null>(null);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashRes, profRes, sheetsRes, histRes, leadsRes] = await Promise.all([
          buyerApi.getDashboard(),
          buyerApi.getProfile(),
          buyerApi.getSheets(),
          buyerApi.getPriceHistory(),
          farmerLeadsApi.getBuyerLeads().catch(() => ({ data: [] })),
        ]);
        setDashboardData(dashRes.data);
        setProfile(profRes.data);
        setSheets(sheetsRes.data || []);
        setHistory(histRes.data || []);
        setLeads(leadsRes.data || []);
      } catch (err) {
        console.error('Failed to load buyer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleUpdateLeadStatus = async (leadId: number, status: string) => {
    try {
      const res = await farmerLeadsApi.updateLead(leadId, { status });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res.data : l)));
      setFeedbackMsg(`Inquiry status updated to ${status}.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!window.confirm('Are you sure you want to dismiss/delete this farmer enquiry?')) return;
    try {
      await farmerLeadsApi.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setFeedbackMsg('Farmer enquiry dismissed successfully.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleConfirmDeleteSheet = async () => {
    if (!sheetToDelete) return;
    setDeletingSheet(true);
    try {
      await buyerApi.deleteSheet(sheetToDelete.id);
      setSheets((prev) => prev.filter((s) => s.id !== sheetToDelete.id));
      setFeedbackMsg(
        `Price sheet for ${sheetToDelete.market_name || 'Market'} (${sheetToDelete.price_date}) deleted successfully.`
      );
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to delete sheet:', err);
    } finally {
      setDeletingSheet(false);
      setSheetToDelete(null);
    }
  };

  const handleAadharModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingAadhar(true);
    try {
      const fd = new FormData();
      const cleanAadhar = modalAadharNumber.replace(/\s+/g, '');
      if (cleanAadhar) {
        fd.append('aadhar_number', cleanAadhar);
      }
      if (modalAadharFile) {
        fd.append('aadhar_card', modalAadharFile);
      }
      const res = await buyerApi.updateProfile(fd);
      setProfile(res.data);
      setShowAadharModal(false);
      setModalAadharFile(null);
      setFeedbackMsg('Aadhaar verification details updated successfully.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to update Aadhaar details:', err);
      alert('Failed to update Aadhaar details. Please check the file format and try again.');
    } finally {
      setUploadingAadhar(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Back Link */}
        <div>
          <BackButton to="/" label="← Back to Home" />
        </div>

        {feedbackMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-bold">{feedbackMsg}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">
              ✕
            </button>
          </div>
        )}

        {/* Welcome Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-md shadow-sky-500/20 shrink-0">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-1">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Buyer Procurement Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {profile?.business_name || user?.email}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Contact: {profile?.contact_person} • {profile?.town_market}, {profile?.district_name || 'Andhra Pradesh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/buyer/prices"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Publish Daily Rates
            </Link>
            <Link
              to="/compare"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              Live Farmer View
            </Link>
          </div>
        </div>

        {/* Important Disclaimer Scrolling Ticker */}
        <ImportantDisclaimerTicker />

        {/* INACTIVE SUBSCRIPTION WARNING (CRITICAL REQUIREMENT) */}
        {!hasActiveSubscription && (
          <div className="rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 p-6 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-base text-amber-900">
                  Buyer Subscription Inactive - Publishing Disabled
                </h3>
                <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                  Your monthly membership has expired or is pending activation. Under ANDHRA AQUA RATES policy, only verified subscribers can publish or update daily purchasing prices.
                </p>
              </div>
            </div>
            <Link
              to="/buyer/subscription"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shrink-0 text-center transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Activate Subscription (₹499/mo)
            </Link>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Subscription Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Subscription</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-black ${
                  hasActiveSubscription ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {hasActiveSubscription ? 'ACTIVE' : 'INACTIVE'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                ₹499 / mo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {dashboardData?.subscription?.expires_at
                ? `Expires: ${new Date(dashboardData.subscription.expires_at).toLocaleDateString('en-IN')}`
                : 'No active billing period.'}
            </p>
          </div>

          {/* Today's Publishing Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Today's Rates</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {dashboardData?.today_published ? (
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Published Live
                </span>
              ) : (
                <span className="text-slate-500">Not Published Today</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {dashboardData?.today_price_entries_count || 0} active shrimp counts listed
            </p>
          </div>

          {/* Total Sheets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Total Price Sheets</span>
              <History className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dashboardData?.total_sheets_count || sheets.length || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Historical price submissions</p>
          </div>

          {/* Verification & Aadhaar KYC Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">KYC & Verification</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {profile?.verification_status === 'VERIFIED' ? 'Verified Buyer' : profile?.verification_status || 'Pending'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Direct farmer inquiries enabled</p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="text-[11px]">
                <span className="text-slate-500 font-medium">Aadhaar: </span>
                {profile?.aadhar_card || profile?.aadhar_number ? (
                  <span className="font-bold text-slate-800">
                    {profile?.aadhar_number ? `•••• ${profile.aadhar_number.slice(-4)}` : 'Uploaded'}
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">Not Uploaded</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalAadharNumber(profile?.aadhar_number || '');
                  setShowAadharModal(true);
                }}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {profile?.aadhar_card ? 'View / Change' : '+ Upload Aadhaar'}
              </button>
            </div>
          </div>
        </div>

        {/* FARMER LEADS & INTERESTED SELLERS SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Farmer Enquiries & Interested Sellers</h2>
                {leads.filter((l) => l.status === 'NEW').length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs animate-pulse">
                    {leads.filter((l) => l.status === 'NEW').length} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Shrimp farmers who clicked "Interested" on your published purchasing rates
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total Inquiries: <strong className="text-slate-900 font-bold">{leads.length}</strong>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No farmer inquiries received yet.</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                When farmers view your live rates on the price comparison board and click "Interested", their phone number and required count will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 font-bold text-slate-600 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Farmer / Seller Phone</th>
                    <th className="px-4 py-3">Count & Price</th>
                    <th className="px-4 py-3">Payment Terms</th>
                    <th className="px-4 py-3">Pond / Details</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((l) => (
                    <tr key={l.id} className={l.status === 'NEW' ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-sky-600" />
                          <span>{l.seller_phone}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {l.seller_name || 'Shrimp Farmer'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900">{l.shrimp_count}</span>
                        <div className="text-xs font-black text-emerald-600">
                          ₹{l.offered_price} / kg
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {l.payment_terms || 'Spot Pay'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                        {l.approx_quantity && (
                          <div className="font-semibold text-slate-800">
                            Qty: {l.approx_quantity}
                          </div>
                        )}
                        {l.market_location && (
                          <div className="text-[11px] text-slate-500">
                            {l.market_location}, {l.district}
                          </div>
                        )}
                        {l.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{l.notes}</div>}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                        {new Date(l.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={l.status}
                          onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            l.status === 'NEW'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : l.status === 'CONTACTED'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="NEW">NEW LEAD</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="DEAL_CLOSED">DEAL CLOSED</option>
                          <option value="REJECTED">DISMISSED</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={l.tel_link || `tel:${l.seller_phone}`}
                            className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                            title={`Call ${l.seller_phone}`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                          {l.whatsapp_url && (
                            <a
                              href={l.whatsapp_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(l.id)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                            title="Dismiss lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Price Sheets Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Price Sheets</h2>
              <p className="text-xs text-slate-500">Your published shrimp rates across AP locations</p>
            </div>
            <Link
              to="/buyer/prices"
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
            >
              Update or Add New Rates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {sheets.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No price sheets created yet. Click "Publish Daily Rates" to list your first count prices.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Market Hub</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Counts Listed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sheets.slice(0, 5).map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sheet.price_date}</td>
                      <td className="py-3.5 px-4 text-slate-700">{sheet.market_name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{sheet.product_name}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{sheet.entries.length} Counts</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            sheet.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sheet.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/buyer/prices?sheet_id=${sheet.id}&market_id=${sheet.market_location_id}&product_id=${sheet.product_id}&date=${sheet.price_date}`}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] flex items-center gap-1 border border-sky-200 transition-colors shadow-xs"
                          >
                            <Pencil className="w-3 h-3 text-sky-600" />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSheetToDelete(sheet)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-xs cursor-pointer"
                            title="Delete Price Sheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Price Revision Audit Trail */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Recent Price Audit Trail</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  7-Day Auto-Expiring
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every rate update is timestamped with exact date & time. Records older than 1 week (7 days) auto-delete.
              </p>
            </div>
            <Link
              to="/buyer/history"
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 self-start sm:self-auto"
            >
              View Full History (7 Days) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No price revisions logged in the last 7 days.</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{rev.count_label}</span>
                    <span className="text-slate-500">• {rev.market_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 line-through">
                      {rev.previous_price ? `₹${rev.previous_price}` : '—'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-emerald-700 text-sm">₹{rev.new_price}/kg</span>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-700 font-semibold">
                        {new Date(rev.changed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {new Date(rev.changed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Sheet Confirmation Modal */}
      {sheetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Delete Price Sheet?</h3>
                <p className="text-xs text-slate-500">Remove all rates for this mandi date</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5 bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
              Are you sure you want to delete your price sheet for{' '}
              <strong className="text-slate-900">{sheetToDelete.market_name}</strong> ({sheetToDelete.product_name}) on{' '}
              <strong className="text-slate-900">{sheetToDelete.price_date}</strong>? All {sheetToDelete.entries?.length || ''} count rates will be permanently removed from Andhra farmer comparison views immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={deletingSheet}
                onClick={() => setSheetToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingSheet}
                onClick={handleConfirmDeleteSheet}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {deletingSheet ? 'Deleting...' : 'Yes, Delete Entire Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload / View Aadhaar Modal */}
      {showAadharModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAadharModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-sky-600 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Aadhaar Identity Verification</h3>
                <p className="text-xs text-slate-500">Government KYC & Verified Buyer Profile</p>
              </div>
            </div>

            {profile?.aadhar_card && (
              <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Current Aadhaar Document on File</div>
                    <div className="text-[11px] text-slate-400">Verified and stored securely</div>
                  </div>
                </div>
                <a
                  href={profile.aadhar_card}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold flex items-center gap-1 border border-sky-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Card
                </a>
              </div>
            )}

            <form onSubmit={handleAadharModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhaar Number (12 Digits) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="XXXX XXXX XXXX"
                  value={modalAadharNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                    setModalAadharNumber(formatted);
                  }}
                  maxLength={14}
                  className="w-full text-xs font-mono tracking-widest rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Aadhaar Card (Image or PDF) <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-4 text-center cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setModalAadharFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {modalAadharFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span>{modalAadharFile.name} ({(modalAadharFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 flex flex-col items-center gap-1">
                      <UploadCloud className="w-6 h-6 text-sky-500" />
                      <span className="font-semibold text-slate-700">Click to select Aadhaar file</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG or PDF (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2 text-[11px] text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Encrypted & secure. Never shown to farmers or third parties.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAadharModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={uploadingAadhar}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  {uploadingAadhar ? 'Saving...' : 'Save Aadhaar Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
