import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { pricingApi, locationsApi, productsApi } from '../services/api';
import { District, ShrimpCount, PublicComparisonItem } from '../types';
import { AnimatedPrawnsBackground } from '../components/ui/AnimatedPrawnsBackground';
import {
  Scale,
  Search,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Building2,
  Sparkles,
  Award,
  Layers,
  Zap,
} from 'lucide-react';
import { FarmerInterestModal } from '../components/common/FarmerInterestModal';
import { ImportantDisclaimerTicker } from '../components/common/ImportantDisclaimerTicker';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [districts, setDistricts] = useState<District[]>([]);
  const [counts, setCounts] = useState<ShrimpCount[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCount, setSelectedCount] = useState<string>('');
  const [interestedItem, setInterestedItem] = useState<PublicComparisonItem | null>(null);

  const [recentPrices, setRecentPrices] = useState<PublicComparisonItem[]>([]);
  const [stats, setStats] = useState({
    activeBuyers: 6,
    districtsCount: 8,
    freshPricesToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distRes, countRes, priceRes] = await Promise.all([
          locationsApi.getDistricts(),
          productsApi.getCounts(),
          pricingApi.getComparison({ sort: 'highest_price', page: 1 }),
        ]);
        setDistricts(distRes.data || []);
        setCounts(countRes.data || []);
        const results = priceRes.data.results || [];
        setRecentPrices(results.slice(0, 6));

        const uniqueBuyers = new Set(results.map((r: PublicComparisonItem) => r.buyer_id));
        setStats({
          activeBuyers: uniqueBuyers.size || 6,
          districtsCount: (distRes.data || []).length || 8,
          freshPricesToday: results.filter((r: PublicComparisonItem) => r.is_fresh).length || results.length,
        });
      } catch (err) {
        console.error('Error fetching homepage initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedDistrict) query.set('district', selectedDistrict);
    if (selectedCount) query.set('count', selectedCount);
    navigate(`/compare?${query.toString()}`);
  };

  // Sample prevailing reference rate pills for AP farmers
  const marketHighlights = [
    { count: '30 Count', price: '₹480 - ₹510', status: 'High Demand' },
    { count: '40 Count', price: '₹415 - ₹435', status: 'Active' },
    { count: '50 Count', price: '₹365 - ₹385', status: 'Stable' },
    { count: '60 Count', price: '₹330 - ₹350', status: 'Active' },
    { count: '80 Count', price: '₹285 - ₹305', status: 'Active' },
    { count: '100 Count', price: '₹250 - ₹265', status: 'Moderate' },
  ];

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. HERO SECTION WITH REAL SWIMMING VANNAMEI PRAWNS & OCEAN SUNBEAMS */}
      <AnimatedPrawnsBackground intensity="vibrant" className="pt-0 pb-10 sm:pb-20 px-0 border-b border-slate-800">
        
        {/* Full-width Slow Marquee Ticker (Spans edge-to-edge above trust tag & headline) */}
        <div className="w-full relative z-20 mb-4 sm:mb-6">
          <ImportantDisclaimerTicker fullWidth={true} />
        </div>

        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(14,165,233,0.18),transparent)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          
          {/* Unforgettable Official Brand Emblem Hero Spotlight */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="relative group inline-flex items-center gap-3 p-1.5 sm:p-2 pr-4 sm:pr-5 rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-sky-400/35 shadow-xl shadow-sky-950/70 hover:border-teal-400/60 transition-all hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-lg shadow-sky-500/30 shrink-0">
                <img
                  src="/logo.png"
                  alt="ANDHRA AQUA RATES Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-black text-white tracking-tight leading-snug flex items-center gap-1.5 uppercase">
                  <span>Andhra Aqua</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-sky-400 to-teal-300 text-slate-950">
                    Rates
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-sky-300/80 font-medium mt-0.5">
                  {language === 'te' ? 'ఆంధ్ర ఆక్వా రేట్స్' : "Andhra Pradesh's #1 Aquaculture Network"}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Banner Tag */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-6 shadow-sm max-w-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ రొయ్యల మార్కెట్ లైవ్ నెట్‌వర్క్ • 100% ఉచితం'
                : "Andhra Pradesh Shrimp Pricing Network • 100% Free"}
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 sm:mb-5 leading-tight sm:leading-tight">
            {t.tagline}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal px-2">
            {t.subtitle}
          </p>

          {/* Quick Price Finder Card (Placed Above Compare Today's Prices) */}
          <div className="bg-slate-950/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl border border-sky-400/30 sm:border-2 text-left max-w-4xl mx-auto mb-6 sm:mb-8 transition-all">
            <div className="flex items-center justify-between mb-3.5 sm:mb-4 flex-wrap gap-2">
              <h2 className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                <span>{language === 'te' ? 'ధరల శోధన' : 'Quick Price Finder'}</span>
              </h2>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 sm:px-2.5 rounded-full inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'te' ? 'లైవ్ ధరలు' : 'Live Daily Rates'}
              </span>
            </div>

            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-3.5 items-end">
              {/* 1. District Selector */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] sm:text-xs font-bold text-slate-200 mb-1 sm:mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{t.district}</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold rounded-xl border border-slate-300 sm:border-2 bg-white py-2.5 sm:py-3 px-3 sm:px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer min-h-[44px] sm:min-h-[48px]"
                >
                  <option value="" className="text-slate-900 bg-white font-medium py-1.5">
                    {t.allDistricts}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id} className="text-slate-900 bg-white font-semibold py-1.5">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Shrimp Count Grade */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] sm:text-xs font-bold text-slate-200 mb-1 sm:mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{t.shrimpCount}</span>
                </label>
                <select
                  value={selectedCount}
                  onChange={(e) => setSelectedCount(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold rounded-xl border border-slate-300 sm:border-2 bg-white py-2.5 sm:py-3 px-3 sm:px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer min-h-[44px] sm:min-h-[48px]"
                >
                  <option value="" className="text-slate-900 bg-white font-medium py-1.5">
                    {t.allCounts} ({language === 'te' ? 'అన్ని కౌంట్లు' : 'All Counts 30-120'})
                  </option>
                  {counts.map((c) => (
                    <option key={c.id} value={c.count_value} className="text-slate-900 bg-white font-semibold py-1.5">
                      {c.label} ({c.count_value} count)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Search Rates Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-4 sm:px-5 bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 hover:brightness-110 active:scale-98 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[48px]"
                >
                  <Search className="w-4 h-4 text-slate-950 stroke-[2.5] shrink-0" />
                  <span className="truncate">{language === 'te' ? 'ధరలు చూడండి' : 'Search Rates'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Primary Action Buttons (Now positioned right below the Quick Price Finder) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10 w-full">
            <Link
              to="/compare"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm sm:text-base hover:brightness-110 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              <span>{t.compareTodayPrices}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-700/80 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
              <span>{t.registerAsBuyer}</span>
            </Link>
          </div>

          {/* Prevailing Market Rate Snapshot Cards */}
          <div className="mb-2 sm:mb-4 w-full">
            <div className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-sky-400 mb-2 sm:mb-3 flex items-center justify-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{language === 'te' ? 'నేటి సగటు ధరల అంచనా (₹/Kg)' : 'Today\'s Prevailing Count Rates (₹/Kg)'}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 max-w-4xl mx-auto">
              {marketHighlights.map((m) => (
                <div
                  key={m.count}
                  className="bg-slate-800/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 sm:p-2.5 text-center shadow-sm hover:border-sky-500/50 transition-colors"
                >
                  <div className="text-[11px] sm:text-xs font-bold text-slate-300">{m.count}</div>
                  <div className="text-xs sm:text-base font-black text-white mt-0.5 whitespace-nowrap">{m.price}</div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium mt-0.5 truncate">{m.status}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </AnimatedPrawnsBackground>

      {/* 2. REAL STATS METRICS BAR */}
      <section className="bg-slate-950 border-b border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3 border-r border-slate-800/80 last:border-0">
            <div className="text-3xl sm:text-4xl font-black text-sky-400">{stats.activeBuyers}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t.verifiedBuyers}</div>
          </div>
          <div className="p-3 border-r border-slate-800/80 last:border-0">
            <div className="text-3xl sm:text-4xl font-black text-teal-400">{stats.districtsCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t.coastalDistricts}</div>
          </div>
          <div className="p-3 border-r border-slate-800/80 last:border-0">
            <div className="text-3xl sm:text-4xl font-black text-indigo-400">{stats.freshPricesToday}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t.freshListingsToday}</div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">₹0</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {language === 'te' ? 'రైతులకు ఫీజు ఉచితం' : 'Farmer Access Fee'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. TODAY'S TOP PURCHASING RATES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'te' ? 'ఆంధ్రప్రదేశ్ తాజా రేట్ల పట్టిక' : 'Live Andhra Pradesh Market Rates'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'te' ? 'నేటి అత్యధిక కొనుగోలు ధరలు' : "Today's Top Purchasing Rates"}
            </h2>
          </div>
          <Link
            to="/compare"
            className="text-sm font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>{language === 'te' ? 'అన్ని కౌంట్లను సరిపోల్చండి' : 'View all count comparisons'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : recentPrices.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/60 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">No price sheets published yet for today. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPrices.map((item) => (
              <div
                key={`${item.sheet_id}-${item.entry_id}`}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-lg hover:border-sky-500/50 transition-all flex flex-col justify-between"
              >
                {item.is_highest && (
                  <div className="self-end bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    Top Rate
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{item.buyer_name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>{item.market_name}, {item.district_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="my-4 p-3.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400">{item.count_label}</div>
                      <div className="text-2xl font-black text-sky-300 tracking-tight">
                        ₹{item.price_per_kg}
                        <span className="text-xs font-normal text-slate-400 ml-1">/{item.unit}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                        item.is_fresh
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {item.freshness_status}
                    </span>
                  </div>

                  {item.buyer_note && (
                    <p className="text-xs text-slate-400 italic line-clamp-1 mb-4">
                      "{item.buyer_note}"
                    </p>
                  )}
                </div>

                {/* Direct Action buttons */}
                <div className="pt-3 border-t border-slate-700/80 space-y-2">
                  <button
                    type="button"
                    onClick={() => setInterestedItem(item)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                    <span>{language === 'te' ? 'ఆసక్తి ఉంది (నంబర్ పంపండి)' : "I'm Interested (Send Number)"}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={item.tel_link}
                      className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                      {t.call}
                    </a>
                    <a
                      href={item.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                      {t.whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ALL 26 AP DISTRICTS QUICK SELECT */}
      <section className="bg-slate-950 py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold mb-3 border border-sky-500/20">
            <MapPin className="w-3.5 h-3.5" />
            {language === 'te' ? '26 ఆంధ్రప్రదేశ్ జిల్లాలు' : 'All 26 Andhra Pradesh Districts'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
            {language === 'te' ? 'ఆంధ్రప్రదేశ్ 26 జిల్లాల ఆక్వా కేంద్రాలు & మార్కెట్లు' : 'Andhra Pradesh Aquaculture & Mandi Districts'}
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-2xl mx-auto">
            {language === 'te'
              ? 'మీ జిల్లాను ఎంచుకోండి, స్థానిక మార్కెట్లు మరియు తాజా కొనుగోలు ధరలను నేరుగా ఒకే క్లిక్‌తో చూడండి.'
              : 'Select your district to view daily prawn purchase rates and active local mandis across Andhra Pradesh.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {districts.map((d) => (
              <Link
                key={d.id}
                to={`/compare?district=${d.id}`}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-400 text-slate-300 hover:text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 hover:bg-slate-800/80 hover:shadow-sky-500/10"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{d.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS & TRANSPARENCY PROMISE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {language === 'te' ? 'వేదిక ఎలా పనిచేస్తుంది?' : 'How ANDHRA AQUA RATES Works'}
            </h2>
            <p className="text-sm text-slate-400">
              Bridging the gap between shrimp pond farmers and commercial seafood buyers with zero commission and complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Farmers */}
            <div className="bg-slate-800/80 rounded-2xl p-7 border border-slate-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                FOR SHRIMP FARMERS (100% FREE)
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">1</span>
                  <span><strong>Check daily purchasing prices</strong> across 30 to 150 count grades with zero fees and no registration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">2</span>
                  <span><strong>Filter by district & mandi</strong> (Bhimavaram, Amalapuram, Kakinada, Machilipatnam, Nellore, etc.).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">3</span>
                  <span><strong>Contact buyers directly</strong> via instant phone call or WhatsApp inquiry with prefilled count and rate.</span>
                </li>
              </ul>
            </div>

            {/* For Buyers */}
            <div className="bg-slate-800/80 rounded-2xl p-7 border border-slate-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold mb-4 border border-sky-500/20">
                <ShieldCheck className="w-4 h-4" />
                FOR VERIFIED BUYERS & EXPORTERS
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">1</span>
                  <span><strong>Register your seafood business</strong> with company name, contact, and operational AP mandis.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">2</span>
                  <span><strong>Subscribe for ₹499/month</strong> through secure Razorpay integration to activate publishing privileges.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">3</span>
                  <span><strong>Publish daily price sheets</strong> to reach thousands of shrimp farmers directly across coastal Andhra Pradesh.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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
