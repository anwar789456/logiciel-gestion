import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Key, Save, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    img_url: '',
    bank: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Initialize form with current user data
    setFormData({
      username: currentUser.username || '',
      email: currentUser.email || '',
      password: '',
      confirmPassword: '',
      img_url: currentUser.img_url || '',
      bank: currentUser.bank || ''
    });
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
    setError('');
    setSuccess(false);
    
    // Validate passwords if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError(t('passwords_do_not_match'));
      return;
    }
    
    // Validate username
    if (!formData.username.trim()) {
      setError(t('username_required'));
      return;
    }
    
    // Prepare the data to send to the API
    const userData = {
      username: formData.username.trim(),
      img_url: formData.img_url,
      bank: formData.bank
    };
    
    // Only include password if it was changed
    if (formData.password) {
      userData.password = formData.password;
    }
    
    // Include other fields from the current user that we're not changing
    if (currentUser.userID) userData.userID = currentUser.userID;
    if (currentUser.role) userData.role = currentUser.role;
    if (currentUser._id) userData._id = currentUser._id;
    
    setLoading(true);
    try {
      // Call the API to update the user profile
      const updatedUser = await updateProfile(userData);
      
      // Show success message
      setSuccess(true);
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      console.log('Profile updated successfully:', updatedUser);
    } catch (err) {
      setError(t('update_profile_failed'));
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700">
          <h2 className="text-xl font-bold text-white">{t('profile')}</h2>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative animate-fadeIn" role="alert">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="block sm:inline text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg relative animate-fadeIn" role="alert">
              <span className="block sm:inline">{t('profile_updated_successfully')}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="mb-4">
                  <div className="w-32 h-32 rounded-full border-2 border-blue-500 dark:border-blue-400 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {formData.img_url ? (
                      <img 
                        src={formData.img_url} 
                        alt={formData.username} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="img_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile_image_url')}
                  </label>
                  <input
                    id="img_url"
                    name="img_url"
                    type="text"
                    value={formData.img_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('username')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('bank')}
                  </label>
                  <input
                    id="bank"
                    name="bank"
                    type="text"
                    value={formData.bank}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('new_password')} ({t('leave_blank_to_keep_current')})
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('confirm_new_password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving')}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    {t('save_changes')}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;