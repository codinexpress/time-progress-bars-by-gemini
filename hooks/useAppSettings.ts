
import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppSettings, SectionId, Theme, TimeUnitId, VisualizationMode } from '../types';
import { getUrlParam, setUrlParam } from '../utils/urlUtils';
import { DEFAULT_PROGRESS_CONFIGS } from '../config/progressConfig';

const defaultAppSettings: AppSettings = {
  theme: 'light',
  weekStartDay: 0,
  visualizationMode: 'bars',
  updateIntervalMs: 100,
  customColors: {},
  globalDecimalPlaces: 2,
  decimalPlaceOverrides: {},
  birthDate: '1990-01-01',
  timezone: 'auto',
  hiddenUnits: [],
  hiddenSections: [],
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
    timezone: storedSettings?.timezone || defaultAppSettings.timezone,
    hiddenUnits: Array.isArray(storedSettings?.hiddenUnits) ? storedSettings.hiddenUnits : [],
    hiddenSections: Array.isArray(storedSettings?.hiddenSections) ? storedSettings.hiddenSections : [],
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
    setSettings(prev => ({ ...defaultAppSettings, ...prev, [key]: value }));
  }, [setSettings]);

  const updateColor = useCallback((unitId: string, colorHex: string) => {
    setSettings(prev => {
      const base = { ...defaultAppSettings, ...prev };
      return {
        ...base,
        customColors: {
          ...(base.customColors || {}),
          [unitId]: colorHex,
        }
      };
    });
  }, [setSettings]);

  const updateDecimalOverride = useCallback((unitId: TimeUnitId, value: number | null) => {
    setSettings(prev => {
      const base = { ...defaultAppSettings, ...prev };
      const newOverrides = { ...(base.decimalPlaceOverrides || {}) };
      if (value === null) {
        delete newOverrides[unitId];
      } else {
        newOverrides[unitId] = value;
      }
      return { ...base, decimalPlaceOverrides: newOverrides };
    });
  }, [setSettings]);

  const toggleUnitVisibility = useCallback((unitId: TimeUnitId) => {
    setSettings(prev => {
      const base = { ...defaultAppSettings, ...prev };
      const currentHidden = Array.isArray(base.hiddenUnits) ? base.hiddenUnits : [];
      const isHidden = currentHidden.includes(unitId);
      const nextHidden = isHidden 
        ? currentHidden.filter(id => id !== unitId)
        : [...currentHidden, unitId];
      return { ...base, hiddenUnits: nextHidden };
    });
  }, [setSettings]);

  const toggleSectionVisibility = useCallback((sectionId: SectionId) => {
    setSettings(prev => {
      const base = { ...defaultAppSettings, ...prev };
      const currentHidden = Array.isArray(base.hiddenSections) ? base.hiddenSections : [];
      const isHidden = currentHidden.includes(sectionId);
      const nextHidden = isHidden
        ? currentHidden.filter(s => s !== sectionId)
        : [...currentHidden, sectionId];
      return { ...base, hiddenSections: nextHidden };
    });
  }, [setSettings]);

  const showAllCards = useCallback(() => {
    setSettings(prev => ({
      ...defaultAppSettings,
      ...prev,
      hiddenUnits: [],
      hiddenSections: []
    }));
  }, [setSettings]);

  const hideAllCards = useCallback(() => {
    const allSections: SectionId[] = ['micro', 'cyclical', 'macro', 'mega'];
    setSettings(prev => ({
      ...defaultAppSettings,
      ...prev,
      hiddenSections: allSections
    }));
  }, [setSettings]);

  const showCategoryCards = useCallback((sectionId: SectionId) => {
    const categoryUnitIds = DEFAULT_PROGRESS_CONFIGS.filter(c => c.section === sectionId).map(c => c.id);
    setSettings(prev => {
      const base = { ...defaultAppSettings, ...prev };
      const currentHiddenSections = Array.isArray(base.hiddenSections) ? base.hiddenSections : [];
      const currentHiddenUnits = Array.isArray(base.hiddenUnits) ? base.hiddenUnits : [];
      return {
        ...base,
        hiddenSections: currentHiddenSections.filter(s => s !== sectionId),
        hiddenUnits: currentHiddenUnits.filter(u => !categoryUnitIds.includes(u)),
      };
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
    toggleUnitVisibility,
    toggleSectionVisibility,
    showAllCards,
    hideAllCards,
    showCategoryCards,
    resetColors,
    resetAllSettings
  };
};
