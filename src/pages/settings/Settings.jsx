import React from 'react';
import { useTranslation } from 'react-i18next';
import BackupButton from '../../components/BackupButton';

function Settings() {
  const { t } = useTranslation();

  return (
    <div className='px-8 pt-4'>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('settings')}
      </h1>
      
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Paramètres Généraux
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Configure your application settings here.
          </p>
        </div>

        {/* Backup Section */}
        <BackupButton />
      </div>
    </div>
  );
}

export default Settings;