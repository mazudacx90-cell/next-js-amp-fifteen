// utils/helpers.js
/**
 * Format date to locale string
 */
export function formatDate(date, locale = 'en-US') {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(locale);
}

/**
 * Format date and time
 */
export function formatDateTime(date, locale = 'en-US') {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString(locale);
}

/**
 * Truncate text
 */
export function truncateText(text, length = 100) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Slugify text
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if string is email
 */
export function isEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get query params
 */
export function getQueryParams(queryString) {
  const params = new URLSearchParams(queryString);
  const obj = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * Merge objects
 */
export function mergeObjects(target, source) {
  return { ...target, ...source };
}

/**
 * Get nested object value
 */
export function getNestedValue(obj, path) {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
  }
  return result;
}
