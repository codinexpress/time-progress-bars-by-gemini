
import React, { useState, useEffect } from 'react';
import ColorCustomizer from './components/ColorCustomizer';
import CommentSection from './components/CommentSection';
import FeedbackSection from './components/FeedbackSection';
import SettingsDisplay from './components/SettingsDisplay';
import TabNavigation from './components/TabNavigation';
import AboutSection from './components/AboutSection';
import Dashboard from './components/Dashboard';
import ShareModal from './components/ShareModal';
import { DEFAULT_PROGRESS_CONFIGS } from './config/progressConfig';
import { EyeIcon, ShareIcon } from './components/Icons';
import { ActiveTab } from './types';
import { useAppSettings } from './hooks/useAppSettings';
import { useFeedback } from './hooks/useFeedback';
import { getUrlParam, setUrlParam } from './utils/urlUtils';
import { getOgImageUrl, getUserTimezoneOffset, formatUtcOffsetString, resolveTimezoneOffset } from './utils/ogUtils';

const App: React.FC = () => {
  const { 
    settings, 
    updateSetting, 
    updateColor, 
    updateDecimalOverride,
    toggleUnitVisibility,
    toggleSectionVisibility,
    showAllCards,
    hideAllCards,
    showCategoryCards,
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

  // Initialize state from URL params or default
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const tabParam = getUrlParam('tab');
    const validTabs: ActiveTab[] = ['visualizations', 'settings', 'colors', 'comments', 'feedback', 'about'];
    return (tabParam && validTabs.includes(tabParam as ActiveTab)) 
      ? (tabParam as ActiveTab) 
      : 'visualizations';
  });

  const [isFocusMode, setIsFocusMode] = useState(() => {
    const focusParam = getUrlParam('focus');
    return focusParam === 'true' || focusParam === '1';
  });

  const [isAppShareOpen, setIsAppShareOpen] = useState(false);

  // Sync URL when activeTab changes
  useEffect(() => {
    setUrlParam('tab', activeTab === 'visualizations' ? null : activeTab);
  }, [activeTab]);

  // Sync URL when focus mode changes
  useEffect(() => {
    setUrlParam('focus', isFocusMode ? 'true' : null);
  }, [isFocusMode]);

  // Dynamically update document head title and Open Graph meta tags
  useEffect(() => {
    const itemParam = getUrlParam('item');
    const matchedConfig = itemParam ? DEFAULT_PROGRESS_CONFIGS.find(c => c.id === itemParam) : null;

    let pageTitle = 'Time Flux - Real-Time Existence Tracker';
    let pageDesc = 'Visualize the flow of existence across second, minute, hour, day, week, month, year, decade, and century with live progress bars.';

    if (matchedConfig) {
      pageTitle = `${matchedConfig.label} Progress | Time Flux`;
      pageDesc = `Live real-time progress of ${matchedConfig.label} on Time Flux. Track the passage of time accurately.`;
    } else if (activeTab !== 'visualizations') {
      pageTitle = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} | Time Flux`;
    }

    document.title = pageTitle;

    // Update dynamic OG tags in DOM
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const activeOffset = resolveTimezoneOffset(settings.timezone);
    const tzParam = getUrlParam('tz') || formatUtcOffsetString(activeOffset);
    const vParam = getUrlParam('v') || null;

    const ogImgUrl = getOgImageUrl({
      item: matchedConfig?.id || null,
      tab: activeTab !== 'visualizations' ? activeTab : null,
      mode: settings.visualizationMode,
      theme: settings.theme,
      tz: tzParam,
      v: vParam,
      origin: origin,
    });

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute('content', pageDesc);

    const ogImgEl = document.querySelector('meta[property="og:image"]');
    if (ogImgEl) ogImgEl.setAttribute('content', ogImgUrl);

    const ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) {
      ogUrlEl.setAttribute('content', window.location.href);
    } else {
      const newOgUrl = document.createElement('meta');
      newOgUrl.setAttribute('property', 'og:url');
      newOgUrl.setAttribute('content', window.location.href);
      document.head.appendChild(newOgUrl);
    }

    const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleEl) twitterTitleEl.setAttribute('content', pageTitle);

    const twitterDescEl = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescEl) twitterDescEl.setAttribute('content', pageDesc);

    const twitterImgEl = document.querySelector('meta[name="twitter:image"]');
    if (twitterImgEl) twitterImgEl.setAttribute('content', ogImgUrl);
  }, [activeTab, settings.visualizationMode, settings.theme]);

  const handleResetAll = () => {
    resetAllSettings();
    setActiveTab('visualizations');
    setIsFocusMode(false);
    // Clear app-level URL params
    setUrlParam('tab', null);
    setUrlParam('focus', null);
    setUrlParam('item', null);
    setUrlParam('mode', null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6 selection:bg-sky-500 selection:text-white text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <main className={`w-full transition-all duration-500 ease-in-out ${isFocusMode ? 'max-w-[98vw]' : 'max-w-6xl bg-white/80 dark:bg-slate-800/[.85] backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50'} p-4 sm:p-6 md:p-8 relative`}>
        
        {/* Header */}
        {!isFocusMode && (
          <header className="mb-8 text-center relative">
            <div className="absolute top-0 right-0 flex items-center gap-2">
              <button 
                onClick={() => setIsAppShareOpen(true)}
                className="text-xs font-medium bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                title="Share Time Flux Open Graph Card"
              >
                <ShareIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button 
                onClick={() => setIsFocusMode(true)}
                className="text-xs font-medium bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition-all"
                title="Enter Focus Mode"
              >
                Focus
              </button>
            </div>
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
              onToggleUnitVisibility={toggleUnitVisibility}
              onToggleSectionVisibility={toggleSectionVisibility}
              onShowAllCards={showAllCards}
              onHideAllCards={hideAllCards}
              onShowCategoryCards={showCategoryCards}
            />
          )}
          
          {!isFocusMode && activeTab === 'settings' && (
             <SettingsDisplay 
              settings={settings}
              onSettingChange={updateSetting}
              onResetAllSettings={handleResetAll}
              onDecimalOverrideChange={updateDecimalOverride}
              onToggleUnitVisibility={toggleUnitVisibility}
              onToggleSectionVisibility={toggleSectionVisibility}
              onShowAllCards={showAllCards}
              onHideAllCards={hideAllCards}
              onShowCategoryCards={showCategoryCards}
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
              <span className="opacity-70 mt-1 inline-block">Version 2.8.0 - Dynamic Open Graph &amp; Deep Link Enabled</span>
            </p>
          </footer>
        )}

        {/* Global App Share Modal */}
        {isAppShareOpen && (
          <ShareModal
            config={null}
            settings={settings}
            isOpen={isAppShareOpen}
            onClose={() => setIsAppShareOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
