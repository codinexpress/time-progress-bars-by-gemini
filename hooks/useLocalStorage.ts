import { useState, useEffect, useCallback } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
  }
  
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => getStorageValue(key, defaultValue));

  // Update localStorage immediately and synchronously upon any state update
  const setStoredValue = useCallback((action: T | ((val: T) => T)) => {
    setValue(prev => {
      const nextValue = typeof action === 'function' ? (action as (val: T) => T)(prev) : action;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(nextValue));
        }
      } catch (e) {
        console.warn(`Error writing localStorage key "${key}":`, e);
      }
      return nextValue;
    });
  }, [key]);

  // Synchronize on mount and handle multi-tab changes if key changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  }, [key, value]);

  return [value, setStoredValue];
}
