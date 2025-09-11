import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  X,
  RefreshCw,
  FileSpreadsheet,
  Database,
  TrendingUp,
  Eye,
  Table
} from 'lucide-react';
import ficheCommandeApi from '../../api/ficheCommandeApi';

// Custom animations styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInLeft {
    from { 
      opacity: 0; 
      transform: translateX(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  @keyframes bounceIn {
    0% { 
      opacity: 0; 
      transform: scale(0.3); 
    }
    50% { 
      opacity: 1; 
      transform: scale(1.05); 
    }
    70% { 
      transform: scale(0.9); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.8s ease-out both;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.5s ease-out both;
  }
  
  .animate-bounceIn {
    animation: bounceIn 0.6s ease-out both;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  if (!document.head.querySelector('style[data-fiche-commande-animations]')) {
    styleElement.setAttribute('data-fiche-commande-animations', 'true');
    document.head.appendChild(styleElement);
  }
}

const FicheCommande = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ files: [], sheets: [] });
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    file: '',
    sheet: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [columnFilters, setColumnFilters] = useState({});
  const [columnValues, setColumnValues] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    count: 0,
    totalRecords: 0
  });
  const dropdownRef = useRef(null);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [viewMode, setViewMode] = useState('normal'); // 'normal' or 'detailed'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Function to refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  const startAutoRefresh = () => {
    if (autoRefreshInterval) return;
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds
    setAutoRefreshInterval(interval);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  };

  // Cleanup auto-refresh on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  useEffect(() => {
    loadData();
  }, [filters, columnFilters, pagination.current]);
  
  useEffect(() => {
    loadSummary();
    loadFilterOptions();
  }, []);

  // Load unique values for each column
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      const values = {};
      filteredColumns.forEach(column => {
        const uniqueValues = [...new Set(data.map(item => item[column]).filter(val => val !== null && val !== undefined && val !== ''))];
        values[column] = uniqueValues.sort();
      });
      setColumnValues(values);
    }
  }, [data, columns]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        ...columnFilters,
        page: pagination.current,
        limit: 50
      };
      
      const response = await ficheCommandeApi.getAllFicheCommandes(params);
      setData(response.data);
      setColumns(response.columns);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await ficheCommandeApi.getSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
    }
  };

  const loadFilterOptions = async (selectedFile = null) => {
    try {
      const options = await ficheCommandeApi.getFilterOptions(selectedFile);
      setFilterOptions(options);
    } catch (error) {
      console.error('Erreur lors du chargement des options de filtre:', error);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    try {
      const result = await ficheCommandeApi.importExcel(selectedFile);
      alert(`Import réussi! ${result.totalImported} lignes importées depuis ${result.fileName}`);
      setSelectedFile(null);
      loadData();
      loadSummary();
      loadFilterOptions();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import du fichier Excel');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche ?')) {
      try {
        await ficheCommandeApi.delete(id);
        await loadData();
        await loadSummary();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les données du fichier "${fileName}" ?`)) {
      try {
        await ficheCommandeApi.deleteByFile(fileName);
        await loadData();
        await loadSummary();
        await loadFilterOptions();
        alert('Fichier supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        alert('Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await ficheCommandeApi.update(editingItem._id, formData);
      } else {
        await ficheCommandeApi.create(formData);
      }
      setShowAddModal(false);
      setEditingItem(null);
      loadData();
      loadSummary();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const applyColumnFilter = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setOpenDropdown(null);
    setPagination({ ...pagination, current: 1 });
  };

  const clearColumnFilter = (column) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setPagination({ ...pagination, current: 1 });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setFilters({
      file: '',
      sheet: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPagination({ ...pagination, current: 1 });
    // Reload data after clearing filters
    setTimeout(() => loadData(), 100);
  };

  const getFilteredColumns = () => {
    return columns.filter(col => 
      !col.startsWith('_') && 
      col !== '__v' && 
      col !== 'createdAt' && 
      col !== 'updatedAt' &&
      col !== 'file' &&
      col !== 'sheet' &&
      col !== 'importDate' &&
      col !== 'isManual'
    );
  };

  const filteredColumns = getFilteredColumns();

  const getFilteredData = () => {
    // Since filtering is now done server-side in loadData(), 
    // we only apply column filters client-side
    let filtered = data;
    
    // Apply column filters only (basic filters are handled server-side)
    Object.keys(columnFilters).forEach(column => {
      const filterValue = columnFilters[column];
      if (filterValue && filterValue !== 'all') {
        filtered = filtered.filter(item => 
          String(item[column] || '').toLowerCase().includes(String(filterValue).toLowerCase())
        );
      }
    });
    
    return filtered;
  };

  // Extract address from client name (text in parentheses)
  const extractAddress = (clientText) => {
    if (!clientText) return '';
    const match = clientText.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  };

  // Get client name without address
  const getClientName = (clientText) => {
    if (!clientText) return '';
    return clientText.replace(/\s*\([^)]*\)\s*/, '').trim();
  };

  // Get detailed view columns with proper mapping
  const getDetailedColumns = () => {
    return [
      'Client',
      'Adresse', // Extracted from Client
      'Numero_de_tel',
      'Commande',
      'Couleur',
      'Date_commande',
      'Mt_commande',
      'Mt_Avance',
      'Nature',
      'Reste',
      'Delais'
    ];
  };

  // Transform data for detailed view
  const getDetailedData = () => {
    return getFilteredData().map(item => {
      // Find client column with multiple possible names
      const clientColumn = columns.find(col => 
        col && (
          col.toLowerCase().includes('client') || 
          col.toLowerCase().includes('nom') ||
          col.toLowerCase().includes('name') ||
          col.toLowerCase() === 'client' ||
          col.toLowerCase() === 'nom_client'
        )
      );
      
      const clientText = clientColumn ? (item[clientColumn] || '') : '';
      const clientName = getClientName(clientText) || 'Client non spécifié';
      const clientAddress = extractAddress(clientText) || 'Adresse non spécifiée';
      
      return {
        ...item,
        Client: clientName,
        Adresse: clientAddress,
        Numero_de_tel: item.Numero_de_tel || item['Numéro de tel'] || item.telephone || item.tel || item['Numero de tel'] || item.phone || item.Phone || '',
        Commande: item.Commande || item.commande || item.Produit || item.produit || item.Article || item.article || item.Product || item.product || '',
        Couleur: item.Couleur || item.couleur || item.Color || item.color || item.Couleurs || item.couleurs || '',
        Date_commande: item.Date_commande || item['Date commande'] || item.date || item.Date || item['Date de commande'] || item.date_commande || '',
        Mt_commande: item.Mt_commande || item['Mt commande'] || item.montant || item.Montant || item.Prix || item.prix || item.Total || item.total || item.Amount || item.amount || '',
        Mt_Avance: item.Mt_Avance || item['Mt Avance'] || item.avance || item.Avance || item.Acompte || item.acompte || item.Advance || item.advance || '',
        Nature: item.Nature || item.nature || item.Type || item.type || item.Statut || item.statut || item.Category || item.category || '',
        Reste: item.Reste || item.reste || item.Restant || item.restant || item.Solde || item.solde || item.Balance || item.balance || '',
        Delais: item.Delais || item.delais || item.delai || item.Délai || item['Délai'] || item.Livraison || item.livraison || item.Delivery || item.delivery || ''
      };
    });
  };

  // Group data by client for consolidated view
  const getGroupedData = () => {
    const detailedData = getDetailedData();
    const grouped = {};
    
    detailedData.forEach(item => {
      // Create a more robust client key
      const clientName = item.Client || 'Client non spécifié';
      const clientAddress = item.Adresse || 'Adresse non spécifiée';
      const clientPhone = item.Numero_de_tel || 'Tel non spécifié';
      const clientKey = `${clientName}_${clientAddress}_${clientPhone}`;
      
      if (!grouped[clientKey]) {
        grouped[clientKey] = {
          Client: clientName,
          Adresse: clientAddress,
          Numero_de_tel: clientPhone,
          commandes: [],
          totalMontant: 0,
          totalAvance: 0,
          totalReste: 0
        };
      }
      
      // Add command with proper data handling
      const commandeData = {
        Commande: item.Commande || 'Commande non spécifiée',
        Couleur: item.Couleur || '-',
        Date_commande: item.Date_commande || '-',
        Mt_commande: parseFloat(item.Mt_commande) || 0,
        Mt_Avance: parseFloat(item.Mt_Avance) || 0,
        Nature: item.Nature || '-',
        Reste: parseFloat(item.Reste) || 0,
        Delais: item.Delais || '-',
        _id: item._id
      };
      
      grouped[clientKey].commandes.push(commandeData);
      
      // Calculate totals
      grouped[clientKey].totalMontant += commandeData.Mt_commande;
      grouped[clientKey].totalAvance += commandeData.Mt_Avance;
      grouped[clientKey].totalReste += commandeData.Reste;
    });
    
    // Filter out groups with no valid client name
    return Object.values(grouped).filter(group => 
      group.Client && group.Client !== 'Client non spécifié' && group.commandes.length > 0
    );
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Handle Excel date serial numbers
      if (typeof dateString === 'number' && dateString > 25000) {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (dateString - 2) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('fr-FR');
      }
      
      // Handle string dates
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing DD/MM/YYYY format
        const parts = dateString.toString().split('/');
        if (parts.length === 3) {
          const parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toLocaleDateString('fr-FR');
          }
        }
        return dateString;
      }
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Fiches de Commande
              </h1>
              <p className="text-gray-600">
                Import et gestion intelligente de vos fiches de commande Excel
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              {/* Import Excel */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload size={20} />
                  Choisir Excel
                </label>
                {selectedFile && (
                  <button
                    onClick={handleImportExcel}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {importing ? <RefreshCw size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
                    {importing ? 'Import...' : 'Importer'}
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'normal' ? 'detailed' : 'normal')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {viewMode === 'normal' ? <Eye size={20} /> : <Table size={20} />}
                  {viewMode === 'normal' ? 'Vue Détaillée' : 'Vue Normale'}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={20} />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fiches</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fichiers</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalFiles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Feuilles</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.sheets?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Dernier Import</p>
                  <p className="text-sm font-bold text-gray-900">
                    {summary.files?.[0]?.lastImport ? 
                      new Date(summary.files[0].lastImport).toLocaleDateString() : 
                      'Aucun'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtres et Recherche</h3>
            <div className="flex items-center gap-2">
              {Object.keys(columnFilters).length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={16} />
                  Effacer tout
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter size={20} />
                {showFilters ? 'Masquer' : 'Afficher'} Filtres
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <select
                  value={filters.file}
                  onChange={(e) => {
                    const selectedFile = e.target.value;
                    setFilters({...filters, file: selectedFile, sheet: ''}); // Reset sheet when file changes
                    loadFilterOptions(selectedFile); // Reload sheets for selected file
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les fichiers</option>
                  {filterOptions.files.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feuille</label>
                <select
                  value={filters.sheet}
                  onChange={(e) => setFilters({...filters, sheet: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les feuilles</option>
                  {filterOptions.sheets.map(sheet => (
                    <option key={sheet} value={sheet}>{sheet}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={refreshData}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </button>
                  
                  <button
                    onClick={autoRefreshInterval ? stopAutoRefresh : startAutoRefresh}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      autoRefreshInterval 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${autoRefreshInterval ? 'animate-spin' : ''}`} />
                    {autoRefreshInterval ? 'Arrêter Auto' : 'Auto 30s'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {viewMode === 'detailed' ? 'Vue Détaillée' : 'Données'} ({pagination.totalRecords} fiches)
              </h3>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Aucune donnée trouvée. Importez un fichier Excel pour commencer.</p>
            </div>
          ) : viewMode === 'detailed' ? (
            // Professional Detailed View with Enhanced Cards
            <div className="space-y-8 animate-fadeIn">
              {getGroupedData().map((clientGroup, groupIndex) => (
                <div key={groupIndex} className="bg-white border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] transform overflow-hidden animate-slideUp" style={{animationDelay: `${groupIndex * 150}ms`}}>
                  {/* Enhanced Client Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-800 px-4 sm:px-8 py-4 sm:py-6 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-6">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-2 sm:p-3 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                          <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{clientGroup.Client}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <p className="text-blue-200 text-xs sm:text-sm font-medium">{clientGroup.Adresse}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 text-right">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-white/30 transition-colors duration-300">
                          <div className="text-white text-xs sm:text-sm font-semibold">{clientGroup.Numero_de_tel}</div>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          {clientGroup.commandes.length} commande{clientGroup.commandes.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Commands Table */}
                  <div className="overflow-x-auto bg-gradient-to-b from-gray-50 to-white">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gradient-to-r from-slate-100 to-gray-100 border-b-2 border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>Commande</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span>Couleur</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                              <span>Date</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>Montant</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span>Avance</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                              <span>Nature</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span>Reste</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                              <span>Délais</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {clientGroup.commandes.map((cmd, cmdIndex) => (
                          <tr key={cmdIndex} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-sm animate-slideInLeft" style={{animationDelay: `${cmdIndex * 100}ms`}}>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{cmd.Commande}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 hover:shadow-md transition-shadow duration-200">
                                {cmd.Couleur || '-'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                <span className="text-xs sm:text-sm font-medium text-blue-700">{formatDate(cmd.Date_commande)}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                                <span className="text-xs sm:text-sm font-bold text-green-700">
                                  {cmd.Mt_commande ? `${cmd.Mt_commande} DT` : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-orange-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                                <span className="text-xs sm:text-sm font-bold text-orange-700">
                                  {cmd.Mt_Avance ? `${cmd.Mt_Avance} DT` : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-200 hover:shadow-md transition-shadow duration-200">
                                {cmd.Nature || '-'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <div className="bg-gradient-to-r from-red-100 to-rose-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-red-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                                <span className="text-xs sm:text-sm font-bold text-red-700">
                                  {cmd.Reste ? `${cmd.Reste} DT` : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-5">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 hover:shadow-md transition-shadow duration-200">
                                {cmd.Delais || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Totals Footer */}
                  <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-t-2 border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                        <div className="text-base font-bold text-slate-700">
                          Résumé financier - {clientGroup.Client}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 sm:gap-8">
                        <div className="text-center bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-bounceIn">
                          <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Total Commande</div>
                          <div className="text-sm sm:text-lg font-bold text-green-700">
                            {clientGroup.totalMontant.toFixed(2)} DT
                          </div>
                        </div>
                        
                        <div className="text-center bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-bounceIn" style={{animationDelay: '100ms'}}>
                          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Total Avance</div>
                          <div className="text-sm sm:text-lg font-bold text-orange-700">
                            {clientGroup.totalAvance.toFixed(2)} DT
                          </div>
                        </div>
                        
                        <div className="text-center bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md border border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-bounceIn" style={{animationDelay: '200ms'}}>
                          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Total Reste</div>
                          <div className="text-sm sm:text-lg font-bold text-red-700">
                            {clientGroup.totalReste.toFixed(2)} DT
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Normal View Table - Excel-like display
            <div className="overflow-x-auto bg-white">
              <div className="mb-4 flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <button
                    onClick={autoRefreshInterval ? stopAutoRefresh : startAutoRefresh}
                    className={`flex items-center px-3 py-1 rounded text-sm ${
                      autoRefreshInterval 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${autoRefreshInterval ? 'animate-spin' : ''}`} />
                    {autoRefreshInterval ? 'Auto-actualisation ON' : 'Auto-actualisation OFF'}
                  </button>
                  <span className="text-xs text-gray-500">
                    {autoRefreshInterval ? 'Actualisation toutes les 30s' : 'Cliquez pour activer'}
                  </span>
                </div>
                
                {/* File management */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Gestion fichiers:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDeleteFile(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-1 text-sm border border-red-300 rounded bg-red-50 text-red-700"
                  >
                    <option value="">Supprimer un fichier...</option>
                    {filterOptions.files.map(file => (
                      <option key={file} value={file}>{file}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-blue-50">
                  <tr>
                    {filteredColumns.map(column => (
                      <th
                        key={column}
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border border-gray-300 bg-blue-100"
                        style={{ minWidth: '120px' }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{column.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-1">
                            {columnFilters[column] && (
                              <button
                                onClick={() => clearColumnFilter(column)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Effacer le filtre"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <div className="relative" ref={openDropdown === column ? dropdownRef : null}>
                              <button
                                onClick={() => setOpenDropdown(openDropdown === column ? null : column)}
                                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                  columnFilters[column] ? 'text-blue-600' : 'text-gray-400'
                                }`}
                                title="Filtrer cette colonne"
                              >
                                <ChevronDown size={14} />
                              </button>
                              
                              {openDropdown === column && (
                                <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                  <div className="p-3">
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value) {
                                            handleColumnFilter(column, value);
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                      <div
                                        className={`px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 rounded ${
                                          !columnFilters[column] ? 'bg-blue-50 text-blue-600' : ''
                                        }`}
                                        onClick={() => handleColumnFilter(column, 'all')}
                                      >
                                        (Tout afficher)
                                      </div>
                                      {columnValues[column]?.map((value, index) => (
                                        <div
                                          key={index}
                                          className={`px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 rounded truncate ${
                                            columnFilters[column] === value ? 'bg-blue-50 text-blue-600' : ''
                                          }`}
                                          onClick={() => handleColumnFilter(column, value)}
                                          title={value}
                                        >
                                          {value || '(Vide)'}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {getFilteredData().map((row, index) => {
                    const rowStyle = row._rowColor ? { backgroundColor: row._rowColor } : {};
                    return (
                      <tr key={index} className="hover:bg-gray-50" style={rowStyle}>
                        {filteredColumns.map(column => {
                          const cellValue = row[column] || '-';
                          const cellStyle = row[`_${column}_color`] ? { backgroundColor: row[`_${column}_color`] } : {};
                          
                          return (
                            <td 
                              key={column} 
                              className="px-4 py-2 text-sm text-gray-900 border border-gray-300"
                              style={cellStyle}
                            >
                              {column.toLowerCase().includes('date') && cellValue !== '-' 
                                ? formatDate(cellValue)
                                : cellValue
                              }
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(row)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {((pagination.current - 1) * 50) + 1} à {Math.min(pagination.current * 50, pagination.totalRecords)} sur {pagination.totalRecords} résultats
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({...pagination, current: pagination.current - 1})}
                    disabled={pagination.current === 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.current} sur {pagination.total}
                  </span>
                  <button
                    onClick={() => setPagination({...pagination, current: pagination.current + 1})}
                    disabled={pagination.current === pagination.total}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddEditModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          editingItem={editingItem}
          columns={filteredColumns}
        />
      )}
    </div>
  );
};

// Modal component for adding/editing items
const AddEditModal = ({ isOpen, onClose, onSave, editingItem, columns }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({});
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingItem ? 'Modifier la fiche' : 'Ajouter une fiche'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.filter(col => !col.startsWith('_')).map(column => (
              <div key={column}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {column.replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  value={formData[column] || ''}
                  onChange={(e) => setFormData({...formData, [column]: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingItem ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FicheCommande;
