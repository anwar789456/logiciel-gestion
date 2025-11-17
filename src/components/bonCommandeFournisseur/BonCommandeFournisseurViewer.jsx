import React from 'react';
import { ArrowLeft, Edit, Printer, FileSpreadsheet } from 'lucide-react';
import { exportBonCommandeFournisseurToExcel } from '../../utils/excelExport';
import { printBonCommandeFournisseur } from '../../utils/printBonCommande';

export default function BonCommandeFournisseurViewer({ bon, onEdit, onBack }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const calculateTotalTTC = () => {
    if (!bon.articles || bon.articles.length === 0) return 0;
    // Sum up all article totals with full precision, only round at the end
    const total = bon.articles.reduce((sum, article) => {
      const qty = parseFloat(article.quantity) || 0;
      const puHT = parseFloat(article.pu_ht) || 0;
      const remisePct = parseFloat(article.pht) || 0;
      
      // Calculate: PU après Remise = PU HT - (PU HT × Remise%)
      const montantRemise = (puHT * remisePct) / 100;
      const puApresRemise = puHT - montantRemise;
      
      // Calculate: PU TTC = PU après Remise × 1.19
      const puTTC = puApresRemise * 1.19;
      
      // Calculate: Total TTC = PU TTC × Quantity
      const lineTotal = puTTC * qty;
      return sum + lineTotal;
    }, 0);
    // Round to 4 decimal places for maximum precision
    return Math.round(total * 10000) / 10000;
  };

  const calculateReste = () => {
    const total = calculateTotalTTC();
    const avance = parseFloat(bon.avance) || 0;
    // Calculate remainder with full precision
    const reste = total - avance;
    // Round to 4 decimal places
    return Math.round(reste * 10000) / 10000;
  };

  const hasRemise = () => {
    if (!bon.articles || bon.articles.length === 0) return false;
    return bon.articles.some(article => {
      const remise = parseFloat(article.pht) || 0;
      return remise > 0;
    });
  };

  const showRemiseColumn = hasRemise();

  const handlePrint = () => {
    printBonCommandeFournisseur(bon);
  };

  const handleExportExcel = async () => {
    try {
      await exportBonCommandeFournisseurToExcel(bon);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden on print */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(bon)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit size={18} />
            Modifier
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer size={18} />
            Imprimer
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            BON DE COMMANDE FOURNISSEUR
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            N° {bon.compteur || '-'}
          </p>
        </div>

        {/* Supplier and Date Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Fournisseur
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bon.fournisseur || '-'}
              </p>
              {bon.adresse && (
                <p className="text-gray-700 dark:text-gray-300">
                  {bon.adresse}
                </p>
              )}
              {bon.gsm && (
                <p className="text-gray-700 dark:text-gray-300">
                  GSM: {bon.gsm}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Date
            </h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {formatDate(bon.date_bon)}
            </p>
          </div>
        </div>

        {/* Articles Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Articles
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                    Réf/Couleur
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                    Qté
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                    PU HT<br/>(DT)
                  </th>
                  {showRemiseColumn && (
                    <>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                        Remise<br/>(%)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                        Montant Remise<br/>(DT)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                        PU après Remise<br/>(DT)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                        TVA 19%<br/>(DT)
                      </th>
                    </>
                  )}
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                    PU TTC<br/>(DT)
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                    Total TTC<br/>(Qté × PU TTC)
                  </th>
                </tr>
              </thead>
              <tbody>
                {bon.articles && bon.articles.length > 0 ? (
                  bon.articles.map((article, index) => {
                    const qty = parseFloat(article.quantity) || 0;
                    const puHT = parseFloat(article.pu_ht) || 0;
                    const remisePct = parseFloat(article.pht) || 0;
                    
                    // Calculate all intermediate values
                    const montantRemise = (puHT * remisePct) / 100;
                    const puApresRemise = puHT - montantRemise;
                    const montantTVA = puApresRemise * 0.19; // 19% TVA
                    const puTTC = puApresRemise * 1.19; // PU après Remise × 1.19
                    
                    // Calculate line total with full precision: PU TTC × Quantity
                    const totalTTC = puTTC * qty;
                    // Round to 4 decimal places for display
                    const roundedTotal = Math.round(totalTTC * 10000) / 10000;
                    
                    return (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                          {article.description}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                          {article.ref_couleur || '-'}
                        </td>
                        <td className="px-3 py-2 text-xs text-center text-gray-900 dark:text-white">
                          {qty}
                        </td>
                        <td className="px-3 py-2 text-xs text-right text-gray-900 dark:text-white">
                          {puHT.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>
                        {showRemiseColumn && (
                          <>
                            <td className="px-3 py-2 text-xs text-right font-medium text-blue-600 dark:text-blue-400">
                              {remisePct.toFixed(2)}%
                            </td>
                            <td className="px-3 py-2 text-xs text-right text-red-600 dark:text-red-400">
                              -{montantRemise.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </td>
                            <td className="px-3 py-2 text-xs text-right text-gray-900 dark:text-white">
                              {puApresRemise.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </td>
                            <td className="px-3 py-2 text-xs text-right text-green-600 dark:text-green-400">
                              +{montantTVA.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </td>
                          </>
                        )}
                        <td className="px-3 py-2 text-xs text-right font-medium text-gray-900 dark:text-white">
                          {puTTC.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>
                        <td className="px-3 py-2 text-xs text-right font-bold text-gray-900 dark:text-white">
                          {roundedTotal.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={showRemiseColumn ? "10" : "6"} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Aucun article
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Total TTC:
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {calculateTotalTTC().toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 4 })} DT
              </span>
            </div>
            
            {bon.avance && parseFloat(bon.avance) > 0 && (
              <>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    Avance:
                  </span>
                  <span className="text-lg text-gray-900 dark:text-white">
                    {parseFloat(bon.avance).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 4 })} DT
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Reste à payer:
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateReste().toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 4 })} DT
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Information */}
        {bon.reglement && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Règlement<span><p className="text-gray-900 dark:text-white">{bon.reglement}</p></span></h3>
          </div>
        )}
      </div>
    </div>
  );
}
