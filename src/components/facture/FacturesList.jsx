import React, { useRef } from 'react';
import { FileText, Download, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { getAllFactures, deleteFacture, downloadFacturePDF } from '../../api/facture/facture';
import TableDisplay from '../shared/TableDisplay';

const FacturesList = ({ onCreateNew, onEdit, onView }) => {
  const tableRef = useRef(null);

  const fetchFactures = async (page = 1, itemsPerPage = 10, searchTerm = '') => {
    try {
      const data = await getAllFactures();
      
      // Apply search filter
      let filteredData = data;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(facture => 
          (facture.clientName || '').toLowerCase().includes(searchLower) ||
          (facture.factureNumber || '').toLowerCase().includes(searchLower) ||
          (facture.clientPhone || '').includes(searchTerm)
        );
      }

      // Sort by creation date (newest first)
      filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
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
      console.error('Error fetching factures:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await deleteFacture(id);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } catch (error) {
        console.error('Error deleting facture:', error);
        alert('Erreur lors de la suppression de la facture');
      }
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await downloadFacturePDF(id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Payée' },
      unpaid: { color: 'bg-red-100 text-red-800', label: 'Non payée' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partiellement payée' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Annulée' }
    };

    const config = statusConfig[status] || statusConfig.unpaid;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    { 
      header: 'Numéro', 
      key: 'factureNumber', 
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
      key: 'createdAt', 
      type: 'date', 
      width: '15%' 
    },
    { 
      header: 'Montant', 
      key: 'totalAmount', 
      type: 'price', 
      width: '15%' 
    },
    { 
      header: 'Statut', 
      key: 'status', 
      type: 'status', 
      width: '15%' 
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
            Gestion des Factures
          </h2>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Facture</span>
        </button>
      </div>

      {/* Table */}
      <TableDisplay
        ref={tableRef}
        title="Liste des Factures"
        columns={columns}
        fetchData={fetchFactures}
        searchPlaceholder="Rechercher par nom, numéro de facture ou téléphone..."
        onRowClick={onView}
        onEdit={onEdit}
        onView={onView}
        onDelete={handleDelete}
        actions={actions}
      />
    </div>
  );
};

export default FacturesList;
