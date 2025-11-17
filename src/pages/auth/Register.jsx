import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import { createUser } from '../../api/user';
import { User, Mail, Lock, AlertCircle, UserPlus, ChevronDown } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
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
          <span>English</span>
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
          <span>Français</span>
        </div>
      );
    }
  };
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee', // Default role is employee
    img_url: '' // Default empty image URL
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Check if user is admin
  if (!isAdmin()) {
    navigate('/');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate form
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError(t('please_fill_all_fields'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwords_do_not_match'));
      return;
    }
    
    setLoading(true);
    try {
      // Create new user
      await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        img_url: formData.img_url
      });
      
      setSuccess(true);
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        img_url: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || t('registration_failed'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        <button
          className="flex cursor-pointer items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
          title={language === 'en' ? t('switchToFrench') : t('switchToEnglish')}
        >
          <span>{getLanguageDisplay(language)}</span>
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UserPlus className="mr-2" />
            {t('register_new_employee')}
          </h2>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="block sm:inline">{t('employee_registered_successfully')}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('username')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder={t('enter_username')}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder={t('enter_email')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('password')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder={t('enter_password')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('confirm_password')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder={t('confirm_password')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('role')}
              </label>
              <select
                name="role"
                id="role"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="employee">{t('employee')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="img_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('profile_image_url')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="img_url"
                  id="img_url"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="https://example.com/image.jpg"
                  value={formData.img_url}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('registering') : t('register')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;