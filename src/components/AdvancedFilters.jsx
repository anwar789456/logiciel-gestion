import React, { useState } from 'react';
import { Calendar, Filter, X, Search, User, Clock } from 'lucide-react';

const AdvancedFilters = ({ onFiltersChange, availableClients = [], loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    client: '',
    status: '',
    category: '',
    period: 'all' // all, today, week, month, year
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (type, value) => {
    const newDateRange = { ...filters.dateRange, [type]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: { start: '', end: '' },
      client: '',
      status: '',
      category: '',
      period: 'all'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const setPredefinedPeriod = (period) => {
    const now = new Date();
    let start = new Date();
    
    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = null;
    }

    const newFilters = {
      ...filters,
      period,
      dateRange: {
        start: start ? start.toISOString().split('T')[0] : '',
        end: period !== 'all' ? now.toISOString().split('T')[0] : ''
      }
    };
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.client) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.period !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Filter Toggle Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtres avancés</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Quick Period Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Période rapide
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Tout' },
                { key: 'today', label: 'Aujourd\'hui' },
                { key: 'week', label: '7 derniers jours' },
                { key: 'month', label: 'Ce mois' },
                { key: 'year', label: 'Cette année' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setPredefinedPeriod(period.key)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.period === period.key
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Client Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              Client
            </label>
            <select
              value={filters.client}
              onChange={(e) => handleFilterChange('client', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous les clients</option>
              {availableClients.map((client, index) => (
                <option key={index} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="En stock">En stock</option>
              <option value="Hors stock">Hors stock</option>
              <option value="En arrivage">En arrivage</option>
              <option value="Sur commande">Sur commande</option>
              <option value="pending">En attente</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              placeholder="Filtrer par catégorie..."
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
