
import React from 'react';
import { ProgressBarProps } from '../types';

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  percentage,
  details,
  icon,
  barColor = '#0ea5e9', // Default to a hex color (sky-500)
  trailColor = 'bg-slate-200 dark:bg-slate-700',
  textColor = 'text-slate-700 dark:text-slate-300',
  showPercentageText = true,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Determine if textColor is a hex color or a Tailwind class
  const isTextColorHex = textColor.startsWith('#');
  const labelStyle = isTextColorHex ? { color: textColor } : {};
  const labelClassName = isTextColorHex ? '' : textColor;

  return (
    <div className="mb-6 p-4 rounded-xl shadow-lg bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
      <div className={`flex justify-between items-center mb-2 ${labelClassName}`} style={labelStyle}>
        <div className="flex items-center space-x-2">
          {icon && <span className="w-5 h-5">{icon}</span>}
          <span className="text-sm font-medium">{label}</span>
        </div>
        {showPercentageText && (
          <span className="text-sm font-medium">{clampedPercentage.toFixed(2)}%</span>
        )}
      </div>
      <div className={`w-full ${trailColor} rounded-full h-5 overflow-hidden shadow-inner`}>
        <div
          className="h-5 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${clampedPercentage}%`, backgroundColor: barColor }}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
        ></div>
      </div>
      {details && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
          <p><strong className="font-semibold text-slate-600 dark:text-slate-300">Elapsed:</strong> {details.elapsed}</p>
          <p><strong className="font-semibold text-slate-600 dark:text-slate-300">Remaining:</strong> {details.remaining}</p>
          <p><strong className="font-semibold text-slate-600 dark:text-slate-300">Period:</strong> {details.period}</p>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;