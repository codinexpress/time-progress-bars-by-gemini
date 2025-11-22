
/**
 * Safely extracts a readable message from an unknown error object.
 * Useful for handling catch(e) blocks where e could be anything.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      return String((error as any).message);
    }
    // Try to stringify if it's an object without message
    try {
      const json = JSON.stringify(error);
      if (json !== '{}') return json;
    } catch (e) {
      // ignore circular structures
    }
  }
  return 'An unexpected error occurred';
};
