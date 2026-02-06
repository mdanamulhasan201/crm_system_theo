/**
 * Utility functions for safe toast notifications
 * Ensures that objects are never passed directly to toast, preventing React rendering errors
 */

/**
 * Safely converts a value to a string for use in toast notifications
 * Handles objects, arrays, and other non-string values gracefully
 */
export const safeToastMessage = (message: any): string => {
  if (message == null) {
    return 'An error occurred';
  }

  // If it's already a string, return it
  if (typeof message === 'string') {
    return message;
  }

  // If it's an object with title and description, format it nicely
  if (typeof message === 'object') {
    if ('title' in message && 'description' in message) {
      const title = safeToastMessage(message.title);
      const desc = safeToastMessage(message.description);
      return desc ? `${title}: ${desc}` : title;
    }
    
    // If it's an object with just a message property
    if ('message' in message) {
      return safeToastMessage(message.message);
    }
    
    // If it's an object with an error property
    if ('error' in message) {
      return safeToastMessage(message.error);
    }
    
    // For other objects, try to stringify (but handle circular references)
    try {
      return JSON.stringify(message);
    } catch {
      return 'An error occurred';
    }
  }

  // For arrays, join them
  if (Array.isArray(message)) {
    return message.map(item => safeToastMessage(item)).join(', ');
  }

  // For other types, convert to string
  try {
    return String(message);
  } catch {
    return 'An error occurred';
  }
};

