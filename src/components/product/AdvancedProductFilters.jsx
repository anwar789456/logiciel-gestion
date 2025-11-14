import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Search, Calendar, Tag, Package, Layers, CalendarDays, ChevronDown } from 'lucide-react';
import { FetchAllProductTypeItems } from '../../api/product';

const AdvancedProductFilters = ({ filters, setFilters, onFiltersChange, onApplyFilters, categories = [] }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false); // Start with filters closed
  const [productTypes, setProductTypes] = useState([]);
  const [typeProdOptions, setTypeProdOptions] = useState([]);
  
  // Date filter removed as requested

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFiltersChange) onFiltersChange(newFilters);
    // Automatically apply filters when they change
    // Use setTimeout to ensure state is updated before applying filters
    setTimeout(() => {
      if (onApplyFilters) onApplyFilters();
    }, 0);
  };

  // Date range change handler removed as requested

  const handlePriceRangeChange = (type, value) => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    if (onFiltersChange) onFiltersChange(newFilters);
    // Automatically apply filters when they change
    // Use setTimeout to ensure state is updated before applying filters
    setTimeout(() => {
      if (onApplyFilters) onApplyFilters();
    }, 0);
  };

  const handleQuantityRangeChange = (type, value) => {
    const newQuantityRange = { ...filters.quantity, [type]: value };
    const newFilters = { ...filters, quantity: newQuantityRange };
    setFilters(newFilters);
    if (onFiltersChange) onFiltersChange(newFilters);
    // Automatically apply filters when they change
    // Use setTimeout to ensure state is updated before applying filters
    setTimeout(() => {
      if (onApplyFilters) onApplyFilters();
    }, 0);
  };

  const clearFilters = () => {
    const clearedFilters = {
      // dateRange removed as requested
      category: '',
      type: '',
      typeProd: '',
      status: '',
      priceRange: { min: '', max: '' },
      quantity: { min: '', max: '' },
      // period removed as requested
      search: ''
    };
    setFilters(clearedFilters);
    if (onFiltersChange) onFiltersChange(clearedFilters);
    // Automatically apply filters after clearing
    // Use setTimeout to ensure state is updated before applying filters
    setTimeout(() => {
      if (onApplyFilters) onApplyFilters();
    }, 0);
  };

  // setPredefinedPeriod function removed as requested

  const getActiveFiltersCount = () => {
    let count = 0;
    // Date filter check removed as requested
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.typeProd) count++;
    if (filters.status) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.quantity.min || filters.quantity.max) count++;
    // Period check removed as requested
    return count;
  };

  // Fetch product types and process them for the dropdown
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const data = await FetchAllProductTypeItems();
        setProductTypes(data);
        
        // Process product types to extract sousTitles for the dropdown
        const options = [];
        data.forEach(type => {
          if (type.sousTitles && type.sousTitles.length > 0) {
            // Add the main title as a disabled option header
            options.push({
              value: '',
              label: type.title,
              disabled: true,
              isHeader: true
            });
            
            // Add subtitles as selectable options
            type.sousTitles.forEach(subTitle => {
              if (subTitle.valueSous && subTitle.titleSous) {
                // Only add unique values
                if (!options.some(option => option.value === subTitle.valueSous)) {
                  options.push({
                    value: subTitle.valueSous,
                    label: `  ${subTitle.titleSous}`,
                    disabled: false
                  });
                }
              }
            });
          }
        });
        
        setTypeProdOptions(options);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };
    
    fetchProductTypes();
  }, []);
  
  // Close dropdowns when clicking outside - date filter removed as requested
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Date filter check removed as requested
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-none ">
      {/* Filter Toggle Button */}
      <div className="px-8 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">{t('advanced_filters')}</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            {t('clear_all_filters')}
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Quick Period Filters removed as requested */}

          {/* Date Filter removed as requested */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter removed as requested */}

            {/* Product Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Package className="inline h-4 w-4 mr-1" />
                {t('product_type_filter')}
              </label>
              <select
                value={filters.typeProd}
                onChange={(e) => handleFilterChange('typeProd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('all_product_types')}</option>
                {typeProdOptions.map((option, index) => (
                  <option 
                    key={index} 
                    value={option.value} 
                    disabled={option.disabled}
                    style={option.isHeader ? { fontWeight: 'bold', backgroundColor: '#f3f4f6' } : {}}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Layers className="inline h-4 w-4 mr-1" />
                {t('availability')}
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('all_statuses')}</option>
                <option value="En stock">{t('en stock')}</option>
                <option value="Hors stock">{t('hors stock')}</option>
                <option value="En arrivage">{t('en arrivage')}</option>
                <option value="Sur commande">{t('sur commande')}</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('price_range')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder={t('min_price')}
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder={t('max_price')}
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Quantity Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('quantity_range')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder={t('min_quantity')}
                  value={filters.quantity.min}
                  onChange={(e) => handleQuantityRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder={t('max_quantity')}
                  value={filters.quantity.max}
                  onChange={(e) => handleQuantityRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedProductFilters;