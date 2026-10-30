import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, label, className = '' }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const defaultLabel = language === 'te' ? 'వెనుకకు' : 'Back';
  const displayLabel = label || defaultLabel;

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={displayLabel}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs group cursor-pointer active:scale-95 ${
        className ||
        'bg-white hover:bg-slate-50 text-slate-700 hover:text-sky-600 border border-slate-300 hover:border-sky-300'
      }`}
    >
      <ArrowLeft className="w-4 h-4 text-sky-600 transition-transform group-hover:-translate-x-1 shrink-0" />
      <span>{displayLabel}</span>
    </button>
  );
};
