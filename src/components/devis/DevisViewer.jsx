import React from 'react';
import { Download, Edit, ArrowLeft, FileText, User, Phone, MapPin, Calendar } from 'lucide-react';
import { downloadDevisPDF } from '../../api/devis/devis';

const DevisViewer = ({ devis, onEdit, onBack }) => {
  const handleDownloadPDF = async () => {
    try {
      await downloadDevisPDF(devis._id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Envoyé' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepté' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeté' },
      expired: { color: 'bg-orange-100 text-orange-800', label: 'Expiré' }
    };

    const config = statusConfig[status] || statusConfig.draft;
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
                Devis N° {devis.devisNumber}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Créé le {new Date(devis.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(devis.status)}
          <button
            onClick={() => onEdit && onEdit(devis)}
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
            <p className="text-xs text-gray-500 dark:text-gray-500">SATRACO s.a.r.l - IU:1280963K</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-1">
              <User className="h-4 w-4" />
              <span className="font-medium">CLIENT: {devis.clientName}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
              <MapPin className="h-4 w-4" />
              <span>ADRESSE: {devis.clientAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <span>Téléphone: {devis.clientPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Devis Details */}
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          DEVIS N° {devis.devisNumber}
        </h3>
        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Ariana le: {new Date(devis.date).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-x-auto">
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
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Prix Unitaire
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Remise
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {devis.items?.map((item, index) => (
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
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">
                  {item.unitPrice.toFixed(2)} DT
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">
                  {item.discount}%
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold">
                  {item.total.toFixed(2)} DT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Row */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <tbody>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-bold text-gray-900 dark:text-white" colSpan="5">
                Total
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                {devis.totalAmount?.toFixed(3)} DT
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Délais de livraison:</h4>
          <p>{devis.deliveryDelay}</p>
        </div>

        <div className="text-center space-y-2">
          <p className="font-medium">Rib Ste SATRACO: 20003032210028360584 Banque: BTK Agence: Ariana</p>
          <p>{devis.paymentTerms}</p>
          <p className="font-medium">{devis.deliveryCondition}</p>
        </div>

        {devis.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h4>
            <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded">{devis.notes}</p>
          </div>
        )}
      </div>

      {/* Validity Information */}
      {devis.validityDate && (
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Ce devis est valide jusqu'au {new Date(devis.validityDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevisViewer;
