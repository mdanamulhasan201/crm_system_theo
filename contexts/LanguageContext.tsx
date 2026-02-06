'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
};

const LANGUAGE_STORAGE_KEY = 'tdhaemoi_selected_language';

// Get initial language from localStorage or default to 'de'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang && (savedLang === 'de' || savedLang === 'en')) {
      return savedLang;
    }
  }
  return 'de';
};

const LanguageContext = createContext<LanguageContextType>({ selectedLang: 'de', setSelectedLang: () => { } });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with function to avoid calling getInitialLanguage on every render
  const [selectedLang, setSelectedLangState] = useState<string>(() => getInitialLanguage());

  // Sync with localStorage on mount (for SSR/hydration)
  useEffect(() => {
    const savedLang = getInitialLanguage();
    if (savedLang !== selectedLang) {
      setSelectedLangState(savedLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to sync with localStorage

  // Custom setter that also saves to localStorage
  const setSelectedLang = (lang: string) => {
    setSelectedLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      
      // Update Google Translate if available
      const waitForGoogleTranslate = setInterval(() => {
        if (
          typeof window !== 'undefined' &&
          window.google &&
          window.google.translate &&
          typeof window.google.translate.TranslateElement === 'function'
        ) {
          const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (selectElement) {
            clearInterval(waitForGoogleTranslate);
            try {
              selectElement.value = lang;
              selectElement.dispatchEvent(new Event('change'));
            } catch (error) {
              console.error('Error updating Google Translate language:', error);
            }
          }
        }
      }, 100);

      setTimeout(() => clearInterval(waitForGoogleTranslate), 5000);
    }
  };

  return (
    <LanguageContext.Provider value={{ selectedLang, setSelectedLang }}>
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