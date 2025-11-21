
import React, { useMemo } from 'react';
import { PixelGridProps } from '../types';

const PixelGrid: React.FC<PixelGridProps> = ({
  label,
  percentage,
  details,
  icon,
  pixelColor = '#0ea5e9',
  emptyPixelColor = '#0ea5e933',
  textColor = 'text-slate-700 dark:text-slate-300', 
  mainValueColor, 
  gridRows = 8,
  gridCols = 10,
  isMaximized = false,
  sizeClassName,
  decimalPlaces,
  legend,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const totalPixels = gridRows * gridCols;
  const filledPixels = Math.round((clampedPercentage / 100) * totalPixels);
  
  const percentageColor = mainValueColor || pixelColor;

  // SVG Parameters
  const pixelSize = 10;
  const gap = 2;
  const width = gridCols * pixelSize + (gridCols - 1) * gap;
  const height = gridRows * pixelSize + (gridRows - 1) * gap;

  const pixels = useMemo(() => {
    const pixelRects = [];
    for (let i = 0; i < totalPixels; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      const x = col * (pixelSize + gap);
      const y = row * (pixelSize + gap);
      const isFilled = i < filledPixels;
      
      pixelRects.push(
        <rect
          key={i}
          x={x}
          y={y}
          width={pixelSize}
          height={pixelSize}
          fill={isFilled ? pixelColor : emptyPixelColor}
          rx={1.5}
          className="transition-colors duration-300 ease-in-out"
        />
      );
    }
    return pixelRects;
  }, [totalPixels, filledPixels, gridCols, pixelSize, gap, pixelColor, emptyPixelColor]);

  const labelTextSize = isMaximized ? 'text-xl sm:text-2xl' : 'text-sm sm:text-md';
  const iconSize = isMaximized ? 'w-8 h-8' : 'w-5 h-5 sm:w-6 sm:h-6';
  const percentTextSize = isMaximized ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl';
  const detailTextSize = isMaximized ? 'text-lg' : 'text-xs';
  const legendSize = isMaximized ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs';
  
  const containerMaxWidth = isMaximized ? '600px' : '240px';

  return (
    <div className={`p-4 flex flex-col items-center ${textColor} w-full`}>
      <div className="flex items-center space-x-2 mb-3">
        {icon && <span className={iconSize}>{icon}</span>}
        <span className={`${labelTextSize} font-bold uppercase tracking-wide`}>{label}</span>
      </div>

      <div className="relative mb-3 flex flex-col items-center" style={{ maxWidth: containerMaxWidth, width: '100%' }}>
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-sm">
           {pixels}
         </svg>
         {legend && (
           <div className={`mt-2 ${legendSize} ${textColor} opacity-60 font-mono text-center bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full`}>
             {legend}
           </div>
         )}
      </div>

       <div 
        className={`${percentTextSize} font-bold font-mono`}
        style={{ color: percentageColor }}
      >
          {clampedPercentage.toFixed(decimalPlaces)}%
      </div>
      
      {details && (
        <div className={`mt-3 ${detailTextSize} text-center space-y-1 w-full ${textColor} opacity-80`}>
          <div className="flex justify-between px-2 gap-4"><span>Elapsed:</span> <span className="font-mono">{details.elapsed}</span></div>
          <div className="flex justify-between px-2 gap-4"><span>Remaining:</span> <span className="font-mono">{details.remaining}</span></div>
        </div>
      )}
    </div>
  );
};

export default PixelGrid;
