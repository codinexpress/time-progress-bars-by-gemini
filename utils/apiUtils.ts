import { FEEDBACK_API_APP_KEY } from '../types';

const API_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

// Microsoft-IIS / Windows HTTP.sys limits URL path segments to ~200-240 characters.
// We use a safe chunk size of 140 chars to ensure each segment never exceeds path limits.
const CHUNK_SIZE = 140;
const MAX_SAFE_SEGMENT_LEN = 150;

/**
 * Helper to encode string to URL-safe Base64 (handles Unicode & Emojis).
 * Strips padding '=' to be URL path friendly.
 */
function toUrlSafeBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // Make URL safe: + -> -, / -> _, remove padding =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error("Encoding error in toUrlSafeBase64:", e);
    return "";
  }
}

/**
 * Helper to decode URL-safe Base64 to string (handles Unicode & Emojis).
 * Supports raw JSON strings or legacy format gracefully.
 */
function fromUrlSafeBase64(base64: string): string {
  if (!base64 || typeof base64 !== 'string') return '';
  if (base64.startsWith('{') || base64.startsWith('[')) return base64;

  try {
    // Revert URL safe chars: - -> +, _ -> /
    // Also handle legacy '.' padding if present from previous versions
    let str = base64.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
    
    // Restore padding if missing
    while (str.length % 4) {
      str += '=';
    }

    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.warn("Decoding warning in fromUrlSafeBase64 (returning original):", e);
    return base64;
  }
}

/**
 * Fetches a numeric value for a given key.
 */
export async function getValue(key: string): Promise<number | null> {
  const url = `${API_BASE_URL}/GetValue/${FEEDBACK_API_APP_KEY}/${encodeURIComponent(key)}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });
    if (!response.ok) {
      if (response.status === 404) return 0;
      console.warn(`API Warning: GET ${key} returned status ${response.status} (${response.statusText})`);
      return null;
    }
    const textValue = await response.text();

    if (textValue === '""' || textValue.trim() === '' || textValue === 'null') return 0;

    // Attempt to parse as JSON first
    try {
      const jsonParsedValue = JSON.parse(textValue);
      if (typeof jsonParsedValue === 'number') return jsonParsedValue;
      if (typeof jsonParsedValue === 'string') {
        const parsed = parseInt(jsonParsedValue, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch (e) {
      // Fallback for plain text
    }

    const directNumValue = parseInt(textValue, 10);
    return isNaN(directNumValue) ? 0 : directNumValue;

  } catch (error) {
    console.error(`Network error fetching value for key "${key}":`, error);
    return null;
  }
}

/**
 * Internal helper to fetch raw text for a key and remove JSON quotes if any.
 */
async function getRawString(key: string): Promise<string | null> {
  const url = `${API_BASE_URL}/GetValue/${FEEDBACK_API_APP_KEY}/${encodeURIComponent(key)}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn(`API Warning: GET ${key} returned status ${response.status} (${response.statusText})`);
      return null;
    }
    
    let textValue = await response.text();
    
    // Clean up quotes if the API returns them as JSON strings (e.g. "\"value\"")
    if (textValue.startsWith('"') && textValue.endsWith('"')) {
      try {
        textValue = JSON.parse(textValue);
      } catch (e) {
        // If parse fails, keep original
      }
    }

    if (!textValue || textValue === 'null' || textValue === '""') return null;

    return textValue;
  } catch (error) {
    console.error(`Network error fetching string for key "${key}":`, error);
    return null;
  }
}

/**
 * Fetches a string value for a given key.
 * Automatically handles multi-part chunked strings and Base64 decoding.
 */
export async function getStringValue(key: string): Promise<string | null> {
  const raw = await getRawString(key);
  if (!raw) return null;

  // Check if chunked manifest: CHK_<count>
  if (raw.startsWith('CHK_')) {
    const chunkCount = parseInt(raw.slice(4), 10);
    if (!isNaN(chunkCount) && chunkCount > 0) {
      const chunkPromises: Promise<string | null>[] = [];
      for (let i = 0; i < chunkCount; i++) {
        chunkPromises.push(getRawString(`${key}_c${i}`));
      }
      const chunkResults = await Promise.all(chunkPromises);
      const combined = chunkResults.filter(Boolean).join('');
      return fromUrlSafeBase64(combined);
    }
  }

  // If not chunked, decode standard Base64 or plain string
  return fromUrlSafeBase64(raw);
}

/**
 * Updates a numeric value for a given key.
 * Always includes body: '' to prevent HTTP 411 Length Required errors on IIS.
 */
export async function updateValue(key: string, value: number): Promise<boolean> {
  const url = `${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${encodeURIComponent(key)}/${String(value)}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      body: '',
    });
    if (!response.ok) {
      console.error(`API Error: POST ${key} returned ${response.status} ${response.statusText}`);
    }
    return response.ok;
  } catch (error) {
    console.error(`Network error updating value for key "${key}":`, error);
    return false;
  }
}

/**
 * Updates a string value for a given key.
 * Uses URL-Safe Base64 encoding. Automatically splits longer payloads into safe chunks
 * to avoid Microsoft-IIS URL path segment limits (which reject segments > 210 characters with HTTP 400).
 */
export async function updateStringValue(key: string, value: string): Promise<boolean> {
  try {
    const encodedValue = toUrlSafeBase64(value);
    
    if (!encodedValue) {
      throw new Error("Encoding failed: Result was empty");
    }

    // 1. If payload fits safely within IIS segment limit, write directly
    if (encodedValue.length <= MAX_SAFE_SEGMENT_LEN) {
      const url = `${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${encodeURIComponent(key)}/${encodeURIComponent(encodedValue)}`;
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: '',
      });
      
      if (!response.ok) {
        console.error(`API Error: POST String ${key} returned ${response.status} ${response.statusText}`);
      }

      return response.ok;
    }

    // 2. If payload exceeds safe segment length, split into chunks of CHUNK_SIZE
    const chunks: string[] = [];
    for (let i = 0; i < encodedValue.length; i += CHUNK_SIZE) {
      chunks.push(encodedValue.slice(i, i + CHUNK_SIZE));
    }

    // Write all chunks in parallel
    const chunkPromises = chunks.map((chunk, i) => {
      const chunkKey = `${key}_c${i}`;
      const url = `${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${encodeURIComponent(chunkKey)}/${encodeURIComponent(chunk)}`;
      return fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: '',
      }).then(res => res.ok).catch(() => false);
    });

    const results = await Promise.all(chunkPromises);
    if (results.some(ok => !ok)) {
      console.error(`API Error: One or more chunk writes failed for ${key}`);
      return false;
    }

    // Write manifest to root key: CHK_<count> (using URL-safe underscore, no colons or forbidden IIS chars)
    const manifestVal = `CHK_${chunks.length}`;
    const manifestUrl = `${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${encodeURIComponent(key)}/${encodeURIComponent(manifestVal)}`;
    const manResponse = await fetch(manifestUrl, {
      method: 'POST',
      mode: 'cors',
      body: '',
    });

    if (!manResponse.ok) {
      console.error(`API Error: Manifest write failed for ${key} returned ${manResponse.status}`);
    }

    return manResponse.ok;
  } catch (error) {
    console.error(`Network error updating string for key "${key}":`, error);
    return false;
  }
}
