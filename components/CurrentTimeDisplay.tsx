import React from 'react';
import { CurrentTimeDisplayProps } from '../types';

const CurrentTimeDisplay: React.FC<CurrentTimeDisplayProps> = ({ currentTime }) => {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use 24-hour format option or keep 12-hour. Standard digital clocks often have seconds.
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

  return (
    <div className="text-center mb-8 p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
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