import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useUrlState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get(key);
      return param ? JSON.parse(decodeURIComponent(param)) : initialValue;
    } catch (error) {
      console.warn(`Error reading URL parameter "${key}":`, error);
      return initialValue;
    }
  });

  const setUrlValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      const url = new URL(window.location.href);
      if (valueToStore === initialValue) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, encodeURIComponent(JSON.stringify(valueToStore)));
      }
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn(`Error setting URL parameter "${key}":`, error);
    }
  };

  return [value, setUrlValue] as const;
}