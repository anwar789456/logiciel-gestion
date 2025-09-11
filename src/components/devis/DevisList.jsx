import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Edit, Trash2, Eye, Plus, Search, Filter } from 'lucide-react';
import { getAllDevis, deleteDevis, downloadDevisPDF } from '../../api/devis/devis';
import TableDisplay from '../shared/TableDisplay';

const DevisList = ({ onCreateNew, onEdit, onView }) => {
  const tableRef = useRef(null);

  const fetchDevis = async (page = 1, itemsPerPage = 10, searchTerm = '') => {
    try {
      const data = await getAllDevis();
      
      // Apply search filter
      let filteredData = data;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(devis => 
          (devis.clientName || '').toLowerCase().includes(searchLower) ||
          (devis.devisNumber || '').toLowerCase().includes(searchLower) ||
          (devis.clientPhone || '').includes(searchTerm)
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
      console.error('Error fetching devis:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await deleteDevis(id);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } catch (error) {
        console.error('Error deleting devis:', error);
        alert('Erreur lors de la suppression du devis');
      }
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await downloadDevisPDF(id);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const columns = [
    { 
      header: 'Numéro', 
      key: 'devisNumber', 
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
            Gestion des Devis
          </h2>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Devis</span>
        </button>
      </div>

      {/* Table */}
      <TableDisplay
        ref={tableRef}
        title="Liste des Devis"
        columns={columns}
        fetchData={fetchDevis}
        searchPlaceholder="Rechercher par nom, numéro de devis ou téléphone..."
        onRowClick={onView}
        onEdit={onEdit}
        onView={onView}
        onDelete={handleDelete}
        actions={actions}
      />
    </div>
  );
};

export default DevisList;
