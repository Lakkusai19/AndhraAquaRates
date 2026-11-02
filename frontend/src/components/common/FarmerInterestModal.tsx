import React, { useState } from 'react';
import {
  X,
  Phone,
  User,
  MapPin,
  Scale,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Building2,
  Zap,
} from 'lucide-react';
import { PublicComparisonItem } from '../../types';
import { farmerLeadsApi } from '../../services/api';

interface FarmerInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PublicComparisonItem | null;
  language: 'en' | 'te';
}

export const FarmerInterestModal: React.FC<FarmerInterestModalProps> = ({
  isOpen,
  onClose,
  item,
  language,
}) => {
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [approxQuantity, setApproxQuantity] = useState('');
  const [pondLocation, setPondLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    buyer_name: string;
    buyer_phone: string;
    whatsapp_url: string;
  } | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDigits = sellerPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError(
        language === 'te'
          ? 'దయచేసి మీ సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.'
          : 'Please enter a valid 10-digit mobile phone number.'
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        buyer_id: item.buyer_id,
        seller_phone: sellerPhone.trim(),
        seller_name: sellerName.trim() || 'Shrimp Farmer',
        shrimp_count: item.count_label,
        offered_price: item.price_per_kg,
        payment_terms: item.payment_terms || 'Spot Payment',
        market_location: item.market_name,
        district: item.district_name,
        approx_quantity: approxQuantity.trim(),
        notes: [pondLocation.trim() ? `Location: ${pondLocation.trim()}` : '', notes.trim()]
          .filter(Boolean)
          .join(' | '),
      };

      const res = await farmerLeadsApi.submitInterest(payload);
      setSuccessData(res.data);
    } catch (err: any) {
      console.error('Failed to submit farmer interest:', err);
      setError(
        err.response?.data?.error ||
          (language === 'te'
            ? 'వివరాలు పంపడంలో లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
            : 'Failed to send your interest. Please check your network and try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setSellerPhone('');
    setSellerName('');
    setApproxQuantity('');
    setPondLocation('');
    setNotes('');
    setError(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 text-white">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-teal-500/20 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-amber-400 via-sky-400 to-teal-400 shadow-md shadow-amber-500/25 shrink-0">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'te' ? 'రొయ్యల విక్రయ ఆసక్తి' : "Express Interest to Sell"}
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'te'
                  ? 'మీ మొబైల్ నంబర్ నేరుగా కొనుగోలుదారుకి చేరుతుంది'
                  : 'Send your phone number directly to this verified buyer'}
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Rate Snapshot Box */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-extrabold text-white text-sm">{item.buyer_name}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold">
                {item.business_type}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5 text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{language === 'te' ? 'కౌంట్ గ్రేడ్' : 'Count Grade'}</span>
                <span className="font-black text-sky-300 text-sm">{item.count_label}</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{language === 'te' ? 'ధర / కేజీ' : 'Rate / kg'}</span>
                <span className="font-black text-emerald-400 text-sm">₹{item.price_per_kg}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{language === 'te' ? 'చెల్లింపు' : 'Payment'}</span>
                <span className="font-bold text-amber-300 text-xs truncate block">{item.payment_terms || 'Spot Pay'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{item.market_name}, {item.district_name}</span>
            </div>
          </div>

          {/* If already submitted successfully, show Celebration & Connect Links */}
          {successData ? (
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">
                  {language === 'te' ? 'ఆసక్తి విజయవంతంగా చేరింది!' : 'Interest Sent Successfully!'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                  {language === 'te'
                    ? `మీ మొబైల్ నంబర్ (${sellerPhone}) ${successData.buyer_name} కు పంపబడింది. కొనుగోలుదారు మిమ్మల్ని త్వరలోనే సంప్రదిస్తారు.`
                    : `Your mobile number (${sellerPhone}) has been notified to ${successData.buyer_name}. They will review and contact you shortly.`}
                </p>
              </div>

              {/* Direct Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                {successData.whatsapp_url && (
                  <a
                    href={successData.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{language === 'te' ? 'వాట్సాప్‌లో మాట్లాడండి' : 'Chat on WhatsApp Now'}</span>
                  </a>
                )}
                {item.tel_link && (
                  <a
                    href={item.tel_link}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-sky-400" />
                    <span>{language === 'te' ? 'నేరుగా కాల్ చేయండి' : 'Call Buyer Directly'}</span>
                  </a>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  {language === 'te' ? 'ముగించు' : 'Close Window'}
                </button>
              </div>
            </div>
          ) : (
            /* Interest Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Seller Mobile Number (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {language === 'te' ? 'మీ మొబైల్ నంబర్ (కాలింగ్ నంబర్)' : 'Your Mobile Phone (Calling)'}{' '}
                  <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={14}
                    placeholder={language === 'te' ? 'ఉదా: 98480 12345' : 'e.g. +91 98480 12345'}
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/90 text-white pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono tracking-wider placeholder:text-slate-500"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'te'
                    ? 'ఈ నంబర్‌కు బయ్యర్ నేరుగా ఫోన్ చేసి వివరాలు మాట్లాడుకుంటారు.'
                    : 'The buyer will use this number to contact you regarding the price and harvest.'}
                </p>
              </div>

              {/* Farmer Name & Approx Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'te' ? 'రైతు / మీ పేరు (ఐచ్ఛికం)' : 'Your Name (Optional)'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder={language === 'te' ? 'ఉదా: రమేష్ రెడ్డి' : 'e.g. Ramesh Reddy'}
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/90 text-white pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'te' ? 'అంచనా పరిమాణం (ఐచ్ఛికం)' : 'Approx Quantity (Optional)'}
                  </label>
                  <div className="relative">
                    <Scale className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder={language === 'te' ? 'ఉదా: 2 టన్నులు / 500 కేజీలు' : 'e.g. 2 Tons / 500 Kgs'}
                      value={approxQuantity}
                      onChange={(e) => setApproxQuantity(e.target.value)}
                      className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/90 text-white pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pond Location & Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'te' ? 'చెరువు గ్రామం / మండలం & వివరాలు (ఐచ్ఛికం)' : 'Pond Village / Mandal & Remarks (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'te' ? 'ఉదా: కల్లా మండలం, రేపు రాత్రి హార్వెస్ట్' : 'e.g. Kalla Mandal, ready for netting tomorrow'}
                  value={pondLocation}
                  onChange={(e) => setPondLocation(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/90 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                />
              </div>

              {/* Trust Badge */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  {language === 'te'
                    ? '100% ఉచిత సేవ. మీ నంబర్ కేవలం ఈ అధికారిక బయ్యర్‌కు మాత్రమే చేరుతుంది.'
                    : '100% Free Service. Your contact details are securely delivered to this verified buyer only.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  {language === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>{language === 'te' ? 'పంపుతోంది...' : 'Sending...'}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'బయ్యర్‌కి నంబర్ పంపండి →' : 'Send to Buyer →'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
