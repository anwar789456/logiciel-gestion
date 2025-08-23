import React from 'react';
import { Download, Edit, ArrowLeft, FileText, User, Phone, MapPin, Calendar } from 'lucide-react';
import { downloadFacturePDF } from '../api/facture/facture';

const FactureViewer = ({ facture, onEdit, onBack }) => {
  const handleDownloadPDF = async () => {
    try {
      await downloadFacturePDF(facture._id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Payée' },
      unpaid: { color: 'bg-red-100 text-red-800', label: 'Non payée' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partiellement payée' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Annulée' }
    };

    const config = statusConfig[status] || statusConfig.unpaid;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Facture N° {facture.factureNumber}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Créée le {new Date(facture.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(facture.status)}
          <button
            onClick={() => onEdit && onEdit(facture)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Company Header */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">SAMET HOME</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">MEUBLES ET DECORATION</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Raison Sociale: SATRACO</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Code TVA: 1280963K/A/M/000</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Adresse: Avenue Abou El Kacem Al Chebbi</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">GSM: 56834015</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">E-Mail: design@samethome.com</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-1">
              <User className="h-4 w-4" />
              <span className="font-medium">Client: {facture.companyName || facture.clientName}</span>
            </div>
            {facture.taxId && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                <span>Code TVA: {facture.taxId}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
              <MapPin className="h-4 w-4" />
              <span>Adresse: {facture.clientAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <span>GSM: {facture.clientPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Facture Details */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            FACTURE N°{facture.factureNumber}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ariana le: {new Date(facture.date).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Quantité
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Ref Color
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  P. unitaire HT
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {facture.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 text-center text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    {item.description}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    {item.refColor || '-'}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    {item.unitPrice.toFixed(3)}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-900 dark:text-white">
                    {item.total.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64 border border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">TOTAL HT</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {facture.totalHT.toFixed(3)}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">TVA</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {facture.tvaAmount.toFixed(3)}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Timbre Fiscal</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">1.000</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">TOTAL TTC</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {(facture.totalTTC + 1).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      {facture.clientType === 'entreprise' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Informations Entreprise
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Nom de l'entreprise:</span>
              <p className="text-gray-900 dark:text-white">{facture.companyName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Registre de Commerce:</span>
              <p className="text-gray-900 dark:text-white">{facture.rc}</p>
            </div>
            {facture.taxId && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Identifiant fiscal:</span>
                <p className="text-gray-900 dark:text-white">{facture.taxId}</p>
              </div>
            )}
            {facture.email && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <p className="text-gray-900 dark:text-white">{facture.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {facture.notes && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{facture.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p>SATRACO s.a.r.l au Capital de 10.000 DT / RC. B038912013 / MF. 1280963K/A/M/000</p>
      </div>
    </div>
  );
};

export default FactureViewer;
