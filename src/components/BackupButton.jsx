import React, { useState, useEffect } from 'react';
import { Download, Database, AlertCircle, CheckCircle, FileText, FileSpreadsheet, FileImage, Settings } from 'lucide-react';
import { getBackupInfo, exportCollections } from '../api/backup';

const BackupButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load backup info on component mount
  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const info = await getBackupInfo();
      setBackupInfo(info);
      // Select all collections by default
      setSelectedCollections(info.collections.map(col => col.name));
      setError(null);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Serveur backend non disponible. Veuillez démarrer le serveur backend.');
      } else {
        setError('Impossible de charger les informations de sauvegarde');
      }
      console.error('Error loading backup info:', err);
    }
  };

  const handleExport = async () => {
    if (selectedCollections.length === 0) {
      setError('Veuillez sélectionner au moins une collection');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await exportCollections(selectedCollections, selectedFormat);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Serveur backend non disponible. Veuillez démarrer le serveur backend.');
      } else {
        setError('Erreur lors de l\'export des données');
      }
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionToggle = (collectionName) => {
    setSelectedCollections(prev => 
      prev.includes(collectionName)
        ? prev.filter(name => name !== collectionName)
        : [...prev, collectionName]
    );
  };

  const handleSelectAll = () => {
    if (backupInfo) {
      setSelectedCollections(backupInfo.collections.map(col => col.name));
    }
  };

  const handleSelectNone = () => {
    setSelectedCollections([]);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'json':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatDescription = (format) => {
    switch (format) {
      case 'json':
        return 'Fichiers JSON dans une archive ZIP';
      case 'excel':
        return 'Fichier Excel avec feuilles séparées';
      case 'pdf':
        return 'Rapport PDF avec aperçu des données';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Sauvegarde de la Base de Données
          </h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4 mr-1" />
          {showAdvanced ? 'Simple' : 'Avancé'}
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Exportez vos données dans différents formats selon vos besoins.
      </p>

      {/* Advanced Options */}
      {showAdvanced && backupInfo && (
        <div className="mb-6 space-y-4">
          {/* Collection Selection */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sélectionner les collections:
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded"
                >
                  Tout
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded"
                >
                  Aucun
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {backupInfo.collections.map((collection) => (
                <label key={collection.name} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collection.name)}
                    onChange={() => handleCollectionToggle(collection.name)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {collection.displayName || collection.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({collection.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Format d'export:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['json', 'excel', 'pdf'].map((format) => (
                <label key={format} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={selectedFormat === format}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {getFormatIcon(format)}
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {format === 'json' ? 'JSON' : format === 'excel' ? 'Excel' : 'PDF'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getFormatDescription(format)}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      {backupInfo && !showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Informations de la base de données:
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Collections:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-white">
                {backupInfo.totalCollections}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total documents:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-white">
                {backupInfo.collections.reduce((sum, col) => sum + col.count, 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-3 mb-4 text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center p-3 mb-4 text-green-800 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Export réalisé avec succès!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={isLoading || selectedCollections.length === 0}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <Download className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Export en cours...' : `Exporter (${selectedCollections.length})`}
        </button>

        <button
          onClick={loadBackupInfo}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
        >
          <Database className="h-4 w-4 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          💡 Choisissez les collections et le format qui correspondent à vos besoins. 
          Les exports JSON incluent toutes les données, Excel est idéal pour l'analyse, 
          et PDF pour les rapports.
        </p>
      </div>
    </div>
  );
};

export default BackupButton;
