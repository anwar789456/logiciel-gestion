import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Download, Edit, Trash2, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductDetailsModal from './ProductDetailsModal';

const TableDisplayProduct = React.forwardRef(({ 
  title, 
  columns, 
  fetchData, 
  searchPlaceholder,
  onRowClick = null,
  onEdit = null,
  onDelete = null,
  exportData = null 
}, ref) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('productsPerPage')) || 10;
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPageDropdownRef = useRef(null);

  const loadData = async (page = 1, search = '', perPage = itemsPerPage) => {
    try {
      // Only set loading if we don't already have data (prevents full table flicker)
      if (data.length === 0) {
        setLoading(true);
      } else {
        // For subsequent loads, we'll use a more targeted loading approach
        setLoading(true);
      }
      
      const response = await fetchData(page, perPage, search);
      
      // Update state in a batch to minimize renders
      setData(response.data);
      setTotalPages(response.pagination.total);
      setTotalItems(response.pagination.totalItems);
      setCurrentPage(response.pagination.current);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    refreshData: (page = currentPage) => {
      loadData(page, searchTerm, itemsPerPage);
    }
  }));

  useEffect(() => {
    // Add a small delay before loading data to prevent UI jank
    const loadDataWithDelay = setTimeout(() => {
      loadData(1, searchTerm, itemsPerPage);
    }, 50);
    
    // Clean up the timeout if the component unmounts or dependencies change
    return () => clearTimeout(loadDataWithDelay);
  }, [searchTerm, itemsPerPage]);
  
  // Handle clicks outside the items per page dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showItemsPerPageDropdown && itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(event.target)) {
        setShowItemsPerPageDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showItemsPerPageDropdown]);

  // Add debounce for search to prevent excessive refreshes
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    
    // Always update the input field immediately for responsive UI
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to actually perform the search after typing stops
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      // The actual data loading will be triggered by the useEffect that watches searchTerm
    }, 300); // 300ms delay
    
    setSearchTimeout(timeoutId);
  };
  
  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadData(page, searchTerm, itemsPerPage);
  };
  
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    localStorage.setItem('productsPerPage', value);
    setCurrentPage(1);
    loadData(1, searchTerm, value);
    setShowItemsPerPageDropdown(false);
  };

  const handleExport = () => {
    if (exportData) {
      exportData(searchTerm);
    }
  };

  const formatValue = (value, type = 'text') => {
    if (value === null || value === undefined) return (
      <span className="text-gray-400 italic">N/A</span>
    );
    
    switch (type) {
      case 'price':
        return (
          <span className="text-green-600 dark:text-green-400 font-semibold">
            {value} DT
          </span>
        );
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            {value}
          </a>
        );
      case 'phone':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors"
          >
            {value}
          </a>
        );
      case 'status':
        // Convert value to lowercase for case-insensitive matching
        const statusValue = String(value);
        const statusStyles = {
          'En stock': 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
          'Hors stock': 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
          'En arrivage': 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200',
          'Sur commande': 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200',
          'pending': 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200',
          'completed': 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
          'cancelled': 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
        };
        return (
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyles[statusValue] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {value}
          </span>
        );
      default:
        return String(value).length > 50 ? `${String(value).substring(0, 50)}...` : String(value);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/3"></div>
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-64"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex-1"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-700 overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Erreur de chargement</h3>
            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
            <button 
              onClick={() => loadData(currentPage, searchTerm)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define CSS variables for header and pagination heights
  const headerHeight = '100px'; // Increased from 64px to accommodate the total items count
  const paginationHeight = '56px';

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative"
      style={{
        '--header-height': headerHeight,
        '--pagination-height': paginationHeight
      }}
    >
      {/* Enhanced Header with Gradient */}
      <div 
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 relative"
        style={{ height: headerHeight, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-12 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-500 rounded-full"></span>
                  {totalItems} {totalItems > 1 ? t('items') : t('item')} {t('in_total')}
                </p>
              </div>
              
              {/* Small loading indicator that doesn't disrupt the layout */}
              {loading && data.length > 0 && (
                <div className="flex items-center absolute top-6 right-24">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                </div>
              )}
            </div>
          
        </div>
      </div>

      {/* Enhanced Table Container */}
      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        <div className="overflow-x-auto overflow-y-auto" style={{ height: '400px' }}>
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-600"
                    style={{ width: column.width || 'auto' }}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody 
              className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 transition-opacity duration-300"
              style={{ opacity: loading && data.length > 0 ? '0.6' : '1' }}
            >
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    transition-all duration-200 ease-in-out
                    ${hoveredRow === rowIndex 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-md' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((column, colIndex) => {
                    // Actions Column (special case for actions key)
                    if (column.key === 'actions' && column.type === 'custom') {
                      return (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(row);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                              title="Voir les détails"
                            >
                              <Eye size={16} />
                            </button>
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row);
                                }}
                                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Modifier"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(row._id);
                                }}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    }
                    
                    // All other columns (including custom columns with render function)
                    return (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                        style={{ width: column.width || 'auto' }}
                      >
                        {column.type === 'custom' && typeof column.render === 'function'
                          ? column.render(row[column.key], row)
                          : formatValue(row[column.key], column.type)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal 
        product={selectedProduct}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />

      {/* Enhanced Pagination */}
      {totalPages > 0 && (
        <div 
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        style={{ height: paginationHeight }}
      >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Page {currentPage} sur {totalPages}
              </div>
              
              {/* Items per page dropdown */}
              <div className="relative" ref={itemsPerPageDropdownRef}>
                <button 
                  onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>{t('show_items_per_page')}: {itemsPerPage}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showItemsPerPageDropdown && (
                  <div className="fixed mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto" style={{ 
                    left: itemsPerPageDropdownRef.current?.getBoundingClientRect().left + 'px', 
                    top: (window.innerHeight - itemsPerPageDropdownRef.current?.getBoundingClientRect().bottom < 150) 
                      ? (itemsPerPageDropdownRef.current?.getBoundingClientRect().top - 150) + 'px' 
                      : (itemsPerPageDropdownRef.current?.getBoundingClientRect().bottom + 8) + 'px'
                  }}>
                    <ul className="py-1">
                      {[10, 20, 50].map((value) => (
                        <li key={value}>
                          <button
                            onClick={() => handleItemsPerPageChange(value)}
                            className={`w-full text-left px-4 py-2 text-sm ${itemsPerPage === value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                          >
                            {value} {t('items_per_page')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Enhanced Page Numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      pageNum === currentPage
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* We're not using a full overlay for content refreshes anymore */}
      
      {/* Initial loading state */}
      {loading && data.length === 0 && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <div className="animate-pulse absolute inset-0 rounded-full bg-blue-100 opacity-20"></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('loading')}...</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default TableDisplayProduct;