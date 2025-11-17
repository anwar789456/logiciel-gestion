import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllEncoursproduction, addEncoursproduction, updateEncoursproduction, deleteEncoursproduction } from '../../api/EnCoursProduction/EnCoursProduction';
import { Search, Edit, Trash2, X, Check, AlertCircle, CopyPlus, Eye } from 'lucide-react';

export default function EncoursDeProduction() {
  const { t } = useTranslation();
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [newProduction, setNewProduction] = useState({
    clientname: '', 
    modeles: [{ quantity: '', modele: '', couleur: '', metrage: '', controle: '' }],
    date_commande: '', delais_client: '', delais_production: ''
  });

  const [editingProduction, setEditingProduction] = useState(null);
  const [editForm, setEditForm] = useState({
    clientname: '', 
    modeles: [{ quantity: '', modele: '', couleur: '', metrage: '', controle: '' }],
    date_commande: '', delais_client: '', delais_production: ''
  });

  useEffect(() => { fetchProductions(); }, []);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const data = await getAllEncoursproduction();
      setProductions(data);
      setError('');
    } catch (err) {
      setError('Échec du chargement des productions');
    } finally {
      setLoading(false);
    }
  };

  const filteredProductions = productions.filter(p => 
    p.clientname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.modeles?.some(m => m.modele?.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleAddProduction = async (e) => {
    e.preventDefault();
    setError('');
    setAddSuccess(false);
    if (!newProduction.clientname.trim()) {
      setError('Veuillez remplir le nom du client');
      return;
    }
    setAddLoading(true);
    try {
      const created = await addEncoursproduction(newProduction);
      setProductions(prev => [...prev, created]);
      setAddSuccess(true);
      setTimeout(() => {
        setNewProduction({ clientname: '', modeles: [{ quantity: '', modele: '', couleur: '', metrage: '', controle: '' }], date_commande: '', delais_client: '', delais_production: '' });
        setShowAddModal(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Échec de l\'ajout');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditProduction = (p) => {
    setEditingProduction(p._id);
    setEditForm({
      clientname: p.clientname || '', 
      modeles: p.modeles && p.modeles.length > 0 ? p.modeles : [{ quantity: '', modele: '', couleur: '', metrage: '', controle: '' }],
      date_commande: formatDateForInput(p.date_commande), 
      delais_client: formatDateForInput(p.delais_client),
      delais_production: formatDateForInput(p.delais_production)
    });
    setShowEditModal(true);
  };

  const handleUpdateProduction = async (e) => {
    e.preventDefault();
    setError('');
    setEditSuccess(false);
    if (!editForm.clientname.trim()) {
      setError('Veuillez remplir le nom du client');
      return;
    }
    setEditLoading(true);
    try {
      const updated = await updateEncoursproduction(editingProduction, editForm);
      setProductions(prev => prev.map(p => p._id === editingProduction ? updated : p));
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
        setEditingProduction(null);
      }, 1500);
    } catch (err) {
      setError('Échec de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduction = async (id) => {
    try {
      await deleteEncoursproduction(id);
      setProductions(prev => prev.filter(p => p._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError('Échec de la suppression');
    }
  };

  const addModele = () => {
    setNewProduction({
      ...newProduction,
      modeles: [...newProduction.modeles, { quantity: '', modele: '', couleur: '', metrage: '', controle: '' }]
    });
  };

  const removeModele = (index) => {
    setNewProduction({
      ...newProduction,
      modeles: newProduction.modeles.filter((_, i) => i !== index)
    });
  };

  const updateModele = (index, field, value) => {
    const updatedModeles = [...newProduction.modeles];
    updatedModeles[index][field] = value;
    setNewProduction({ ...newProduction, modeles: updatedModeles });
  };

  const addEditModele = () => {
    setEditForm({
      ...editForm,
      modeles: [...editForm.modeles, { quantity: '', modele: '', couleur: '', metrage: '', controle: '' }]
    });
  };

  const removeEditModele = (index) => {
    setEditForm({
      ...editForm,
      modeles: editForm.modeles.filter((_, i) => i !== index)
    });
  };

  const updateEditModele = (index, field, value) => {
    const updatedModeles = [...editForm.modeles];
    updatedModeles[index][field] = value;
    setEditForm({ ...editForm, modeles: updatedModeles });
  };

  const handleViewDetails = (production) => {
    setSelectedProduction(production);
    setShowDetailsModal(true);
  };

  return (
    <div className='pt-4 px-8'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Encours de Production</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CopyPlus size={20} />Ajouter Production
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Rechercher par nom de client ou modèle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Modèle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Couleur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Métrage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contrôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Délais Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Délais Production</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProductions.length === 0 ? (
                  <tr><td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Aucune production trouvée</td></tr>
                ) : (
                  filteredProductions.map((p, pIdx) => {
                    const rowSpan = p.modeles && p.modeles.length > 0 ? p.modeles.length : 1;
                    const isEven = pIdx % 2 === 0;
                    const bgClass = isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50';
                    const hoverClass = 'hover:bg-blue-50 dark:hover:bg-gray-600';
                    return p.modeles && p.modeles.length > 0 ? (
                      p.modeles.map((m, idx) => (
                        <tr key={`${p._id}-${idx}`} className={`${bgClass} ${hoverClass}`}>
                          {idx === 0 && (
                            <>
                              <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{p.clientname}</td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{m.modele || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{m.quantity || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{m.couleur || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{m.metrage || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{m.controle || '-'}</td>
                          {idx === 0 && (
                            <>
                              <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">{formatDate(p.date_commande)}</td>
                              <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(p.delais_client)}</td>
                              <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(p.delais_production)}</td>
                              <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button onClick={() => handleViewDetails(p)} className="text-green-600 hover:text-green-900 dark:text-green-400" title="Voir détails"><Eye size={18} /></button>
                                  <button onClick={() => handleEditProduction(p)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier"><Edit size={18} /></button>
                                  <button onClick={() => setConfirmDelete(p._id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer"><Trash2 size={18} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr key={p._id} className={`${bgClass} ${hoverClass}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.clientname}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(p.date_commande)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(p.delais_client)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(p.delais_production)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewDetails(p)} className="text-green-600 hover:text-green-900 dark:text-green-400" title="Voir détails"><Eye size={18} /></button>
                            <button onClick={() => handleEditProduction(p)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier"><Edit size={18} /></button>
                            <button onClick={() => setConfirmDelete(p._id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ajouter une Production</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              {addSuccess && <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2"><Check size={20} /><span>Ajouté avec succès!</span></div>}
              <form onSubmit={handleAddProduction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Client <span className="text-red-500">*</span></label>
                  <input type="text" value={newProduction.clientname} onChange={(e) => setNewProduction({...newProduction, clientname: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modèles</label>
                    <button type="button" onClick={addModele} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">+ Ajouter Modèle</button>
                  </div>
                  {newProduction.modeles.map((modele, index) => (
                    <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-3 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modèle {index + 1}</span>
                        {newProduction.modeles.length > 1 && (
                          <button type="button" onClick={() => removeModele(index)} className="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Modèle" value={modele.modele} onChange={(e) => updateModele(index, 'modele', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Quantité" value={modele.quantity} onChange={(e) => updateModele(index, 'quantity', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Couleur" value={modele.couleur} onChange={(e) => updateModele(index, 'couleur', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Métrage" value={modele.metrage} onChange={(e) => updateModele(index, 'metrage', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Contrôle" value={modele.controle} onChange={(e) => updateModele(index, 'controle', e.target.value)} className="col-span-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Commande</label>
                    <input type="date" value={newProduction.date_commande} onChange={(e) => setNewProduction({...newProduction, date_commande: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délais Client</label>
                    <input type="date" value={newProduction.delais_client} onChange={(e) => setNewProduction({...newProduction, delais_client: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délais Production</label>
                    <input type="date" value={newProduction.delais_production} onChange={(e) => setNewProduction({...newProduction, delais_production: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Modifier la Production</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              {editSuccess && <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-2"><Check size={20} /><span>Modifié avec succès!</span></div>}
              <form onSubmit={handleUpdateProduction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Client <span className="text-red-500">*</span></label>
                  <input type="text" value={editForm.clientname} onChange={(e) => setEditForm({...editForm, clientname: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modèles</label>
                    <button type="button" onClick={addEditModele} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">+ Ajouter Modèle</button>
                  </div>
                  {editForm.modeles.map((modele, index) => (
                    <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-3 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modèle {index + 1}</span>
                        {editForm.modeles.length > 1 && (
                          <button type="button" onClick={() => removeEditModele(index)} className="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Modèle" value={modele.modele} onChange={(e) => updateEditModele(index, 'modele', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Quantité" value={modele.quantity} onChange={(e) => updateEditModele(index, 'quantity', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Couleur" value={modele.couleur} onChange={(e) => updateEditModele(index, 'couleur', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Métrage" value={modele.metrage} onChange={(e) => updateEditModele(index, 'metrage', e.target.value)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        <input type="text" placeholder="Contrôle" value={modele.controle} onChange={(e) => updateEditModele(index, 'controle', e.target.value)} className="col-span-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Commande</label>
                    <input type="date" value={editForm.date_commande} onChange={(e) => setEditForm({...editForm, date_commande: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délais Client</label>
                    <input type="date" value={editForm.delais_client} onChange={(e) => setEditForm({...editForm, delais_client: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délais Production</label>
                    <input type="date" value={editForm.delais_production} onChange={(e) => setEditForm({...editForm, delais_production: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
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

      {showDetailsModal && selectedProduction && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Détails de la Production</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Client Information */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Informations Client</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom du Client:</span>
                      <p className="text-base text-gray-900 dark:text-white mt-1">{selectedProduction.clientname}</p>
                    </div>
                  </div>
                </div>

                {/* Models Information */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Modèles</h3>
                  {selectedProduction.modeles && selectedProduction.modeles.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProduction.modeles.map((modele, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Modèle {idx + 1}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Modèle:</span>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">{modele.modele || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quantité:</span>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">{modele.quantity || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Couleur:</span>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">{modele.couleur || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Métrage:</span>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">{modele.metrage || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Contrôle:</span>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">{modele.controle || '-'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun modèle disponible</p>
                  )}
                </div>

                {/* Dates Information */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Commande:</span>
                      <p className="text-base text-gray-900 dark:text-white mt-1">{formatDate(selectedProduction.date_commande) || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Délais Client:</span>
                      <p className="text-base text-gray-900 dark:text-white mt-1">{formatDate(selectedProduction.delais_client) || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Délais Production:</span>
                      <p className="text-base text-gray-900 dark:text-white mt-1">{formatDate(selectedProduction.delais_production) || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition-colors">
                Fermer
              </button>
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">Êtes-vous sûr de vouloir supprimer cette production ?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteProduction(confirmDelete)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition-colors">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
