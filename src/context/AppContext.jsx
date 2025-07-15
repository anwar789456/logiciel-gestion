import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AppContext = createContext();

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
document.documentElement.setAttribute(
  'data-theme',
  localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ? 'dark'
    : 'light'
);

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem('sidebarOpen') !== 'false'
  );

  // Effect to handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!('theme' in localStorage)) {
        setIsDarkMode(e.matches);
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Effect to update DOM and localStorage when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      localStorage.theme = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      localStorage.theme = 'light';
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language, i18n]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const changeLanguage = (lng) => setLanguage(lng);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        language,
        changeLanguage,
        isSidebarOpen,
        toggleSidebar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};