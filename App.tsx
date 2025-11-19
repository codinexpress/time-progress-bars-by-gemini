
import React, { useState, useEffect } from 'react';
import CurrentTimeDisplay from './components/CurrentTimeDisplay';
import ColorCustomizer from './components/ColorCustomizer';
import CommentSection from './components/CommentSection';
import FeedbackSection from './components/FeedbackSection';
import SettingsDisplay from './components/SettingsDisplay';
import VisualizationCard from './components/VisualizationCard';
import TabNavigation from './components/TabNavigation';
import { DEFAULT_PROGRESS_CONFIGS } from './config/progressConfig';
import { EyeIcon } from './components/Icons';
import { ActiveTab } from './types';
import { useTime } from './hooks/useTime';
import { useAppSettings } from './hooks/useAppSettings';
import { useFeedback } from './hooks/useFeedback';

const App: React.FC = () => {
  const { 
    settings, 
    updateSetting, 
    updateColor, 
    updateDecimalOverride,
    resetColors, 
    resetAllSettings 
  } = useAppSettings();

  const currentTime = useTime(settings.updateIntervalMs);
  
  const { 
    visitorCount, 
    feedbackData, 
    isLoading: isLoadingFeedback, 
    error: feedbackError, 
    handleLikeToggle, 
    handleRate 
  } = useFeedback();

  const [activeTab, setActiveTab] = useState<ActiveTab>('visualizations');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [maximizedConfigId, setMaximizedConfigId] = useState<string | null>(null);

  const gridLayoutClasses = {
    bars: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    orbits: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    pixels: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4',
    spiral: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    hourglass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    radialSlice: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const handleResetAll = () => {
    resetAllSettings();
    setActiveTab('visualizations');
  };
  
  // Close maximized view on Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximizedConfigId(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const maximizedConfig = DEFAULT_PROGRESS_CONFIGS.find(c => c.id === maximizedConfigId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6 selection:bg-sky-500 selection:text-white text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <main className={`w-full transition-all duration-500 ease-in-out ${isFocusMode ? 'max-w-[98vw]' : 'max-w-6xl bg-white/80 dark:bg-slate-800/[.85] backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50'} p-4 sm:p-6 md:p-8 relative`}>
        
        {/* Header */}
        {!isFocusMode && (
          <header className="mb-8 text-center relative">
            <button 
              onClick={() => setIsFocusMode(true)}
              className="absolute top-0 right-0 text-xs font-medium bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition-all"
              title="Enter Focus Mode"
            >
              Focus
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-500 to-teal-500 dark:from-sky-400 dark:via-cyan-400 dark:to-teal-400 pb-2 tracking-tight font-mono uppercase">
              Time Flux
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 font-medium tracking-wide">VISUALIZE THE FLOW OF EXISTENCE</p>
          </header>
        )}

        {/* Focus Mode Exit */}
        {isFocusMode && (
          <div className="mb-4 flex justify-end">
             <button 
              onClick={() => setIsFocusMode(false)}
              className="text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 rounded-full transition-colors shadow-lg z-10 opacity-50 hover:opacity-100"
            >
              EXIT FOCUS
            </button>
          </div>
        )}
        
        <CurrentTimeDisplay currentTime={currentTime} />

        {/* Navigation Tabs */}
        {!isFocusMode && (
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        
        {/* Main Content Area */}
        <div className="py-2 min-h-[300px] animate-fadeIn">
          {(activeTab === 'visualizations' || isFocusMode) && (
            <div className={`grid gap-4 sm:gap-6 ${gridLayoutClasses[settings.visualizationMode]}`}>
              {DEFAULT_PROGRESS_CONFIGS.map((config) => (
                <VisualizationCard 
                  key={config.id}
                  config={config}
                  currentTime={currentTime}
                  settings={settings}
                  onMaximize={setMaximizedConfigId}
                />
              ))}
            </div>
          )}
          
          {!isFocusMode && activeTab === 'settings' && (
             <SettingsDisplay 
              settings={settings}
              onSettingChange={updateSetting}
              onResetAllSettings={handleResetAll}
              onDecimalOverrideChange={updateDecimalOverride}
            />
          )}
          
          {!isFocusMode && activeTab === 'colors' && (
            <ColorCustomizer
              progressConfigs={DEFAULT_PROGRESS_CONFIGS}
              customColors={settings.customColors}
              onColorChange={updateColor}
              onResetColors={resetColors}
            />
          )}
          
          {!isFocusMode && activeTab === 'comments' && (
            <CommentSection 
              appTheme={settings.theme} 
            />
          )}
          
          {!isFocusMode && activeTab === 'feedback' && (
            <FeedbackSection
              feedbackData={feedbackData}
              onLikeToggle={handleLikeToggle}
              onRate={handleRate}
              isLoading={isLoadingFeedback}
              error={feedbackError}
              appTheme={settings.theme}
            />
          )}
        </div>
        
        {/* Footer */}
        {!isFocusMode && (
          <footer className="mt-12 sm:mt-16 text-center border-t border-slate-200 dark:border-slate-700/50 pt-8">
            <div className="flex items-center justify-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400/80 mb-3">
                <EyeIcon className="w-4 h-4 text-sky-500" /> 
                <span>
                  {visitorCount !== null ? visitorCount.toLocaleString() : '...'} Visitors
                </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Crafted with React, TypeScript & Tailwind CSS.
              <br />
              <span className="opacity-70 mt-1 inline-block">Version 2.3.0 - Expansion</span>
            </p>
          </footer>
        )}
      </main>

      {/* Maximized View Modal Overlay */}
      {maximizedConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setMaximizedConfigId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl flex justify-center">
             <VisualizationCard
                config={maximizedConfig}
                currentTime={currentTime}
                settings={settings}
                isMaximized={true}
                onClose={() => setMaximizedConfigId(null)}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
