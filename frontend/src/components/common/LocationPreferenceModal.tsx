import React, { useState, useEffect } from 'react';
import { useLocationPreference } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  Navigation,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  Sliders,
  Waves,
} from 'lucide-react';

// Priority coastal aquaculture hubs in Andhra Pradesh
const TOP_COASTAL_AQUA_DISTRICTS = [
  'West Godavari',
  'Dr. B. R. Ambedkar Konaseema',
  'Krishna',
  'Bapatla',
  'Nellore',
  'Guntur',
  'Kakinada',
  'Eluru',
  'Prakasam',
  'Visakhapatnam',
];

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
  const { language } = useLanguage();

  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(locationPreference.districtId);
  const [selectedRadius, setSelectedRadius] = useState<number>(locationPreference.radiusKm || 300);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Sync state whenever modal opens or preference updates
  useEffect(() => {
    if (isPreferenceModalOpen) {
      setSelectedDistrictId(locationPreference.districtId);
      setSelectedRadius(locationPreference.radiusKm || 300);
      setStatusMsg(null);
    }
  }, [isPreferenceModalOpen, locationPreference.districtId, locationPreference.radiusKm]);

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
      }, 1600);
    } else {
      setStatusMsg({
        type: 'error',
        text: result.message || (language === 'te' ? 'లొకేషన్ గుర్తించలేకపోయాము. దయచేసి జిల్లాను ఎంచుకోండి.' : 'Could not detect location. Please select your district manually.'),
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

  const isSelectedCoastal = TOP_COASTAL_AQUA_DISTRICTS.some((name) => {
    const d = districts.find((x) => x.id === selectedDistrictId);
    return d && d.name.toLowerCase() === name.toLowerCase();
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeLocationModal}
    >
      <div
        className="bg-slate-900 border border-sky-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border-b border-slate-800 flex items-start justify-between shrink-0">
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="leading-snug">{statusMsg.text}</span>
            </div>
          )}

          {/* Quick Notice for Hyderabad / Non-AP Users */}
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200/90 leading-relaxed">
            <span className="font-bold text-sky-300">
              {language === 'te' ? '💡 హైదరాబాద్ / ఇతర నగరాల్లో ఉన్నారా?' : '💡 Sitting in Hyderabad or outside AP?'}
            </span>{' '}
            {language === 'te'
              ? 'హైదరాబాద్‌లో రొయ్యల సాగు ఉండదు కాబట్టి, ఆంధ్రప్రదేశ్‌లో మీ రొయ్యల చెరువులు ఉన్న తీరప్రాంత జిల్లాను (ఉదా: పశ్చిమ గోదావరి, కృష్ణా, బాపట్ల, నెల్లూరు) ఎంచుకోండి. ఆ ప్రాంతం నుండి 300 కి.మీ లోపలి లైవ్ రేట్లు కనిపిస్తాయి.'
              : 'Shrimp farming is located in coastal Andhra Pradesh. Please select the coastal district where your shrimp ponds are located (e.g. West Godavari, Krishna, Nellore, Bapatla) to view local buyers and prevailing rates.'}
          </div>

          {/* 1. Fast 1-Tap Coastal Aquaculture Hub Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'te' ? '1. ప్రధాన తీరప్రాంత రొయ్యల సాగు జిల్లాలు (1-ట్యాప్):' : '1. Top Coastal Shrimp Aquaculture Hubs (1-Tap):'}</span>
              </span>
              <span className="text-[10px] text-teal-300 font-bold bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30">
                {language === 'te' ? 'సిఫార్సు' : 'Recommended'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOP_COASTAL_AQUA_DISTRICTS.map((name) => {
                const found = districts.find((d) => d.name.toLowerCase() === name.toLowerCase());
                if (!found) return null;
                const isSelected = selectedDistrictId === found.id;
                return (
                  <button
                    key={found.id}
                    type="button"
                    onClick={() => setSelectedDistrictId(found.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-400 to-teal-400 text-slate-950 font-black shadow-md shadow-sky-500/25 border-sky-300 scale-[1.02]'
                        : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 border-slate-700'
                    }`}
                  >
                    <span className="truncate">{found.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Manual Dropdown for All 26 Districts */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{language === 'te' ? '2. లేదా మొత్తం 26 జిల్లాల నుండి ఎంచుకోండి' : '2. Or Select from all 26 AP Districts'}</span>
              <span className="text-[10px] text-sky-400 font-medium">
                {districts.length} {language === 'te' ? 'జిల్లాలు' : 'Districts'}
              </span>
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
              className="w-full text-xs sm:text-sm font-bold rounded-2xl border-2 border-slate-700 bg-slate-950 py-3 px-3.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
            >
              <optgroup label={language === 'te' ? '🌊 తీరప్రాంత ఆక్వా జిల్లాలు' : '🌊 Coastal Aquaculture Hubs'}>
                {districts
                  .filter((d) => TOP_COASTAL_AQUA_DISTRICTS.some((t) => t.toLowerCase() === d.name.toLowerCase()))
                  .map((d) => (
                    <option key={d.id} value={d.id} className="text-white bg-slate-950 py-1.5 font-semibold">
                      {d.name} ({d.state_code})
                    </option>
                  ))}
              </optgroup>
              <optgroup label={language === 'te' ? '🏛️ ఇతర ఆంధ్రప్రదేశ్ జిల్లాలు' : '🏛️ Other Andhra Pradesh Districts'}>
                {districts
                  .filter((d) => !TOP_COASTAL_AQUA_DISTRICTS.some((t) => t.toLowerCase() === d.name.toLowerCase()))
                  .map((d) => (
                    <option key={d.id} value={d.id} className="text-white bg-slate-950 py-1.5 font-normal">
                      {d.name} ({d.state_code})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {language === 'te' ? 'లేదా' : 'OR'}
            </span>
          </div>

          {/* 3. Fast GPS Auto-Detection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {language === 'te' ? '3. ప్రస్తుత లొకేషన్ గుర్తింపు (GPS)' : '3. Detect Device GPS Location'}
            </label>
            <button
              type="button"
              onClick={handleDetect}
              disabled={isDetecting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-sky-400/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>{language === 'te' ? 'లొకేషన్ గుర్తిస్తోంది...' : 'Detecting your GPS location...'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-teal-400 fill-current" />
                  <span>{language === 'te' ? 'నా ప్రస్తుత లొకేషన్ గుర్తించండి (GPS)' : 'Detect Current GPS Location'}</span>
                </>
              )}
            </button>
          </div>

          {/* 4. Radius Setting */}
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
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedRadius === r
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm font-black'
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
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-left">
            <span className="text-[11px] text-slate-400 block font-medium">
              {language === 'te' ? 'ఎంచుకున్న లొకేషన్:' : 'Selected Location:'}
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
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
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
