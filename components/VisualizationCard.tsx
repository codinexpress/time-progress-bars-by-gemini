
import React, { useMemo } from 'react';
import { AppSettings, ProgressItemConfig, Theme } from '../types';
import ProgressBar from './ProgressBar';
import TimeOrbit from './TimeOrbit';
import PixelGrid from './PixelGrid';
import TimeSpiral from './TimeSpiral';
import Hourglass from './Hourglass';
import RadialSlice from './RadialSlice';

interface VisualizationCardProps {
  config: ProgressItemConfig;
  currentTime: Date;
  settings: AppSettings;
}

const VisualizationCard: React.FC<VisualizationCardProps> = ({ config, currentTime, settings }) => {
  const { visualizationMode, customColors, weekStartDay, theme } = settings;

  const effectiveHexColor = customColors[config.id] || config.baseColor;
  const details = config.getDetails(currentTime, weekStartDay);

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
  };
  
  const cardBaseClass = `w-full rounded-xl shadow-xl backdrop-blur-md border transition-all duration-300 
    ${theme === 'dark' 
      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-900/50' 
      : 'bg-white/90 border-slate-200/80 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50'}`;

  const containerClass = visualizationMode === 'bars' 
    ? 'hover:scale-[1.02] transition-transform duration-300' 
    : `${cardBaseClass} hover:scale-[1.02] transition-transform duration-300`;

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
          />
        );
      case 'spiral':
        return (
          <TimeSpiral
            {...commonProps}
            spiralColor={colors.primary}
            trackColor={colors.orbitColor}
          />
        );
      case 'hourglass':
        return (
          <Hourglass
            {...commonProps}
            sandColor={colors.primary}
            frameColor={colors.frameColor}
          />
        );
      case 'radialSlice':
        return (
          <RadialSlice
            {...commonProps}
            sliceColor={colors.primary}
            trackColor={colors.orbitColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={containerClass}>
      {renderContent()}
    </div>
  );
};

export default VisualizationCard;
