import React, { useState, useEffect } from 'react';
import { Download, FileText, X } from 'lucide-react';
import { getBonLivraisonById, downloadBonLivraisonPDF } from '../../api/bonLivraisonApi';

const BonLivraisonViewer = ({ bonLivraison, onEdit, onBack }) => {
  const [error, setError] = useState('');

  const handleDownloadPDF = async () => {
    try {
      await downloadBonLivraisonPDF(bonLivraison._id);
    } catch (error) {
      setError('Erreur lors du téléchargement du PDF');
      console.error('Error downloading PDF:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!bonLivraison) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bon de livraison N° {bonLivraison.bonLivraisonNumber}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onEdit && onEdit(bonLivraison)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Modifier
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Retour
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informations générales */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations générales
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(bonLivraison.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Statut:</span>
                <span className="ml-2">{getStatusBadge(bonLivraison.status)}</span>
              </div>
              {bonLivraison.deliveryDate && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date de livraison:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(bonLivraison.deliveryDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations client
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white capitalize">
                  {bonLivraison.clientType}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Nom:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {bonLivraison.clientName}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Téléphone:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {bonLivraison.clientPhone}
                </span>
              </div>
              {bonLivraison.email && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {bonLivraison.email}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Adresse:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {bonLivraison.clientAddress}
                </span>
              </div>
              {bonLivraison.clientType === 'entreprise' && (
                <>
                  {bonLivraison.companyName && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Entreprise:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {bonLivraison.companyName}
                      </span>
                    </div>
                  )}
                  {bonLivraison.rc && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">RC:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {bonLivraison.rc}
                      </span>
                    </div>
                  )}
                  {bonLivraison.taxId && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">ID Fiscal:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {bonLivraison.taxId}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Articles ({bonLivraison.items.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantité
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ref Color
                  </th>
                </tr>
              </thead>
              <tbody>
                {bonLivraison.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      {item.refColor || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {bonLivraison.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {bonLivraison.notes}
              </p>
            </div>
          </div>
        )}

        {/* Informations de création/modification */}
        <div className="text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
          <div className="flex justify-between">
            <span>
              Créé le: {new Date(bonLivraison.createdAt).toLocaleString('fr-FR')}
            </span>
            {bonLivraison.updatedAt && bonLivraison.updatedAt !== bonLivraison.createdAt && (
              <span>
                Modifié le: {new Date(bonLivraison.updatedAt).toLocaleString('fr-FR')}
              </span>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BonLivraisonViewer;
