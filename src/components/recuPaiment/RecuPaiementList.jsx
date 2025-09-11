import React, { useRef } from 'react';
import { FileText, Plus, Eye, Edit, Trash2, Download } from 'lucide-react';
import { getAllRecuPaiements, deleteRecuPaiement, downloadRecuPaiementPDF } from '../../api/recuPaiementApi';
import TableDisplay from '../shared/TableDisplay';

const RecuPaiementList = ({ onCreateNew, onEdit, onView }) => {
  const tableRef = useRef(null);

  const fetchRecuPaiements = async (page = 1, itemsPerPage = 10, searchTerm = '') => {
    try {
      const data = await getAllRecuPaiements();
      
      // Apply search filter
      let filteredData = data;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(recuPaiement => 
          (recuPaiement.recuPaiementNumber || '').toLowerCase().includes(searchLower) ||
          (recuPaiement.clientName || '').toLowerCase().includes(searchLower) ||
          (recuPaiement.commandeNumber || '').toLowerCase().includes(searchLower)
        );
      }

      // Sort by date (newest first)
      filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Calculate pagination
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
      
      return {
        data: paginatedData,
        pagination: {
          current: page,
          total: totalPages,
          totalItems: totalItems
        }
      };
    } catch (error) {
      console.error('Error fetching recu paiements:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce reçu de paiement ?')) {
      try {
        await deleteRecuPaiement(id);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } catch (error) {
        console.error('Error deleting recu paiement:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await downloadRecuPaiementPDF(id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
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

  const columns = [
    { 
      header: 'Numéro', 
      key: 'recuPaiementNumber', 
      type: 'text', 
      width: '12%' 
    },
    { 
      header: 'Client', 
      key: 'clientName', 
      type: 'text',
      width: '18%'
    },
    { 
      header: 'Commande', 
      key: 'commandeNumber', 
      type: 'custom', 
      width: '12%',
      render: (value, row) => (
        <div className="text-sm text-gray-900 dark:text-white">
          N°{value}
        </div>
      )
    },
    { 
      header: 'Date', 
      key: 'date', 
      type: 'date', 
      width: '12%' 
    },
    { 
      header: 'Total', 
      key: 'totalAmount', 
      type: 'price', 
      width: '12%' 
    },
    { 
      header: 'Reste à payer', 
      key: 'resteAPayer', 
      type: 'price', 
      width: '12%' 
    },
    { 
      header: 'Statut', 
      key: 'status', 
      type: 'status', 
      width: '12%' 
    },
    {
      header: 'Actions',
      key: 'actions',
      type: 'custom',
      width: '10%'
    }
  ];

  const actions = [
    {
      icon: <Download size={16} />,
      onClick: (row) => handleDownloadPDF(row._id),
      className: 'bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900',
      title: 'Télécharger PDF'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Reçus de Paiement
          </h2>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Reçu</span>
        </button>
      </div>

      {/* Table */}
      <TableDisplay
        ref={tableRef}
        title="Liste des Reçus de Paiement"
        columns={columns}
        fetchData={fetchRecuPaiements}
        searchPlaceholder="Rechercher par numéro, client ou commande..."
        onRowClick={onView}
        onEdit={onEdit}
        onView={onView}
        onDelete={handleDelete}
        actions={actions}
      />
    </div>
  );
};

export default RecuPaiementList;
