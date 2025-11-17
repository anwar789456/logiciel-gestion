import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Eye, Search, FileSpreadsheet, Filter, X } from 'lucide-react';
import { getAllBonReceptions, deleteBonReception } from '../../api/BonReception/BonReception';
import { exportBonReceptionToExcel } from '../../utils/excelExportBonReception';
import toast from 'react-hot-toast';

export default function BonReceptionList({ onCreateNew, onEdit, onView }) {
  const { t } = useTranslation();
  const [bons, setBons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fournisseur: '',
    hasAvance: 'all' // 'all', 'with', 'without'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null });

  useEffect(() => {
    fetchBons();
  }, []);

  const fetchBons = async () => {
    try {
      setLoading(true);
      const data = await getAllBonReceptions();
      setBons(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des bons de réception');
      console.error('Error fetching bons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBonReception(id);
      toast.success('Bon de réception supprimé avec succès');
      fetchBons();
      setDeleteConfirmation({ show: false, id: null });
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting bon:', error);
    }
  };

  const filteredBons = bons.filter(bon => {
    // Search filter
    const matchesSearch = bon.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bon.gsm?.includes(searchTerm);
    
    // Date range filter
    const bonDate = bon.createdAt ? new Date(bon.createdAt) : null;
    const matchesDateFrom = !filters.dateFrom || !bonDate || bonDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || !bonDate || bonDate <= new Date(filters.dateTo);
    
    // Fournisseur filter
    const matchesFournisseur = !filters.fournisseur || 
      bon.fournisseur?.toLowerCase().includes(filters.fournisseur.toLowerCase());
    
    // Avance filter
    const hasAvance = bon.avance && parseFloat(bon.avance) > 0;
    const matchesAvance = filters.hasAvance === 'all' ||
      (filters.hasAvance === 'with' && hasAvance) ||
      (filters.hasAvance === 'without' && !hasAvance);
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesFournisseur && matchesAvance;
  });

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      fournisseur: '',
      hasAvance: 'all'
    });
  };

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.fournisseur || filters.hasAvance !== 'all';

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Bon de Réception
        </h1>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nouveau Bon
        </button>
      </div>

      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par fournisseur ou GSM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Filter size={20} />
          Filtres
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {[filters.dateFrom, filters.dateTo, filters.fournisseur, filters.hasAvance !== 'all'].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fournisseur
              </label>
              <input
                type="text"
                placeholder="Filtrer par fournisseur..."
                value={filters.fournisseur}
                onChange={(e) => setFilters({ ...filters, fournisseur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Avance Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut Avance
              </label>
              <select
                value={filters.hasAvance}
                onChange={(e) => setFilters({ ...filters, hasAvance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Tous</option>
                <option value="with">Avec avance</option>
                <option value="without">Sans avance</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Compteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  GSM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun bon de réception trouvé
                  </td>
                </tr>
              ) : (
                filteredBons.map((bon) => (
                  <tr key={bon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {bon.compteur || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {bon.fournisseur || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {bon.gsm || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(bon.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {bon.avance || '0'} DT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onView(bon)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await exportBonReceptionToExcel(bon);
                            } catch (error) {
                              console.error('Error exporting to Excel:', error);
                            }
                          }}
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="Excel"
                        >
                          <FileSpreadsheet size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(bon)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation({ show: true, id: bon._id })}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce bon de réception ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, id: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
