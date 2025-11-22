
import React, { useState, useEffect } from 'react';
import ColorCustomizer from './components/ColorCustomizer';
import CommentSection from './components/CommentSection';
import FeedbackSection from './components/FeedbackSection';
import SettingsDisplay from './components/SettingsDisplay';
import TabNavigation from './components/TabNavigation';
import AboutSection from './components/AboutSection';
import Dashboard from './components/Dashboard';
import { DEFAULT_PROGRESS_CONFIGS } from './config/progressConfig';
import { EyeIcon } from './components/Icons';
import { ActiveTab, VisualizationMode } from './types';
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
  const [maximizedUnitId, setMaximizedUnitId] = useState<string | null>(null);

  // Initialize state from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const unitParam = params.get('unit');
    const modeParam = params.get('mode');
    const focusParam = params.get('focus');

    // Override Visualization Mode if provided
    if (modeParam && ['bars', 'orbits', 'pixels', 'spiral', 'hourglass', 'radialSlice'].includes(modeParam)) {
      updateSetting('visualizationMode', modeParam as VisualizationMode);
    }

    // Set Focus Mode
    if (focusParam === 'true') {
      setIsFocusMode(true);
    }

    // Set Active Tab or implied tab
    if (tabParam && ['visualizations', 'settings', 'colors', 'comments', 'feedback', 'about'].includes(tabParam)) {
      setActiveTab(tabParam as ActiveTab);
    } else if (unitParam) {
      // If a unit is requested but no tab specified, go to visualizations
      setActiveTab('visualizations');
    }

    // Set Maximized Unit
    if (unitParam) {
      setMaximizedUnitId(unitParam);
    }
  }, [updateSetting]);

  // Sync URL with State
  useEffect(() => {
    const params = new URLSearchParams();

    if (activeTab !== 'visualizations') {
      params.set('tab', activeTab);
    }

    if (isFocusMode) {
      params.set('focus', 'true');
    }

    if (maximizedUnitId) {
      params.set('unit', maximizedUnitId);
      // When maximized, include the mode so the link reproduces the exact view
      params.set('mode', settings.visualizationMode);
    }

    const search = params.toString();
    const newUrl = window.location.pathname + (search ? `?${search}` : '');

    // Replace state to keep URL clean without flooding history
    if (window.location.search !== (search ? `?${search}` : '')) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeTab, isFocusMode, maximizedUnitId, settings.visualizationMode]);

  const handleResetAll = () => {
    resetAllSettings();
    setActiveTab('visualizations');
    setMaximizedUnitId(null);
  };
  
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-500 to-teal-500 dark:from-sky-400 dark:via-cyan-400 dark:to-teal-400 pb-2 tracking-tight font-orbitron uppercase">
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
        
        {/* Navigation Tabs */}
        {!isFocusMode && (
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        
        {/* Main Content Area */}
        <div className="py-2 min-h-[300px] animate-fadeIn">
          {(activeTab === 'visualizations' || isFocusMode) && (
            <Dashboard 
              settings={settings} 
              isFocusMode={isFocusMode}
              maximizedUnitId={maximizedUnitId}
              setMaximizedUnitId={setMaximizedUnitId}
            />
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

          {!isFocusMode && activeTab === 'about' && (
            <AboutSection />
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
              <span className="opacity-70 mt-1 inline-block">Version 2.7.0 - Permalink Support</span>
            </p>
          </footer>
        )}
      </main>
    </div>
  );
};

export default App;
