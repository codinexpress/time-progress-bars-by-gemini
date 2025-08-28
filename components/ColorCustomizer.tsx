
import React from 'react';
import { ColorCustomizerProps } from '../types';
import { ResetIcon } from './Icons'; // Import ResetIcon

const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  progressConfigs,
  customColors,
  onColorChange,
  onResetColors,
}) => {

  return (
    <div className="space-y-4 p-1">
      {progressConfigs.map((config) => {
        const currentHexColor = customColors[config.id] || config.baseColor;
        return (
          <div 
            key={config.id} 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md bg-slate-100 dark:bg-slate-700/50 shadow"
          >
            <label 
              htmlFor={`color-picker-${config.id}`} 
              className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 sm:mb-0 flex items-center"
            >
              {config.icon({ className: 'w-5 h-5 mr-2', color: currentHexColor })}
              {config.label}:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id={`color-picker-${config.id}`}
                value={currentHexColor}
                onChange={(e) => onColorChange(config.id, e.target.value)}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-md border border-slate-300 dark:border-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-700"
                aria-label={`Select color for ${config.label}`}
                title={`Current color: ${currentHexColor}`}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono select-all" style={{ color: currentHexColor }}>
                {currentHexColor}
              </span>
            </div>
          </div>
        );
      })}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onResetColors}
          className="px-4 py-2 text-xs sm:text-sm rounded-md text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-rose-600 dark:hover:bg-rose-700 transition-colors flex items-center space-x-1.5"
          aria-label="Reset all unit colors to default"
        >
          <ResetIcon className="w-4 h-4" />
          <span>Reset All Colors to Default</span>
        </button>
      </div>
    </div>
  );
};

export default ColorCustomizer;
