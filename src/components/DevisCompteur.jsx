import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Hash, Save, RefreshCw } from 'lucide-react';
import { getDevisCounter, updateDevisCounter } from '../api/devisCompteur';

const DevisCompteur = () => {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCounter();
  }, []);

  const fetchCounter = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDevisCounter();
      setCounter(data);
      setNewValue(data.devisComptValue || '1');
    } catch (error) {
      console.error('Error fetching counter:', error);
      setError('Erreur lors du chargement du compteur');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newValue || newValue.trim() === '') {
      setError('Veuillez entrer une valeur valide');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const updatedCounter = await updateDevisCounter(newValue.trim());
      setCounter(updatedCounter);
      setSuccess('Compteur mis à jour avec succès');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating counter:', error);
      setError('Erreur lors de la mise à jour du compteur');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setNewValue(value);
      setError('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Hash className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          Compteur de Devis
        </h3>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valeur actuelle du compteur
          </label>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {counter?.devisComptValue || '1'}
          </div>
          {counter?.datedeviscompt && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Dernière mise à jour: {new Date(counter.datedeviscompt).toLocaleString('fr-FR')}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="newValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nouvelle valeur
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="newValue"
              value={newValue}
              onChange={handleInputChange}
              placeholder="Entrez la nouvelle valeur"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleSave}
              disabled={saving || !newValue || newValue.trim() === ''}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md">
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Le compteur de devis détermine le numéro du prochain devis qui sera créé.</p>
          <p>Modifiez cette valeur pour ajuster la numérotation des futurs devis.</p>
        </div>
      </div>
    </div>
  );
};

export default DevisCompteur;
