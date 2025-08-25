import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './languageContext';

// Global translation cache
const translationCache = new Map();

// Preload translations for better performance
const preloadTranslations = async (locale) => {
  if (translationCache.has(locale)) {
    return translationCache.get(locale);
  }

  try {
    const response = await fetch(`/locales/${locale}/common.json`);
    
    if (response.ok) {
      const data = await response.json();
      translationCache.set(locale, data);
      return data;
    } else {
      console.error('Failed to load translations, status:', response.status);
    }
  } catch (error) {
    console.error('Error preloading translations:', error);
  }
  
  return {};
};

export function useTranslation() {
  const { currentLocale } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      // Check cache first
      if (translationCache.has(currentLocale)) {
        setTranslations(translationCache.get(currentLocale));
        return;
      }

      setLoading(true);
      try {
        const data = await preloadTranslations(currentLocale);
        setTranslations(data);
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [currentLocale]);

  // Memoize translation functions for better performance
  const t = useMemo(() => {
    return (key) => {
      const keys = key.split('.');
      let value = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn('Translation not found for key:', key, 'in translations:', translations);
          return key; // Return the key if translation not found
        }
      }
      
      return value || key;
    };
  }, [translations]);

  const tArray = useMemo(() => {
    return (key) => {
      const result = t(key);
      return Array.isArray(result) ? result : [];
    };
  }, [t]);

  return { t, tArray, loading, currentLocale, translations };
}

// Preload both languages on app startup
if (typeof window !== 'undefined') {
  preloadTranslations('en');
  preloadTranslations('ja');
} 