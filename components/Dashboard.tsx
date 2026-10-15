import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CurrentTimeDisplay from './CurrentTimeDisplay';
import VisualizationCard from './VisualizationCard';
import ShareModal from './ShareModal';
import { AppSettings, SectionId, ProgressItemConfig, TimeUnitId } from '../types';
import { DEFAULT_PROGRESS_CONFIGS } from '../config/progressConfig';
import { useTime } from '../hooks/useTime';
import { getUrlParam, setUrlParam } from '../utils/urlUtils';
import { EyeIcon, EyeSlashIcon, SlidersIcon, ChevronDownIcon, ChevronUpIcon, ResetIcon, XMarkIcon } from './Icons';

interface DashboardProps {
  settings: AppSettings;
  isFocusMode: boolean;
  onToggleUnitVisibility?: (unitId: TimeUnitId) => void;
  onToggleSectionVisibility?: (sectionId: SectionId) => void;
  onShowAllCards?: () => void;
  onHideAllCards?: () => void;
  onShowCategoryCards?: (sectionId: SectionId) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  settings, 
  isFocusMode,
  onToggleUnitVisibility,
  onToggleSectionVisibility,
  onShowAllCards,
  onHideAllCards,
  onShowCategoryCards,
}) => {
  const currentTime = useTime(settings.updateIntervalMs, settings.timezone);
  
  // Initialize maximized state from URL parameter 'item'
  const [maximizedConfigId, setMaximizedConfigId] = useState<string | null>(() => {
    return getUrlParam('item');
  });

  const [shareConfig, setShareConfig] = useState<ProgressItemConfig | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // State for card hide confirmation modal
  const [cardToHideConfirm, setCardToHideConfirm] = useState<ProgressItemConfig | null>(null);

  // Sync maximized state to URL
  useEffect(() => {
    setUrlParam('item', maximizedConfigId);
  }, [maximizedConfigId]);

  // Close modals on Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMaximizedConfigId(null);
        setShareConfig(null);
        setCardToHideConfirm(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const maximizedConfig = DEFAULT_PROGRESS_CONFIGS.find(c => c.id === maximizedConfigId);

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

  const categoryThemes: Record<SectionId, { border: string; bgGradient: string; badge: string; accentColor: string }> = {
    micro: {
      border: 'border-teal-400/50 dark:border-teal-500/40',
      bgGradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border-teal-300 dark:border-teal-700',
      accentColor: '#14b8a6',
    },
    cyclical: {
      border: 'border-sky-400/50 dark:border-sky-500/40',
      bgGradient: 'from-sky-500/10 via-amber-500/5 to-transparent',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border-sky-300 dark:border-sky-700',
      accentColor: '#0ea5e9',
    },
    macro: {
      border: 'border-purple-400/50 dark:border-purple-500/40',
      bgGradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      accentColor: '#8b5cf6',
    },
    mega: {
      border: 'border-pink-400/50 dark:border-pink-500/40',
      bgGradient: 'from-pink-500/10 via-indigo-500/5 to-transparent',
      badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 border-pink-300 dark:border-pink-700',
      accentColor: '#db2777',
    },
  };

  const hiddenUnits = useMemo(() => settings.hiddenUnits || [], [settings.hiddenUnits]);
  const hiddenSections = useMemo(() => settings.hiddenSections || [], [settings.hiddenSections]);

  const totalConfigsCount = DEFAULT_PROGRESS_CONFIGS.length;

  // A card is visible if its section is NOT hidden AND its unit ID is NOT hidden
  const totalVisibleCount = useMemo(() => {
    return DEFAULT_PROGRESS_CONFIGS.filter(
      c => !hiddenSections.includes(c.section) && !hiddenUnits.includes(c.id)
    ).length;
  }, [hiddenSections, hiddenUnits]);

  const totalHiddenCount = totalConfigsCount - totalVisibleCount;

  // Trigger confirmation modal when hide button is clicked on the card itself
  const handleCardHideClick = (unitId: TimeUnitId) => {
    const config = DEFAULT_PROGRESS_CONFIGS.find(c => c.id === unitId);
    if (config) {
      setCardToHideConfirm(config);
    }
  };

  const handleConfirmHideCard = () => {
    if (cardToHideConfirm && onToggleUnitVisibility) {
      onToggleUnitVisibility(cardToHideConfirm.id);
    }
    setCardToHideConfirm(null);
  };

  return (
    <>
      <CurrentTimeDisplay currentTime={currentTime} timezone={settings.timezone} />

      {/* Visibility Control Toolbar */}
      {!isFocusMode && (
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm">
                <EyeIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>
                  {totalVisibleCount} of {totalConfigsCount} Metrics Visible
                </span>
              </span>
              {totalHiddenCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                  {totalHiddenCount} hidden
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {totalHiddenCount > 0 && onShowAllCards && (
                <button
                  type="button"
                  onClick={onShowAllCards}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 transition-all flex items-center gap-1.5 shadow-xs"
                  title="Unhide all cards and categories"
                >
                  <ResetIcon className="w-3.5 h-3.5" />
                  <span>Unhide All</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(prev => !prev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border shadow-xs ${
                  isFilterPanelOpen
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sky-500/20'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                aria-expanded={isFilterPanelOpen}
              >
                <SlidersIcon className="w-3.5 h-3.5" />
                <span>Customize Visibility</span>
                {isFilterPanelOpen ? (
                  <ChevronUpIcon className="w-3.5 h-3.5 ml-0.5" />
                ) : (
                  <ChevronDownIcon className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Filter & Visibility Accordion Drawer */}
          {isFilterPanelOpen && (
            <div className="mt-3 p-4 sm:p-6 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Card &amp; Category Visibility
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any metric to show/hide it, or toggle entire categories on and off.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onShowAllCards && (
                    <button
                      type="button"
                      onClick={onShowAllCards}
                      className="text-xs px-3 py-1 rounded-lg font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      Show All
                    </button>
                  )}
                  {onHideAllCards && (
                    <button
                      type="button"
                      onClick={onHideAllCards}
                      className="text-xs px-3 py-1 rounded-lg font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      Hide All
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(groupedConfigs) as SectionId[]).map((section) => {
                  const isCatHidden = hiddenSections.includes(section);
                  const configs = groupedConfigs[section];
                  const visibleInCatCount = configs.filter(c => !hiddenUnits.includes(c.id)).length;
                  const theme = categoryThemes[section];

                  return (
                    <div 
                      key={section}
                      className={`p-4 rounded-xl border bg-gradient-to-br transition-all ${theme.border} ${theme.bgGradient} ${
                        isCatHidden 
                          ? 'opacity-60 bg-slate-100/40 dark:bg-slate-800/20' 
                          : 'bg-white/70 dark:bg-slate-800/60 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: theme.accentColor }} 
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            {sectionTitles[section]}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${theme.badge}`}>
                            {isCatHidden ? 'Category Hidden' : `${visibleInCatCount}/${configs.length} active`}
                          </span>
                        </div>

                        {onToggleSectionVisibility && (
                          <button
                            type="button"
                            onClick={() => onToggleSectionVisibility(section)}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-semibold ${
                              isCatHidden
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                            }`}
                            title={isCatHidden ? `Unhide ${sectionTitles[section]}` : `Hide entire ${sectionTitles[section]} category`}
                          >
                            {isCatHidden ? (
                              <>
                                <EyeIcon className="w-3 h-3" />
                                <span>Unhide Category</span>
                              </>
                            ) : (
                              <>
                                <EyeSlashIcon className="w-3 h-3" />
                                <span>Hide Category</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Individual unit pills with metric colors */}
                      <div className="flex flex-wrap gap-2">
                        {configs.map((config) => {
                          const isUnitHidden = hiddenUnits.includes(config.id);
                          const isEffectivelyHidden = isCatHidden || isUnitHidden;
                          const effectiveColor = settings.customColors[config.id] || config.baseColor;

                          return (
                            <button
                              key={config.id}
                              type="button"
                              onClick={() => onToggleUnitVisibility && onToggleUnitVisibility(config.id)}
                              disabled={isCatHidden}
                              style={
                                !isEffectivelyHidden
                                  ? {
                                      backgroundColor: `${effectiveColor}15`,
                                      borderColor: `${effectiveColor}55`,
                                    }
                                  : undefined
                              }
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isEffectivelyHidden
                                  ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700/80 line-through'
                                  : 'text-slate-800 dark:text-slate-100 shadow-xs hover:scale-105 active:scale-95'
                              } ${isCatHidden ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                              title={
                                isCatHidden
                                  ? `${config.label} is hidden because ${sectionTitles[section]} category is hidden`
                                  : isUnitHidden
                                  ? `Click to unhide ${config.label}`
                                  : `Click to hide ${config.label}`
                              }
                            >
                              <span 
                                className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 p-0.5"
                                style={
                                  !isEffectivelyHidden
                                    ? { backgroundColor: `${effectiveColor}25`, color: effectiveColor }
                                    : { color: '#94a3b8' }
                                }
                              >
                                {config.icon({ className: 'w-3.5 h-3.5', color: !isEffectivelyHidden ? effectiveColor : '#94a3b8' })}
                              </span>
                              <span className="font-semibold">{config.label}</span>
                              {isUnitHidden && !isCatHidden ? (
                                <EyeSlashIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : !isEffectivelyHidden ? (
                                <span 
                                  className="w-1.5 h-1.5 rounded-full shrink-0" 
                                  style={{ backgroundColor: effectiveColor }} 
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid Content or All-Hidden Empty State */}
      {totalVisibleCount === 0 ? (
        <div className="py-16 px-4 text-center bg-slate-100/80 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 my-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <EyeSlashIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              All Metrics Are Currently Hidden
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              You have hidden all time progress bars and categories. Click the button below to restore all cards to the dashboard.
            </p>
          </div>
          {onShowAllCards && (
            <button
              type="button"
              onClick={onShowAllCards}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <ResetIcon className="w-4 h-4" />
              <span>Restore All Metrics</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {(Object.keys(groupedConfigs) as SectionId[]).map((section) => {
            const isCategoryHidden = hiddenSections.includes(section);
            const configs = groupedConfigs[section];
            const visibleConfigs = configs.filter(c => !hiddenUnits.includes(c.id));
            const hiddenUnitsCount = configs.length - visibleConfigs.length;

            // When a category is hidden, or if all its cards are hidden, IT COMPLETELY DISAPPEARS!
            if (isCategoryHidden || visibleConfigs.length === 0) {
              return null;
            }

            // Normal rendering with active cards:
            return (
              <div key={section}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest font-mono border-b-2 border-slate-200 dark:border-slate-700 pb-1 pr-2">
                      {sectionTitles[section]}
                    </h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      {visibleConfigs.length}/{configs.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hiddenUnitsCount > 0 && onShowCategoryCards && (
                      <button
                        type="button"
                        onClick={() => onShowCategoryCards(section)}
                        className="text-[11px] px-2 py-1 rounded-md text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
                        title={`Unhide ${hiddenUnitsCount} cards in ${sectionTitles[section]}`}
                      >
                        <EyeIcon className="w-3 h-3" />
                        <span>Unhide {hiddenUnitsCount}</span>
                      </button>
                    )}

                    {onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={() => onToggleSectionVisibility(section)}
                        className="text-[11px] px-2.5 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 font-medium"
                        title={`Hide entire ${sectionTitles[section]} category`}
                        aria-label={`Hide ${sectionTitles[section]} category`}
                      >
                        <EyeSlashIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hide Category</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className={`grid gap-4 sm:gap-6 ${gridLayoutClasses[settings.visualizationMode]}`}>
                  {visibleConfigs.map((config) => (
                    <VisualizationCard 
                      key={config.id}
                      config={config}
                      currentTime={currentTime}
                      settings={settings}
                      onMaximize={setMaximizedConfigId}
                      onShare={setShareConfig}
                      onHide={handleCardHideClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal when hide button is clicked on the card itself */}
      {cardToHideConfirm && createPortal(
        <div 
          className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setCardToHideConfirm(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ 
                    backgroundColor: `${settings.customColors[cardToHideConfirm.id] || cardToHideConfirm.baseColor}20`,
                    color: settings.customColors[cardToHideConfirm.id] || cardToHideConfirm.baseColor
                  }}
                >
                  {cardToHideConfirm.icon({ className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Hide "{cardToHideConfirm.label}" Card?
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    Category: {sectionTitles[cardToHideConfirm.section]}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCardToHideConfirm(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Cancel"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to hide the <strong className="text-slate-900 dark:text-white font-semibold">{cardToHideConfirm.label}</strong> progress card from your dashboard?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-sky-500 shrink-0" />
              <span>
                You can easily unhide it anytime using the <strong>Customize Visibility</strong> toolbar or in <strong>Settings</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCardToHideConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHideCard}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <EyeSlashIcon className="w-4 h-4" />
                <span>Hide Card</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Maximized View Modal Overlay */}
      {maximizedConfig && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-sm" onClick={() => setMaximizedConfigId(null)}>
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl flex justify-center animate-fadeIn">
              <VisualizationCard
                config={maximizedConfig}
                currentTime={currentTime}
                settings={settings}
                isMaximized={true}
                onClose={() => setMaximizedConfigId(null)}
                onShare={setShareConfig}
                onHide={handleCardHideClick}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share & Open Graph Modal */}
      {shareConfig && (
        <ShareModal
          config={shareConfig}
          settings={settings}
          isOpen={!!shareConfig}
          onClose={() => setShareConfig(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
