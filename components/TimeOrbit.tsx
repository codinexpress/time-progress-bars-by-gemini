import React from 'react';
import { TimeOrbitProps } from '../types';

const TimeOrbit: React.FC<TimeOrbitProps> = ({
  label,
  percentage,
  details,
  icon,
  planetColor = '#0ea5e9',
  orbitColor = '#e2e8f0',
  textColor = 'text-slate-700 dark:text-slate-300', 
  mainValueColor, 
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const angle = (clampedPercentage / 100) * 360 - 90; 
  const radius = 40; 
  const planetRadius = 6;
  const strokeWidth = 6;
  const viewBoxSize = 100; 

  const x = viewBoxSize / 2 + radius * Math.cos(angle * Math.PI / 180);
  const y = viewBoxSize / 2 + radius * Math.sin(angle * Math.PI / 180);
  
  const percentageColor = mainValueColor || planetColor;

  return (
    <div className={`p-4 flex flex-col items-center ${textColor}`}>
      <div className="flex items-center space-x-2 mb-3">
        {icon && <span className="w-6 h-6">{icon}</span>}
        <span className="text-sm sm:text-md font-bold uppercase tracking-wide">{label}</span>
      </div>

      <div className="relative w-36 h-36 sm:w-40 sm:h-40">
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform -rotate-90 drop-shadow-md">
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            stroke={orbitColor}
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-50"
          />
           <circle
            cx={x}
            cy={y}
            r={planetRadius}
            fill={planetColor}
            className="transition-all duration-150 ease-out"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
        </svg>
        <div 
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono"
          style={{ color: percentageColor }}
        >
          {clampedPercentage.toFixed(1)}%
        </div>
      </div>
      
      {details && (
        <div className={`mt-3 text-xs text-center space-y-1 w-full ${textColor} opacity-80`}>
          <p><span className="font-semibold opacity-70">Elapsed:</span> <span className="font-mono">{details.elapsed}</span></p>
          <p><span className="font-semibold opacity-70">Remaining:</span> <span className="font-mono">{details.remaining}</span></p>
        </div>
      )}
    </div>
  );
};

export default TimeOrbit;