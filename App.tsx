
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProgressBar from './components/ProgressBar';
import CurrentTimeDisplay from './components/CurrentTimeDisplay';
import TimeOrbit from './components/TimeOrbit';
import PixelGrid from './components/PixelGrid'; 
import TimeSpiral from './components/TimeSpiral'; 
import Hourglass from './components/Hourglass'; 
import RadialSlice from './components/RadialSlice'; 
import ColorCustomizer from './components/ColorCustomizer';
import CommentSection from './components/CommentSection';
import FeedbackSection from './components/FeedbackSection';
import SettingsDisplay from './components/SettingsDisplay'; // Import SettingsDisplay
import { DEFAULT_PROGRESS_CONFIGS } from './config/progressConfig'; // Import progress configs
import { EyeIcon, SparkleIcon } from './components/Icons'; // Import necessary icons for App.tsx
import { 
  AppSettings, Theme, WeekStartDay, VisualizationMode, 
  TimeUnitId, CustomColors, ActiveTab, FeedbackData, RatingCounts,
  VISITOR_COUNT_KEY, LIKE_COUNT_KEY, RATING_KEY_PREFIX,
  LOCAL_STORAGE_HAS_LIKED_KEY, LOCAL_STORAGE_USER_RATING_KEY
} from './types';
import { getValue, updateValue } from './utils/apiUtils';

const defaultAppSettings: AppSettings = {
  theme: 'light',
  weekStartDay: 0,
  visualizationMode: 'bars',
  updateIntervalMs: 200,
  customColors: {},
};

