
import React from 'react';
import { PixelGridProps } from '../types';

const PixelGrid: React.FC<PixelGridProps> = ({
  label,
  percentage,
  details,
  icon,
  pixelColor = '#0ea5e9', // Default hex (sky-500)
  emptyPixelColor = '#0ea5e933', // Default hex with alpha (sky-500 at 20% opacity)
  textColor = 'text-slate-700 dark:text-slate-300', 
  mainValueColor, 
  gridRows = 10,
  gridCols = 10,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const totalPixels = gridRows * gridCols;
  const filledPixels = Math.round((clampedPercentage / 100) * totalPixels);

  const pixels = Array.from({ length: totalPixels }, (_, i) => ({
    filled: i < filledPixels,
  }));
  
  const percentageColor = mainValueColor || pixelColor;

  return (
    <div className={`p-3 sm:p-4 flex flex-col items-center ${textColor}`}> {/* Removed card classes */}
      <div className="flex items-center space-x-2 mb-2">
        {icon && <span className="w-5 h-5 sm:w-6 sm:h-6">{icon}</span>}
        <span className="text-sm sm:text-md font-semibold">{label}</span>
      </div>

      <div 
        className="grid gap-0.5 sm:gap-1 mb-2" 
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, width: '100%', maxWidth: '200px' }}
        role="img"
        aria-label={`${label}: ${clampedPercentage.toFixed(1)}%`}
      >
        {pixels.map((pixel, index) => (
          <div
            key={index}
            className="aspect-square rounded-[1px] sm:rounded-sm transition-colors duration-150"
            style={{ backgroundColor: pixel.filled ? pixelColor : emptyPixelColor }}
          ></div>
        ))}
      </div>
       <div 
        className="text-lg sm:text-xl font-bold"
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

export default PixelGrid;