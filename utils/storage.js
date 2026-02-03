// utils/storage.js
/**
 * LocalStorage utility wrapper
 */
const storage = {
  /**
   * Get item from localStorage
   */
  getItem(key) {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item to localStorage
   */
  setItem(key, value) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item to storage: ${key}`, error);
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  },

  /**
   * Get user session
   */
  getUserSession() {
    return this.getItem('userSession');
  },

  /**
   * Set user session
   */
  setUserSession(session) {
    this.setItem('userSession', session);
  },

  /**
   * Clear user session
   */
  clearUserSession() {
    this.removeItem('userSession');
  },

  /**
   * Get language preference
   */
  getLanguagePreference() {
    return this.getItem('languagePreference') || 'en';
  },

  /**
   * Set language preference
   */
  setLanguagePreference(lang) {
    this.setItem('languagePreference', lang);
  },
};

export default storage;
