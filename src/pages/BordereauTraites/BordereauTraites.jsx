import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllBordereautraiteemis, addBordereautraiteemis, updateBordereautraiteemis, deleteBordereautraiteemis } from '../../api/BordereauTraites/BordereauTraitesEmis';
import { CopyPlus, Search, Edit, Trash2, AlertCircle, X, Check } from 'lucide-react';

export default function BordereauTraites() {
  const { t } = useTranslation();
  const [bordereaux, setBordereaux] = useState([]);
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

  const [newBordereau, setNewBordereau] = useState({
    emetteur: '', num_cheque: '', tel: '', banque: '', montant: '', date_emission: '', echeance: '', ordre_de: '', lieu: ''
  });

  const [editingBordereau, setEditingBordereau] = useState(null);
  const [editForm, setEditForm] = useState({
    emetteur: '', num_cheque: '', tel: '', banque: '', montant: '', date_emission: '', echeance: '', ordre_de: '', lieu: ''
  });

  useEffect(() => { fetchBordereaux(); }, []);

  const fetchBordereaux = async () => {
    try {
      setLoading(true);
      const data = await getAllBordereautraiteemis();
      setBordereaux(data);
      setError('');
    } catch (err) {
      setError('Failed to load bordereaux');
    } finally {
      setLoading(false);
    }
  };

  const filteredBordereaux = bordereaux.filter(b => 
    b.emetteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.num_cheque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.banque?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddBordereau = async (e) => {
    e.preventDefault();
    setError('');
    setAddSuccess(false);
    if (!newBordereau.emetteur.trim() || !newBordereau.num_cheque.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setAddLoading(true);
    try {
      const created = await addBordereautraiteemis(newBordereau);
      setBordereaux(prev => [...prev, created]);
      setAddSuccess(true);
      setTimeout(() => {
        setNewBordereau({ emetteur: '', num_cheque: '', tel: '', banque: '', montant: '', date_emission: '', echeance: '', ordre_de: '', lieu: '' });
        setShowAddModal(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Échec de l\'ajout');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditBordereau = (b) => {
    setEditingBordereau(b._id);
    setEditForm({
      emetteur: b.emetteur || '', num_cheque: b.num_cheque || '', tel: b.tel || '', banque: b.banque || '',
      montant: b.montant || '', date_emission: formatDateForInput(b.date_emission), echeance: formatDateForInput(b.echeance),
      ordre_de: b.ordre_de || '', lieu: b.lieu || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateBordereau = async (e) => {
    e.preventDefault();
    setError('');
    setEditSuccess(false);
    if (!editForm.emetteur.trim() || !editForm.num_cheque.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setEditLoading(true);
    try {
      const updated = await updateBordereautraiteemis(editingBordereau, editForm);
      setBordereaux(prev => prev.map(b => b._id === editingBordereau ? updated : b));
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
        setEditingBordereau(null);
      }, 1500);
    } catch (err) {
      setError('Échec de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBordereau = async (id) => {
    try {
      await deleteBordereautraiteemis(id);
      setBordereaux(prev => prev.filter(b => b._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError('Échec de la suppression');
    }
  };

  return (
    <div className='pt-4 px-8'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Bordereau de Traites Emis</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CopyPlus size={20} />Ajouter Bordereau
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bénéficiaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">N° Chèque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Banque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date Émission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Échéance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ordre de</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lieu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBordereaux.length === 0 ? (
                  <tr><td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Aucun bordereau trouvé</td></tr>
                ) : (
                  filteredBordereaux.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{b.emetteur}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.num_cheque}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.tel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.banque}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.montant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(b.date_emission)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(b.echeance)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.ordre_de}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.lieu}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditBordereau(b)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier"><Edit size={18} /></button>
                          <button onClick={() => setConfirmDelete(b._id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer"><Trash2 size={18} /></button>
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ajouter un Bordereau</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              {addSuccess && <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2"><Check size={20} /><span>Ajouté avec succès!</span></div>}
              <form onSubmit={handleAddBordereau} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bénéficiaire <span className="text-red-500">*</span></label>
                    <input type="text" name="emetteur" value={newBordereau.emetteur} onChange={(e) => setNewBordereau({...newBordereau, emetteur: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° Chèque <span className="text-red-500">*</span></label>
                    <input type="text" name="num_cheque" value={newBordereau.num_cheque} onChange={(e) => setNewBordereau({...newBordereau, num_cheque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                    <input type="text" name="tel" value={newBordereau.tel} onChange={(e) => setNewBordereau({...newBordereau, tel: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banque</label>
                    <input type="text" name="banque" value={newBordereau.banque} onChange={(e) => setNewBordereau({...newBordereau, banque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant</label>
                    <input type="text" name="montant" value={newBordereau.montant} onChange={(e) => setNewBordereau({...newBordereau, montant: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordre de</label>
                    <input type="text" name="ordre_de" value={newBordereau.ordre_de} onChange={(e) => setNewBordereau({...newBordereau, ordre_de: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Émission</label>
                    <input type="date" name="date_emission" value={newBordereau.date_emission} onChange={(e) => setNewBordereau({...newBordereau, date_emission: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Échéance</label>
                    <input type="date" name="echeance" value={newBordereau.echeance} onChange={(e) => setNewBordereau({...newBordereau, echeance: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
                  <input type="text" name="lieu" value={newBordereau.lieu} onChange={(e) => setNewBordereau({...newBordereau, lieu: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Modifier le Bordereau</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              {editSuccess && <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2"><Check size={20} /><span>Modifié avec succès!</span></div>}
              <form onSubmit={handleUpdateBordereau} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bénéficiaire <span className="text-red-500">*</span></label>
                    <input type="text" value={editForm.emetteur} onChange={(e) => setEditForm({...editForm, emetteur: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° Chèque <span className="text-red-500">*</span></label>
                    <input type="text" value={editForm.num_cheque} onChange={(e) => setEditForm({...editForm, num_cheque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                    <input type="text" value={editForm.tel} onChange={(e) => setEditForm({...editForm, tel: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banque</label>
                    <input type="text" value={editForm.banque} onChange={(e) => setEditForm({...editForm, banque: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant</label>
                    <input type="text" value={editForm.montant} onChange={(e) => setEditForm({...editForm, montant: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordre de</label>
                    <input type="text" value={editForm.ordre_de} onChange={(e) => setEditForm({...editForm, ordre_de: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Émission</label>
                    <input type="date" value={editForm.date_emission} onChange={(e) => setEditForm({...editForm, date_emission: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Échéance</label>
                    <input type="date" value={editForm.echeance} onChange={(e) => setEditForm({...editForm, echeance: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
                  <input type="text" value={editForm.lieu} onChange={(e) => setEditForm({...editForm, lieu: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">Êtes-vous sûr de vouloir supprimer ce bordereau ?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteBordereau(confirmDelete)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition-colors">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
