import React from 'react';
import { useTranslation } from 'react-i18next';

function Settings() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('settings')}
      </h1>
    </div>
  );
}

export default Settings;