import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllEchancierchequerecus, addEchancierchequerecus, updateEchancierchequerecus, deleteEchancierchequerecus } from '../../api/EchancierCheque/EchancierChequeRecus';
import { CopyPlus, Search, Edit, Trash2, AlertCircle, X, Check } from 'lucide-react';

export default function EcheancierChequesRecus() {
  const { t } = useTranslation();
  const [echeanciers, setEcheanciers] = useState([]);
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

  const [newEcheancier, setNewEcheancier] = useState({
    num_cheque: '', banque: '', montant: '', date_emission: '', echeance: '', tireur: '', motif: '', etat: ''
  });

  const [editingEcheancier, setEditingEcheancier] = useState(null);
  const [editForm, setEditForm] = useState({
    num_cheque: '', banque: '', montant: '', date_emission: '', echeance: '', tireur: '', motif: '', etat: ''
  });

  useEffect(() => { fetchEcheanciers(); }, []);

  const fetchEcheanciers = async () => {
    try {
      setLoading(true);
      const data = await getAllEchancierchequerecus();
      setEcheanciers(data);
      setError('');
    } catch (err) {
      setError('Failed to load echeanciers');
    } finally {
      setLoading(false);
    }
  };

  const filteredEcheanciers = echeanciers.filter(e => 
    e.num_cheque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.banque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tireur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatDateForInput = (d) => {
    if (!d) return '';
    return new Date(d).toISOString().split('T')[0];
  };

  const handleAddEcheancier = async (e) => {
    e.preventDefault();
    setError('');
    setAddSuccess(false);
    if (!newEcheancier.num_cheque.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setAddLoading(true);
    try {
      const created = await addEchancierchequerecus(newEcheancier);
      setEcheanciers(prev => [...prev, created]);
      setAddSuccess(true);
      setTimeout(() => {
        setNewEcheancier({ num_cheque: '', banque: '', montant: '', date_emission: '', echeance: '', tireur: '', motif: '', etat: '' });
        setShowAddModal(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Échec de l\'ajout');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditEcheancier = (e) => {
    setEditingEcheancier(e._id);
    setEditForm({
      num_cheque: e.num_cheque || '', banque: e.banque || '', montant: e.montant || '',
      date_emission: formatDateForInput(e.date_emission), echeance: formatDateForInput(e.echeance),
      tireur: e.tireur || '', motif: e.motif || '', etat: e.etat || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateEcheancier = async (e) => {
    e.preventDefault();
    setError('');
    setEditSuccess(false);
    if (!editForm.num_cheque.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setEditLoading(true);
    try {
      const updated = await updateEchancierchequerecus(editingEcheancier, editForm);
      setEcheanciers(prev => prev.map(ec => ec._id === editingEcheancier ? updated : ec));
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
        setEditingEcheancier(null);
      }, 1500);
    } catch (err) {
      setError('Échec de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteEcheancier = async (id) => {
    try {
      await deleteEchancierchequerecus(id);
      setEcheanciers(prev => prev.filter(e => e._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError('Échec de la suppression');
    }
  };

  return (
    <div className='pt-4 px-8'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Échéancier Chèques Reçus</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CopyPlus size={20} />Ajouter Échéancier
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /><span>{error}</span>
        </div>
      )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">N° Chèque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Banque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date Émission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Échéance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tireur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Motif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">État</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEcheanciers.length === 0 ? (
                  <tr><td colSpan="9" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Aucun échéancier trouvé</td></tr>
                ) : (
                  filteredEcheanciers.map((e) => (
                    <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{e.num_cheque}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{e.banque}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{e.montant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(e.date_emission)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(e.echeance)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{e.tireur}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{e.motif}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{e.etat}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditEcheancier(e)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier"><Edit size={18} /></button>
                          <button onClick={() => setConfirmDelete(e._id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer"><Trash2 size={18} /></button>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ajouter un Échéancier</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              {addSuccess && <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2"><Check size={20} /><span>Ajouté avec succès!</span></div>}
              <form onSubmit={handleAddEcheancier} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° Chèque <span className="text-red-500">*</span></label>
                    <input type="text" value={newEcheancier.num_cheque} onChange={(e) => setNewEcheancier({...newEcheancier, num_cheque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banque</label>
                    <input type="text" value={newEcheancier.banque} onChange={(e) => setNewEcheancier({...newEcheancier, banque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant</label>
                    <input type="text" value={newEcheancier.montant} onChange={(e) => setNewEcheancier({...newEcheancier, montant: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tireur</label>
                    <input type="text" value={newEcheancier.tireur} onChange={(e) => setNewEcheancier({...newEcheancier, tireur: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Émission</label>
                    <input type="date" value={newEcheancier.date_emission} onChange={(e) => setNewEcheancier({...newEcheancier, date_emission: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Échéance</label>
                    <input type="date" value={newEcheancier.echeance} onChange={(e) => setNewEcheancier({...newEcheancier, echeance: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif</label>
                    <input type="text" value={newEcheancier.motif} onChange={(e) => setNewEcheancier({...newEcheancier, motif: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">État</label>
                    <input type="text" value={newEcheancier.etat} onChange={(e) => setNewEcheancier({...newEcheancier, etat: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={addLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">{addLoading ? 'Ajout...' : 'Ajouter'}</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition-colors">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Modifier l'Échéancier</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              {editSuccess && <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2"><Check size={20} /><span>Modifié avec succès!</span></div>}
              <form onSubmit={handleUpdateEcheancier} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° Chèque <span className="text-red-500">*</span></label>
                    <input type="text" value={editForm.num_cheque} onChange={(e) => setEditForm({...editForm, num_cheque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banque</label>
                    <input type="text" value={editForm.banque} onChange={(e) => setEditForm({...editForm, banque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant</label>
                    <input type="text" value={editForm.montant} onChange={(e) => setEditForm({...editForm, montant: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tireur</label>
                    <input type="text" value={editForm.tireur} onChange={(e) => setEditForm({...editForm, tireur: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Émission</label>
                    <input type="date" value={editForm.date_emission} onChange={(e) => setEditForm({...editForm, date_emission: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Échéance</label>
                    <input type="date" value={editForm.echeance} onChange={(e) => setEditForm({...editForm, echeance: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif</label>
                    <input type="text" value={editForm.motif} onChange={(e) => setEditForm({...editForm, motif: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">État</label>
                    <input type="text" value={editForm.etat} onChange={(e) => setEditForm({...editForm, etat: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={editLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">{editLoading ? 'Modification...' : 'Modifier'}</button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition-colors">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Êtes-vous sûr de vouloir supprimer cet échéancier ?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteEcheancier(confirmDelete)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition-colors">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
