import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Moon, SunMedium, ChevronDown, Bolt } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Navbar() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode, language, changeLanguage } = useApp();
  const navigate = useNavigate();

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

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-full px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">            
            <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
              {t('appTitle')}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            
            <button 
              onClick={handleSettingsClick}
              className='p-2 rounded-md cursor-pointer text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none'
              title={t('settings')}
            >
              <Bolt size={24} />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md cursor-pointer text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isDarkMode ? <SunMedium size={24} /> : <Moon size={24} />}
            </button>

            <div className="relative">
              <button
                className="flex cursor-pointer items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
              >
                <span>{getLanguageDisplay(language)}</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;