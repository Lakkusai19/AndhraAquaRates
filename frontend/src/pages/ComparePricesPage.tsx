import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { pricingApi, locationsApi, productsApi, buyerApi } from '../services/api';
import { District, ShrimpCount, PublicComparisonItem } from '../types';
import { AnimatedPrawnsBackground } from '../components/ui/AnimatedPrawnsBackground';
import { BackButton } from '../components/common/BackButton';
import { FarmerInterestModal } from '../components/common/FarmerInterestModal';
import { ImportantDisclaimerTicker } from '../components/common/ImportantDisclaimerTicker';
import {
  Scale,
  Search,
  Filter,
  PhoneCall,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  RotateCcw,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Layers,
  TrendingUp,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  CreditCard,
  X
} from 'lucide-react';

export const ComparePricesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isBuyer } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [deleteTargetItem, setDeleteTargetItem] = useState<PublicComparisonItem | null>(null);
  const [deletingMyRate, setDeletingMyRate] = useState(false);
  const [rateFeedback, setRateFeedback] = useState<string | null>(null);

  // Filter state initialized from URL search params
  const [district, setDistrict] = useState<string>(searchParams.get('district') || '');
  const [count, setCount] = useState<string>(searchParams.get('count') || '');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max_price') || '');
  const [buyerSearch, setBuyerSearch] = useState<string>(searchParams.get('buyer') || '');
  const [freshOnly, setFreshOnly] = useState<boolean>(searchParams.get('fresh_only') === 'true');
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'highest_price');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);

  // Data state
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [countsList, setCountsList] = useState<ShrimpCount[]>([]);
  const [items, setItems] = useState<PublicComparisonItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected item modal for full inspection
  const [selectedItem, setSelectedItem] = useState<PublicComparisonItem | null>(null);
  const [interestedItem, setInterestedItem] = useState<PublicComparisonItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [distRes, countRes] = await Promise.all([
          locationsApi.getDistricts(),
          productsApi.getCounts(),
        ]);
        setDistrictsList(distRes.data || []);
        setCountsList(countRes.data || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Sync state to URL and fetch comparison items
  const fetchPrices = async () => {
    setLoading(true);
    setError(null);

    // Sync URL search parameters
    const params: any = {};
    if (district) params.district = district;
    if (count) params.count = count;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (buyerSearch) params.buyer = buyerSearch;
    if (freshOnly) params.fresh_only = 'true';
    if (sort) params.sort = sort;
    if (page > 1) params.page = String(page);

    setSearchParams(params);

    try {
      const res = await pricingApi.getComparison({
        district: district || undefined,
        count: count ? Number(count) : undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        buyer: buyerSearch || undefined,
        fresh_only: freshOnly || undefined,
        sort: sort || 'highest_price',
        page: page,
      });
      setItems(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch (err: any) {
      setError('Unable to load shrimp price rates from the server. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [district, count, minPrice, maxPrice, buyerSearch, freshOnly, sort, page]);

  const handleResetFilters = () => {
    setDistrict('');
    setCount('');
    setMinPrice('');
    setMaxPrice('');
    setBuyerSearch('');
    setFreshOnly(false);
    setSort('highest_price');
    setPage(1);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmDeleteMyRate = async () => {
    if (!deleteTargetItem) return;
    setDeletingMyRate(true);
    try {
      await buyerApi.deleteEntry(deleteTargetItem.entry_id);
      setItems((prev) => prev.filter((i) => i.entry_id !== deleteTargetItem.entry_id));
      setRateFeedback(
        `Deleted your live rate for ${deleteTargetItem.count_label}. It is now removed from comparison views.`
      );
      setTimeout(() => setRateFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to delete live rate:', err);
    } finally {
      setDeletingMyRate(false);
      setDeleteTargetItem(null);
    }
  };


  const activeFiltersCount = [
    district,
    count,
    minPrice,
    maxPrice,
    buyerSearch,
    freshOnly ? 'fresh' : '',
    sort !== 'highest_price' ? sort : '',
  ].filter(Boolean).length;

  const totalPages = Math.ceil(totalCount / 20) || 1;

  return (
    <div className="flex-1 bg-slate-900 min-h-screen text-slate-100 flex flex-col font-sans">
      {/* ======================================================== */}
      {/* 1. HERO BANNER WITH REALISTIC SWIMMING PRAWNS & OCEAN GLOW */}
      {/* ======================================================== */}
      <AnimatedPrawnsBackground intensity="subtle" showBubbles={true} className="min-h-0 relative pt-6 pb-8 px-4 sm:px-6 lg:px-8 border-b border-sky-800/40 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Action Nav Bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <BackButton
              to="/"
              label={language === 'te' ? '← హోమ్ పేజీకి' : '← Back to Home'}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-md hover:border-sky-300"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-extrabold">{t.copiedLink}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-sky-300" />
                    <span>{t.shareFilters}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
              >
                <Filter className="w-4 h-4" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>
            </div>
          </div>

          {/* Feedback banner if rate was deleted */}
          {rateFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-xl mb-6 backdrop-blur-md animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="font-bold">{rateFeedback}</span>
              </div>
              <button onClick={() => setRateFeedback(null)} className="text-emerald-400 hover:text-white font-bold text-sm">
                ✕
              </button>
            </div>
          )}

          {/* Hero Titles */}
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-md shadow-sky-500/25 shrink-0">
                <img
                  src="/logo.png"
                  alt="ANDHRA AQUA RATES Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide uppercase shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                <span>Andhra Pradesh Live Mandi Price Monitor</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-cyan-300 mb-3 leading-tight">
              {language === 'te' ? 'రొయ్యల రోజువారీ కొనుగోలు ధరల పోలిక' : 'Compare Daily Shrimp Purchasing Rates'}
            </h1>
            <p className="text-xs sm:text-base text-sky-100/80 max-w-2xl leading-relaxed">
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ తీరప్రాంత ఆక్వా మార్కెట్లలో ధృవీకరించబడిన ఎగుమతిదారులు మరియు ప్రాసెసర్లు అందించే లైవ్ కొనుగోలు ధరలు.'
                : 'Direct purchasing rates in ₹/kg offered by verified exporters and processors across coastal AP aquaculture hubs. Real database records only.'}
            </p>
          </div>

          {/* ======================================================== */}
          {/* 2. SMART PRICE FILTERS DECK (FILLS HERO SPACE)          */}
          {/* ======================================================== */}
          <div className="w-full mt-6">
        <div
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-sky-400/25 shadow-2xl shadow-sky-950/80 p-5 sm:p-7 transition-all`}
        >
          {/* Deck Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20">
                <Filter className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-white text-base tracking-wide">{t.filterTitle}</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {activeFiltersCount} Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-sky-200/70">
                  {language === 'te' ? 'మీ జిల్లా మరియు కౌంట్ ప్రకారం ధరలను ఫిల్టర్ చేయండి' : 'Filter by district, shrimp count grade, or buyer name'}
                </p>
              </div>
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs text-sky-300 hover:text-white font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-sky-400/20 hover:border-sky-400/40 transition-all self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.resetFilters}</span>
            </button>
          </div>

          {/* Quick Preset Filter Chips (1-Touch Fast Select) */}
          <div className="mb-5 pb-4 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200/70 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick:
            </span>

            {/* Chip: Highest Price */}
            <button
              type="button"
              onClick={() => {
                setSort('highest_price');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sort === 'highest_price'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105 font-black border border-amber-300/50'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 hover:text-white border border-white/10'
              }`}
            >
              <span>🔥 Top Rates First</span>
            </button>

            {/* Chip: Fresh Today */}
            <button
              type="button"
              onClick={() => {
                setFreshOnly(!freshOnly);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                freshOnly
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105 font-black border border-emerald-300/50'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 hover:text-white border border-white/10'
              }`}
            >
              <span>⚡ Fresh Today</span>
            </button>

            {/* Count Chips */}
            {[
              { val: '30', label: '30 Count' },
              { val: '40', label: '40 Count' },
              { val: '50', label: '50 Count' },
              { val: '100', label: '100 Count' },
            ].map((chip) => {
              const isSelected = count === chip.val;
              return (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => {
                    setCount(isSelected ? '' : chip.val);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-400 to-teal-400 text-slate-950 shadow-md shadow-sky-500/30 scale-105 font-black border border-sky-300/50'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 hover:text-white border border-white/10'
                  }`}
                >
                  <span>🦐 {chip.label}</span>
                </button>
              );
            })}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* 5 Grid Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* District */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-sky-200 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.district}</span>
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-sky-500/30 bg-slate-950/80 hover:border-sky-400 py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner transition-all"
              >
                <option value="" className="bg-slate-900 text-white">{t.allDistricts}</option>
                {districtsList.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shrimp Count */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-200 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.shrimpCount}</span>
              </label>
              <select
                value={count}
                onChange={(e) => {
                  setCount(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-indigo-500/30 bg-slate-950/80 hover:border-indigo-400 py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner transition-all"
              >
                <option value="" className="bg-slate-900 text-white">{t.allCounts}</option>
                {countsList.map((c) => (
                  <option key={c.id} value={c.count_value} className="bg-slate-900 text-white">
                    {c.label} ({c.count_value} count)
                  </option>
                ))}
              </select>
            </div>

            {/* Buyer Name Search */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-purple-200 mb-1.5">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span>Buyer Name</span>
              </label>
              <input
                type="text"
                placeholder={t.searchBuyer}
                value={buyerSearch}
                onChange={(e) => {
                  setBuyerSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-purple-500/30 bg-slate-950/80 hover:border-purple-400 py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.minPrice}</span>
              </label>
              <input
                type="number"
                placeholder="₹ min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-emerald-500/30 bg-slate-950/80 hover:border-emerald-400 py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-200 mb-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.maxPrice}</span>
              </label>
              <input
                type="number"
                placeholder="₹ max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-amber-500/30 bg-slate-950/80 hover:border-amber-400 py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Secondary Controls: Freshness & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10 text-xs">
            <label className="inline-flex items-center gap-2.5 cursor-pointer font-bold text-slate-200 hover:text-white select-none">
              <input
                type="checkbox"
                checked={freshOnly}
                onChange={(e) => {
                  setFreshOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-white/20 focus:ring-sky-400 focus:ring-offset-slate-900"
              />
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t.freshOnly} (Updated within last 24h)</span>
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.sortBy}:</span>
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-xs font-semibold rounded-xl border border-sky-500/30 bg-slate-950/80 hover:border-sky-400 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner"
              >
                <option value="highest_price" className="bg-slate-900 text-white">{t.highestPriceFirst}</option>
                <option value="lowest_price" className="bg-slate-900 text-white">{t.lowestPriceFirst}</option>
                <option value="recently_updated" className="bg-slate-900 text-white">{t.recentlyUpdated}</option>
                <option value="oldest_update" className="bg-slate-900 text-white">{t.oldestUpdate}</option>
                <option value="location_asc" className="bg-slate-900 text-white">{t.locationAlpha}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AnimatedPrawnsBackground>

      {/* ======================================================== */}
      {/* 3. MAIN RESULTS CONTAINER (ADJUSTED UPWARDS)            */}
      {/* ======================================================== */}
      <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Important Disclaimer Scrolling Ticker */}
          <div className="mb-4">
            <ImportantDisclaimerTicker />
          </div>

          {/* Results Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-4 px-1">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span>Showing</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 font-black border border-sky-400/30">
                {items.length} offers
              </span>
              <span>(Total {totalCount} in database)</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.transparencyNote}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm mb-6 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchPrices}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-3.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-24 bg-slate-800/60 border border-slate-700/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center my-6 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white mb-1.5">No Matching Shrimp Prices Found</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                No active buyer prices match your current filter settings. Try clearing your filters or selecting "All Counts" to see all market rates.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* DESKTOP TABLE VIEW                                       */}
              {/* ======================================================== */}
              <div className="hidden lg:block bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mb-6 backdrop-blur-xl">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                  <thead className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 font-black text-sky-200 tracking-wider uppercase text-[11px]">
                    <tr>
                      <th scope="col" className="px-5 py-4 w-16 text-center">{t.rank}</th>
                      <th scope="col" className="px-5 py-4">{t.buyer}</th>
                      <th scope="col" className="px-5 py-4 text-center">{t.count}</th>
                      <th scope="col" className="px-6 py-4 text-right">{t.rate}</th>
                      <th scope="col" className="px-5 py-4 text-center">{t.paymentTerms || 'Payment Terms'}</th>
                      <th scope="col" className="px-5 py-4">{t.location}</th>
                      <th scope="col" className="px-5 py-4">{t.updated}</th>
                      <th scope="col" className="px-5 py-4 text-center">{t.freshness}</th>
                      <th scope="col" className="px-5 py-4 text-center text-amber-300 font-extrabold">{t.interestedHeader || 'Interested'}</th>
                      <th scope="col" className="px-6 py-4 text-center">{t.contact}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {items.map((item, idx) => {
                      const overallRank = (page - 1) * 20 + idx + 1;
                      const isOwner =
                        user &&
                        isBuyer &&
                        ((user.buyer_profile_id && user.buyer_profile_id === item.buyer_id) ||
                          (user.business_name &&
                            user.business_name.toLowerCase() === item.buyer_name.toLowerCase()));

                      return (
                        <tr
                          key={`${item.sheet_id}-${item.entry_id}`}
                          className={`hover:bg-sky-950/30 transition-colors ${
                            item.is_highest ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''
                          }`}
                        >
                          {/* Rank with Medal Badges */}
                          <td className="px-5 py-4.5 text-center">
                            {overallRank === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs shadow-md shadow-amber-500/20">
                                🥇 #1
                              </span>
                            ) : overallRank === 2 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 font-black text-xs shadow-sm">
                                🥈 #2
                              </span>
                            ) : overallRank === 3 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black text-xs shadow-sm">
                                🥉 #3
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs">
                                #{overallRank}
                              </span>
                            )}
                          </td>

                          {/* Buyer */}
                          <td className="px-5 py-4.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="font-extrabold text-white hover:text-sky-300 text-sm text-left flex items-center gap-1.5 transition-colors group cursor-pointer"
                              >
                                <span className="group-hover:underline">{item.buyer_name}</span>
                                <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
                              </button>
                              {item.is_featured && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {item.contact_person} • {item.business_type}
                            </div>
                          </td>

                          {/* Count Grade */}
                          <td className="px-5 py-4.5 text-center">
                            <span className="inline-block px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-sky-200 font-black text-xs shadow-xs">
                              {item.count_label}
                            </span>
                          </td>

                          {/* Rate */}
                          <td className="px-6 py-4.5 text-right">
                            <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                              ₹{item.price_per_kg}
                              <span className="text-xs font-normal text-slate-400 ml-1">/{item.unit}</span>
                            </div>
                            {item.is_highest && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-extrabold bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 rounded-full mt-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                {t.highestToday}
                              </span>
                            )}
                          </td>

                          {/* Payment Terms Column */}
                          <td className="px-5 py-4.5 text-center">
                            {item.payment_terms === 'Spot Payment' || !item.payment_terms ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black shadow-xs">
                                <Zap className="w-3 h-3 text-emerald-400" />
                                <span>Spot Pay</span>
                              </span>
                            ) : item.payment_terms === '1-2 Days' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[11px] font-bold shadow-xs">
                                <Clock className="w-3 h-3 text-sky-400" />
                                <span>1-2 Days</span>
                              </span>
                            ) : item.payment_terms === '3-5 Days' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[11px] font-bold shadow-xs">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                <span>3-5 Days</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold shadow-xs">
                                <span>{item.payment_terms}</span>
                              </span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4.5">
                            <div className="font-bold text-slate-200 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span>{item.market_name}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 pl-4">{item.district_name}, AP</div>
                          </td>

                          {/* Updated */}
                          <td className="px-5 py-4.5 text-slate-400 text-[11px]">
                            <div className="flex items-center gap-1 text-slate-300 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{new Date(item.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 pl-4">
                              {new Date(item.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          {/* Freshness Badge */}
                          <td className="px-5 py-4.5 text-center">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold border inline-flex items-center gap-1 ${
                                item.is_fresh
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {item.is_fresh && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                              <span>{item.freshness_status}</span>
                            </span>
                          </td>

                          {/* Interested Option Column */}
                          <td className="px-5 py-4.5 text-center">
                            {isOwner ? (
                              <span className="text-[10px] text-slate-500 italic">Your Rate</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setInterestedItem(item)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all hover:scale-105 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                                title={`Send your mobile number to ${item.buyer_name}`}
                              >
                                <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                                <span>{language === 'te' ? 'ఆసక్తి ఉంది' : 'Interested'}</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4.5">
                            {isOwner ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                                  Your Rate
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTargetItem(item)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 cursor-pointer shadow-xs"
                                  title="Delete your live rate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={item.tel_link}
                                  className="p-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 transition-all hover:scale-105"
                                  title={`Call ${item.buyer_name}`}
                                >
                                  <PhoneCall className="w-4 h-4 text-sky-400" />
                                </a>
                                <a
                                  href={item.whatsapp_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white transition-all hover:scale-105 shadow-md shadow-emerald-500/20"
                                  title={`WhatsApp ${item.buyer_name}`}
                                >
                                  <MessageSquare className="w-4 h-4 text-white" />
                                </a>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ======================================================== */}
              {/* MOBILE / TABLET RESPONSIVE CARDS VIEW                     */}
              {/* ======================================================== */}
              <div className="lg:hidden space-y-4 mb-6">
                {items.map((item, idx) => {
                  const overallRank = (page - 1) * 20 + idx + 1;
                  const isOwner =
                    user &&
                    isBuyer &&
                    ((user.buyer_profile_id && user.buyer_profile_id === item.buyer_id) ||
                      (user.business_name &&
                        user.business_name.toLowerCase() === item.buyer_name.toLowerCase()));

                  return (
                    <div
                      key={`m-${item.sheet_id}-${item.entry_id}`}
                      className={`bg-slate-900/95 rounded-3xl border p-5 shadow-xl relative overflow-hidden backdrop-blur-xl ${
                        item.is_highest ? 'border-amber-400/60 bg-amber-500/5' : 'border-slate-800'
                      }`}
                    >
                      {/* Top Rank & Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {overallRank === 1 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow-md">
                              🥇 #1 Top Rate
                            </span>
                          ) : overallRank === 2 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 font-black text-xs">
                              🥈 #2
                            </span>
                          ) : overallRank === 3 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black text-xs">
                              🥉 #3
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs">
                              #{overallRank}
                            </span>
                          )}

                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${
                              item.is_fresh
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {item.is_fresh && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            <span>{item.freshness_status}</span>
                          </span>
                        </div>

                        {item.is_highest && (
                          <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Top Rate
                          </span>
                        )}
                      </div>

                      {/* Buyer Details */}
                      <div className="mb-3">
                        <h3
                          onClick={() => setSelectedItem(item)}
                          className="font-black text-white text-base hover:text-sky-300 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{item.buyer_name}</span>
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                        </h3>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.contact_person} • {item.business_type}
                        </div>
                      </div>

                      {/* Market Info */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-4 bg-slate-800/50 p-2.5 rounded-2xl border border-slate-700/50">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="font-semibold">{item.market_name}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{item.district_name}, AP</span>
                      </div>

                      {/* Price Highlight Banner */}
                      <div className="p-4 bg-gradient-to-r from-sky-950/60 to-slate-900/80 rounded-2xl border border-sky-500/30 flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wide">
                            {item.count_label}
                          </div>
                          <div className="text-2xl font-black text-emerald-400 tracking-tight">
                            ₹{item.price_per_kg}
                            <span className="text-xs font-normal text-slate-400 ml-1">/{item.unit}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${
                              item.payment_terms === 'Spot Payment' || !item.payment_terms
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-black'
                                : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                            }`}
                          >
                            <Zap className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{item.payment_terms || 'Spot Payment'}</span>
                          </span>

                          <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {item.buyer_note && (
                        <p className="text-xs text-slate-300 italic mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                          "{item.buyer_note}"
                        </p>
                      )}

                      {/* Direct CTA Buttons */}
                      {isOwner ? (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                            Your Rate Listing
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetItem(item)}
                            className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Rate</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setInterestedItem(item)}
                            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                          >
                            <Zap className="w-4 h-4 text-slate-950 fill-current" />
                            <span>{language === 'te' ? '🤝 నాకు ఆసక్తి ఉంది (మొబైల్ నంబర్ పంపండి)' : "🤝 I'm Interested (Send Phone Number)"}</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <a
                              href={item.tel_link}
                              className="py-2.5 px-3 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                              <PhoneCall className="w-4 h-4 text-sky-400" />
                              <span>{t.call}</span>
                            </a>
                            <a
                              href={item.whatsapp_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                            >
                              <MessageSquare className="w-4 h-4 text-white" />
                              <span>{t.whatsapp}</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-slate-900/90 rounded-2xl border border-slate-800 px-5 py-3.5 text-xs text-slate-300 backdrop-blur-xl">
                  <span>
                    Page <strong className="text-white font-black">{page}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODALS (BUYER INSPECTION & DELETE CONFIRMATION)       */}
      {/* ======================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-700 relative text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/30 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Verified Buyer Profile
                </div>
                <h3 className="text-xl font-black text-white">{selectedItem.buyer_name}</h3>
                <p className="text-xs text-slate-400">Contact: {selectedItem.contact_person} • {selectedItem.business_type}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs border-y border-slate-800 py-4 my-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Selected Count:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-200 font-black">
                  {selectedItem.count_label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Offered Purchase Rate:</span>
                <span className="text-emerald-400 font-black text-base">
                  ₹{selectedItem.price_per_kg} / {selectedItem.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Terms:</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedItem.payment_terms || 'Spot Payment (Immediate)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Market / Location:</span>
                <span className="text-white font-semibold">{selectedItem.market_name}, {selectedItem.district_name}, AP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Last Rate Update:</span>
                <span className="text-slate-300">{new Date(selectedItem.updated_at).toLocaleString('en-IN')}</span>
              </div>
              {selectedItem.quantity_capacity && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Procurement Capacity:</span>
                  <span className="text-white font-semibold">{selectedItem.quantity_capacity}</span>
                </div>
              )}
              {selectedItem.buyer_note && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Buyer Notes / Requirements:</span>
                  <p className="p-3 rounded-2xl bg-slate-800/80 text-slate-300 italic border border-slate-700/60 leading-relaxed">
                    "{selectedItem.buyer_note}"
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <a
                href={selectedItem.tel_link}
                className="py-3 px-4 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <PhoneCall className="w-4 h-4 text-sky-400" />
                <span>Call Buyer</span>
              </a>
              <a
                href={selectedItem.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Buyer</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Rate Confirmation Modal */}
      {deleteTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-500/30 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400 mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Delete Your Price?</h3>
                <p className="text-xs text-rose-300">
                  {deleteTargetItem.count_label} • ₹{deleteTargetItem.price_per_kg}/kg
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 leading-relaxed">
              This will permanently delete your live rate for{' '}
              <strong className="text-white">{deleteTargetItem.count_label}</strong> at{' '}
              <strong className="text-white">{deleteTargetItem.market_name}</strong> from the database. Farmers will
              no longer see this price offer.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={deletingMyRate}
                onClick={() => setDeleteTargetItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingMyRate}
                onClick={handleConfirmDeleteMyRate}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingMyRate ? 'Deleting...' : 'Yes, Delete Rate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Express Interest Modal */}
      <FarmerInterestModal
        isOpen={!!interestedItem}
        onClose={() => setInterestedItem(null)}
        item={interestedItem}
        language={language}
      />
    </div>
  );
};
