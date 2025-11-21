
import React, { useState } from 'react';
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
  isMaximized = false,
  sizeClassName,
  decimalPlaces,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // State to track cumulative rotations to prevent "rewind" on wrap-around
  const [rotationState, setRotationState] = useState({
    prevPercentage: clampedPercentage,
    rotations: 0
  });

  // Derived state pattern: Update state during render if props change
  // This ensures the render uses the correct cumulative angle immediately without a 1-frame lag
  if (Math.abs(clampedPercentage - rotationState.prevPercentage) > 0.001) {
    let newRotations = rotationState.rotations;
    const prev = rotationState.prevPercentage;
    const current = clampedPercentage;

    // Threshold of 50% change indicates a wrap-around
    if (prev > 80 && current < 20) {
      newRotations += 1;
    } else if (prev < 20 && current > 80) {
      newRotations -= 1;
    }

    setRotationState({
      prevPercentage: current,
      rotations: newRotations
    });
  }

  // Use rotations from state (current render or updated state)
  const currentRotations = rotationState.rotations;

  // Calculate total angle: 0% = 0 degrees, 100% = 360 degrees.
  // We add full rotations (360 * rotations) to keep the value monotonic.
  const angle = (currentRotations * 360) + (clampedPercentage / 100) * 360; 
  
  const radius = 40; 
  const planetRadius = 6;
  const strokeWidth = 6;
  const viewBoxSize = 100; 
  const center = viewBoxSize / 2;

  const percentageColor = mainValueColor || planetColor;

  const defaultSizeClass = "w-36 h-36 sm:w-40 sm:h-40";
  const containerSizeClass = sizeClassName || defaultSizeClass;

  const labelTextSize = isMaximized ? 'text-xl sm:text-2xl' : 'text-sm sm:text-md';
  const iconSize = isMaximized ? 'w-8 h-8' : 'w-6 h-6';
  const percentTextSize = isMaximized ? 'text-4xl sm:text-5xl' : 'text-2xl';
  const detailTextSize = isMaximized ? 'text-lg' : 'text-xs';

  return (
    <div className={`p-4 flex flex-col items-center ${textColor} w-full`}>
      <div className="flex items-center space-x-2 mb-3">
        {icon && <span className={iconSize}>{icon}</span>}
        <span className={`${labelTextSize} font-bold uppercase tracking-wide`}>{label}</span>
      </div>

      <div className={`relative ${containerSizeClass}`}>
        {/* 
          Rotate -90deg so 0deg starts at 12 o'clock.
          The planet starts at (radius, 0) relative to center, which is 3 o'clock in SVG space.
          -90 rotation brings 3 o'clock to 12 o'clock.
        */}
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform -rotate-90 drop-shadow-md">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={orbitColor}
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-50"
          />
          
          {/* Group centered in viewbox */}
          <g transform={`translate(${center}, ${center})`}>
            {/* 
              Rotating group - rotates around (0,0) which is now the center of SVG.
              We animate the rotation angle to follow the orbit path.
            */}
            <g 
              style={{ transform: `rotate(${angle}deg)` }}
              className="transition-transform duration-500 ease-out"
            >
               {/* Planet offset by radius (starts at 3 o'clock relative to rotation group) */}
               <circle
                cx={radius}
                cy={0}
                r={planetRadius}
                fill={planetColor}
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            </g>
          </g>
        </svg>
        <div 
          className={`absolute inset-0 flex items-center justify-center ${percentTextSize} font-bold font-mono`}
          style={{ color: percentageColor }}
        >
          {clampedPercentage.toFixed(decimalPlaces)}%
        </div>
      </div>
      
      {details && (
        <div className={`mt-3 ${detailTextSize} text-center space-y-1 w-full ${textColor} opacity-80`}>
          <p><span className="font-semibold opacity-70">Elapsed:</span> <span className="font-mono">{details.elapsed}</span></p>
          <p><span className="font-semibold opacity-70">Remaining:</span> <span className="font-mono">{details.remaining}</span></p>
        </div>
      )}
    </div>
  );
};

export default TimeOrbit;
