import React from 'react';
import { SettingsProps, VisualizationMode, WeekStartDay, TimeUnitId } from '../types';
import {
  SunIcon, MoonIcon, BarsIcon, OrbitIcon, PixelIcon, SpiralIcon, HourglassIcon, RadialSliceIcon, ResetIcon
} from './Icons';
import { DEFAULT_PROGRESS_CONFIGS } from '../config/progressConfig';

const SettingsDisplay: React.FC<SettingsProps> = ({
  settings,
  onSettingChange,
  onResetAllSettings,
  onDecimalOverrideChange,
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
    { value: 200, label: "Fast (200ms)" },
    { value: 500, label: "Medium (500ms)" },
    { value: 1000, label: "Standard (1s)" },
    { value: 2000, label: "Slow (2s)" },
  ];

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
      <div>
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
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            id="updateIntervalSelect"
            value={settings.updateIntervalMs}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value)) {
                onSettingChange('updateIntervalMs', value);
              }
            }}
            className="flex-grow sm:flex-grow-0 px-2 py-1.5 text-xs sm:text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-out"
            aria-label="Select predefined update speed"
          >
            {intervalOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
             {/* Add a custom option if current value is not in predefined list */}
            {!intervalOptions.some(opt => opt.value === settings.updateIntervalMs) && (
                <option value={settings.updateIntervalMs}>
                    Custom ({settings.updateIntervalMs}ms)
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
              } else if (e.target.value === "") { // Allow clearing field before typing new val
                 // Or handle empty string state if needed, for now, no change on empty
              }
            }}
            className="w-20 px-2 py-1.5 text-xs sm:text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Custom update speed in milliseconds"
          />
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">ms</span>
        </div>
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