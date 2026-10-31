import React, { useState } from 'react';
import { useLocationPreference } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  Navigation,
  Check,
  X,
  Sparkles,
  Compass,
  AlertCircle,
  Loader2,
  Building2,
  Sliders,
} from 'lucide-react';

export const LocationPreferenceModal: React.FC = () => {
  const {
    districts,
    locationPreference,
    isPreferenceModalOpen,
    closeLocationModal,
    setPreferredDistrict,
    detectCurrentLocation,
    isDetecting,
    setRadiusKm,
  } = useLocationPreference();
  const { t, language } = useLanguage();

  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(locationPreference.districtId);
  const [selectedRadius, setSelectedRadius] = useState<number>(locationPreference.radiusKm || 300);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isPreferenceModalOpen) return null;

  const handleDetect = async () => {
    setStatusMsg(null);
    const result = await detectCurrentLocation();
    if (result.success) {
      setStatusMsg({
        type: 'success',
        text: result.message || (language === 'te' ? 'లొకేషన్ విజయవంతంగా గుర్తించబడింది!' : 'Location detected successfully!'),
      });
      setTimeout(() => {
        closeLocationModal();
      }, 1200);
    } else {
      setStatusMsg({
        type: 'error',
        text: result.message || (language === 'te' ? 'లొకేషన్ గుర్తించలేకపోయాము.' : 'Could not detect location.'),
      });
    }
  };

  const handleSave = () => {
    setPreferredDistrict(selectedDistrictId);
    if (selectedRadius !== locationPreference.radiusKm) {
      setRadiusKm(selectedRadius);
    }
    setStatusMsg({
      type: 'success',
      text: language === 'te' ? 'లొకేషన్ ప్రాధాన్యత సేవ్ చేయబడింది!' : 'Location preference saved successfully!',
    });
    setTimeout(() => {
      closeLocationModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-sky-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/25 shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {language === 'te' ? 'రైతు లొకేషన్ ప్రాధాన్యత' : 'Farmer Location Preference'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {selectedRadius} km
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'te'
                  ? '300 కి.మీ పరిధిలోని కొనుగోలుదారులు మరియు అత్యధిక ధరలు'
                  : 'Buyers & Highest Rates within 300 km radius'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLocationModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Quick Explanation */}
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200/90 leading-relaxed">
            <span className="font-bold text-sky-300">
              {language === 'te' ? '💡 ఎలా పనిచేస్తుంది:' : '💡 How it works:'}
            </span>{' '}
            {language === 'te'
              ? 'మీరు సైట్ ఓపెన్ చేసినప్పుడు మీ ప్రాంతం నుండి 300 కి.మీ పరిధిలోని కొనుగోలుదారుల వివరాలు, వారిలో అత్యధిక ధర ఇచ్చే టాప్ రేట్ మొదట చూపించబడుతుంది. వేరే జిల్లాల ధరలు కావాలనుకుంటే సెర్చ్‌లో ఎప్పుడైనా ఎంచుకోవచ్చు.'
              : 'When you open the site, only buyers and top rates within 300 km of your preferred location are shown. You can still search any district anytime without restriction.'}
          </div>

          {/* 1. Fast GPS Auto-Detection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              {language === 'te' ? '1. త్వరిత లొకేషన్ గుర్తింపు (GPS)' : '1. Fast GPS Auto-Detection'}
            </label>
            <button
              type="button"
              onClick={handleDetect}
              disabled={isDetecting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{language === 'te' ? 'లొకేషన్ గుర్తిస్తోంది...' : 'Detecting your GPS location...'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-slate-950 fill-current" />
                  <span>{language === 'te' ? 'నా ప్రస్తుత లొకేషన్ గుర్తించండి (GPS)' : 'Detect My Current Location (GPS)'}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              {language === 'te'
                ? 'మీ మొబైల్ లేదా బ్రౌజర్ లొకేషన్ ఆధారంగా సమీప జిల్లాను ఎంచుకుంటుంది.'
                : 'Automatically matches your closest AP district based on your device.'}
            </p>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {language === 'te' ? 'లేదా' : 'OR'}
            </span>
          </div>

          {/* 2. Manual District Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>{language === 'te' ? '2. మీ జిల్లాను ఎంచుకోండి' : '2. Select Your District'}</span>
              <span className="text-[10px] text-sky-400 font-medium">
                {districts.length} {language === 'te' ? 'జిల్లాలు' : 'AP Districts'}
              </span>
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
              className="w-full text-xs sm:text-sm font-bold rounded-2xl border-2 border-slate-700 bg-slate-950 py-3 px-3.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id} className="text-white bg-slate-950 py-1.5 font-medium">
                  {d.name} ({d.state_code})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Radius Setting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'te' ? 'పరిధి (కి.మీ)' : 'Surrounding Radius (km)'}</span>
              </label>
              <span className="text-xs font-extrabold text-teal-400">{selectedRadius} km</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[150, 200, 300, 400].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRadius(r)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    selectedRadius === r
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {r} km {r === 300 && '⭐'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'te'
                ? '⭐ 300 కి.మీ సిఫార్సు చేయబడింది (రవాణా ఖర్చులు మరియు రొయ్యల నాణ్యతకు ఉత్తమం).'
                : '⭐ 300 km is recommended for live shrimp transport across AP.'}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[11px] text-slate-400 block font-medium">
              {language === 'te' ? 'ప్రస్తుత లొకేషన్:' : 'Current Setting:'}
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              {districts.find((d) => d.id === selectedDistrictId)?.name || locationPreference.districtName} (
              {selectedRadius} km)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeLocationModal}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              {language === 'te' ? 'రద్దు' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{language === 'te' ? 'వర్తింపజేయండి' : 'Apply Location'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

