import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppSettings, Theme, TimeUnitId } from '../types';

const defaultAppSettings: AppSettings = {
  theme: 'light',
  weekStartDay: 0,
  visualizationMode: 'bars',
  updateIntervalMs: 200,
  customColors: {},
  globalDecimalPlaces: 2,
  decimalPlaceOverrides: {},
};

export const useAppSettings = () => {
  // Initialize with logic to detect system preference if no storage exists
  const [settings, setSettings] = useLocalStorage<AppSettings>('temporalFluxSettings', (() => {
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
        ...prev.customColors,
        [unitId]: colorHex,
      }
    }));
  }, [setSettings]);

  const updateDecimalOverride = useCallback((unitId: TimeUnitId, value: number | null) => {
    setSettings(prev => {
      const newOverrides = { ...prev.decimalPlaceOverrides };
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