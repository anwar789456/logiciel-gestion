import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Package, Ruler, Layers, Search, X } from 'lucide-react';

export const OptionsDisplay = ({ options, handleEdit, handleDelete }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priceRange: { min: '', max: '' },
    sortBy: 'name',
    showCustomOptions: true,
    showSizeOptions: true,
    showMousseOptions: true
  });

  const getIconByType = (type) => {
    switch (type) {
      case 'options':
        return <Package className="text-blue-500" />;
      case 'sizes':
        return <Ruler className="text-green-500" />;
      case 'mousse':
        return <Layers className="text-purple-500" />;
      default:
        return null;
    }
  };

  const getMaxPrice = (option) => {
    let prices = [];
    if (option.customOptions) {
      prices = [...prices, ...option.customOptions.map(o => parseFloat(o.prix_option))];
    }
    if (option.sizesOptions) {
      prices = [...prices, ...option.sizesOptions.map(o => parseFloat(o.prix_option))];
      prices = [...prices, ...option.sizesOptions.map(o => parseFloat(o.prix_coffre))];
    }
    if (option.mousseOptions) {
      prices = [...prices, ...option.mousseOptions.map(o => parseFloat(o.mousse_prix))];
    }
    return Math.max(...prices, 0);
  };

  const filteredOptions = useMemo(() => {
    if (!options) return [];
    
    return options.filter(option => {
      // Search filter
      const searchMatch = option.nomOption.toLowerCase().includes(filters.search.toLowerCase());
      
      // Type filter
      const typeMatch = filters.type === 'all' || option.typeOption === filters.type;
      
      // Price range filter
      const maxPrice = getMaxPrice(option);
      const priceMatch = (!filters.priceRange.min || maxPrice >= parseFloat(filters.priceRange.min)) &&
                        (!filters.priceRange.max || maxPrice <= parseFloat(filters.priceRange.max));
      
      // Options visibility filters
      const customMatch = !option.customOptions?.length || filters.showCustomOptions;
      const sizeMatch = !option.sizesOptions?.length || filters.showSizeOptions;
      const mousseMatch = !option.mousseOptions?.length || filters.showMousseOptions;
      
      return searchMatch && typeMatch && priceMatch && customMatch && sizeMatch && mousseMatch;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'priceAsc':
          return getMaxPrice(a) - getMaxPrice(b);
        case 'priceDesc':
          return getMaxPrice(b) - getMaxPrice(a);
        default:
          return a.nomOption.localeCompare(b.nomOption);
      }
    });
  }, [options, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      priceRange: { min: '', max: '' },
      sortBy: 'name',
      showCustomOptions: true,
      showSizeOptions: true,
      showMousseOptions: true
    });
  };

  if (!options || options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Package size={48} className="mb-4" />
        <p className="text-lg font-medium">No options available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        {filteredOptions.map((option) => (
          <div key={option._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  {getIconByType(option.typeOption)}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{option.nomOption}</h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(option)} 
                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                  aria-label="Edit option"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(option._id)} 
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300"
                  aria-label="Delete option"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              {option.typeOption === "options" ? "Tarification Tissus" :
               option.typeOption === "sizes" ? "Dimensions" :
               option.typeOption === "mousse" ? "Mousse" : option.typeOption}
            </div>

            <div className="p-4">
              {option.customOptions && option.customOptions.length > 0 && filters.showCustomOptions && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tarification Tissus</h4>
                  <div className="space-y-2">
                    {option.customOptions.map((custom, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-gray-800 dark:text-gray-200">{custom.option_name}</span>
                        <div className="flex space-x-3">
                          <span className="font-medium text-gray-900 dark:text-white">{custom.prix_option} TND</span>
                          {custom.tva && <span className="text-sm text-gray-500 dark:text-gray-400">TVA: {custom.tva}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {option.sizesOptions && option.sizesOptions.length > 0 && filters.showSizeOptions && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dimensions</h4>
                  <div className="space-y-3">
                    {option.sizesOptions.map((size, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <div className="mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Dimension:</span>
                          <span className="ml-1 text-gray-800 dark:text-gray-200"> {size.longueur}cm × {size.largeur}cm</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Prix:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{size.prix_option} TND</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Prix Coffre:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{size.prix_coffre} TND</span>
                          </div>
                          {size.tva && (
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">TVA:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{size.tva}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {option.mousseOptions && option.mousseOptions.length > 0 && filters.showMousseOptions && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mousse</h4>
                  <div className="space-y-2">
                    {option.mousseOptions.map((mousse, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-gray-800 dark:text-gray-200">{mousse.mousse_name}</span>
                        <div className="flex space-x-3">
                          <span className="font-medium text-gray-900 dark:text-white">{mousse.mousse_prix} TND</span>
                          {mousse.tva && <span className="text-sm text-gray-500 dark:text-gray-400">TVA: {mousse.tva}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};