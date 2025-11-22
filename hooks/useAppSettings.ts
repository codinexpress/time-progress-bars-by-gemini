
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
  // Initialize with logic to detect system preference if no storage exists.
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
      
      return { ...defaultAppSettings, theme: initialTheme };
    }
    return defaultAppSettings;
  })());

  const settings: AppSettings = {
    ...defaultAppSettings,
    ...storedSettings,
    customColors: storedSettings?.customColors || defaultAppSettings.customColors,
    decimalPlaceOverrides: storedSettings?.decimalPlaceOverrides || defaultAppSettings.decimalPlaceOverrides,
    birthDate: storedSettings?.birthDate || defaultAppSettings.birthDate,
  };

  // Sync URL -> State on mount (Deep linking priority)
  // This overrides LocalStorage if a URL parameter is present on load.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlMode = getUrlParam('mode');
      if (isValidMode(urlMode) && urlMode !== storedSettings.visualizationMode) {
        setSettings(prev => ({ ...prev, visualizationMode: urlMode as VisualizationMode }));
      }
    }
  }, []); // Run once on mount

  // Sync State -> URL when changes occur
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
    
    // Reset state
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
