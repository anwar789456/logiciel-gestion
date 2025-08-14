import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import { ChevronDown } from 'lucide-react';

function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const { language, changeLanguage } = useApp();
  
  const getLanguageDisplay = (lang) => {
    if (lang === 'en') {
      return (
        <div className="flex items-center space-x-2">
          <img 
            src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/us.svg" 
            alt="US Flag" 
            className="w-5 h-4 rounded-sm"
          />
          <span>🇺🇸</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <img 
            src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/fr.svg" 
            alt="French Flag" 
            className="w-5 h-4 rounded-sm"
          />
          <span>🇫🇷</span>
        </div>
      );
    }
  };

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    // Otherwise, redirect to login page
    if (!loading) {
      if (currentUser) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }
  }, [currentUser, loading, navigate]);

  // Show a loading screen while checking authentication status
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <button
          className="flex cursor-pointer items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
          title={language === 'en' ? t('switchToFrench') : t('switchToEnglish')}
        >
          <span>{getLanguageDisplay(language)}</span>
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {t('appTitle')}
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {t('loading')}...
        </p>
      </div>
    </div>
  );
}

export default LandingPage;