
import React, { useMemo, useEffect } from 'react';
import CurrentTimeDisplay from './CurrentTimeDisplay';
import VisualizationCard from './VisualizationCard';
import { AppSettings, SectionId } from '../types';
import { DEFAULT_PROGRESS_CONFIGS } from '../config/progressConfig';
import { useTime } from '../hooks/useTime';

interface DashboardProps {
  settings: AppSettings;
  isFocusMode: boolean;
  maximizedUnitId: string | null;
  setMaximizedUnitId: (id: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, isFocusMode, maximizedUnitId, setMaximizedUnitId }) => {
  const currentTime = useTime(settings.updateIntervalMs);

  // Close maximized view on Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximizedUnitId(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setMaximizedUnitId]);

  const maximizedConfig = DEFAULT_PROGRESS_CONFIGS.find(c => c.id === maximizedUnitId);

  const gridLayoutClasses = {
    bars: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    orbits: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    pixels: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4',
    spiral: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    hourglass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    radialSlice: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const groupedConfigs = useMemo(() => {
    const groups: Record<SectionId, typeof DEFAULT_PROGRESS_CONFIGS[number][]> = {
        micro: [],
        cyclical: [],
        macro: [],
        mega: []
    };
    DEFAULT_PROGRESS_CONFIGS.forEach(config => {
        if (groups[config.section]) {
            groups[config.section].push(config);
        }
    });
    return groups;
  }, []);

  const sectionTitles: Record<SectionId, string> = {
      micro: 'Micro Time',
      cyclical: 'Cyclical Time',
      macro: 'Macro Time',
      mega: 'Mega Time'
  };

  return (
    <>
      <CurrentTimeDisplay currentTime={currentTime} />

      <div className="space-y-12">
          {(Object.keys(groupedConfigs) as SectionId[]).map((section) => (
              <div key={section}>
                  <div className="flex items-center mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest font-mono border-b-2 border-slate-200 dark:border-slate-700 pb-1 pr-4">
                          {sectionTitles[section]}
                      </h2>
                      <div className="flex-grow h-[1px] bg-slate-200 dark:bg-slate-700/50 ml-2"></div>
                  </div>
                  <div className={`grid gap-4 sm:gap-6 ${gridLayoutClasses[settings.visualizationMode]}`}>
                      {groupedConfigs[section].map((config) => (
                          <VisualizationCard 
                              key={config.id}
                              config={config}
                              currentTime={currentTime}
                              settings={settings}
                              onMaximize={setMaximizedUnitId}
                          />
                      ))}
                  </div>
              </div>
          ))}
      </div>

      {/* Maximized View Modal Overlay */}
      {maximizedConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm" onClick={() => setMaximizedUnitId(null)}>
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl flex justify-center animate-fadeIn">
               <VisualizationCard
                  config={maximizedConfig}
                  currentTime={currentTime}
                  settings={settings}
                  isMaximized={true}
                  onClose={() => setMaximizedUnitId(null)}
               />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
