import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ImportantDisclaimerTickerProps {
  className?: string;
  fullWidth?: boolean;
}

export const ImportantDisclaimerTicker: React.FC<ImportantDisclaimerTickerProps> = ({
  className = '',
  fullWidth = false,
}) => {
  const { language } = useLanguage();

  const noticeTelugu =
    'ముఖ్య గమనిక: కొనుగోలుదారు (Buyer) మరియు విక్రేత / రైతు (Seller) మధ్య ధరలు, కౌంట్, నాణ్యత లేదా చెల్లింపులకు సంబంధించి ఏదైనా తప్పుడు కమ్యూనికేషన్ (miscommunication) లేదా వివాదం ఏర్పడితే, యాప్ మేనేజ్‌మెంట్‌కు ఎటువంటి సంబంధం లేదా బాధ్యత ఉండదు. వ్యాపార లావాదేవీలు మరియు డీల్స్ పూర్తిగా ఇరుపక్షాల పరస్పర అంగీకారంతోనే చేసుకోవాలి.';

  const noticeEnglish =
    'IMPORTANT NOTICE: In case of any miscommunication, dispute, or discrepancy regarding rates, shrimp count, quality, or payments between the Seller (Farmer) and Buyer, the App Management / Platform holds no liability or responsibility. All deals, transactions, and negotiations are solely between the respective buyer and seller at their own discretion.';

  const displayMessage =
    language === 'te'
      ? `${noticeTelugu} • ${noticeEnglish}`
      : `${noticeEnglish} • ${noticeTelugu}`;

  if (fullWidth) {
    return (
      <div
        className={`w-full max-w-full bg-slate-950/95 border-b border-amber-500/35 py-1.5 sm:py-2 px-2.5 sm:px-6 shadow-md shadow-black/40 backdrop-blur-xl flex items-center gap-2 sm:gap-3 overflow-hidden select-none group ${className}`}
        title={language === 'te' ? 'ఆపడానికి మౌస్ లేదా వేలు ఉంచండి' : 'Hover to pause scrolling'}
      >
        {/* Fixed Left Badge */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 z-10">
          <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 stroke-[2.5] shrink-0 animate-pulse" />
          <span className="whitespace-nowrap">
            {language === 'te' ? 'ముఖ్య గమనిక' : 'Important Note'}
          </span>
        </div>

        {/* Slow Full-width Moving Marquee Ticker */}
        <div className="overflow-hidden relative flex-1 min-w-0">
          <div className="animate-marquee-slow flex items-center whitespace-nowrap text-[11px] sm:text-xs font-semibold text-amber-200/90 gap-16 py-0.5">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
              <span>{displayMessage}</span>
            </span>
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
              <span>{displayMessage}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-full bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/70 border border-amber-500/35 rounded-2xl p-1.5 sm:p-2.5 shadow-lg shadow-black/40 backdrop-blur-xl flex items-center gap-2 sm:gap-2.5 overflow-hidden select-none group ${className}`}
      title={language === 'te' ? 'ఆపడానికి మౌస్ లేదా వేలు ఉంచండి' : 'Hover to pause scrolling'}
    >
      {/* Fixed Sticky Alert Badge */}
      <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 z-10">
        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 stroke-[2.5] shrink-0 animate-pulse" />
        <span className="whitespace-nowrap">
          {language === 'te' ? 'ముఖ్య గమనిక' : 'Important Note'}
        </span>
      </div>

      {/* Smooth Continuous Marquee Ticker */}
      <div className="overflow-hidden relative flex-1 min-w-0">
        <div className="animate-marquee-slow flex items-center whitespace-nowrap text-[11px] sm:text-xs font-semibold text-amber-200/90 gap-16 py-0.5">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
            <span>{displayMessage}</span>
          </span>
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
            <span>{displayMessage}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
