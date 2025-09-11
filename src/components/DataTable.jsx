import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Filter, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DataTable = ({ 
  title, 
  columns, 
  fetchData, 
  data: staticData = null,
  searchPlaceholder = "Rechercher...",
  onRowClick = null,
  exportData = null 
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const loadData = async (page = 1, search = '') => {
    try {
      setLoading(true);
      
      // If static data is provided directly, use it instead of fetchData
      if (staticData && Array.isArray(staticData)) {
        // Filter data based on search term
        let filteredData = staticData;
        if (search) {
          filteredData = staticData.filter(item =>
            Object.values(item).some(value =>
              value && value.toString().toLowerCase().includes(search.toLowerCase())
            )
          );
        }
        
        // Paginate the filtered data
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
        
        setData(paginatedData);
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
        setTotalItems(filteredData.length);
        setCurrentPage(page);
        setError(null);
        return;
      }
      
      // If fetchData function is provided, use it
      if (typeof fetchData === 'function') {
        const response = await fetchData(page, itemsPerPage, search);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          // Direct array response (new stats endpoints)
          setData(response);
          setTotalPages(Math.ceil(response.length / itemsPerPage));
          setTotalItems(response.length);
          setCurrentPage(page);
        } else if (response.data && response.pagination) {
          // Paginated response format (existing endpoints)
          setData(response.data);
          setTotalPages(response.pagination.total);
          setTotalItems(response.pagination.totalItems);
          setCurrentPage(response.pagination.current);
        } else {
          // Fallback for unexpected formats
          setData(Array.isArray(response) ? response : []);
          setTotalPages(1);
          setTotalItems(Array.isArray(response) ? response.length : 0);
          setCurrentPage(page);
        }
        setError(null);
      } else {
        // No data source provided
        setData([]);
        setTotalPages(0);
        setTotalItems(0);
        setCurrentPage(1);
        setError(null);
      }
    } catch (err) {
      setError(t('error_loading_data'));
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1, searchTerm);
  }, [searchTerm, staticData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadData(page, searchTerm);
  };

  const handleExport = () => {
    if (exportData) {
      exportData(searchTerm);
    }
  };

  const formatValue = (value, type = 'text') => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      // date and datetime cases removed as requested
      case 'price':
        return `${value} DT`;
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800">
            {value}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${value}`} className="text-green-600 hover:text-green-800">
            {value}
          </a>
        );
      case 'status':
        const statusColors = {
          'En stock': 'bg-green-100 text-green-800',
          'Hors stock': 'bg-red-100 text-red-800',
          'En arrivage': 'bg-blue-100 text-blue-800',
          'Sur commande': 'bg-amber-100 text-amber-800',
          'disponible': 'bg-green-100 text-green-800',
          'indisponible': 'bg-red-100 text-red-800',
          'pending': 'bg-yellow-100 text-yellow-800',
          'completed': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800'
        };
        // Try to translate the status value, fallback to original value if no translation exists
        const translatedValue = t(value.toLowerCase(), { defaultValue: value });
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {translatedValue}
          </span>
        );
      default:
        return String(value).length > 50 ? `${String(value).substring(0, 50)}...` : String(value);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
            <button 
              onClick={() => loadData(currentPage, searchTerm)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('showing')} {(currentPage - 1) * itemsPerPage + 1} {t('to')} {Math.min(currentPage * itemsPerPage, totalItems)} {t('of')} {totalItems} {t('elements')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearch}
                autoComplete="off"
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Export Button */}
            {exportData && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                {t('export')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container with Fixed Header and Scrollable Body */}
      <div className="overflow-hidden">
        {/* Table Header - Fixed */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {column.header || column.label}
                  </th>
                ))}
                {onRowClick && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                )}
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body - Scrollable with 100px height */}
        <div className="overflow-x-auto overflow-y-auto" style={{ height: '32vh' }}>
          <table className="w-full">
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {column.render ? column.render(item[column.key]) : (item[column.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Fixed Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('page_of', { current: currentPage, total: totalPages })}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-label={t('loading')}></div>
        </div>
      )}
    </div>
  );
};

export default DataTable;