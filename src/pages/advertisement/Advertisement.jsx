import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, AlertCircle } from 'lucide-react';
import { FetchBannerAdvertisement, UpdateBannerAdvertisement } from '../../api/Homepage/BannerAdvertisement';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import Marquee from "react-fast-marquee";

const Advertisement = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    animation: '',
    link_to: '',
    background_color: '#ffffff',
    font_color: '#000000',
    display: 'true'
  });

  useEffect(() => {
    fetchAdvertisement();
  }, []);

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      const data = await FetchBannerAdvertisement();
      if (data) {
        setFormData({
          title: data.title || '',
          animation: data.animation || '',
          link_to: data.link_to || '',
          background_color: data.background_color || '#ffffff',
          font_color: data.font_color || '#000000',
          display: data.display || 'true'
        });
      }
    } catch (error) {
      console.error('Error fetching advertisement:', error);
      toast.error(t('error_fetching_advertisement'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error(t('title_required'));
      return;
    }

    try {
      setSaving(true);
      await UpdateBannerAdvertisement(formData);
      toast.success(t('advertisement_updated_successfully'));
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast.error(t('error_updating_advertisement'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('advertisement')}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('advertisement_description')}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* Display Toggle - Top Right */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.display === 'oui' ? t('visible') : t('hidden')}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, display: prev.display === 'oui' ? 'non' : 'oui' }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.display === 'oui' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.display === 'oui' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('enter_advertisement_title')}
                  required
                />
              </div>

              {/* Animation */}
              <div>
                <label htmlFor="animation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animation')}
                </label>
                <select
                  id="animation"
                  name="animation"
                  value={formData.animation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('no_animation')}</option>
                  <option value="slide">{t('slide')}</option>
                </select>
              </div>

              {/* Link To */}
              <div>
                <label htmlFor="link_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('link_to')}
                </label>
                <input
                  type="text"
                  id="link_to"
                  name="link_to"
                  value={formData.link_to}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('enter_link_url')}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('link_to_description')}
                </p>
              </div>

              {/* Colors Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Background Color */}
                <div>
                  <label htmlFor="background_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('background_color')}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="background_color"
                      name="background_color"
                      value={formData.background_color}
                      onChange={handleInputChange}
                      className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                {/* Font Color */}
                <div>
                  <label htmlFor="font_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('font_color')}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="font_color"
                      name="font_color"
                      value={formData.font_color}
                      onChange={handleInputChange}
                      className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.font_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, font_color: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('preview')}
                </h3>
                {formData.animation === 'slide' ? (
                  <Marquee
                    pauseOnHover={false}
                    gradient={false}
                    speed={50}
                    style={{
                      backgroundColor: formData.background_color,
                      color: formData.font_color,
                      padding: '10px 20px'
                    }}
                  >
                    <p 
                      className="text-[13px]"
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontStyle: 'normal',
                        fontWeight: 300,
                        letterSpacing: '.2em',
                        margin: 0,
                        paddingRight: '50px'
                      }}
                    >
                      {formData.title || t('advertisement_preview_placeholder')}
                    </p>
                  </Marquee>
                ) : (
                  <div 
                    className="py-[10px] px-[20px] text-center"
                    style={{
                      backgroundColor: formData.background_color,
                      color: formData.font_color
                    }}
                  >
                    <p 
                      className="text-[13px]"
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontStyle: 'normal',
                        fontWeight: 300,
                        letterSpacing: '.2em'
                      }}
                    >
                      {formData.title || t('advertisement_preview_placeholder')}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <Save size={18} />
                  <span>{saving ? t('saving') : t('save_changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Advertisement;
