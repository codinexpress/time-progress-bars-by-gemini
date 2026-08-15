import React from 'react';
import { CurrentTimeDisplayProps } from '../types';
import { getTimezoneDisplayName } from '../utils/ogUtils';

const CurrentTimeDisplay: React.FC<CurrentTimeDisplayProps> = ({ currentTime, timezone = 'auto' }) => {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  const tzLabel = getTimezoneDisplayName(timezone);

  return (
    <div className="text-center mb-8 p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm relative">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{tzLabel}</span>
      </div>
      <p 
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 tracking-wider font-mono tabular-nums"
        aria-live="polite"
      >
        {currentTime.toLocaleTimeString('en-US', timeOptions)}
      </p>
      <p className="text-sm sm:text-base font-medium text-sky-600 dark:text-sky-400 mt-2 uppercase tracking-widest">
        {currentTime.toLocaleDateString('en-US', dateOptions)}
      </p>
    </div>
  );
};

export default CurrentTimeDisplay;