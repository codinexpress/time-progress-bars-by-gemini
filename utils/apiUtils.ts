
import { FEEDBACK_API_APP_KEY } from '../types';

const API_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

/**
 * Fetches a numeric value for a given key.
 * Returns the number, 0 if key not found (404) or parsing fails for specific "empty" API responses, 
 * or null for other errors.
 */
export async function getValue(key: string): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/GetValue/${FEEDBACK_API_APP_KEY}/${key}`);
    if (!response.ok) {
      if (response.status === 404) {
        return 0; // Key not found, treat as 0 for numeric counts
      }
      console.error(`API Error (${response.status}) fetching value for key "${key}": ${response.statusText}`);
      return null; // Other HTTP error
    }
    const textValue = await response.text();

    // Handle specific case where API returns literal '""' for uninitialized/empty numeric values
    if (textValue === '""') { 
      return 0; // Interpret as 0 without warning
    }
    
    // Also handle if the API returns an actual empty string (less common for numeric values from this API, but good practice)
    if (textValue.trim() === '') {
        return 0; // Interpret as 0 without warning
    }

    // Attempt to parse as JSON first.
    // This handles:
    // 1. API returns a JSON string representing a number: "\"123\"" -> jsonParsedValue becomes "123" (string)
    // 2. API returns a bare number as a string: "123" -> jsonParsedValue becomes 123 (number)
    // 3. API returns other JSON types: "true", "null", "{\"a\":1}" which are not numbers.
    try {
      const jsonParsedValue = JSON.parse(textValue);
      if (typeof jsonParsedValue === 'number') {
        return jsonParsedValue; // Handles case 2: e.g., textValue was "123" or "1.23"
      }
      // Handles case 1: e.g., textValue was "\"123\"". jsonParsedValue is the string "123"
      if (typeof jsonParsedValue === 'string') {
        const numValueFromString = parseInt(jsonParsedValue, 10);
        if (!isNaN(numValueFromString)) {
          return numValueFromString;
        }
        // If jsonParsedValue is a string but not a number (e.g. "\"abc\""), it will fall through.
      }
      // If jsonParsedValue is any other JSON type (boolean, null, object, array), it will fall through.
    } catch (e) {
      // textValue was not a valid JSON string.
      // This can happen if textValue is an unquoted string like "abc", or a simple number "123"
      // (though many JSON.parse implementations handle "123" fine, converting to number).
      // Fall through to direct parseInt of the original textValue.
    }

    // If JSON parsing failed, or it parsed but didn't yield a usable number (e.g. parsed to a boolean or non-numeric string),
    // try a direct parseInt of the original textValue.
    // This is robust for plain number strings like "123", "0", "-5".
    const directNumValue = parseInt(textValue, 10);
    if (!isNaN(directNumValue)) {
      return directNumValue;
    }
    
    // If all parsing attempts fail (e.g., textValue was "abc", "true", or some other non-numeric string)
    console.warn(`Could not parse value for key "${key}" as number from text: "${textValue}". Defaulting to 0.`);
    return 0;

  } catch (error) { // Catches network errors, or errors from response.text() itself
    console.error(`Network or other error fetching value for key "${key}":`, error);
    return null; // Indicate a more severe fetching problem
  }
}

/**
 * Updates a numeric value for a given key.
 * The API expects a POST request with the value in the URL path.
 * Returns true on success, false on failure.
 */
export async function updateValue(key: string, value: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/UpdateValue/${FEEDBACK_API_APP_KEY}/${key}/${String(value)}`, {
      method: 'POST',
    });
    if (!response.ok) {
      console.error(`API Error (${response.status}) updating value for key "${key}" to ${value}: ${response.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Network or other error updating value for key "${key}" to ${value}:`, error);
    return false;
  }
}
