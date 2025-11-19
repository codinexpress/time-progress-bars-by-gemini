import React from 'react';
import { ProgressBarProps } from '../types';

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  percentage,
  details,
  icon,
  barColor = '#0ea5e9',
  trailColor = 'bg-slate-200 dark:bg-slate-700',
  textColor = 'text-slate-700 dark:text-slate-300',
  showPercentageText = true,
  isMaximized = false,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const isTextColorHex = textColor.startsWith('#');
  const labelStyle = isTextColorHex ? { color: textColor } : {};
  const labelClassName = isTextColorHex ? '' : textColor;

  const containerPadding = isMaximized ? 'p-8 sm:p-12 mb-0' : 'mb-6 p-5';
  const labelTextSize = isMaximized ? 'text-2xl sm:text-3xl' : 'text-sm';
  const percentageTextSize = isMaximized ? 'text-4xl sm:text-5xl' : 'text-lg';
  const barHeight = isMaximized ? 'h-8 sm:h-12' : 'h-4';
  const iconSize = isMaximized ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-5 h-5';
  const detailsTextSize = isMaximized ? 'text-lg sm:text-xl' : 'text-xs';
  const detailsLabelSize = isMaximized ? 'text-sm sm:text-base' : 'text-[10px]';

  return (
    <div className={`${containerPadding} rounded-2xl shadow-lg bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-100 dark:border-slate-700 transition-all hover:shadow-xl w-full`}>
      <div className={`flex justify-between items-end mb-3 ${labelClassName}`} style={labelStyle}>
        <div className="flex items-center space-x-2.5">
          {icon && <span className={`${iconSize} opacity-90`}>{icon}</span>}
          <span className={`${labelTextSize} font-bold tracking-wide uppercase`}>{label}</span>
        </div>
        {showPercentageText && (
          <span className={`${percentageTextSize} font-bold font-mono tabular-nums leading-none`}>
            {clampedPercentage.toFixed(2)}%
          </span>
        )}
      </div>
      
      <div className={`w-full ${trailColor} rounded-full ${barHeight} overflow-hidden shadow-inner relative`}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${clampedPercentage}%`, backgroundColor: barColor }}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
        >
           {/* Shimmer effect */}
           <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
      
      {details && (
        <div className={`mt-3 grid grid-cols-2 gap-x-4 gap-y-2 ${detailsTextSize} text-slate-500 dark:text-slate-400`}>
          <div className="col-span-2 sm:col-span-1">
            <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize}`}>Elapsed</span>
            <p className="font-mono truncate">{details.elapsed}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize}`}>Remaining</span>
            <p className="font-mono truncate">{details.remaining}</p>
          </div>
          <div className="col-span-2 mt-1 pt-2 border-t border-slate-100 dark:border-slate-700/50">
             <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize}`}>Current Period</span>
             <p className="truncate">{details.period}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;