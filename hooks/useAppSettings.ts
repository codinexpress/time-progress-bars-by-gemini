
import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppSettings, Theme, TimeUnitId } from '../types';

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

export const useAppSettings = () => {
  // Initialize with logic to detect system preference if no storage exists
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

  // Merge stored settings with defaults to ensure all properties exist (handles migration from older versions)
  const settings: AppSettings = {
    ...defaultAppSettings,
    ...storedSettings,
    customColors: storedSettings?.customColors || defaultAppSettings.customColors,
    decimalPlaceOverrides: storedSettings?.decimalPlaceOverrides || defaultAppSettings.decimalPlaceOverrides,
    birthDate: storedSettings?.birthDate || defaultAppSettings.birthDate,
  };

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
