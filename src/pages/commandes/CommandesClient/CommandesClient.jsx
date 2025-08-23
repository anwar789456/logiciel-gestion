import React from 'react';
import { useTranslation } from 'react-i18next';
import CommandesList from '../../../components/CommandesList/CommandesList.jsx';

function CommandesClient() {
  const { t } = useTranslation();

  return (
    <div className="pt-4 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('commandes_client')}
        </h1>
      </div>
      
      <CommandesList />
    </div>
  );
}

export default CommandesClient;