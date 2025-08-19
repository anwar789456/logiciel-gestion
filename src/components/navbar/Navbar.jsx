import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Moon, SunMedium, ChevronDown, Bolt, LogOut, User, UserPlus, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode, language, changeLanguage } = useApp();
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const logoPath = isDarkMode ? '/logo-samet-home-dark-mode.png' : '/logo-samet-home.png';
  
  // Close the profile menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    navigate('/dashboard/settings');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-full px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">            
            <img 
              src={logoPath} 
              alt="Samet Home Logo" 
              className="h-10 w-auto"
            />
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-blue-500 dark:border-blue-400 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-300 hover:scale-105"
                  title={currentUser.name || currentUser.username}
                >
                  {currentUser.img_url ? (
                    <img 
                      src={currentUser.img_url} 
                      alt={currentUser.name || currentUser.username} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  )}
                </button>
                
                {/* Profile dropdown menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentUser.name || currentUser.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isAdmin() ? t('adminRole') : t('employeeRole')}
                      </p>
                    </div>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setProfileMenuOpen(false);
                        navigate('/dashboard/profile');
                      }}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Settings size={16} className="mr-2" />
                      {t('profile')}
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      {t('logout')}
                    </a>

                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={handleSettingsClick}
              className='p-2 rounded-md cursor-pointer text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none'
              title={t('settings')}
            >
              <Bolt size={20} />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md cursor-pointer text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              title={isDarkMode ? t('lightMode') : t('darkMode')}
            >
              {isDarkMode ? <SunMedium size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button
                className="flex cursor-pointer items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
                title={language === 'en' ? t('switchToFrench') : t('switchToEnglish')}
              >
                <span>{getLanguageDisplay(language)}</span>
                <ChevronDown size={16} />
              </button>
            </div>
            
            {/* Logout button removed - now in profile dropdown */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;