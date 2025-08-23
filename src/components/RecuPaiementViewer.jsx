import React, { useState } from 'react';
import { Download, Edit, ArrowLeft } from 'lucide-react';
import { downloadRecuPaiementPDF } from '../api/recuPaiementApi';

const RecuPaiementViewer = ({ recuPaiement, onEdit, onBack }) => {
  const [error, setError] = useState('');

  const handleDownloadPDF = async () => {
    try {
      await downloadRecuPaiementPDF(recuPaiement._id);
    } catch (error) {
      setError('Erreur lors du téléchargement du PDF');
      console.error('Error downloading PDF:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Payé', color: 'bg-green-100 text-green-800' },
      partial: { label: 'Partiel', color: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!recuPaiement) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reçu de paiement N° {recuPaiement.recuPaiementNumber}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onEdit && onEdit(recuPaiement)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit className="h-4 w-4 mr-2" />
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
                <ArrowLeft className="h-4 w-4 mr-2" />
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
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(recuPaiement.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Commande:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    N°{recuPaiement.commandeNumber}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date de livraison:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(recuPaiement.deliveryDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Statut:</span>
                  <span className="ml-2">
                    {getStatusBadge(recuPaiement.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations client
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Nom:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {recuPaiement.clientName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Adresse:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {recuPaiement.clientAddress}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Téléphone:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {recuPaiement.clientPhone}
                  </span>
                </div>
                {recuPaiement.clientEmail && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {recuPaiement.clientEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Articles
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ref Couleur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Prix Unitaire
                    </th>
                    {recuPaiement.items.some(item => item.discount > 0) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Remise
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recuPaiement.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.refColor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.unitPrice.toFixed(2)} DT
                      </td>
                      {recuPaiement.items.some(item => item.discount > 0) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.discount}%
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.total.toFixed(2)} DT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div></div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Résumé financier
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {recuPaiement.totalAmount.toFixed(2)} DT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Avance:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {recuPaiement.avance.toFixed(2)} DT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Règlement:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {recuPaiement.reglement.toFixed(2)} DT
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Reste à payer:</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {recuPaiement.resteAPayer.toFixed(2)} DT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {recuPaiement.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  {recuPaiement.notes}
                </p>
              </div>
            </div>
          )}

          {/* Informations de création/modification */}
          <div className="text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
            <div className="flex justify-between">
              <span>
                Créé le: {new Date(recuPaiement.createdAt).toLocaleString('fr-FR')}
              </span>
              {recuPaiement.updatedAt && recuPaiement.updatedAt !== recuPaiement.createdAt && (
                <span>
                  Modifié le: {new Date(recuPaiement.updatedAt).toLocaleString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuPaiementViewer;
