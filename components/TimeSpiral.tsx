
import React, { useMemo } from 'react';
import { TimeSpiralProps } from '../types';

const generateSpiralPath = (a: number, b: number, rotations: number, pointsPerRotation: number, centerX: number, centerY: number): string => {
  let pathData = `M ${centerX + a} ${centerY}`; 
  const totalPoints = rotations * pointsPerRotation;

  for (let i = 1; i <= totalPoints; i++) {
    const angle = (i / pointsPerRotation) * 2 * Math.PI; 
    const radius = a + (b * angle) / (2 * Math.PI); 
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    pathData += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return pathData;
};

const TimeSpiral: React.FC<TimeSpiralProps> = ({
  label,
  percentage,
  details,
  icon,
  spiralColor = '#0ea5e9',
  trackColor = '#e2e8f0',
  textColor = 'text-slate-700 dark:text-slate-300', 
  mainValueColor,
  isMaximized = false,
  sizeClassName,
  decimalPlaces,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const viewBoxSize = 100;
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

  // Updated parameters for a better shape that fills the box
  const a = 2.5; // Start radius (inner hole size)
  const b = 10.5; // Growth per rotation (controls distance between loops)
  const rotations = 4; // Number of full loops
  const pointsPerRotation = 120; // Higher resolution for smoother curves

  const spiralPathData = useMemo(() => generateSpiralPath(a, b, rotations, pointsPerRotation, centerX, centerY), [a, b, rotations, pointsPerRotation, centerX, centerY]);
  
  const totalPathLength = useMemo(() => {
    if (typeof document === 'undefined') return 300; 
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', spiralPathData);
    return path.getTotalLength();
  }, [spiralPathData]);

  const strokeDasharray = totalPathLength;
  const strokeDashoffset = totalPathLength * (1 - clampedPercentage / 100);

  const percentageColor = mainValueColor || spiralColor;

  const defaultSizeClass = "w-32 h-32 sm:w-36 sm:h-36";
  const containerSizeClass = sizeClassName || defaultSizeClass;

  const labelTextSize = isMaximized ? 'text-xl sm:text-2xl' : 'text-sm sm:text-md';
  const iconSize = isMaximized ? 'w-8 h-8' : 'w-5 h-5 sm:w-6 sm:h-6';
  const percentTextSize = isMaximized ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl';
  const detailTextSize = isMaximized ? 'text-lg' : 'text-xs';
  
  return (
    <div className={`p-4 flex flex-col items-center ${textColor} w-full`}>
      <div className="flex items-center space-x-2 mb-3">
        {icon && <span className={iconSize}>{icon}</span>}
        <span className={`${labelTextSize} font-bold uppercase tracking-wide`}>{label}</span>
      </div>

      <div className={`relative ${containerSizeClass}`}>
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform rotate-[-90deg]">
          {/* Rotate -90deg to start from top, usually looks better for time progress */}
          <path
            d={spiralPathData}
            stroke={trackColor}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d={spiralPathData}
            stroke={spiralColor}
            className="transition-all duration-150 ease-out"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      </div>
      
      <div 
        className={`${percentTextSize} font-bold mt-2 font-mono`}
        style={{ color: percentageColor }}
      >
        {clampedPercentage.toFixed(decimalPlaces)}%
      </div>
      
      {details && (
        <div className={`mt-3 ${detailTextSize} text-center space-y-1 w-full ${textColor} opacity-80`}>
           <p><span className="font-semibold opacity-70">Elapsed:</span> <span className="font-mono">{details.elapsed}</span></p>
        </div>
      )}
    </div>
  );
};

export default TimeSpiral;
