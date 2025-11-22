
/**
 * retrieves a specific query parameter from the URL.
 */
export const getUrlParam = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

/**
 * Updates the URL query parameter without reloading the page.
 * Uses replaceState to update the URL in place.
 */
export const setUrlParam = (key: string, value: string | null) => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  
  window.history.replaceState({}, '', url.toString());
};
