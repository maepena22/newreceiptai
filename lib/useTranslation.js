import { useState, useEffect } from 'react';
import { useLanguage } from './languageContext';

export function useTranslation() {
  const { currentLocale } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/locales/${currentLocale}/common.json`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          console.error('Failed to load translations');
          setTranslations({});
        }
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [currentLocale]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return value || key;
  };

  const tArray = (key) => {
    const result = t(key);
    return Array.isArray(result) ? result : [];
  };

  return { t, tArray, loading, currentLocale };
} 