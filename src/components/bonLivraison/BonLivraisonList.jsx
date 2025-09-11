import React, { useRef } from 'react';
import { FileText, Download, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { getAllBonLivraisons, deleteBonLivraison, downloadBonLivraisonPDF } from '../../api/bonLivraisonApi';
import TableDisplay from '../shared/TableDisplay';

const BonLivraisonList = ({ onCreateNew, onEdit, onView }) => {
  const tableRef = useRef(null);

  const fetchBonLivraisons = async (page = 1, itemsPerPage = 10, searchTerm = '') => {
    try {
      const data = await getAllBonLivraisons();
      
      // Apply search filter
      let filteredData = data;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(bonLivraison => 
          (bonLivraison.clientName || '').toLowerCase().includes(searchLower) ||
          (bonLivraison.bonLivraisonNumber || '').toLowerCase().includes(searchLower) ||
          (bonLivraison.clientPhone || '').includes(searchTerm)
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
      console.error('Error fetching bon livraisons:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ?')) {
      try {
        await deleteBonLivraison(id);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } catch (error) {
        console.error('Error deleting bon de livraison:', error);
        alert('Erreur lors de la suppression du bon de livraison');
      }
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await downloadBonLivraisonPDF(id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    { 
      header: 'Numéro', 
      key: 'bonLivraisonNumber', 
      type: 'text', 
      width: '15%' 
    },
    { 
      header: 'Client', 
      key: 'clientName', 
      type: 'custom',
      width: '25%',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {value || 'N/A'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.clientPhone || 'N/A'}
          </div>
        </div>
      )
    },
    { 
      header: 'Date', 
      key: 'date', 
      type: 'date', 
      width: '15%' 
    },
    { 
      header: 'Statut', 
      key: 'status', 
      type: 'status', 
      width: '15%' 
    },
    { 
      header: 'Articles', 
      key: 'items', 
      type: 'custom', 
      width: '15%',
      render: (value, row) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.items.length} article{row.items.length > 1 ? 's' : ''}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      type: 'custom',
      width: '15%'
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
            Gestion des Bons de Livraison
          </h2>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Bon de Livraison</span>
        </button>
      </div>

      {/* Table */}
      <TableDisplay
        ref={tableRef}
        title="Liste des Bons de Livraison"
        columns={columns}
        fetchData={fetchBonLivraisons}
        searchPlaceholder="Rechercher par client, numéro ou téléphone..."
        onRowClick={onView}
        onEdit={onEdit}
        onView={onView}
        onDelete={handleDelete}
        actions={actions}
      />
    </div>
  );
};

export default BonLivraisonList;
