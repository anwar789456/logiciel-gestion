import React from 'react';
import { useTranslation } from 'react-i18next';

function BonDeSortie() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('bon_de_sortie')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          {t('page_under_construction')}
        </p>
      </div>
    </div>
  );
}

export default BonDeSortie;