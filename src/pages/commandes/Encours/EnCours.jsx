import React from 'react';
import { useTranslation } from 'react-i18next';
import CommandesList from '../../../components/CommandesList/CommandesList.jsx';

function CommandesEnCours() {
  const { t } = useTranslation();

  return (
    <div className="p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('commandes_en_cours')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gérez et suivez toutes vos commandes
        </p>
      </div>
      
      <CommandesList />
    </div>
  );
}

export default CommandesEnCours;