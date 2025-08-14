import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import { User, Lock, AlertCircle, ChevronDown } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser, error } = useAuth();
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
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Check if redirected with an error message
  useEffect(() => {
    if (location.state?.error) {
      setFormError(location.state.error);
      // Clear the error from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!formData.username.trim() || !formData.password.trim()) {
      setFormError(t('please_fill_all_fields'));
      return;
    }
    
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      // Successful login will redirect via the useEffect
    } catch (err) {
      setFormError(error || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="absolute top-4 right-4">
        <button
          className="flex cursor-pointer items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-300 shadow-sm"
          onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
          title={language === 'en' ? t('switchToFrench') : t('switchToEnglish')}
        >
          <span>{getLanguageDisplay(language)}</span>
          <ChevronDown size={18} className="text-blue-600 dark:text-blue-300" style={{minWidth: '18px', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'}} />
        </button>
      </div>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-90 dark:bg-opacity-80 transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/128x128.png" alt="Samet-Home Logo" className="h-16 w-auto" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            {t('sign_in_to_your_account')}
          </h2>
        </div>
        
        {formError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative animate-fadeIn" role="alert">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0 text-red-600 dark:text-red-400" />
              <span className="block sm:inline text-sm font-medium">{formError}</span>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" style={{minWidth: '24px', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'}} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-12 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 shadow-sm"
                  placeholder={t('username')}
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-12 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 shadow-sm"
                  placeholder={t('password')}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('signing_in')}
                </span>
              ) : t('sign_in')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;