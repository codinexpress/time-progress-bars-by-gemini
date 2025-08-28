import React from 'react';
import { CurrentTimeDisplayProps } from '../types';

const CurrentTimeDisplay: React.FC<CurrentTimeDisplayProps> = ({ currentTime }) => {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

  return (
    <div className="text-center mb-8 p-6 bg-slate-200/50 dark:bg-slate-800/80 rounded-xl shadow-xl border border-slate-300 dark:border-slate-700">
      <p 
        className="text-5xl font-bold text-sky-600 dark:text-sky-400"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        {currentTime.toLocaleTimeString('en-US', timeOptions)}
      </p>
      <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
        {currentTime.toLocaleDateString('en-US', dateOptions)}
      </p>
    </div>
  );
};

export default CurrentTimeDisplay;
