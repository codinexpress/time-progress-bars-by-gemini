
import { FEEDBACK_API_APP_KEY } from '../types';

const API_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

/**
 * Helper to encode string to URL-safe Base64 (handles Unicode)
 * Strips padding '=' to be URL path friendly.
 */
function toUrlSafeBase64(str: string): string {
  try {
    // Encode URI component to handle unicode chars correctly in btoa
    const base64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    // Make URL safe: + -> -, / -> _, remove padding =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error("Encoding error", e);
    return "";
  }
}

/**
 * Helper to decode URL-safe Base64 to string (handles Unicode)
 * Handles missing padding or legacy padding chars.
 */
function fromUrlSafeBase64(base64: string): string {
  try {
    // Revert URL safe chars: - -> +, _ -> /
    // Also handle legacy '.' padding if present from previous versions
    let str = base64.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
    
    // Restore padding if missing
    while (str.length % 4) {
      str += '=';
    }

    // Decode
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    // Fallback if it wasn't base64 or valid
    return base64;
  }
}

/**
 * Fetches a numeric value for a given key.
 */
export async function getValue(key: string): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/GetValue/${FEEDBACK_API_APP_KEY}/${key}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });
    if (!response.ok) {
      if (response.status === 404) return 0;
      return null;
    }
    const textValue = await response.text();

    if (textValue === '""' || textValue.trim() === '') return 0;

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
 * Fetches a string value for a given key.
 * Automatically handles Base64 decoding if detected.
 */
export async function getStringValue(key: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/GetValue/${FEEDBACK_API_APP_KEY}/${key}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      return null;
    }
    
    let textValue = await response.text();
    
    // Clean up quotes if the API returns them as JSON strings
    if (textValue.startsWith('"') && textValue.endsWith('"')) {
        try {
            textValue = JSON.parse(textValue);
        } catch (e) {
            // If parse fails, keep original
        }
    }

    // Try to decode if it looks like our custom format or generic string
    if (!textValue.startsWith('{') && !textValue.startsWith('[')) {
       const decoded = fromUrlSafeBase64(textValue);
       // If decoding yielded a JSON-like structure or a readable string, return it.
       // Simple check: if decoded is different, it was likely base64.
       if (decoded !== textValue) {
         return decoded;
       }
    }

    return textValue;
  } catch (error) {
    console.error(`Network error fetching string for key "${key}":`, error);
    return null;
  }
}

/**
 * Updates a numeric value for a given key.
 */
export async function updateValue(key: string, value: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${key}/${String(value)}`, {
      method: 'POST',
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    console.error(`Error updating value for key "${key}":`, error);
    return false;
  }
}

/**
 * Updates a string value for a given key.
 * Uses URL-Safe Base64 encoding to prevent URL path issues.
 */
export async function updateStringValue(key: string, value: string): Promise<boolean> {
  try {
    // 1. Encode to URL-Safe Base64
    const encodedValue = toUrlSafeBase64(value);
    
    if (!encodedValue) {
        throw new Error("Encoding failed");
    }

    // 2. Send
    // Use encodeURIComponent to ensure the Base64 string is treated as a safe path segment.
    const response = await fetch(`${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${key}/${encodeURIComponent(encodedValue)}`, {
      method: 'POST',
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    console.error(`Error updating string for key "${key}":`, error);
    return false;
  }
}
