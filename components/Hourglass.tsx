import React from 'react';
import { HourglassProps } from '../types';

const Hourglass: React.FC<HourglassProps> = ({
  label,
  percentage,
  details,
  icon,
  sandColor = '#f59e0b',
  frameColor = '#94a3b8',
  textColor = 'text-slate-700 dark:text-slate-300', 
  mainValueColor, 
  isMaximized = false,
  sizeClassName,
  decimalPlaces,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const viewBoxWidth = 100;
  const viewBoxHeight = 150;

  const neckY = viewBoxHeight / 2;
  const bulbWidth = viewBoxWidth * 0.8; 
  const neckWidth = viewBoxWidth * 0.1;
  const bulbHeight = (viewBoxHeight / 2) * 0.85;
  const framePadding = 5; 

  const topSandY = neckY - bulbHeight * (1 - clampedPercentage / 100);
  const topSandFillHeight = bulbHeight * (1 - clampedPercentage / 100);
  
  const bottomSandY = neckY;
  const bottomSandFillHeight = bulbHeight * (clampedPercentage / 100);

  const topBulbPath = `M${framePadding},${framePadding} L${viewBoxWidth-framePadding},${framePadding} L${viewBoxWidth/2 + neckWidth/2},${neckY} L${viewBoxWidth/2 - neckWidth/2},${neckY} Z`;
  const bottomBulbPath = `M${viewBoxWidth/2 - neckWidth/2},${neckY} L${viewBoxWidth/2 + neckWidth/2},${neckY} L${viewBoxWidth-framePadding},${viewBoxHeight-framePadding} L${framePadding},${viewBoxHeight-framePadding} Z`;
  
  const percentageColor = mainValueColor || sandColor;
  
  const maskIdTop = `hourglassMaskTop-${label.replace(/\s+/g, '-')}-${isMaximized ? 'max' : 'min'}`;
  const maskIdBottom = `hourglassMaskBottom-${label.replace(/\s+/g, '-')}-${isMaximized ? 'max' : 'min'}`;

  // Determine sizes
  const labelTextSize = isMaximized ? 'text-xl sm:text-2xl' : 'text-sm sm:text-md';
  const iconSize = isMaximized ? 'w-8 h-8' : 'w-5 h-5 sm:w-6 sm:h-6';
  const percentTextSize = isMaximized ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl';
  const detailTextSize = isMaximized ? 'text-lg' : 'text-xs';

  // Scale the container size
  const containerStyle = isMaximized 
    ? { width: 'min(60vh, 60vw)', height: 'min(90vh, 90vw)', maxHeight: '600px', maxWidth: '400px' }
    : { width: '60px', height: '90px' }; // Base aspect ratio roughly 1:1.5

  return (
    <div className={`p-4 flex flex-col items-center ${textColor} w-full`}>
      <div className="flex items-center space-x-2 mb-3">
        {icon && <span className={iconSize}>{icon}</span>}
        <span className={`${labelTextSize} font-bold uppercase tracking-wide`}>{label}</span>
      </div>

      <div className="relative" style={containerStyle}>
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full drop-shadow-sm">
          <defs>
            <mask id={maskIdTop}>
              <path d={topBulbPath} fill="white" />
            </mask>
            <mask id={maskIdBottom}>
              <path d={bottomBulbPath} fill="white" />
            </mask>
          </defs>

          <path d={topBulbPath} stroke={frameColor} strokeWidth="3" fill="none" />
          <path d={bottomBulbPath} stroke={frameColor} strokeWidth="3" fill="none" />
          
          <rect
            x={framePadding} 
            y={topSandY}
            width={bulbWidth} 
            height={topSandFillHeight}
            fill={sandColor}
            className="transition-all duration-150 ease-linear"
            mask={`url(#${maskIdTop})`}
          />

          <rect
            x={framePadding} 
            y={bottomSandY} 
            width={bulbWidth} 
            height={bottomSandFillHeight} 
            fill={sandColor}
            className="transition-all duration-150 ease-linear"
            mask={`url(#${maskIdBottom})`}
          />
        </svg>
        <div 
          className={`absolute inset-0 flex items-center justify-center ${percentTextSize} font-bold font-mono`}
          style={{ color: percentageColor, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
        >
          {clampedPercentage.toFixed(decimalPlaces)}%
        </div>
      </div>
      
      {details && (
        <div className={`mt-3 ${detailTextSize} text-center space-y-1 w-full ${textColor} opacity-80`}>
          <p><span className="font-semibold opacity-70">Remaining:</span> <span className="font-mono">{details.remaining}</span></p>
        </div>
      )}
    </div>
  );
};

export default Hourglass;