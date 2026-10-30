import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buyerApi, locationsApi, productsApi } from '../services/api';
import { MarketLocation, ShrimpCount, Product } from '../types';
import {
  Save,
  Send,
  Eye,
  AlertCircle,
  CheckCircle2,
  Lock,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Trash2,
  Pencil,
  RotateCcw,
  AlertTriangle,
  X,
  FileEdit,
  Sparkles,
  Zap,
  CreditCard
} from 'lucide-react';
import { BackButton } from '../components/common/BackButton';

interface CountInputState {
  shrimp_count_id: number;
  count_value: number;
  count_label: string;
  entry_id?: number | null;
  price_per_kg: string;
  quantity_capacity: string;
  payment_terms: string;
  buyer_note: string;
  buying_availability: boolean;
}

export const DailyPriceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasActiveSubscription } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [markets, setMarkets] = useState<MarketLocation[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<number | ''>('');
  const [priceDate, setPriceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sheetPaymentTerms, setSheetPaymentTerms] = useState<string>('Spot Payment');

  const [rawCounts, setRawCounts] = useState<ShrimpCount[]>([]);
  const [allSheets, setAllSheets] = useState<any[]>([]);
  const [currentSheet, setCurrentSheet] = useState<any | null>(null);

  const [countInputs, setCountInputs] = useState<CountInputState[]>([]);
  const [activeEditingCountId, setActiveEditingCountId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteSheetModalOpen, setDeleteSheetModalOpen] = useState(false);
  const [deleteEntryTarget, setDeleteEntryTarget] = useState<{
    id: number;
    count_label: string;
    entry_id?: number | null;
  } | null>(null);

  // Initial Data Fetch
  const fetchInitialData = async () => {
    try {
      const [prodRes, mktRes, countsRes, sheetsRes] = await Promise.all([
        productsApi.getProducts(),
        locationsApi.getMarkets(),
        productsApi.getCounts(),
        buyerApi.getSheets(),
      ]);

      const prods = prodRes.data || [];
      const mkts = mktRes.data || [];
      const counts = countsRes.data || [];
      const sheets = sheetsRes.data || [];

      setProducts(prods);
      setMarkets(mkts);
      setRawCounts(counts);
      setAllSheets(sheets);

      // 1. Check URL parameters first (e.g. from Dashboard "Edit" link)
      const urlMarketId = searchParams.get('market_id');
      const urlProductId = searchParams.get('product_id');
      const urlDate = searchParams.get('date');

      if (urlMarketId && urlProductId) {
        setSelectedMarketId(Number(urlMarketId));
        setSelectedProductId(Number(urlProductId));
        if (urlDate) setPriceDate(urlDate);
      } else if (sheets.length > 0) {
        // 2. If buyer already has published sheets, automatically load their active sheet!
        const latestSheet = sheets[0];
        setSelectedMarketId(latestSheet.market_location_id);
        setSelectedProductId(latestSheet.product_id);
        setPriceDate(latestSheet.price_date);
      } else {
        // 3. Fallback to first available product and market
        if (prods.length > 0) setSelectedProductId(prods[0].id);
        if (mkts.length > 0) setSelectedMarketId(mkts[0].id);
      }
    } catch (err) {
      console.error('Failed to initialize daily price sheet inputs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update inputs whenever selection changes
  useEffect(() => {
    if (!rawCounts.length) return;

    const matchedSheet = allSheets.find(
      (s: any) =>
        s.price_date === priceDate &&
        Number(s.market_location_id) === Number(selectedMarketId) &&
        Number(s.product_id) === Number(selectedProductId)
    );

    setCurrentSheet(matchedSheet || null);
    if (matchedSheet?.payment_terms) {
      setSheetPaymentTerms(matchedSheet.payment_terms);
    }

    const updatedInputs = rawCounts.map((c) => {
      const matchedEntry = matchedSheet?.entries?.find(
        (e: any) => e.count_value === c.count_value || e.shrimp_count_id === c.id
      );
      return {
        shrimp_count_id: c.id,
        count_value: c.count_value,
        count_label: c.label,
        entry_id: matchedEntry?.id || null,
        price_per_kg: matchedEntry ? String(matchedEntry.price_per_kg) : '',
        quantity_capacity: matchedEntry?.quantity_capacity || 'Any quantity',
        payment_terms: matchedEntry?.payment_terms || matchedSheet?.payment_terms || sheetPaymentTerms || 'Spot Payment',
        buyer_note: matchedEntry?.buyer_note || '',
        buying_availability: matchedEntry ? matchedEntry.buying_availability : true,
      };
    });

    setCountInputs(updatedInputs);
  }, [priceDate, selectedMarketId, selectedProductId, allSheets, rawCounts]);

  const handlePriceChange = (countId: number, value: string) => {
    setCountInputs((prev) =>
      prev.map((item) => (item.shrimp_count_id === countId ? { ...item, price_per_kg: value } : item))
    );
  };

  const handlePaymentTermsChange = (countId: number, value: string) => {
    setCountInputs((prev) =>
      prev.map((item) => (item.shrimp_count_id === countId ? { ...item, payment_terms: value } : item))
    );
  };

  const handleApplyPaymentTermsToAll = (terms: string) => {
    setSheetPaymentTerms(terms);
    setCountInputs((prev) => prev.map((item) => ({ ...item, payment_terms: terms })));
    setSuccess(`Updated payment terms to "${terms}" across all counts.`);
    setTimeout(() => setSuccess(null), 2500);
  };

  const handleNoteChange = (countId: number, value: string) => {
    setCountInputs((prev) =>
      prev.map((item) => (item.shrimp_count_id === countId ? { ...item, buyer_note: value } : item))
    );
  };

  const handleAvailabilityToggle = (countId: number) => {
    setCountInputs((prev) =>
      prev.map((item) =>
        item.shrimp_count_id === countId ? { ...item, buying_availability: !item.buying_availability } : item
      )
    );
  };

  // Row Edit button: focus and highlight input
  const handleEditCount = (countId: number) => {
    setActiveEditingCountId(countId);
    setCountInputs((prev) =>
      prev.map((item) =>
        item.shrimp_count_id === countId ? { ...item, buying_availability: true } : item
      )
    );
    setTimeout(() => {
      const el = document.getElementById(`rate-input-${countId}`) as HTMLInputElement;
      if (el) {
        el.focus();
        el.select();
      }
    }, 60);
  };

  // Row Delete button: trigger confirmation or clear
  const handleDeleteCountClick = (item: CountInputState) => {
    // Check entry_id on item or lookup from currentSheet entries
    const foundEntry = currentSheet?.entries?.find(
      (e: any) => e.count_value === item.count_value || e.shrimp_count_id === item.shrimp_count_id
    );
    const entryId = item.entry_id || foundEntry?.id;

    if (entryId) {
      setDeleteEntryTarget({
        id: item.shrimp_count_id,
        count_label: item.count_label,
        entry_id: entryId,
      });
    } else {
      setCountInputs((prev) =>
        prev.map((row) =>
          row.shrimp_count_id === item.shrimp_count_id
            ? { ...row, price_per_kg: '', buying_availability: false }
            : row
        )
      );
      setSuccess(`Cleared rate for ${item.count_label}.`);
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  // Confirm delete of single entry from server
  const handleConfirmDeleteEntry = async () => {
    if (!deleteEntryTarget) return;
    setDeleting(true);
    setError(null);
    try {
      if (deleteEntryTarget.entry_id) {
        await buyerApi.deleteEntry(deleteEntryTarget.entry_id);
      }
      setCountInputs((prev) =>
        prev.map((row) =>
          row.shrimp_count_id === deleteEntryTarget.id
            ? { ...row, price_per_kg: '', entry_id: null, buying_availability: false }
            : row
        )
      );

      // Refresh sheets cache
      const sheetsRes = await buyerApi.getSheets();
      setAllSheets(sheetsRes.data || []);

      setSuccess(`Price for ${deleteEntryTarget.count_label} successfully deleted.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete price entry.');
    } finally {
      setDeleting(false);
      setDeleteEntryTarget(null);
    }
  };

  // Delete Entire Sheet
  const handleConfirmDeleteSheet = async (targetSheet?: any) => {
    const sheetToDel = targetSheet || currentSheet;
    if (!sheetToDel) return;
    setDeleting(true);
    setError(null);
    try {
      await buyerApi.deleteSheet(sheetToDel.id);
      setSuccess(`Price sheet for ${sheetToDel.market_name || 'Market'} successfully deleted.`);

      // Refresh sheets
      const sheetsRes = await buyerApi.getSheets();
      const updatedSheets = sheetsRes.data || [];
      setAllSheets(updatedSheets);

      if (!targetSheet || targetSheet.id === currentSheet?.id) {
        setCurrentSheet(null);
        setCountInputs((prev) =>
          prev.map((row) => ({
            ...row,
            price_per_kg: '',
            entry_id: null,
            buying_availability: true,
          }))
        );
      }
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete price sheet.');
    } finally {
      setDeleting(false);
      setDeleteSheetModalOpen(false);
    }
  };

  // Clear all rates in current form
  const handleClearAllPrices = () => {
    setCountInputs((prev) =>
      prev.map((row) => ({
        ...row,
        price_per_kg: '',
      }))
    );
    setSuccess('All price rates cleared in form.');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Save / Publish Sheet
  const handleFormSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    setError(null);
    setSuccess(null);

    if (!hasActiveSubscription) {
      setError('Active subscription required to publish prices. Please subscribe or renew your membership.');
      return;
    }

    if (!selectedProductId || !selectedMarketId) {
      setError('Please select product and market location.');
      return;
    }

    const validEntries = countInputs
      .filter((item) => item.price_per_kg && Number(item.price_per_kg) > 0)
      .map((item) => ({
        shrimp_count_id: item.shrimp_count_id,
        price_per_kg: Number(item.price_per_kg),
        quantity_capacity: item.quantity_capacity,
        payment_terms: item.payment_terms || sheetPaymentTerms || 'Spot Payment',
        buyer_note: item.buyer_note,
        buying_availability: item.buying_availability,
      }));

    if (validEntries.length === 0) {
      setError('Please enter purchase rates for at least one shrimp count.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: Number(selectedProductId),
        market_location_id: Number(selectedMarketId),
        price_date: priceDate,
        payment_terms: sheetPaymentTerms,
        status: status,
        entries: validEntries,
      };

      await buyerApi.createSheet(payload);

      // Refresh sheets
      const sheetsRes = await buyerApi.getSheets();
      setAllSheets(sheetsRes.data || []);

      setSuccess(
        status === 'PUBLISHED'
          ? 'Today\'s prices published live! Farmers can now view your updated rates.'
          : 'Price sheet saved as draft.'
      );
      setTimeout(() => {
        navigate('/buyer/dashboard');
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to save price sheet.');
    } finally {
      setSubmitting(false);
    }
  };

  const filledCount = countInputs.filter((c) => c.price_per_kg && Number(c.price_per_kg) > 0).length;

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Back Link */}
        <div className="flex items-center justify-between">
          <BackButton to="/buyer/dashboard" label="← Back to Dashboard" />
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-md shadow-sky-500/20 shrink-0">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-sky-700 mb-1">
                <DollarSign className="w-4 h-4 text-sky-600" />
                Daily Mandi Rate Submission
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Manage Daily Shrimp Prices
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter, edit, or delete rates for shrimp counts. Live prices are updated for Andhra farmers instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Preview Public Rates
            </button>
          </div>
        </div>

        {/* INACTIVE SUBSCRIPTION BANNER */}
        {!hasActiveSubscription && (
          <div className="rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 p-6 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-sm text-amber-900">
                  Publishing Locked - Active Subscription Required
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  You cannot publish or update daily price sheets without an active verified subscription.
                </p>
              </div>
            </div>
            <Link
              to="/buyer/subscription"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shrink-0 text-center"
            >
              Activate Membership (₹499/mo) →
            </Link>
          </div>
        )}

        {/* Feedback alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold text-sm">
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600 font-bold text-sm">
              ✕
            </button>
          </div>
        )}

        {/* Your Published Mandi Sheets Overview */}
        {allSheets.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Your Published Price Sheets ({allSheets.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any sheet below to load and edit or delete its rates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSheets.map((sheet) => {
                const isCurrent =
                  currentSheet?.id === sheet.id ||
                  (Number(selectedMarketId) === Number(sheet.market_location_id) &&
                    Number(selectedProductId) === Number(sheet.product_id) &&
                    priceDate === sheet.price_date);

                return (
                  <div
                    key={sheet.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/30 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <strong className="text-xs text-slate-900 block font-black">
                          {sheet.market_name}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {sheet.product_name} • {sheet.price_date}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          sheet.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {sheet.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-semibold mb-3">
                      {sheet.entries?.length || 0} count rates listed
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMarketId(sheet.market_location_id);
                          setSelectedProductId(sheet.product_id);
                          setPriceDate(sheet.price_date);
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <Pencil className="w-3 h-3" />
                        <span>{isCurrent ? 'Currently Editing' : 'Load Sheet'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmDeleteSheet(sheet)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center gap-1 cursor-pointer"
                        title="Delete this price sheet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Rate Date
            </label>
            <input
              type="date"
              value={priceDate}
              onChange={(e) => setPriceDate(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Procurement Market / Mandi
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-900 bg-white font-medium">
                  {m.name} ({m.district_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Product Category
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900 bg-white font-medium">
                  {p.name} ({p.default_price_unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Payment Schedule (Default)
            </label>
            <select
              value={sheetPaymentTerms}
              onChange={(e) => handleApplyPaymentTermsToAll(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="Spot Payment">⚡ Spot Payment (Immediate)</option>
              <option value="1-2 Days">⏱️ 1 - 2 Days</option>
              <option value="3-5 Days">⏱️ 3 - 5 Days</option>
              <option value="Within 7 Days">📅 Within 7 Days / 1 Week</option>
              <option value="10-15 Days">📅 10 - 15 Days</option>
            </select>
          </div>
        </div>

        {/* Existing Sheet Banner (Sheet-Level Actions: Edit & Delete) */}
        {currentSheet && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-emerald-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileEdit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900">
                    Existing Price Sheet (#{currentSheet.id})
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      currentSheet.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {currentSheet.status === 'PUBLISHED' ? 'Published Live' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {currentSheet.market_name} • {currentSheet.product_name} • Date: {currentSheet.price_date}
                  {currentSheet.updated_at && (
                    <span className="text-slate-500 text-[11px] ml-1.5">
                      (Updated {new Date(currentSheet.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const firstPriced = countInputs.find((c) => c.price_per_kg);
                  if (firstPriced) handleEditCount(firstPriced.shrimp_count_id);
                  else if (countInputs.length > 0) handleEditCount(countInputs[0].shrimp_count_id);
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Pencil className="w-3.5 h-3.5 text-sky-600" />
                Edit Rates
              </button>

              <button
                type="button"
                onClick={() => setDeleteSheetModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Delete Entire Sheet
              </button>
            </div>
          </div>
        )}

        {/* Count-wise Rate Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900">Shrimp Count Rates (₹/kg)</h2>
              <p className="text-xs text-slate-500">
                Enter your purchase price for each count grade. Use <strong>Edit</strong> to modify or <strong>Delete</strong> to remove rates.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                {filledCount} of {countInputs.length} counts active
              </span>
              {filledCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllPrices}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div>
              {/* Desktop Column Header */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3 pb-2.5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                <div className="sm:col-span-3">Count Grade</div>
                <div className="sm:col-span-4">Purchase Rate (₹/kg)</div>
                <div className="sm:col-span-3">Payment Terms</div>
                <div className="sm:col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-slate-100">
                {countInputs.map((item) => {
                  const isEditing = activeEditingCountId === item.shrimp_count_id;
                  const hasPrice = Boolean(item.price_per_kg && Number(item.price_per_kg) > 0);

                  return (
                    <div
                      key={item.shrimp_count_id}
                      className={`py-3.5 px-3 rounded-2xl transition-all duration-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center ${
                        isEditing
                          ? 'bg-sky-50/60 ring-2 ring-sky-500/80 shadow-sm'
                          : !item.buying_availability
                          ? 'opacity-60 bg-slate-50/50 hover:opacity-100'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Grade Label */}
                      <div className="sm:col-span-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 block">
                            {item.count_label}
                          </span>
                          {isEditing && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-200 text-sky-800">
                              Editing
                            </span>
                          )}
                          {item.entry_id && !isEditing && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Saved
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{item.count_value} pcs/kg</span>
                      </div>

                      {/* Rate Input */}
                      <div className="sm:col-span-4">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                          <input
                            id={`rate-input-${item.shrimp_count_id}`}
                            type="number"
                            placeholder="Rate in ₹"
                            disabled={!item.buying_availability}
                            value={item.price_per_kg}
                            onFocus={() => setActiveEditingCountId(item.shrimp_count_id)}
                            onChange={(e) => handlePriceChange(item.shrimp_count_id, e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-12 py-2.5 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400 shadow-xs"
                          />
                          <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-medium">/kg</span>
                        </div>
                      </div>

                      {/* Payment Terms Select */}
                      <div className="sm:col-span-3">
                        <select
                          disabled={!item.buying_availability}
                          value={item.payment_terms || sheetPaymentTerms || 'Spot Payment'}
                          onChange={(e) => handlePaymentTermsChange(item.shrimp_count_id, e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-2.5 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 shadow-xs"
                        >
                          <option value="Spot Payment">⚡ Spot Payment (Immediate)</option>
                          <option value="1-2 Days">⏱️ 1 - 2 Days</option>
                          <option value="3-5 Days">⏱️ 3 - 5 Days</option>
                          <option value="Within 7 Days">📅 Within 7 Days / 1 Wk</option>
                          <option value="10-15 Days">📅 10 - 15 Days</option>
                        </select>
                      </div>

                      {/* Action Buttons: Edit, Delete */}
                      <div className="sm:col-span-2 flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditCount(item.shrimp_count_id)}
                          title="Edit rate for this count"
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                            isEditing
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <Pencil className={`w-3.5 h-3.5 ${isEditing ? 'text-white' : 'text-sky-600'}`} />
                          <span className="hidden lg:inline">Edit</span>
                        </button>

                        {/* Delete Price Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCountClick(item)}
                          disabled={!item.price_per_kg && !item.entry_id}
                          title="Delete rate for this count"
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span className="hidden lg:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submission Action Buttons */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {currentSheet && (
                <button
                  type="button"
                  onClick={() => setDeleteSheetModalOpen(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 py-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Entire Price Sheet
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={submitting || !hasActiveSubscription}
                onClick={() => handleFormSubmit('DRAFT')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm"
              >
                <Save className="w-4 h-4 text-slate-500" />
                Save Draft
              </button>

              <button
                type="button"
                disabled={submitting || !hasActiveSubscription}
                onClick={() => handleFormSubmit('PUBLISHED')}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
                {submitting
                  ? 'Publishing Rates...'
                  : currentSheet
                  ? 'Update & Publish Rates Live'
                  : 'Publish Today\'s Prices Live'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Sheet Modal */}
      {deleteSheetModalOpen && currentSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Delete Price Sheet?</h3>
                <p className="text-xs text-slate-500">This action removes all rates for this date and mandi.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5 bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
              You are about to delete the price sheet for{' '}
              <strong className="text-slate-900">{currentSheet.market_name}</strong> on{' '}
              <strong className="text-slate-900">{currentSheet.price_date}</strong>. Farmers will no longer see any
              purchase prices from you for this date in the public comparison hub.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteSheetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDeleteSheet}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Yes, Delete Entire Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Entry Modal */}
      {deleteEntryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Delete {deleteEntryTarget.count_label} Rate?
                </h3>
                <p className="text-xs text-slate-500">Remove price for this count</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              This will permanently delete your live purchase rate for{' '}
              <strong className="text-slate-900">{deleteEntryTarget.count_label}</strong> from Andhra farmer
              comparison views.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteEntryTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDeleteEntry}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting...' : 'Yes, Delete Rate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Public Farmer Listing Preview</h3>
                <p className="text-[11px] text-slate-500">This is how farmers in Andhra will see your rates</p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {countInputs.filter((item) => item.price_per_kg && Number(item.price_per_kg) > 0).length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No price rates entered yet. Fill in prices to see preview.
                </div>
              ) : (
                countInputs
                  .filter((item) => item.price_per_kg && Number(item.price_per_kg) > 0)
                  .map((item) => (
                    <div
                      key={item.shrimp_count_id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{item.count_label}</strong>
                        <div className="text-[10px] text-slate-500 italic">{item.buyer_note}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sky-900 text-sm">₹{item.price_per_kg}/kg</span>
                        <span className="text-[10px] text-emerald-600 block font-bold">Active Today</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
