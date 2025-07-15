import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Moon, Sun, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Navbar() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode, language, changeLanguage, toggleSidebar } = useApp();

  const getLanguageDisplay = (lang) => {
    return lang === 'en' ? 'English' : 'Français';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-full px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">{t('appTitle')}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
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
