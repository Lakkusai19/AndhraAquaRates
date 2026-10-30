import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-lg shadow-sky-500/25 shrink-0">
                <img
                  src="/logo.png"
                  alt="ANDHRA AQUA RATES Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div>
                <span className="font-extrabold text-white text-base block leading-tight uppercase">Andhra Aqua</span>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Rates</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering shrimp farmers across coastal Andhra Pradesh with transparent, verified, daily purchasing prices from certified processors, exporters, and wholesalers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Free For Farmers
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/compare" className="hover:text-sky-400 transition-colors">Compare Today's Prices</Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-sky-400 transition-colors">Aqua Hubs & Mandis</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-sky-400 transition-colors">How The Platform Works</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-sky-400 transition-colors">Buyer Onboarding & Membership</Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1">
                  <span>👑 Admin Portal Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Key AP Hubs */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Major Aqua Districts</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center justify-between">
                <span>West Godavari</span>
                <span className="text-slate-500 text-[11px]">Bhimavaram / Palakollu</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Konaseema</span>
                <span className="text-slate-500 text-[11px]">Amalapuram / Ravulapalem</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Kakinada</span>
                <span className="text-slate-500 text-[11px]">Harbor / Tallarevu</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Krishna & Bapatla</span>
                <span className="text-slate-500 text-[11px]">Machilipatnam / Nizampatnam</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Nellore</span>
                <span className="text-slate-500 text-[11px]">Wholesale Aqua Terminal</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Market Support Desk</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>+91 98480 12345 (Toll-Free Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>support@andhraaquarates.com</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Mon - Sat: 6:00 AM - 8:00 PM IST (Peak Mandi Hours)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ANDHRA AQUA RATES. Built for Andhra Pradesh Aquaculture community.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Subscription Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
