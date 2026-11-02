import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocationPreference } from '../../context/LocationContext';
import {
  Scale,
  MapPin,
  HelpCircle,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  Home,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer, isAdmin, hasActiveSubscription, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { locationPreference, openLocationModal } = useLocationPreference();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full select-none backdrop-blur-xl bg-slate-950/90 border-b border-sky-500/20 text-white transition-all shadow-md shadow-slate-950/40">
      <div className="w-full max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-4 xl:px-8">
        {/* Strictly locked h-18 (72px) height to prevent downward ballooning on language switch */}
        <div className="flex items-center justify-between h-18 gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Global Back Arrow (Accessible on mobile and system whenever not on homepage) */}
            {location.pathname !== '/' && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label={language === 'te' ? 'వెనుకకు' : 'Back'}
                title={language === 'te' ? 'మునుపటి పేజీకి వెళ్లండి' : 'Go back'}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 hover:text-teal-300 border border-sky-500/30 shadow-sm transition-all flex items-center gap-1.5 shrink-0 group active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline text-xs font-bold">
                  {language === 'te' ? 'వెనుకకు' : 'Back'}
                </span>
              </button>
            )}

            {/* 1. BRAND LOGO (Single-line lock, zero wrapping) */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-2.5 shrink-0 group outline-none py-1 transition-transform"
            >
            {/* Official Brand Logo Icon with subtle glowing ring */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 xl:w-11 xl:h-11 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-md shadow-sky-500/25 group-hover:scale-105 group-hover:shadow-sky-400/40 transition-all shrink-0">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>

            {/* Brand Typography (strictly whitespace-nowrap, no break) */}
            <div className="flex flex-col text-left shrink-0 justify-center">
              <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
                <span className="font-extrabold text-sm sm:text-lg xl:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors uppercase">
                  Andhra Aqua
                </span>
                <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-sky-400 to-teal-300 text-slate-950 shrink-0 shadow-xs">
                  Rates
                </span>
              </div>
              <div className="hidden xl:flex text-[11px] text-sky-300/80 font-medium tracking-wide mt-1 whitespace-nowrap leading-none items-center gap-1.5">
                <span>ఆంధ్ర ఆక్వా రేట్స్</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-semibold hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Rates
                </span>
              </div>
            </div>
          </Link>
        </div>

          {/* 2. CENTER NAVIGATION LINKS (whitespace-nowrap & shrink-0) */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            <Link
              to="/"
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive('/')
                  ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {t.home}
            </Link>

            <Link
              to="/compare"
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/compare')
                  ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="lg:hidden xl:inline">{t.compareTodayPrices}</span>
              <span className="hidden lg:inline xl:hidden">{language === 'te' ? 'ధరల పోలిక' : 'Compare Prices'}</span>
            </Link>

            <Link
              to="/locations"
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/locations')
                  ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="lg:hidden xl:inline">{t.locations}</span>
              <span className="hidden lg:inline xl:hidden">{language === 'te' ? 'ప్రాంతాలు' : 'Locations'}</span>
            </Link>

            <Link
              to="/how-it-works"
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/how-it-works')
                  ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{t.howItWorks}</span>
            </Link>
          </nav>

          {/* 3. RIGHT ACTIONS: Location, Language, Buyer & Auth (whitespace-nowrap & shrink-0) */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 xl:gap-2.5 shrink-0">
            
            {/* Location Preference Pill (300 km radius) */}
            <button
              type="button"
              onClick={openLocationModal}
              title={language === 'te' ? 'లొకేషన్ ప్రాధాన్యత మార్చండి (300 కి.మీ పరిధి)' : 'Change Location Preference (300 km surround)'}
              className="flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-sky-300 hover:text-white border border-sky-400/35 hover:border-teal-400 text-xs font-bold transition-all shadow-sm group cursor-pointer shrink-0 active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate max-w-[75px] lg:max-w-[85px] xl:max-w-[120px]">{locationPreference.districtName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold shrink-0">
                {locationPreference.radiusKm || 300}km
              </span>
            </button>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-900/90 rounded-full p-0.5 xl:p-1 border border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  language === 'te'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Authenticated Buyer Options */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                {isBuyer && (
                  <>
                    <Link
                      to="/buyer/dashboard"
                      className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 flex items-center gap-1.5 border border-slate-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.buyerDashboard}</span>
                    </Link>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border whitespace-nowrap shrink-0 ${
                        hasActiveSubscription
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {hasActiveSubscription ? 'Active Sub' : 'Inactive'}
                    </span>
                  </>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 flex items-center gap-1.5 border border-purple-500/40 whitespace-nowrap shrink-0"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-300 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Public Guest / Farmer Actions */
              <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-2.5 xl:px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{t.buyerLogin}</span>
                </Link>

                <Link
                  to="/register"
                  className="px-3 xl:px-4 py-1.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span>{t.registerAsBuyer}</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. MOBILE CONTROLS (REGISTER AS BUYER + LANGUAGE + HAMBURGER) */}
          <div className="flex items-center lg:hidden gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Register as Buyer / Dashboard Action Button */}
            <div className="md:hidden flex items-center">
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-black rounded-xl bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-sm shadow-sky-500/25 transition-all flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[2.5]" />
                  <span className="sm:hidden">{language === 'te' ? 'నమోదు' : 'Register'}</span>
                  <span className="hidden sm:inline">{t.registerAsBuyer}</span>
                </Link>
              ) : isBuyer ? (
                <Link
                  to="/buyer/dashboard"
                  className="px-2 sm:px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="sm:hidden">{language === 'te' ? 'బోర్డ్' : 'Portal'}</span>
                  <span className="hidden sm:inline">{t.buyerDashboard}</span>
                </Link>
              ) : isAdmin ? (
                <Link
                  to="/admin"
                  className="px-2 sm:px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Admin</span>
                </Link>
              ) : null}
            </div>

            {/* Language toggle for mobile (hidden on md since md already has desktop language pill) */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="md:hidden text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-sky-300 hover:text-white font-bold whitespace-nowrap transition-colors"
            >
              {language === 'en' ? 'తెలుగు' : 'EN'}
            </button>

            {/* Hamburger button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          {/* Brand Identity Spotlight in Mobile Drawer */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-sky-500/15 via-slate-900 to-teal-500/15 border border-sky-400/25 mb-1 shadow-md">
            <div className="w-11 h-11 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 to-teal-300 shadow-md shrink-0">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="text-xs font-black text-white leading-tight flex items-center gap-1.5 uppercase">
                <span>Andhra Aqua</span>
                <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-gradient-to-r from-sky-400 to-teal-300 text-slate-950">Rates</span>
              </div>
              <div className="text-[10px] text-sky-300 font-medium leading-tight mt-0.5">ఆంధ్ర ఆక్వా రేట్స్</div>
            </div>
          </div>

          {/* Location Preference Tile (Mobile) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openLocationModal();
            }}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-400/30 flex items-center justify-between text-xs font-bold text-sky-300 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-normal leading-tight">
                  {language === 'te' ? 'లొకేషన్ ప్రాధాన్యత' : 'Location Preference'}
                </span>
                <span className="text-white font-extrabold">{locationPreference.districtName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {locationPreference.radiusKm || 300} km
              </span>
              <span className="text-xs text-teal-400 font-bold underline">
                {language === 'te' ? 'మార్చండి' : 'Change'}
              </span>
            </div>
          </button>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
              isActive('/')
                ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Home className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{t.home}</span>
          </Link>

          <Link
            to="/compare"
            onClick={() => setIsOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all whitespace-nowrap ${
              isActive('/compare')
                ? 'text-sky-300 bg-sky-500/20 border border-sky-400/40'
                : 'text-sky-300 bg-sky-500/10 border border-sky-400/20 hover:bg-sky-500/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{t.compareTodayPrices}</span>
            </div>
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
          </Link>

          <Link
            to="/locations"
            onClick={() => setIsOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
              isActive('/locations')
                ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t.locations}</span>
          </Link>

          <Link
            to="/how-it-works"
            onClick={() => setIsOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
              isActive('/how-it-works')
                ? 'text-sky-300 bg-sky-500/15 border border-sky-400/30'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t.howItWorks}</span>
          </Link>

          <div className="pt-3 border-t border-slate-800/90 space-y-2">
            {isAuthenticated ? (
              <>
                {isBuyer && (
                  <Link
                    to="/buyer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 px-4 text-center rounded-xl bg-sky-500/15 text-sky-300 font-bold text-xs border border-sky-400/30 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>{t.buyerDashboard}</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 px-4 text-center rounded-xl bg-purple-900/40 text-purple-200 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    <span>{t.adminPortal}</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center rounded-xl bg-red-950/40 text-red-300 font-bold text-xs border border-red-500/30 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>{t.logout}</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-3 text-center rounded-xl bg-slate-900 text-slate-200 font-bold text-xs border border-slate-700/80 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{t.buyerLogin}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-3 text-center rounded-xl bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5] shrink-0" />
                  <span className="truncate">{language === 'te' ? 'నమోదు' : t.registerAsBuyer}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
