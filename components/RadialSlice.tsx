import React from 'react';
import { RadialSliceProps } from '../types';

const RadialSlice: React.FC<RadialSliceProps> = ({
  label,
  percentage,
  details,
  icon,
  sliceColor = '#10b981',
  trackColor = '#e2e8f0',
  textColor = 'text-slate-700 dark:text-slate-300', 
  mainValueColor, 
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const viewBoxSize = 100;
  const outerRadius = 40; 
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

  const progressCircleRadius = outerRadius / 2;
  const circumference = 2 * Math.PI * progressCircleRadius;
  const strokeDashoffset = circumference * (1 - clampedPercentage / 100);

  const percentageColor = mainValueColor || sliceColor;
  
  const progressCircleClassName = 'transition-all duration-150 ease-out';

  return (
    <div className={`p-4 flex flex-col items-center ${textColor}`}>
      <div className="flex items-center space-x-2 mb-3">
        {icon && <span className="w-5 h-5 sm:w-6 sm:h-6">{icon}</span>}
        <span className="text-sm sm:text-md font-bold uppercase tracking-wide">{label}</span>
      </div>

      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full drop-shadow-md">
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill={trackColor}
            className="opacity-60"
          />
          
          {clampedPercentage > 0.001 && ( 
            <circle
              cx={centerX}
              cy={centerY}
              r={progressCircleRadius} 
              fill="none"
              stroke={sliceColor}
              strokeWidth={outerRadius} 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${centerX} ${centerY})`} 
              className={progressCircleClassName}
              strokeLinecap="butt" 
            />
          )}
        </svg>
      </div>
      <div 
        className="text-xl sm:text-2xl font-bold mt-2 font-mono"
        style={{ color: percentageColor }}
      >
        {clampedPercentage.toFixed(1)}%
      </div>
      
      {details && (
        <div className={`mt-3 text-xs text-center space-y-1 w-full ${textColor} opacity-80`}>
          <p><span className="font-semibold opacity-70">Remaining:</span> <span className="font-mono">{details.remaining}</span></p>
        </div>
      )}
    </div>
  );
};

export default RadialSlice;