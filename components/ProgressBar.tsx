
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
  decimalPlaces,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const isTextColorHex = textColor.startsWith('#');
  const labelStyle = isTextColorHex ? { color: textColor } : {};
  const labelClassName = isTextColorHex ? '' : textColor;

  // Adjust sizing for maximized view to be more responsive on mobile
  // Removed internal padding for maximized view to rely on parent container padding
  const containerPadding = isMaximized ? 'w-full' : 'mb-6 p-5 w-full';
  
  const labelTextSize = isMaximized ? 'text-xl sm:text-3xl' : 'text-sm';
  // Larger percentage text in body for maximized view
  const percentageTextSize = isMaximized ? 'text-5xl sm:text-7xl' : 'text-lg';
  const barHeight = isMaximized ? 'h-6 sm:h-12' : 'h-4';
  const iconSize = isMaximized ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-5 h-5';
  const detailsTextSize = isMaximized ? 'text-sm sm:text-lg' : 'text-xs';
  const detailsLabelSize = isMaximized ? 'text-xs sm:text-sm' : 'text-[10px]';
  
  // When maximized, we remove the card decoration (bg, shadow, border) because the parent VisualizationCard handles it.
  const containerDecoration = isMaximized 
    ? '' 
    : 'rounded-2xl shadow-lg bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-100 dark:border-slate-700 transition-all hover:shadow-xl';

  return (
    <div className={`${containerPadding} ${containerDecoration}`}>
      <div className={`flex justify-between items-end mb-3 ${labelClassName}`} style={labelStyle}>
        <div className="flex items-center space-x-2.5">
          {icon && <span className={`${iconSize} opacity-90`}>{icon}</span>}
          <span className={`${labelTextSize} font-bold tracking-wide uppercase`}>{label}</span>
        </div>
        {/* Hide percentage in header if maximized */}
        {showPercentageText && !isMaximized && (
          <span className={`${percentageTextSize} font-bold font-mono tabular-nums leading-none`}>
            {clampedPercentage.toFixed(decimalPlaces)}%
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
        <div className={`mt-4 sm:mt-8 ${detailsTextSize} text-slate-500 dark:text-slate-400`}>
          {isMaximized ? (
            // Maximized Layout: Side-by-side Elapsed/Remaining and Percentage
            <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col gap-4 flex-grow min-w-0 pr-2">
                  <div>
                    <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize} block mb-1`}>Elapsed</span>
                    <p className="font-mono truncate leading-tight">{details.elapsed}</p>
                  </div>
                  <div>
                    <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize} block mb-1`}>Remaining</span>
                    <p className="font-mono truncate leading-tight">{details.remaining}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 pl-2">
                  {showPercentageText && (
                    <span className={`${percentageTextSize} font-bold font-mono tabular-nums leading-none block text-right`} style={{ color: barColor }}>
                      {clampedPercentage.toFixed(decimalPlaces)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                 <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize} block mb-1`}>Current Period</span>
                 <p className="leading-tight break-words opacity-90">{details.period}</p>
              </div>
            </div>
          ) : (
            // Standard Card Layout
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-2 sm:col-span-1">
                <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize}`}>Elapsed</span>
                <p className="font-mono truncate leading-tight">{details.elapsed}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize}`}>Remaining</span>
                <p className="font-mono truncate leading-tight">{details.remaining}</p>
              </div>
              <div className="col-span-2 mt-1 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                 <span className={`font-semibold text-slate-400 dark:text-slate-500 uppercase ${detailsLabelSize}`}>Current Period</span>
                 <p className="truncate leading-tight">{details.period}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
