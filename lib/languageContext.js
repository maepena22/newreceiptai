import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Set initial locale from router
    if (router.locale) {
      setCurrentLocale(router.locale);
    }
  }, [router.locale]);

  const changeLanguage = (newLocale) => {
    setCurrentLocale(newLocale);
    
    // Get current path and query
    const { pathname, query, asPath } = router;
    
    // Navigate to the same page with new locale
    router.push(
      {
        pathname,
        query,
      },
      asPath,
      { locale: newLocale }
    );
  };

  const value = {
    currentLocale,
    changeLanguage,
    isEnglish: currentLocale === 'en',
    isJapanese: currentLocale === 'ja',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 