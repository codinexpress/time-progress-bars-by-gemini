
import React from 'react';
import { SettingsProps, VisualizationMode, WeekStartDay, TimeUnitId, SectionId } from '../types';
import {
  SunIcon, MoonIcon, BarsIcon, OrbitIcon, PixelIcon, SpiralIcon, HourglassIcon, RadialSliceIcon, ResetIcon, EyeIcon, EyeSlashIcon
} from './Icons';
import { DEFAULT_PROGRESS_CONFIGS } from '../config/progressConfig';
import { TIMEZONE_PRESETS, getTimezoneDisplayName, getAdjustedTime, getUserTimezoneOffset, formatUtcOffsetLabel } from '../utils/ogUtils';

const SettingsDisplay: React.FC<SettingsProps> = ({
  settings,
  onSettingChange,
  onResetAllSettings,
  onDecimalOverrideChange,
  onToggleUnitVisibility,
  onToggleSectionVisibility,
  onShowAllCards,
  onHideAllCards,
  onShowCategoryCards,
}) => {
  const vizOptions: { mode: VisualizationMode, label: string, Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { mode: 'bars', label: 'Bars', Icon: BarsIcon },
    { mode: 'orbits', label: 'Orbits', Icon: OrbitIcon },
    { mode: 'pixels', label: 'Pixels', Icon: PixelIcon },
    { mode: 'spiral', label: 'Spiral', Icon: SpiralIcon },
    { mode: 'hourglass', label: 'Hourglass', Icon: HourglassIcon },
    { mode: 'radialSlice', label: 'Radial Slice', Icon: RadialSliceIcon },
  ];

  const intervalOptions = [
    { value: 1, label: "Ultra Fast (1ms)" },
    { value: 10, label: "Super Fast (10ms)" },
    { value: 50, label: "Very Fast (50ms)" },
    { value: 100, label: "Fast (100ms)" },
    { value: 200, label: "Minimum (200ms)" },
  ];

  const currentTzDisplay = getTimezoneDisplayName(settings.timezone);
  const currentTimeInTz = getAdjustedTime(new Date(), settings.timezone);
  const timeFormatted = currentTimeInTz.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 sm:mr-3">Theme:</span>
        <button
          onClick={() => onSettingChange('theme', settings.theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition-colors self-start sm:self-center"
          aria-label={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {settings.theme === 'light' ? <MoonIcon className="w-5 h-5 text-slate-700" /> : <SunIcon className="w-5 h-5 text-slate-300" />}
        </button>
      </div>

      {/* Timezone Setting */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <div>
            <label htmlFor="timezoneSelect" className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
              Timezone / Location:
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active: <span className="font-semibold text-sky-600 dark:text-sky-400">{currentTzDisplay}</span> ({timeFormatted})
            </span>
          </div>
          {settings.timezone !== 'auto' && (
            <button
              onClick={() => onSettingChange('timezone', 'auto')}
              className="mt-2 sm:mt-0 text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors self-start sm:self-auto"
            >
              Reset to Auto
            </button>
          )}
        </div>

        <div className="relative">
          <select
            id="timezoneSelect"
            value={settings.timezone || 'auto'}
            onChange={(e) => onSettingChange('timezone', e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none shadow-sm cursor-pointer"
          >
            {TIMEZONE_PRESETS.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
          Saved locally in browser storage. Drives live dashboard timers and dynamic social preview cards.
        </p>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">View Mode:</span>
        <div className="flex flex-wrap gap-2 items-center">
          {vizOptions.map(opt => (
            <button
              key={opt.mode}
              onClick={() => onSettingChange('visualizationMode', opt.mode)}
              className={`flex items-center px-3 py-2 rounded-md transition-colors duration-150 ease-out group focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-sky-500
                ${settings.visualizationMode === opt.mode 
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              aria-label={`${opt.label} View`} 
              title={`${opt.label} View`}
            >
              <opt.Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="ml-1.5 text-xs sm:text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 sm:mr-3">Week starts on:</span>
        <div className="flex space-x-2">
          {(['Sun', 'Mon'] as const).map((day, index) => (
            <button
              key={day}
              onClick={() => onSettingChange('weekStartDay', index as WeekStartDay)}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 ${
                settings.weekStartDay === index
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="updateIntervalSelect" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 sm:mr-3 shrink-0">Update Speed:</label>
        
        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all w-full sm:w-auto shadow-sm">
          <select
            id="updateIntervalSelect"
            value={settings.updateIntervalMs}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value)) {
                onSettingChange('updateIntervalMs', value);
              }
            }}
            className="flex-grow sm:flex-grow-0 px-3 py-2 text-xs sm:text-sm bg-transparent border-r border-slate-200 dark:border-slate-600 outline-none text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600/50 transition-colors"
            aria-label="Select predefined update speed"
          >
            {intervalOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-700">
                {opt.label}
              </option>
            ))}
             {/* Add a custom option if current value is not in predefined list */}
            {!intervalOptions.some(opt => opt.value === settings.updateIntervalMs) && (
                <option value={settings.updateIntervalMs} className="bg-white dark:bg-slate-700">
                    Custom
                </option>
            )}
          </select>
          <input
            type="number"
            id="updateIntervalInput"
            min="1"
            value={settings.updateIntervalMs}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1) {
                onSettingChange('updateIntervalMs', value);
              } else if (e.target.value === "") { 
                 // Allow clearing field before typing new val
              }
            }}
            className="w-20 px-3 py-2 text-xs sm:text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Custom update speed in milliseconds"
          />
          <span className="pr-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-transparent select-none">ms</span>
        </div>
      </div>

      {/* Birth Date for Life Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <div className="mb-1 sm:mb-0">
            <label htmlFor="birthDateInput" className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Birth Date:</label>
            <span className="text-xs text-slate-500 dark:text-slate-400">For 'Life Progress' metric</span>
        </div>
        <input
            type="date"
            id="birthDateInput"
            value={settings.birthDate}
            onChange={(e) => onSettingChange('birthDate', e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
        />
      </div>

      {/* Decimal Precision Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Precision Controls</h3>
        
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between">
           <label htmlFor="globalDecimalInput" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1 sm:mb-0">Global Decimal Places:</label>
           <div className="flex items-center space-x-3">
             <input 
               type="range" 
               min="0" 
               max="12" 
               value={settings.globalDecimalPlaces} 
               onChange={(e) => onSettingChange('globalDecimalPlaces', parseInt(e.target.value, 10))}
               className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-sky-500"
             />
             <input 
               id="globalDecimalInput"
               type="number" 
               min="0" 
               max="20" 
               value={settings.globalDecimalPlaces}
               onChange={(e) => onSettingChange('globalDecimalPlaces', Math.max(0, parseInt(e.target.value, 10) || 0))}
               className="w-12 px-1 py-1 text-center text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
             />
           </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Individual Overrides</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEFAULT_PROGRESS_CONFIGS.map(config => {
              const overrideValue = settings.decimalPlaceOverrides[config.id];
              const hasOverride = overrideValue !== undefined;
              
              return (
                <div key={config.id} className="flex items-center justify-between bg-white dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600/50 shadow-sm">
                  <label htmlFor={`decimal-${config.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center truncate mr-2">
                    {config.label}
                  </label>
                  <input
                    id={`decimal-${config.id}`}
                    type="number"
                    min="0"
                    max="20"
                    placeholder={String(settings.globalDecimalPlaces)}
                    value={hasOverride ? overrideValue : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onDecimalOverrideChange(config.id, val === '' ? null : Math.max(0, parseInt(val, 10)));
                    }}
                    className={`w-12 px-1 py-1 text-center text-xs rounded border focus:ring-1 focus:ring-sky-500 outline-none transition-colors
                      ${hasOverride 
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-bold' 
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">Leave blank to use global setting.</p>
        </div>
      </div>

      {/* Card & Category Visibility Management */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Card &amp; Category Visibility
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hide or unhide specific cards (e.g. second, hour, heartbeat) or entire categories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onShowAllCards && (
              <button
                type="button"
                onClick={onShowAllCards}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Show All
              </button>
            )}
            {onHideAllCards && (
              <button
                type="button"
                onClick={onHideAllCards}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Hide All
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(['micro', 'cyclical', 'macro', 'mega'] as SectionId[]).map((sectionId) => {
            const sectionLabels: Record<SectionId, string> = {
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
            const configs = DEFAULT_PROGRESS_CONFIGS.filter(c => c.section === sectionId);
            const isSectionHidden = (settings.hiddenSections || []).includes(sectionId);
            const hiddenUnits = settings.hiddenUnits || [];
            const visibleUnitsCount = configs.filter(c => !hiddenUnits.includes(c.id)).length;
            const theme = categoryThemes[sectionId];

            return (
              <div 
                key={sectionId} 
                className={`p-3.5 sm:p-4 rounded-xl border bg-gradient-to-br transition-all ${theme.border} ${theme.bgGradient} ${
                  isSectionHidden
                    ? 'opacity-60 bg-slate-100/50 dark:bg-slate-800/20'
                    : 'bg-white/80 dark:bg-slate-800/70 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: theme.accentColor }} 
                    />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {sectionLabels[sectionId]}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${theme.badge}`}>
                      {isSectionHidden ? 'Category Hidden' : `${visibleUnitsCount} / ${configs.length} active`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onShowCategoryCards && !isSectionHidden && visibleUnitsCount < configs.length && (
                      <button
                        type="button"
                        onClick={() => onShowCategoryCards(sectionId)}
                        className="text-xs px-2 py-1 text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                      >
                        Show All
                      </button>
                    )}
                    {onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={() => onToggleSectionVisibility(sectionId)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                          isSectionHidden
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {isSectionHidden ? (
                          <>
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>Unhide Category</span>
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="w-3.5 h-3.5" />
                            <span>Hide Category</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Individual units in this section with metric colors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {configs.map((config) => {
                    const isUnitHidden = hiddenUnits.includes(config.id);
                    const isEffectiveHidden = isSectionHidden || isUnitHidden;
                    const effectiveColor = settings.customColors[config.id] || config.baseColor;

                    return (
                      <button
                        key={config.id}
                        type="button"
                        disabled={isSectionHidden}
                        onClick={() => onToggleUnitVisibility && onToggleUnitVisibility(config.id)}
                        style={
                          !isEffectiveHidden
                            ? {
                                backgroundColor: `${effectiveColor}15`,
                                borderColor: `${effectiveColor}50`,
                              }
                            : undefined
                        }
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-all text-left ${
                          isEffectiveHidden
                            ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100 shadow-xs hover:scale-102 active:scale-98'
                        } ${isSectionHidden ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        title={isSectionHidden ? 'Category is hidden' : isUnitHidden ? `Unhide ${config.label}` : `Hide ${config.label}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span 
                            className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 p-0.5"
                            style={
                              !isEffectiveHidden
                                ? { backgroundColor: `${effectiveColor}25`, color: effectiveColor }
                                : { color: '#94a3b8' }
                            }
                          >
                            {config.icon({ className: 'w-3.5 h-3.5', color: !isEffectiveHidden ? effectiveColor : '#94a3b8' })}
                          </span>
                          <span className={`truncate font-semibold ${isEffectiveHidden ? 'line-through' : ''}`}>
                            {config.label}
                          </span>
                        </div>
                        {isUnitHidden && !isSectionHidden ? (
                          <EyeSlashIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                        ) : (
                          <span 
                            className="w-1.5 h-1.5 rounded-full shrink-0 ml-1" 
                            style={{ backgroundColor: !isEffectiveHidden ? effectiveColor : 'transparent' }} 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onResetAllSettings}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 bg-slate-200 hover:bg-red-200 dark:bg-slate-700 dark:hover:bg-red-700 hover:text-red-700 dark:hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition-colors duration-150 ease-out group"
          aria-label="Reset all settings to default"
          title="Reset All Settings"
        >
          <ResetIcon className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
          <span className="text-xs sm:text-sm">Reset All Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsDisplay;
