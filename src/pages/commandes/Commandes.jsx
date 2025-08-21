import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clipboard, Clock, History } from 'lucide-react';

function Commandes() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigateToEnCours = () => {
    navigate('/commandes-en-cours');
  };

  const handleNavigateToHistorique = () => {
    navigate('/commandes-fiche');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('commandes')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('commandes_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={handleNavigateToEnCours}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-4">
            <Clock className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('commandes_en_cours')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {t('commandes_en_cours_description')}
          </p>
        </div>

        <div 
          onClick={handleNavigateToHistorique}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-4">
            <History className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('historique_commandes')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {t('historique_commandes_description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Commandes;