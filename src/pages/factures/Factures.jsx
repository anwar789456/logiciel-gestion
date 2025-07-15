import React from 'react';
import { useTranslation } from 'react-i18next';

function Factures() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('receipts')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">
          View and manage your receipts here.
        </p>
      </div>
    </div>
  );
}

export default Factures;