// lib/i18n/i18n.js
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../constants/language.constants';

let currentLanguage = DEFAULT_LANGUAGE;
let translations = {};

/**
 * Load translation file
 */
async function loadTranslation(lang) {
  try {
    const translation = await import(`../../locales/${lang}.json`);
    return translation.default || translation;
  } catch (error) {
    console.error(`Failed to load translation for ${lang}:`, error);
    return null;
  }
}

/**
 * Initialize i18n
 */
async function init(lang = DEFAULT_LANGUAGE) {
  if (!SUPPORTED_LANGUAGES[lang] && !Object.values(SUPPORTED_LANGUAGES).includes(lang)) {
    console.warn(`Language ${lang} not supported, using ${DEFAULT_LANGUAGE}`);
    lang = DEFAULT_LANGUAGE;
  }

  currentLanguage = lang;
  translations = await loadTranslation(lang);

  if (!translations) {
    console.warn(`Failed to load ${lang}, falling back to ${DEFAULT_LANGUAGE}`);
    currentLanguage = DEFAULT_LANGUAGE;
    translations = await loadTranslation(DEFAULT_LANGUAGE);
  }

  return translations;
}

/**
 * Change language
 */
async function changeLanguage(lang) {
  return init(lang);
}

/**
 * Get current language
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * Get translation by key (supports nested keys with dot notation)
 */
function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  // Replace parameters
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] || match;
    });
  }

  return value;
}

/**
 * Get all translations
 */
function getTranslations() {
  return translations;
}

export default {
  init,
  changeLanguage,
  getLanguage,
  t,
  getTranslations,
};
