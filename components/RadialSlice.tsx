import React from 'react';
import { RadialSliceProps } from '../types';

const RadialSlice: React.FC<RadialSliceProps> = ({
  label,
  percentage,
  details,
  icon,
  sliceColor = '#10b981', // Default hex (emerald-500)
  trackColor = '#e2e8f0', // Default hex (slate-200)
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
    <div className={`p-3 sm:p-4 flex flex-col items-center ${textColor}`}> {/* Removed card classes */}
      <div className="flex items-center space-x-2 mb-2">
        {icon && <span className="w-5 h-5 sm:w-6 sm:h-6">{icon}</span>}
        <span className="text-sm sm:text-md font-semibold">{label}</span>
      </div>

      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full">
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill={trackColor}
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
        className="text-xl sm:text-2xl font-bold mt-2"
        style={{ color: percentageColor }}
      >
        {clampedPercentage.toFixed(1)}%
      </div>
      
      {details && (
        <div className={`mt-2 text-xs text-center space-y-0.5 w-full ${textColor}`}>
          <p><strong className="font-semibold">Elapsed:</strong> {details.elapsed}</p>
          <p><strong className="font-semibold">Remaining:</strong> {details.remaining}</p>
          <p><strong className="font-semibold">Period:</strong> {details.period}</p>
        </div>
      )}
    </div>
  );
};

export default RadialSlice;
