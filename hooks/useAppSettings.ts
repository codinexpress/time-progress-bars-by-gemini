
import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppSettings, Theme, TimeUnitId, VisualizationMode } from '../types';
import { getUrlParam, setUrlParam } from '../utils/urlUtils';

const defaultAppSettings: AppSettings = {
  theme: 'light',
  weekStartDay: 0,
  visualizationMode: 'bars',
  updateIntervalMs: 100,
  customColors: {},
  globalDecimalPlaces: 2,
  decimalPlaceOverrides: {},
  birthDate: '1990-01-01',
};

const isValidMode = (mode: string | null): mode is VisualizationMode => {
  const validModes = ['bars', 'orbits', 'pixels', 'spiral', 'hourglass', 'radialSlice'];
  return mode !== null && validModes.includes(mode);
};

export const useAppSettings = () => {
  // Initialize with logic to detect system preference if no storage exists,
  // BUT prioritize URL params for specific settings if present.
  const [storedSettings, setSettings] = useLocalStorage<AppSettings>('temporalFluxSettings', (() => {
    if (typeof window !== 'undefined') {
      const storedThemeKey = localStorage.getItem('theme') as Theme | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let initialTheme: Theme = 'light';
      if (storedThemeKey === 'dark' || storedThemeKey === 'light') {
        initialTheme = storedThemeKey;
      } else if (systemPrefersDark) {
        initialTheme = 'dark';
      }

      // Check URL for visualization mode override
      const urlMode = getUrlParam('mode');
      const initialMode = isValidMode(urlMode) ? (urlMode as VisualizationMode) : defaultAppSettings.visualizationMode;

      // Note: We return the object that will be merged. 
      // If LocalStorage exists, useLocalStorage will use that instead of this return value 
      // unless we explicitly handle the merge logic inside the hook initialization or 
      // if we manually override it after mount. 
      // However, useLocalStorage (custom hook) reads LS first. 
      // To ensure URL priority, we handle the override in the next step (settings merge).
      
      return { ...defaultAppSettings, theme: initialTheme, visualizationMode: initialMode };
    }
    return defaultAppSettings;
  })());

  // Merge stored settings with defaults, but also apply immediate URL overrides to the active state
  // This ensures if I link ?mode=pixels, it shows pixels even if my LS says 'bars'.
  const settings: AppSettings = {
    ...defaultAppSettings,
    ...storedSettings,
    customColors: storedSettings?.customColors || defaultAppSettings.customColors,
    decimalPlaceOverrides: storedSettings?.decimalPlaceOverrides || defaultAppSettings.decimalPlaceOverrides,
    birthDate: storedSettings?.birthDate || defaultAppSettings.birthDate,
  };

  // Apply URL override for mode effectively
  const urlMode = typeof window !== 'undefined' ? getUrlParam('mode') : null;
  if (isValidMode(urlMode) && settings.visualizationMode !== urlMode) {
    // This is a temporary override for the render cycle, 
    // but we also want to update the state so it persists in LS
    settings.visualizationMode = urlMode as VisualizationMode;
  }

  // Sync state back to URL when it changes
  useEffect(() => {
    setUrlParam('mode', settings.visualizationMode);
  }, [settings.visualizationMode]);

  // Effect to apply theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', settings.theme);
  }, [settings.theme]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const updateColor = useCallback((unitId: string, colorHex: string) => {
    setSettings(prev => ({
      ...prev,
      customColors: {
        ...(prev.customColors || {}),
        [unitId]: colorHex,
      }
    }));
  }, [setSettings]);

  const updateDecimalOverride = useCallback((unitId: TimeUnitId, value: number | null) => {
    setSettings(prev => {
      const newOverrides = { ...(prev.decimalPlaceOverrides || {}) };
      if (value === null) {
        delete newOverrides[unitId];
      } else {
        newOverrides[unitId] = value;
      }
      return { ...prev, decimalPlaceOverrides: newOverrides };
    });
  }, [setSettings]);

  const resetColors = useCallback(() => {
    setSettings(prev => ({ ...prev, customColors: {} }));
  }, [setSettings]);

  const resetAllSettings = useCallback(() => {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    // Remove URL params on reset
    setUrlParam('mode', null);
    setSettings({ ...defaultAppSettings, theme });
  }, [setSettings]);

  return {
    settings,
    updateSetting,
    updateColor,
    updateDecimalOverride,
    resetColors,
    resetAllSettings
  };
};
