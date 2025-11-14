import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { getAllDemandesConge, updateDemandeConge, deleteDemandeConge } from '../../../api/Employe/demandeConge';
import { createConge } from '../../../api/Employe/conge';
import { Search, Edit, Trash2, Eye, Printer, Check, X, AlertCircle } from 'lucide-react';
import CongeDocument from '../../../components/employe/CongeDocument';

export default function ListeConge() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const documentRef = useRef(null);

  // Fetch all demandes de congé
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const data = await getAllDemandesConge();
        setDemandes(data);
      } catch (err) {
        console.error('Error fetching demandes de congé:', err);
        setError('Failed to load demandes de congé');
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter demandes based on search term
  const filteredDemandes = demandes.filter(demande => 
    demande.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.job?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays === 1 ? '1 jour' : `${diffDays} jours`;
  };

  // Handle view details
  const handleViewDetails = (demande) => {
    setSelectedDemande(demande);
    setShowDetailsModal(true);
  };

  // Handle approve/reject demande and update fields
  const handleUpdateStatus = async (id, decision, responsable, date_effectuer) => {
    try {
      setUpdateLoading(true);
      
      // Find the current demande to check its previous status
      const currentDemande = demandes.find(d => d._id === id);
      const previousDecision = currentDemande?.decisionResponsable || 'En attente';
      
      const updateData = { 
        decisionResponsable: decision 
      };
      
      // Add responsable and date_effectuer if provided
      if (responsable !== undefined) {
        updateData.responsable = responsable;
      }
      
      if (date_effectuer !== undefined) {
        updateData.date_effectuer = date_effectuer;
      }
      
      // Add dateRangePartiel if decision is 'Accord partiel' and dates are provided
      if (decision === 'Accord partiel' && selectedDemande?.dateRangePartiel) {
        updateData.dateRangePartiel = selectedDemande.dateRangePartiel;
      } else if (decision !== 'Accord partiel') {
        // Reset dateRangePartiel if decision is not 'Accord partiel'
        updateData.dateRangePartiel = { startDate: null, endDate: null };
      }
      
      await updateDemandeConge(id, updateData);
      
      // If changing from 'En attente' or 'Refus' to 'Accord total' or 'Accord partiel', create conge entry
      if ((previousDecision === 'En attente' || previousDecision === 'Refus' || !previousDecision) && 
          (decision === 'Accord total' || decision === 'Accord partiel')) {
        
        // Determine date range based on decision type
        let dateDebut, dateFin;
        if (decision === 'Accord partiel' && selectedDemande?.dateRangePartiel?.startDate && selectedDemande?.dateRangePartiel?.endDate) {
          dateDebut = new Date(selectedDemande.dateRangePartiel.startDate);
          dateFin = new Date(selectedDemande.dateRangePartiel.endDate);
        } else {
          dateDebut = new Date(currentDemande.dateRange.startDate);
          dateFin = new Date(currentDemande.dateRange.endDate);
        }
        
        // Calculate number of days
        const diffTime = Math.abs(dateFin - dateDebut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Create conge entry
        const congeData = {
          collaborateur: currentDemande.username,
          nbr_jour: diffDays.toString(),
          date_debut: dateDebut,
          date_fin: dateFin,
          nature: currentDemande.motif
        };
        
        try {
          await createConge(congeData);
          console.log('Conge entry created successfully');
        } catch (congeError) {
          console.error('Error creating conge entry:', congeError);
          // Don't fail the whole operation if conge creation fails
          setError('Demande mise à jour mais erreur lors de la création du congé');
        }
      }
      
      // Update local state
      setDemandes(prevDemandes => 
        prevDemandes.map(demande => 
          demande._id === id ? { ...demande, ...updateData } : demande
        )
      );
      
      // If we're updating the currently selected demande, update that too
      if (selectedDemande && selectedDemande._id === id) {
        setSelectedDemande(prev => ({ ...prev, ...updateData }));
      }
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating demande status:', err);
      setError('Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle delete demande
  const handleDelete = async (id) => {
    try {
      await deleteDemandeConge(id);
      setDemandes(prevDemandes => prevDemandes.filter(demande => demande._id !== id));
      setConfirmDelete(null);
      
      // If we're deleting the currently selected demande, close the modal
      if (selectedDemande && selectedDemande._id === id) {
        setShowDetailsModal(false);
      }
    } catch (err) {
      console.error('Error deleting demande:', err);
      setError('Failed to delete demande');
    }
  };

  // Handle print document
  const handleDownloadPDF = () => {
    if (!documentRef.current) return;
    
    try {
      // Show loading indicator
      setUpdateLoading(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError('Veuillez autoriser les popups pour imprimer le document');
        setUpdateLoading(false);
        // Afficher une alerte pour guider l'utilisateur
        alert('Pour imprimer le document, veuillez autoriser les popups dans votre navigateur puis réessayez.');
        return;
      }
      
      // Get the HTML content of the document
      const documentContent = documentRef.current.outerHTML;
      
      // Write the document content to the new window with proper styling
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Demande de Congé - ${selectedDemande.username}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              width: 100%;
            }
            #document-container {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              padding: 0;
            }
            @media print {
              body {
                width: 100%;
                min-height: 29.7cm;
                margin: 0;
                padding: 0;
              }
              #document-container {
                width: 100%;
                max-width: 100%;
              }
              @page {
                size: auto;
                margin: 0mm;
              }
            }
          </style>
        </head>
        <body>
          <div id="document-container">
            ${documentContent}
          </div>
        </body>
        </html>
      `);
      
      // Wait for content to load then print
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        // Close the window after printing (or after a delay if print is cancelled)
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      };
    } catch (error) {
      console.error('Error printing document:', error);
      setError('Erreur lors de l\'impression du document');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Redirect if not admin
  if (!isAdmin()) {
    return (
      <div className="pt-4 px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Accès refusé!</strong>
          <span className="block sm:inline"> Cette page est réservée aux administrateurs.</span>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-4 px-8'>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Liste des Demandes de Congé</h1>
      
      {/* Success message */}
      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
          <Check className="mr-2" size={18} />
          Statut mis à jour avec succès
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" size={18} />
          <div>
            <p className="font-bold">{error}</p>
            {error.includes('popups') && (
              <p className="text-sm mt-1">
                Pour autoriser les popups: <br />
                1. Recherchez l'icône de blocage de popups dans la barre d'adresse de votre navigateur<br />
                2. Cliquez dessus et sélectionnez "Toujours autoriser les popups pour ce site"<br />
                3. Rafraîchissez la page et réessayez
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="p-2 pl-10 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Rechercher par nom, poste ou motif..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Demandes list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? "Aucune demande trouvée" : "Aucune demande de congé"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDemandes.map((demande) => (
                  <tr key={demande._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{demande.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{demande.job}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{demande.motif}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(demande.dateRange?.startDate)} - {formatDate(demande.dateRange?.endDate)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {calculateDuration(demande.dateRange?.startDate, demande.dateRange?.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {demande.decisionResponsable ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${demande.decisionResponsable === 'Accord total' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : demande.decisionResponsable === 'Accord partiel' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {demande.decisionResponsable}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(demande)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(demande._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedDemande && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 bg-blue-600 dark:bg-blue-700 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Eye className="mr-2" />
                Détails
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Actions buttons */}
              <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedDemande({...selectedDemande, decisionResponsable: 'Accord total'})}
                    disabled={updateLoading}
                    className={`px-4 py-2 ${selectedDemande.decisionResponsable === 'Accord total' ? 'bg-green-700 ring-2 ring-green-500' : 'bg-green-600'} text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 flex items-center ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Check className="mr-1" size={16} />
                    Accord total
                  </button>
                  <button
                    onClick={() => setSelectedDemande({...selectedDemande, decisionResponsable: 'Accord partiel'})}
                    disabled={updateLoading}
                    className={`px-4 py-2 ${selectedDemande.decisionResponsable === 'Accord partiel' ? 'bg-yellow-700 ring-2 ring-yellow-500' : 'bg-yellow-600'} text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-300 flex items-center ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Check className="mr-1" size={16} />
                    Accord partiel
                  </button>
                  <button
                    onClick={() => setSelectedDemande({...selectedDemande, decisionResponsable: 'Refus'})}
                    disabled={updateLoading}
                    className={`px-4 py-2 ${selectedDemande.decisionResponsable === 'Refus' ? 'bg-red-700 ring-2 ring-red-500' : 'bg-red-600'} text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300 flex items-center ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <X className="mr-1" size={16} />
                    Refus
                  </button>
                </div>
                
                <button
                  onClick={handleDownloadPDF}
                  disabled={updateLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Préparation...
                    </>
                  ) : (
                    <>
                      <Printer className="mr-1" size={16} />
                      Imprimer
                    </>
                  )}
                </button>
              </div>
              
              {/* Responsable and Date fields */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={selectedDemande.responsable || ''}
                    onChange={(e) => setSelectedDemande({...selectedDemande, responsable: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nom du responsable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'effectuation</label>
                  <input
                    type="date"
                    value={selectedDemande.date_effectuer ? new Date(selectedDemande.date_effectuer).toISOString().split('T')[0] : ''}
                    onChange={(e) => setSelectedDemande({...selectedDemande, date_effectuer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Partial Date Range - Only shown when Accord partiel is selected */}
              {selectedDemande.decisionResponsable === 'Accord partiel' && (
                <div className="mb-6 border border-gray-300 p-4 rounded-md bg-white dark:bg-gray-800">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Période accordée partiellement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                      <input
                        type="date"
                        value={selectedDemande.dateRangePartiel?.startDate ? new Date(selectedDemande.dateRangePartiel.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedDemande({
                          ...selectedDemande, 
                          dateRangePartiel: {
                            ...selectedDemande.dateRangePartiel || {},
                            startDate: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                      <input
                        type="date"
                        value={selectedDemande.dateRangePartiel?.endDate ? new Date(selectedDemande.dateRangePartiel.endDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedDemande({
                          ...selectedDemande, 
                          dateRangePartiel: {
                            ...selectedDemande.dateRangePartiel || {},
                            endDate: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Save button for responsable and date */}
              <div className="mb-6">
                <button
                  onClick={() => handleUpdateStatus(selectedDemande._id, selectedDemande.decisionResponsable || 'En attente', selectedDemande.responsable, selectedDemande.date_effectuer)}
                  disabled={updateLoading}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 flex items-center ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Check className="mr-1" size={16} />
                  Enregistrer les modifications
                </button>
              </div>
              
              {/* Document preview */}
              <div className="border border-gray-300 rounded-lg overflow-hidden w-full">
                <CongeDocument 
                  ref={documentRef} 
                  formData={{
                    motif: selectedDemande.motif,
                    autreMotif: selectedDemande.motif,
                    dateRange: selectedDemande.dateRange,
                    dateRangePartiel: selectedDemande.dateRangePartiel,
                    decisionResponsable: selectedDemande.decisionResponsable,
                    responsable: selectedDemande.responsable,
                    date_effectuer: selectedDemande.date_effectuer
                  }} 
                  employeeInfo={{
                    name: selectedDemande.username,
                    department: selectedDemande.job,
                    manager: selectedDemande.responsable

                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertCircle className="mr-2 text-red-500" />
              Confirmer la suppression
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer cette demande de congé ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
