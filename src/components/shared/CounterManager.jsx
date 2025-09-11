import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, FileText, Receipt, Truck, CreditCard } from 'lucide-react';
import { getDevisCounter, updateDevisCounter } from '../../api/devisCompteur';
import { getFactureCounter, updateFactureCounter } from '../../api/factureCompteur';
import { getBonLivraisonCounter, updateBonLivraisonCounter } from '../../api/bonLivraisonCompteur';
import { getRecuPaiementCounter, updateRecuPaiementCounter } from '../../api/recuPaiementCompteur';

const CounterManager = () => {
  const [counters, setCounters] = useState({
    devis: { value: '', loading: false, error: null },
    facture: { value: '', loading: false, error: null },
    bonLivraison: { value: '', loading: false, error: null },
    recuPaiement: { value: '', loading: false, error: null }
  });

  const [saving, setSaving] = useState({
    devis: false,
    facture: false,
    bonLivraison: false,
    recuPaiement: false
  });

  const counterConfigs = [
    {
      key: 'devis',
      title: 'Compteur Devis',
      icon: FileText,
      color: 'blue',
      fetchFn: getDevisCounter,
      updateFn: updateDevisCounter,
      fieldName: 'devisComptValue'
    },
    {
      key: 'facture',
      title: 'Compteur Factures',
      icon: Receipt,
      color: 'green',
      fetchFn: getFactureCounter,
      updateFn: updateFactureCounter,
      fieldName: 'factureComptValue'
    },
    {
      key: 'bonLivraison',
      title: 'Compteur Bons de Livraison',
      icon: Truck,
      color: 'orange',
      fetchFn: getBonLivraisonCounter,
      updateFn: updateBonLivraisonCounter,
      fieldName: 'bonLivraisonComptValue'
    },
    {
      key: 'recuPaiement',
      title: 'Compteur Reçus de Paiement',
      icon: CreditCard,
      color: 'purple',
      fetchFn: getRecuPaiementCounter,
      updateFn: updateRecuPaiementCounter,
      fieldName: 'recupaiementcompt'
    }
  ];

  useEffect(() => {
    fetchAllCounters();
  }, []);

  const fetchAllCounters = async () => {
    for (const config of counterConfigs) {
      await fetchCounter(config);
    }
  };

  const fetchCounter = async (config) => {
    setCounters(prev => ({
      ...prev,
      [config.key]: { ...prev[config.key], loading: true, error: null }
    }));

    try {
      const data = await config.fetchFn();
      const value = config.key === 'recuPaiement' 
        ? data[config.fieldName]?.toString() || '1'
        : data[config.fieldName] || '1';
      
      setCounters(prev => ({
        ...prev,
        [config.key]: { value, loading: false, error: null }
      }));
    } catch (error) {
      console.error(`Error fetching ${config.key} counter:`, error);
      setCounters(prev => ({
        ...prev,
        [config.key]: { value: '1', loading: false, error: 'Erreur de chargement' }
      }));
    }
  };

  const handleCounterChange = (key, value) => {
    setCounters(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const saveCounter = async (config) => {
    const { key } = config;
    const value = counters[key].value;

    if (!value || value.trim() === '' || parseInt(value) < 1) {
      alert('Veuillez entrer une valeur valide (nombre positif)');
      return;
    }

    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      const updateValue = config.key === 'recuPaiement' 
        ? parseInt(value) 
        : value.toString();
      
      await config.updateFn(updateValue);
      
      setCounters(prev => ({
        ...prev,
        [key]: { ...prev[key], error: null }
      }));
      
      alert(`Compteur ${config.title.toLowerCase()} mis à jour avec succès !`);
    } catch (error) {
      console.error(`Error updating ${key} counter:`, error);
      setCounters(prev => ({
        ...prev,
        [key]: { ...prev[key], error: 'Erreur de sauvegarde' }
      }));
      alert(`Erreur lors de la mise à jour du compteur ${config.title.toLowerCase()}`);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const resetCounter = (config) => {
    if (window.confirm(`Êtes-vous sûr de vouloir remettre le compteur ${config.title.toLowerCase()} à 1 ?`)) {
      handleCounterChange(config.key, '1');
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
      green: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
      orange: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800',
      purple: 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800'
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      orange: 'text-orange-600 dark:text-orange-400',
      purple: 'text-purple-600 dark:text-purple-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Gestion des Compteurs Documents
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {counterConfigs.map((config) => {
          const IconComponent = config.icon;
          const counter = counters[config.key];
          const isSaving = saving[config.key];

          return (
            <div
              key={config.key}
              className={`p-6 rounded-lg border-2 ${getColorClasses(config.color)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-6 w-6 ${getIconColorClasses(config.color)}`} />
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                    {config.title}
                  </h4>
                </div>
                {counter.loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valeur actuelle du compteur
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={counter.value}
                    onChange={(e) => handleCounterChange(config.key, e.target.value)}
                    disabled={counter.loading || isSaving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    placeholder="Entrez la valeur du compteur"
                  />
                  {counter.error && (
                    <p className="text-red-500 text-sm mt-1">{counter.error}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => saveCounter(config)}
                    disabled={counter.loading || isSaving || !counter.value}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  
                  <button
                    onClick={() => resetCounter(config)}
                    disabled={counter.loading || isSaving}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Remettre à 1"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Le prochain document utilisera cette valeur comme numéro
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800">
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Comment ça fonctionne
            </h4>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Définissez la valeur souhaitée pour chaque compteur</li>
                <li>Le prochain document créé utilisera cette valeur exacte</li>
                <li>Le compteur s'incrémente automatiquement après chaque création</li>
                <li>Exemple: Compteur = 5 → Prochain devis = 5/25</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterManager;
