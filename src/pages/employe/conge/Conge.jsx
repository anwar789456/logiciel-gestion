import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { getAllConges, createConge, updateConge, deleteConge } from '../../../api/Employe/conge';
import { CopyPlus, Search, Edit, Trash2, Calendar, AlertCircle, X, Check } from 'lucide-react';

export default function Conge() {
  const { t } = useTranslation();
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [newConge, setNewConge] = useState({
    collaborateur: '',
    nbr_jour: '',
    date_debut: '',
    date_fin: '',
    nature: ''
  });

  const [editingConge, setEditingConge] = useState(null);
  const [editForm, setEditForm] = useState({
    collaborateur: '',
    nbr_jour: '',
    date_debut: '',
    date_fin: '',
    nature: ''
  });

  // Fetch all conges
  useEffect(() => {
    fetchConges();
  }, []);

  const fetchConges = async () => {
    try {
      setLoading(true);
      const data = await getAllConges();
      setConges(data);
      setError('');
    } catch (err) {
      console.error('Error fetching conges:', err);
      setError('Failed to load conges');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter conges based on search term
  const filteredConges = conges.filter(conge => 
    conge.collaborateur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.nature?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle add modal change
  const handleAddModalChange = (e) => {
    const { name, value } = e.target;
    setNewConge(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add conge
  const handleAddConge = async (e) => {
    e.preventDefault();
    setError('');
    setAddSuccess(false);

    // Validate form
    if (!newConge.collaborateur.trim() || !newConge.date_debut || !newConge.date_fin) {
      setError('Please fill all required fields');
      return;
    }

    setAddLoading(true);
    try {
      const createdConge = await createConge(newConge);
      setConges(prev => [...prev, createdConge]);
      setAddSuccess(true);

      setTimeout(() => {
        setNewConge({
          collaborateur: '',
          nbr_jour: '',
          date_debut: '',
          date_fin: '',
          nature: ''
        });
        setShowAddModal(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error adding conge:', err);
      setError(err.response?.data?.message || 'Failed to add conge');
    } finally {
      setAddLoading(false);
    }
  };

  // Handle edit conge
  const handleEditConge = (conge) => {
    setEditingConge(conge._id);
    setEditForm({
      collaborateur: conge.collaborateur || '',
      nbr_jour: conge.nbr_jour || '',
      date_debut: formatDateForInput(conge.date_debut),
      date_fin: formatDateForInput(conge.date_fin),
      nature: conge.nature || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle update conge
  const handleUpdateConge = async (e) => {
    e.preventDefault();
    setError('');
    setEditSuccess(false);

    // Validate form
    if (!editForm.collaborateur.trim() || !editForm.date_debut || !editForm.date_fin) {
      setError('Please fill all required fields');
      return;
    }

    setEditLoading(true);
    try {
      const updatedConge = await updateConge(editingConge, editForm);
      setConges(prev => prev.map(c => c._id === editingConge ? updatedConge : c));
      setEditSuccess(true);

      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
        setEditingConge(null);
      }, 1500);
    } catch (err) {
      console.error('Error updating conge:', err);
      setError(err.response?.data?.message || 'Failed to update conge');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete conge
  const handleDeleteConge = async (id) => {
    try {
      await deleteConge(id);
      setConges(prev => prev.filter(c => c._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting conge:', err);
      setError('Failed to delete conge');
    }
  };

  return (
    <div className='pt-4 px-8'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {t('liste_conge')}
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CopyPlus size={20} />
          Ajouter Congé
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par collaborateur ou nature..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Collaborateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nombre de Jours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConges.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Aucun congé trouvé
                    </td>
                  </tr>
                ) : (
                  filteredConges.map((conge) => (
                    <tr key={conge._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {conge.collaborateur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {conge.nbr_jour} {conge.nbr_jour === '1' ? 'jour' : 'jours'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(conge.date_debut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(conge.date_fin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {conge.nature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditConge(conge)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(conge._id)}
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
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Ajouter un Congé
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              {addSuccess && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2">
                  <Check size={20} />
                  <span>Congé ajouté avec succès!</span>
                </div>
              )}

              <form onSubmit={handleAddConge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Collaborateur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="collaborateur"
                    value={newConge.collaborateur}
                    onChange={handleAddModalChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de Jours
                  </label>
                  <input
                    type="text"
                    name="nbr_jour"
                    value={newConge.nbr_jour}
                    onChange={handleAddModalChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_debut"
                      value={newConge.date_debut}
                      onChange={handleAddModalChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_fin"
                      value={newConge.date_fin}
                      onChange={handleAddModalChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nature
                  </label>
                  <input
                    type="text"
                    name="nature"
                    value={newConge.nature}
                    onChange={handleAddModalChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {addLoading ? 'Ajout en cours...' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Modifier le Congé
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              {editSuccess && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2">
                  <Check size={20} />
                  <span>Congé modifié avec succès!</span>
                </div>
              )}

              <form onSubmit={handleUpdateConge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Collaborateur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="collaborateur"
                    value={editForm.collaborateur}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de Jours
                  </label>
                  <input
                    type="text"
                    name="nbr_jour"
                    value={editForm.nbr_jour}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_debut"
                      value={editForm.date_debut}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_fin"
                      value={editForm.date_fin}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nature
                  </label>
                  <input
                    type="text"
                    name="nature"
                    value={editForm.nature}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {editLoading ? 'Modification en cours...' : 'Modifier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce congé ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteConge(confirmDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