const EXTENDSCLASS_API_KEY = "d9892a88-3e66-11f0-8efd-0242ac110009";

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ActiveTab>('visualizations');
  
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    let storedSettingsJson = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      storedSettingsJson = localStorage.getItem('temporalFluxSettings');
    }
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';

    if (storedSettingsJson) {
      try {
        const parsed = JSON.parse(storedSettingsJson) as Partial<AppSettings>;
        const customColors = (typeof parsed.customColors === 'object' && parsed.customColors !== null) ? parsed.customColors : {};
        return { ...defaultAppSettings, theme: initialTheme, ...parsed, customColors };
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
      }
    }
    return { ...defaultAppSettings, theme: initialTheme };
  });

  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    likeCount: 0,
    hasLiked: false,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    userRating: 0,
  });
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeTabIndicatorStyle, setActiveTabIndicatorStyle] = useState<React.CSSProperties>({});


  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, appSettings.updateIntervalMs); 
    return () => clearInterval(timerId);
  }, [appSettings.updateIntervalMs]);

  useEffect(() => {
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', appSettings.theme);
  }, [appSettings.theme]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('temporalFluxSettings', JSON.stringify(appSettings));
    }
  }, [appSettings]);

  useEffect(() => {
    const initFeedbackSystem = async () => {
      setIsLoadingFeedback(true);
      setFeedbackError(null);
      
      const initialVisitorCount = await getValue(VISITOR_COUNT_KEY);
      if (initialVisitorCount !== null) {
        const newVisitorCount = initialVisitorCount + 1;
        setVisitorCount(newVisitorCount);
        await updateValue(VISITOR_COUNT_KEY, newVisitorCount);
      } else {
        setFeedbackError(prev => (prev ? prev + "; " : "") + "Could not update visitor count.");
      }

      const storedLikeCount = await getValue(LIKE_COUNT_KEY);
      const storedHasLiked = localStorage.getItem(LOCAL_STORAGE_HAS_LIKED_KEY) === 'true';
      if (storedLikeCount === null) {
         setFeedbackError(prev => (prev ? prev + "; " : "") + "Could not load like count.");
      }

      const newRatingCounts: RatingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let ratingFetchError = false;
      for (let i = 1; i <= 5; i++) {
        const count = await getValue(`${RATING_KEY_PREFIX}${i}`);
        if (count !== null) {
          newRatingCounts[i as keyof RatingCounts] = count;
        } else {
          ratingFetchError = true;
          break;
        }
      }
       if (ratingFetchError) {
        setFeedbackError(prev => (prev ? prev + "; " : "") + "Could not load all rating counts.");
      }
      const storedUserRating = parseInt(localStorage.getItem(LOCAL_STORAGE_USER_RATING_KEY) || '0', 10);

      setFeedbackData({
        likeCount: storedLikeCount ?? 0,
        hasLiked: storedHasLiked,
        ratingCounts: newRatingCounts,
        userRating: storedUserRating,
      });
      
      setIsLoadingFeedback(false);
    };
    initFeedbackSystem();
  }, []);

  const handleLikeToggle = useCallback(async () => {
    const newHasLiked = !feedbackData.hasLiked;
    const newLikeCount = feedbackData.likeCount + (newHasLiked ? 1 : -1);

    setFeedbackData(prev => ({ ...prev, hasLiked: newHasLiked, likeCount: newLikeCount }));
    localStorage.setItem(LOCAL_STORAGE_HAS_LIKED_KEY, String(newHasLiked));
    
    setIsLoadingFeedback(true);
    const success = await updateValue(LIKE_COUNT_KEY, newLikeCount);
    setIsLoadingFeedback(false);
    if (!success) {
      setFeedbackError("Failed to update like count. Your preference is saved locally.");
    } else {
        setFeedbackError(null);
    }
  }, [feedbackData]);

  const handleRate = useCallback(async (newRating: number) => {
    const oldRating = feedbackData.userRating;
    const newRatingCounts = { ...feedbackData.ratingCounts };
    let apiSuccess = true;

    setIsLoadingFeedback(true);

    if (oldRating > 0 && oldRating !== newRating) {
      newRatingCounts[oldRating as keyof RatingCounts] = Math.max(0, newRatingCounts[oldRating as keyof RatingCounts] - 1);
      if (!(await updateValue(`${RATING_KEY_PREFIX}${oldRating}`, newRatingCounts[oldRating as keyof RatingCounts]))) {
        apiSuccess = false;
      }
    }

    if (apiSuccess && oldRating !== newRating) {
        newRatingCounts[newRating as keyof RatingCounts]++;
        if (!(await updateValue(`${RATING_KEY_PREFIX}${newRating}`, newRatingCounts[newRating as keyof RatingCounts]))) {
            apiSuccess = false;
            // Rollback decrement if increment failed
            if (oldRating > 0) newRatingCounts[oldRating as keyof RatingCounts]++; 
        }
    }


    if (apiSuccess) {
      setFeedbackData(prev => ({ ...prev, ratingCounts: newRatingCounts, userRating: newRating }));
      localStorage.setItem(LOCAL_STORAGE_USER_RATING_KEY, String(newRating));
      setFeedbackError(null);
    } else {
      // Even if API fails, update UI and local storage based on user action
      setFeedbackError("Failed to update rating with the server. Your preference is saved locally.");
      // Update local storage and UI state to reflect the user's *intended* rating, 
      // even if the full sync (decrement old, increment new) failed.
      const tempRatingCounts = {...feedbackData.ratingCounts};
      if(oldRating > 0 && oldRating !== newRating) tempRatingCounts[oldRating as keyof RatingCounts] = Math.max(0, tempRatingCounts[oldRating as keyof RatingCounts] -1);
      tempRatingCounts[newRating as keyof RatingCounts]++;

      setFeedbackData(prev => ({ ...prev, userRating: newRating, ratingCounts: tempRatingCounts }));
      localStorage.setItem(LOCAL_STORAGE_USER_RATING_KEY, String(newRating));
    }
    setIsLoadingFeedback(false);
  }, [feedbackData]);

  const handleSettingChange = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleColorChange = useCallback((unitId: TimeUnitId, colorHex: string) => {
    setAppSettings(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [unitId]: colorHex,
      }
    }));
  }, []);

  const handleResetColors = useCallback(() => {
    setAppSettings(prev => ({ ...prev, customColors: {} }));
  }, []);
  
  const handleResetAllSettings = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('temporalFluxSettings');
    }
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setAppSettings({ ...defaultAppSettings, theme: prefersDark ? 'dark' : 'light' });
    setActiveTab('visualizations'); 
  }, []);

  const getDynamicHexColors = (baseHexColor: string) => {
    return {
      primary: baseHexColor,
      unitSpecificText: baseHexColor, 
      emptyPixel: `${baseHexColor}33`, 
      cardGeneralTextColor: appSettings.theme === 'dark' ? 'text-slate-300' : 'text-slate-700',
      progressBarDetailTextColor: appSettings.theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    };
  };
  
  const tabs: { id: ActiveTab, label: string }[] = [
    { id: 'visualizations', label: 'Visualizations' },
    { id: 'settings', label: 'Display Settings' },
    { id: 'colors', label: 'Color Scheme' },
    { id: 'comments', label: 'Comments' },
    { id: 'feedback', label: 'Feedback' },
  ];
  
  useEffect(() => {
    const activeTabIndex = tabs.findIndex(t => t.id === activeTab);
    const activeTabElement = tabRefs.current[activeTabIndex];
    if (activeTabElement) {
      setActiveTabIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  const gridLayoutClasses = {
    bars: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    orbits: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    pixels: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4',
    spiral: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    hourglass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    radialSlice: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const cardBaseClass = `w-full rounded-xl shadow-xl backdrop-blur-md border transition-colors duration-300 
    ${appSettings.theme === 'dark' 
      ? 'bg-slate-800/80 border-slate-700' 
      : 'bg-white/90 border-slate-200/80'}`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6 selection:bg-sky-500 selection:text-white text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <main className="w-full max-w-6xl bg-white/80 dark:bg-slate-800/[.85] backdrop-blur-lg shadow-2xl rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-slate-300 dark:border-slate-700 transition-colors duration-300">
        <header className="mb-8 text-center">
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 dark:from-sky-400 dark:via-cyan-400 dark:to-teal-400 pb-2"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Time Progress Bars
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Observe time's flow through diverse lenses.</p>
        </header>
        
        <CurrentTimeDisplay currentTime={currentTime} />

        <div className="mb-6 border-b border-slate-300 dark:border-slate-700">
          <nav className="relative flex space-x-1 sm:space-x-2 overflow-x-auto pb-px -mb-px" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[index] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 font-medium text-sm rounded-t-md transition-all duration-200 ease-in-out whitespace-nowrap
                  hover:text-sky-500 dark:hover:text-sky-300 
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 focus-visible:z-10
                  ${activeTab === tab.id
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-500 dark:text-slate-400'
                  }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
            {Object.keys(activeTabIndicatorStyle).length > 0 && (
              <div
                className="absolute bottom-0 h-[3px] bg-sky-500 dark:bg-sky-400 rounded-t-sm transition-all duration-300 ease-in-out"
                style={activeTabIndicatorStyle}
              />
            )}
          </nav>
        </div>
        
        <div key={activeTab} className="py-4 opacity-0 animate-fadeIn">
          {activeTab === 'visualizations' && (
            <div className={`grid gap-4 sm:gap-6 ${gridLayoutClasses[appSettings.visualizationMode]}`}>
              {DEFAULT_PROGRESS_CONFIGS.map((config) => {
                const effectiveHexColor = appSettings.customColors[config.id] || config.baseColor;
                const details = config.getDetails(currentTime, appSettings.weekStartDay);
                const unitColors = getDynamicHexColors(effectiveHexColor);
                
                const commonProps = {
                  key: config.id,
                  label: config.label,
                  percentage: details.percentage,
                  details: { elapsed: details.elapsed, remaining: details.remaining, period: details.period },
                  icon: config.icon({ className: 'w-5 h-5', color: unitColors.unitSpecificText }),
                  textColor: unitColors.cardGeneralTextColor, 
                  mainValueColor: unitColors.unitSpecificText, 
                };
                
                const cardTextColorClass = appSettings.theme === 'dark' ? 'text-slate-300' : 'text-slate-700';

                let decadeCardSpecificClass = '';
                if (appSettings.visualizationMode !== 'bars' && config.id === 'decade') {
                    const currentLayout = gridLayoutClasses[appSettings.visualizationMode];
                    if (currentLayout.includes('lg:grid-cols-3') && !currentLayout.includes('lg:grid-cols-4')) decadeCardSpecificClass = 'lg:col-span-3';
                    else if (currentLayout.includes('xl:grid-cols-4')) decadeCardSpecificClass = 'xl:col-span-2 xl:col-start-2';
                    else if (currentLayout.includes('md:grid-cols-4')) decadeCardSpecificClass = 'md:col-span-4';
                    else if (currentLayout.includes('sm:grid-cols-2') || currentLayout.includes('xs:grid-cols-2')) decadeCardSpecificClass = 'sm:col-span-2';
                    else if (currentLayout.includes('grid-cols-1')) decadeCardSpecificClass = 'col-span-1';
                }

                return (
                  <div key={config.id} className={`${appSettings.visualizationMode === 'bars' ? '' : cardBaseClass} ${decadeCardSpecificClass}`}>
                    {appSettings.visualizationMode === 'bars' && (
                      <ProgressBar
                        {...commonProps}
                        icon={config.icon({ className: 'w-5 h-5', color: unitColors.progressBarDetailTextColor})} 
                        textColor={unitColors.progressBarDetailTextColor} 
                        barColor={unitColors.primary} 
                        trailColor="bg-slate-200 dark:bg-slate-700" 
                      />
                    )}
                    {appSettings.visualizationMode === 'orbits' && (
                      <TimeOrbit
                        {...commonProps}
                        textColor={cardTextColorClass}
                        planetColor={unitColors.primary} 
                        orbitColor={appSettings.theme === 'dark' ? '#334155' : '#e2e8f0'} 
                      />
                    )}
                    {appSettings.visualizationMode === 'pixels' && (
                      <PixelGrid
                        {...commonProps}
                        textColor={cardTextColorClass}
                        pixelColor={unitColors.primary} 
                        emptyPixelColor={unitColors.emptyPixel}
                        gridRows={config.gridConfig?.rows ?? 8} 
                        gridCols={config.gridConfig?.cols ?? (config.id === 'second' || config.id === 'minute' ? 10 : 8)}
                      />
                    )}
                    {appSettings.visualizationMode === 'spiral' && (
                      <TimeSpiral
                        {...commonProps}
                        textColor={cardTextColorClass}
                        spiralColor={unitColors.primary} 
                        trackColor={appSettings.theme === 'dark' ? '#334155' : '#e2e8f0'} 
                      />
                    )}
                    {appSettings.visualizationMode === 'hourglass' && (
                      <Hourglass
                        {...commonProps}
                        textColor={cardTextColorClass}
                        sandColor={unitColors.primary} 
                        frameColor={appSettings.theme === 'dark' ? '#64748b' : '#94a3b8'} 
                      />
                    )}
                    {appSettings.visualizationMode === 'radialSlice' && (
                      <RadialSlice
                        {...commonProps}
                        textColor={cardTextColorClass}
                        sliceColor={unitColors.primary} 
                        trackColor={appSettings.theme === 'dark' ? '#334155' : '#e2e8f0'}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'settings' && (
             <SettingsDisplay 
              settings={appSettings}
              onSettingChange={handleSettingChange}
              onResetAllSettings={handleResetAllSettings}
            />
          )}
          {activeTab === 'colors' && (
            <ColorCustomizer
              progressConfigs={DEFAULT_PROGRESS_CONFIGS}
              customColors={appSettings.customColors}
              onColorChange={handleColorChange}
              onResetColors={handleResetColors}
            />
          )}
          {activeTab === 'comments' && (
            <CommentSection 
              apiKey={EXTENDSCLASS_API_KEY} 
              appTheme={appSettings.theme} 
            />
          )}
          {activeTab === 'feedback' && (
            <FeedbackSection
              feedbackData={feedbackData}
              onLikeToggle={handleLikeToggle}
              onRate={handleRate}
              isLoading={isLoadingFeedback}
              error={feedbackError}
              appTheme={appSettings.theme}
            />
          )}
        </div>
        
        <footer className="mt-10 sm:mt-12 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400/80 mb-2">
              <EyeIcon className="w-4 h-4" /> 
              <span>
                {visitorCount !== null ? visitorCount.toLocaleString() : 'Loading...'} Visitors
              </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400/80">
            Crafted with React, TypeScript & Tailwind CSS.
            Enhanced with AI assistance <SparkleIcon className="w-3 h-3 inline-block relative -top-px fill-current" />.
            &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
