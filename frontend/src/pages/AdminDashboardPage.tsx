import React, { useState, useEffect } from 'react';
import { adminApi, locationsApi } from '../services/api';
import { District, FarmerLead } from '../types';
import {
  ShieldAlert,
  Users,
  Scale,
  CreditCard,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Clock,
  ExternalLink,
  Edit,
  KeyRound,
  Trash2,
  X,
  Save,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  FileSpreadsheet,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Zap,
  Phone,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [leads, setLeads] = useState<FarmerLead[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [activeTab, setActiveTab] = useState<'buyers' | 'sheets' | 'leads' | 'logs'>('buyers');
  const [buyerSearch, setBuyerSearch] = useState('');
  const [sheetSearch, setSheetSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Buyer Modal State
  const [editingBuyer, setEditingBuyer] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    whatsapp: '',
    business_type: 'WHOLESALER',
    district_id: '',
    town_market: '',
    business_address: '',
    aadhar_number: '',
    verification_status: 'VERIFIED',
    is_featured: false,
  });

  // Password Reset Modal State
  const [resetModalBuyer, setResetModalBuyer] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(true);
  const [resetSuccessInfo, setResetSuccessInfo] = useState<{ email: string; newPass: string } | null>(null);

  // Delete Buyer Confirmation Modal State
  const [deletingBuyer, setDeletingBuyer] = useState<any | null>(null);

  // Delete Sheet Confirmation Modal State
  const [deletingSheet, setDeletingSheet] = useState<any | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, buyersRes, logsRes, sheetsRes, distRes, leadsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getBuyers(),
        adminApi.getAuditLogs(),
        adminApi.getAllPriceSheets(),
        locationsApi.getDistricts(),
        adminApi.getFarmerLeads().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setBuyers(buyersRes.data || []);
      setLogs(logsRes.data || []);
      setSheets(sheetsRes.data || []);
      setDistricts(distRes.data || []);
      setLeads(leadsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Quick Verification Status Toggle
  const handleUpdateBuyerStatus = async (buyerId: number, status: string) => {
    setActionLoading(true);
    try {
      await adminApi.updateBuyerStatus(buyerId, status);
      showToast(`Buyer status updated to ${status}.`);
      await fetchAdminData();
    } catch {
      showToast('Failed to update buyer status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (buyer: any) => {
    setEditingBuyer(buyer);
    setEditForm({
      business_name: buyer.business_name || '',
      contact_person: buyer.contact_person || '',
      email: buyer.email || '',
      phone: buyer.phone || '',
      whatsapp: buyer.whatsapp || '',
      business_type: buyer.business_type || 'WHOLESALER',
      district_id: buyer.district_id ? String(buyer.district_id) : '',
      town_market: buyer.town_market || '',
      business_address: buyer.business_address || '',
      aadhar_number: buyer.aadhar_number || '',
      verification_status: buyer.verification_status || 'VERIFIED',
      is_featured: !!buyer.is_featured,
    });
  };

  // Save Buyer Details
  const handleSaveBuyerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuyer) return;
    setActionLoading(true);

    try {
      const payload: any = {
        ...editForm,
        district_id: editForm.district_id ? parseInt(editForm.district_id) : null,
      };
      await adminApi.updateBuyer(editingBuyer.id, payload);
      showToast(`Buyer '${editForm.business_name}' updated successfully!`);
      setEditingBuyer(null);
      await fetchAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save buyer details.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Password Reset Modal
  const openPasswordResetModal = (buyer: any) => {
    setResetModalBuyer(buyer);
    setResetSuccessInfo(null);
    generateRandomPassword();
  };

  // Generate a friendly strong temporary password
  const generateRandomPassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setNewPasswordInput(`Shrimp@${randomDigits}`);
  };

  // Execute Direct Password Reset
  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalBuyer) return;
    setActionLoading(true);

    try {
      const res = await adminApi.resetBuyerPassword(resetModalBuyer.id, newPasswordInput);
      setResetSuccessInfo({
        email: res.data.email,
        newPass: res.data.new_password,
      });
      showToast(`Password for ${resetModalBuyer.business_name} successfully updated!`);
      await fetchAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to reset buyer password.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Buyer Delete
  const handleExecuteBuyerDelete = async () => {
    if (!deletingBuyer) return;
    setActionLoading(true);
    try {
      await adminApi.deleteBuyer(deletingBuyer.id);
      showToast(`Buyer '${deletingBuyer.business_name}' deleted.`);
      setDeletingBuyer(null);
      await fetchAdminData();
    } catch {
      showToast('Failed to delete buyer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Price Sheet Delete
  const handleExecuteSheetDelete = async () => {
    if (!deletingSheet) return;
    setActionLoading(true);
    try {
      await adminApi.deletePriceSheet(deletingSheet.id);
      showToast(`Price sheet #${deletingSheet.id} deleted.`);
      setDeletingSheet(null);
      await fetchAdminData();
    } catch {
      showToast('Failed to delete price sheet.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Buyers
  const filteredBuyers = buyers.filter((b) =>
    b.business_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
    b.email?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
    b.contact_person?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
    b.district_name?.toLowerCase().includes(buyerSearch.toLowerCase())
  );

  // Filtered Sheets
  const filteredSheets = sheets.filter((s) =>
    s.buyer_name?.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    s.market_name?.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    s.district_name?.toLowerCase().includes(sheetSearch.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-xl shadow-sky-500/25 shrink-0">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400 mb-1">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Administrative Operations & Platform Master
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Master Dashboard</h1>
              <p className="text-xs text-purple-200/80 mt-1">
                Full control to inspect buyers, edit profiles, reset passwords, moderate rates, and view audit logs
              </p>
            </div>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-semibold text-xs flex items-center gap-2 self-start sm:self-auto border border-purple-500/40 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>

        {/* Global Toast Alert */}
        {toastMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all ${
              toastMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real DB Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500">Buyers Registered</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.buyers?.total || buyers.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {stats?.buyers?.active_subscribers || 0} Active Paid Subscribers
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500">Platform Price Sheets</span>
            <div className="text-2xl font-black text-sky-700 mt-1">{stats?.listings?.total_sheets || sheets.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {stats?.listings?.fresh_sheets_today || 0} Fresh Today (Within 24h)
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500">Total Revenue (INR)</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹{stats?.financials?.total_revenue_inr || 0}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {stats?.financials?.successful_transactions || 0} Successful Razorpay Orders
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500">Security Audit Events</span>
            <div className="text-2xl font-black text-purple-700 mt-1">{logs.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Immutable Admin & Buyer Logs
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'buyers'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Buyer Management ({buyers.length})
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sheets'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            All Platform Price Sheets ({sheets.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'leads'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Farmer Inquiries ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Security Audit Logs ({logs.length})
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: BUYERS MANAGEMENT                                  */}
        {/* ======================================================== */}
        {activeTab === 'buyers' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Buyer Accounts & Master Controls</h2>
                <p className="text-xs text-slate-500">
                  Full administrative permissions to edit profile details, reset passwords, change verification status, or delete accounts
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search business, contact, district, email..."
                  value={buyerSearch}
                  onChange={(e) => setBuyerSearch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Business & Contact</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Aadhaar KYC</th>
                    <th className="py-3 px-4">Phone / WA</th>
                    <th className="py-3 px-4 text-center">Subscription</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBuyers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No buyers found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBuyers.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {b.business_name}
                            {b.is_featured && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {b.contact_person} • <span className="font-mono text-purple-700">{b.email}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{b.business_type_display || b.business_type}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {b.district_name || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          {b.aadhar_card ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-[11px] text-slate-800 font-bold">
                                {b.aadhar_number ? `•••• ${b.aadhar_number.slice(-4)}` : 'Doc Uploaded'}
                              </span>
                              <a
                                href={b.aadhar_card}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> View Aadhaar
                              </a>
                            </div>
                          ) : b.aadhar_number ? (
                            <span className="font-mono text-[11px] text-slate-700">•••• {b.aadhar_number.slice(-4)}</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Not provided</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          <div>{b.phone}</div>
                          {b.whatsapp && <div className="text-[10px] text-teal-600">WA: {b.whatsapp}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              b.has_active_subscription
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.has_active_subscription ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                              b.verification_status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : b.verification_status === 'SUSPENDED'
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {b.verification_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Buyer Details Button */}
                            <button
                              onClick={() => openEditModal(b)}
                              title="Edit Buyer Details"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Admin Password Reset Button */}
                            <button
                              onClick={() => openPasswordResetModal(b)}
                              title="Reset Buyer Password"
                              className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-200 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Verification status toggle */}
                            {b.verification_status !== 'VERIFIED' ? (
                              <button
                                onClick={() => handleUpdateBuyerStatus(b.id, 'VERIFIED')}
                                disabled={actionLoading}
                                title="Approve Verification"
                                className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                              >
                                Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateBuyerStatus(b.id, 'SUSPENDED')}
                                disabled={actionLoading}
                                title="Suspend Account"
                                className="px-2 py-1 rounded bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700"
                              >
                                Suspend
                              </button>
                            )}

                            {/* Delete Buyer Button */}
                            <button
                              onClick={() => setDeletingBuyer(b)}
                              title="Delete Buyer Permanently"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ALL PLATFORM PRICE SHEETS                         */}
        {/* ======================================================== */}
        {activeTab === 'sheets' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Platform-Wide Price Sheets</h2>
                <p className="text-xs text-slate-500">
                  Inspect and moderate all daily price sheets posted by registered buyers across all mandis
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by buyer, mandi, district..."
                  value={sheetSearch}
                  onChange={(e) => setSheetSearch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Sheet ID</th>
                    <th className="py-3 px-4">Buyer Business</th>
                    <th className="py-3 px-4">Market / Mandi</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Entries</th>
                    <th className="py-3 px-4 text-center">Payment Terms</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Delete Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSheets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No price sheets found.
                      </td>
                    </tr>
                  ) : (
                    filteredSheets.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">#{s.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{s.buyer_name}</div>
                          <div className="text-[11px] text-slate-500">{s.buyer_email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{s.market_name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{s.district_name}</td>
                        <td className="py-3.5 px-4 text-slate-700">{s.price_date}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-sky-700">{s.entries_count} counts</td>
                        <td className="py-3.5 px-4 text-center text-[11px] text-slate-600 font-medium">
                          {s.payment_terms}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              s.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setDeletingSheet(s)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete this price sheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AUDIT LOGS                                        */}
        {/* ======================================================== */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Platform Security Audit Log</h2>
              <p className="text-xs text-slate-500">
                Immutable trace of registrations, admin edits, password changes, logins, payments, and price updates
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details / Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{log.actor_email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: FARMER LEADS & INQUIRIES                            */}
        {/* ======================================================== */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Farmer Inquiries & Seller Leads</h2>
                <p className="text-xs text-slate-500">
                  Real-time list of all shrimp farmers who submitted their phone number to reach buyers
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                Total Leads: {leads.length}
              </span>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No farmer inquiries recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-50 font-bold text-slate-600 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Farmer Phone</th>
                      <th className="py-3 px-4">Target Buyer</th>
                      <th className="py-3 px-4">Count & Offered Rate</th>
                      <th className="py-3 px-4">Payment & Location</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Connect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-purple-600" />
                            <span>{l.seller_phone}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">{l.seller_name || 'Shrimp Farmer'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{l.buyer_name}</div>
                          <div className="text-[11px] text-slate-400">Buyer ID #{l.buyer}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{l.shrimp_count}</span>
                          <div className="text-emerald-600 font-black">₹{l.offered_price} / kg</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{l.payment_terms || 'Spot Payment'}</div>
                          <div className="text-[11px] text-slate-400">{l.market_location}, {l.district}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                          {new Date(l.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              l.status === 'NEW'
                                ? 'bg-amber-100 text-amber-800'
                                : l.status === 'CONTACTED'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={l.tel_link || `tel:${l.seller_phone}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                              title={`Call ${l.seller_phone}`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                            {l.whatsapp_url && (
                              <a
                                href={l.whatsapp_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                title="WhatsApp chat"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT BUYER DETAILS                              */}
      {/* ======================================================== */}
      {editingBuyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in">
            <button
              onClick={() => setEditingBuyer(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Buyer Profile</h3>
                <p className="text-xs text-slate-500">
                  Admin Master Override for ID #{editingBuyer.id} • {editingBuyer.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBuyerDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.contact_person}
                    onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Login Email <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Type <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={editForm.business_type}
                    onChange={(e) => setEditForm({ ...editForm, business_type: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="WHOLESALER">Wholesaler</option>
                    <option value="PROCESSOR">Processor</option>
                    <option value="EXPORTER">Exporter</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="COMMISSION_AGENT">Commission Agent / Trader</option>
                    <option value="OTHER">Other Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Andhra Pradesh District <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={editForm.district_id}
                    onChange={(e) => setEditForm({ ...editForm, district_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Town / Mandi Market</label>
                  <input
                    type="text"
                    value={editForm.town_market}
                    onChange={(e) => setEditForm({ ...editForm, town_market: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar Number (KYC)</label>
                  <input
                    type="text"
                    value={editForm.aadhar_number}
                    onChange={(e) => setEditForm({ ...editForm, aadhar_number: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Status <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={editForm.verification_status}
                    onChange={(e) => setEditForm({ ...editForm, verification_status: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="VERIFIED">VERIFIED (Approved)</option>
                    <option value="PENDING">PENDING (Under Review)</option>
                    <option value="SUSPENDED">SUSPENDED (Blocked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Address <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editForm.business_address}
                  onChange={(e) => setEditForm({ ...editForm, business_address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit_is_featured"
                  checked={editForm.is_featured}
                  onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="edit_is_featured" className="text-xs font-semibold text-slate-800">
                  Highlight as Featured Buyer on Public Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBuyer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {actionLoading ? 'Saving...' : 'Save Buyer Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADMIN PASSWORD RESET                            */}
      {/* ======================================================== */}
      {resetModalBuyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in">
            <button
              onClick={() => {
                setResetModalBuyer(null);
                setResetSuccessInfo(null);
              }}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Admin Password Reset</h3>
                <p className="text-xs text-slate-500">
                  Direct override for {resetModalBuyer.business_name}
                </p>
              </div>
            </div>

            {resetSuccessInfo ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Password Changed Successfully!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Provide the new temporary password to the buyer:
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl font-mono text-sm text-purple-900 font-bold select-all">
                  {resetSuccessInfo.newPass}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalBuyer(null);
                    setResetSuccessInfo(null);
                  }}
                  className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecutePasswordReset} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                  <div><strong>Buyer:</strong> {resetModalBuyer.business_name}</div>
                  <div><strong>Email:</strong> {resetModalBuyer.email}</div>
                  <div><strong>Phone:</strong> {resetModalBuyer.phone}</div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">New Password</label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] text-purple-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setResetModalBuyer(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !newPasswordInput}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {actionLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE BUYER CONFIRMATION                       */}
      {/* ======================================================== */}
      {deletingBuyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Buyer Permanently?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>{deletingBuyer.business_name}</strong> ({deletingBuyer.email})? This action cannot be undone and will delete all associated price sheets.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBuyer(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBuyerDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Buyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE PRICE SHEET CONFIRMATION                 */}
      {/* ======================================================== */}
      {deletingSheet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Price Sheet?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete Price Sheet #{deletingSheet.id} ({deletingSheet.buyer_name} at {deletingSheet.market_name})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSheet(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSheetDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
