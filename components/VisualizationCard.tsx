import React, { useMemo } from 'react';
import { AppSettings, ProgressItemConfig, Theme } from '../types';
import ProgressBar from './ProgressBar';
import TimeOrbit from './TimeOrbit';
import PixelGrid from './PixelGrid';
import TimeSpiral from './TimeSpiral';
import Hourglass from './Hourglass';
import RadialSlice from './RadialSlice';
import { ExpandIcon, XMarkIcon } from './Icons';

interface VisualizationCardProps {
  config: ProgressItemConfig;
  currentTime: Date;
  settings: AppSettings;
  onMaximize?: (id: string) => void;
  onClose?: () => void;
  isMaximized?: boolean;
}

const VisualizationCard: React.FC<VisualizationCardProps> = ({ 
  config, 
  currentTime, 
  settings, 
  onMaximize, 
  onClose,
  isMaximized = false 
}) => {
  const { visualizationMode, customColors, weekStartDay, theme, globalDecimalPlaces, decimalPlaceOverrides } = settings;

  const effectiveHexColor = customColors[config.id] || config.baseColor;
  const details = config.getDetails(currentTime, weekStartDay);
  
  // Determine decimal places: Override > Global > Default (2)
  const decimalPlaces = decimalPlaceOverrides[config.id] ?? globalDecimalPlaces ?? 2;

  const colors = useMemo(() => {
    return {
      primary: effectiveHexColor,
      unitSpecificText: effectiveHexColor,
      emptyPixel: `${effectiveHexColor}33`,
      cardGeneralTextColor: theme === 'dark' ? 'text-slate-300' : 'text-slate-700',
      progressBarDetailTextColor: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
      orbitColor: theme === 'dark' ? '#334155' : '#e2e8f0',
      frameColor: theme === 'dark' ? '#64748b' : '#94a3b8',
      trailColor: 'bg-slate-100 dark:bg-slate-800',
    };
  }, [effectiveHexColor, theme]);

  const commonProps = {
    label: config.label,
    percentage: details.percentage,
    details: { elapsed: details.elapsed, remaining: details.remaining, period: details.period },
    icon: config.icon({ className: 'w-5 h-5', color: colors.unitSpecificText }),
    textColor: colors.cardGeneralTextColor,
    mainValueColor: colors.unitSpecificText,
    isMaximized: isMaximized,
    decimalPlaces: decimalPlaces,
  };
  
  const cardBaseClass = `relative w-full rounded-xl shadow-xl backdrop-blur-md border transition-all duration-300 
    ${theme === 'dark' 
      ? 'bg-slate-800/80 border-slate-700' 
      : 'bg-white/90 border-slate-200/80'}`;

  const containerClass = isMaximized
    ? `w-full max-w-3xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 sm:p-10 shadow-2xl flex items-center justify-center relative`
    : visualizationMode === 'bars'
      ? `group relative hover:scale-[1.02] transition-transform duration-300`
      : `${cardBaseClass} group hover:scale-[1.02] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-transform duration-300`;

  // Determine large sizes for circular visualizations when maximized
  const maximizedSizeClass = "w-64 h-64 sm:w-96 sm:h-96";

  const renderContent = () => {
    switch (visualizationMode) {
      case 'bars':
        return (
          <ProgressBar
            {...commonProps}
            icon={config.icon({ className: 'w-5 h-5', color: colors.progressBarDetailTextColor })}
            textColor={colors.progressBarDetailTextColor}
            barColor={colors.primary}
            trailColor={colors.trailColor}
          />
        );
      case 'orbits':
        return (
          <TimeOrbit
            {...commonProps}
            planetColor={colors.primary}
            orbitColor={colors.orbitColor}
            sizeClassName={isMaximized ? maximizedSizeClass : undefined}
          />
        );
      case 'pixels':
        return (
          <PixelGrid
            {...commonProps}
            pixelColor={colors.primary}
            emptyPixelColor={colors.emptyPixel}
            gridRows={config.id === 'second' || config.id === 'minute' ? 6 : (config.gridConfig?.rows ?? 10)}
            gridCols={config.id === 'second' || config.id === 'minute' ? 10 : (config.gridConfig?.cols ?? 10)}
            sizeClassName={isMaximized ? maximizedSizeClass : undefined}
          />
        );
      case 'spiral':
        return (
          <TimeSpiral
            {...commonProps}
            spiralColor={colors.primary}
            trackColor={colors.orbitColor}
            sizeClassName={isMaximized ? maximizedSizeClass : undefined}
          />
        );
      case 'hourglass':
        return (
          <Hourglass
            {...commonProps}
            sandColor={colors.primary}
            frameColor={colors.frameColor}
            sizeClassName={isMaximized ? maximizedSizeClass : undefined}
          />
        );
      case 'radialSlice':
        return (
          <RadialSlice
            {...commonProps}
            sliceColor={colors.primary}
            trackColor={colors.orbitColor}
            sizeClassName={isMaximized ? maximizedSizeClass : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={containerClass}>
      {/* Control Button */}
      <div className={`absolute top-3 right-3 z-10 transition-opacity duration-200 ${isMaximized ? '' : 'opacity-0 group-hover:opacity-100'}`}>
        {isMaximized ? (
           <button 
             onClick={onClose}
             className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
             title="Close View"
           >
             <XMarkIcon className="w-6 h-6" />
           </button>
        ) : (
          <button 
            onClick={() => onMaximize && onMaximize(config.id)}
            className="p-1.5 rounded-full bg-slate-100/50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            title="Maximize View"
          >
            <ExpandIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default VisualizationCard;