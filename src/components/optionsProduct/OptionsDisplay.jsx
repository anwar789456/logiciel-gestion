import React, { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, Package, Ruler, Layers, Search, X, UserPlus, Check } from 'lucide-react';
import { FetchAllProductItems, UpdateProductById } from '../../api/product';

export const OptionsDisplay = ({ options, handleEdit, handleDelete }) => {
  const [products, setProducts] = useState([]);
  const [assigningOption, setAssigningOption] = useState(null); // Stores the option being assigned
  const [selectedProducts, setSelectedProducts] = useState([]); // Array of product IDs
  const [productSearch, setProductSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
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

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await FetchAllProductItems();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter(product => 
      product.nom?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.idProd?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  // Handle opening the assign dropdown
  const handleOpenAssign = (option) => {
    setAssigningOption(option);
    setSelectedProducts([]);
    setProductSearch('');
  };

  // Handle closing the assign dropdown
  const handleCloseAssign = () => {
    setAssigningOption(null);
    setSelectedProducts([]);
    setProductSearch('');
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Remove product from selection
  const removeProductFromSelection = (productId) => {
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };

  // Handle assigning the option to selected products
  const handleAssignToProducts = async () => {
    if (!assigningOption || selectedProducts.length === 0) return;
    
    setIsAssigning(true);
    console.log('=== Starting Product Assignment ===');
    console.log('Assigning option:', assigningOption.nomOption, 'ID:', assigningOption._id);
    console.log('Selected products count:', selectedProducts.length);
    
    try {
      // Update each selected product
      const updatePromises = selectedProducts.map(async (productId) => {
        const product = products.find(p => p._id === productId);
        if (!product) {
          console.warn(`Product not found for ID: ${productId}`);
          return;
        }

        console.log('\n--- Processing product:', product.nom, '---');
        console.log('Product ID:', productId);
        console.log('Original product data:', JSON.parse(JSON.stringify(product)));
        console.log('Original sizes structure:', product.sizes);

        // Ensure sizes is an array
        let currentSizes = [];
        if (Array.isArray(product.sizes)) {
          currentSizes = product.sizes;
          console.log('Sizes is already an array:', currentSizes);
          console.log('First size element structure:', currentSizes[0]);
        } else if (typeof product.sizes === 'string') {
          try {
            currentSizes = JSON.parse(product.sizes);
            console.log('Parsed sizes from string:', currentSizes);
          } catch (e) {
            console.error('Failed to parse sizes string:', e);
            currentSizes = [];
          }
        } else {
          console.log('Sizes is neither array nor string, defaulting to empty array');
        }

        // Get the sizesOptions from the dimension option
        const sizesOptionsToAdd = assigningOption.sizesOptions || [];
        
        if (sizesOptionsToAdd.length === 0) {
          console.warn(`No sizesOptions found in option ${assigningOption.nomOption}`);
          return;
        }

        // Check if any of these sizes are already in the product
        const newSizesToAdd = sizesOptionsToAdd.filter(newSize => {
          return !currentSizes.some(existingSize => 
            existingSize.longueur === newSize.longueur && 
            existingSize.largeur === newSize.largeur
          );
        });

        if (newSizesToAdd.length === 0) {
          console.log(`✓ All sizes from "${assigningOption.nomOption}" are already assigned to product ${product.nom}`);
          return;
        }

        // Add the new sizes to the product's sizes array
        const updatedSizes = [...currentSizes, ...newSizesToAdd];
        console.log(`Adding ${newSizesToAdd.length} new size(s) to product`);
        console.log('Updated sizes array:', updatedSizes);

        // Create a clean copy of the product data, removing any computed or problematic fields
        const cleanedProduct = {
          idProd: product.idProd || '',
          typeProd: product.typeProd || '',
          nom: product.nom || '',
          description: product.description || '',
          quantite: product.quantite || '0',
          images: product.images || [],
          minPrice: product.minPrice || '',
          maxPrice: product.maxPrice || '',
          tva: product.tva || '',
          longueur: product.longueur || '',
          largeur: product.largeur || '',
          hauteur: product.hauteur || '',
          profondeur_assise: product.profondeur_assise || '',
          display: product.display || 'oui',
          categorie: product.categorie || '',
          disponibilite: product.disponibilite || 'En stock',
          options: product.options || [],
          sizes: updatedSizes,
          mousse: product.mousse || [],
          subcategorie: product.subcategorie || '',
          direction: product.direction || '',
          delai: product.delai || '',
          dimensions: product.dimensions || [],
          ordre: product.ordre || 0
        };

        console.log('Cleaned product data to send:', cleanedProduct);
        console.log('Sending update request...');

        // Update the product - send the cleaned product data with updated sizes
        await UpdateProductById(productId, cleanedProduct);
        console.log('✓ Successfully updated product:', product.nom);
      });

      await Promise.all(updatePromises);
      
      console.log('=== Assignment Complete ===');
      alert(`Successfully assigned "${assigningOption.nomOption}" to ${selectedProducts.length} product(s)`);
      handleCloseAssign();
      
      // Refresh products list
      const data = await FetchAllProductItems();
      setProducts(data);
    } catch (error) {
      console.error('=== Error assigning option to products ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      alert(`Error assigning option to products: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsAssigning(false);
    }
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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dimensions</h4>
                    <button
                      onClick={() => handleOpenAssign(option)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                    >
                      <UserPlus size={14} />
                      <span>Assign to Products</span>
                    </button>
                  </div>
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

      {/* Product Assignment Modal */}
      {assigningOption && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCloseAssign}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign "{assigningOption.nomOption}" to Products
              </h3>
              <button
                onClick={handleCloseAssign}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products by name or ID..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Selected Products Display */}
            {selectedProducts.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Products ({selectedProducts.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map(productId => {
                    const product = products.find(p => p._id === productId);
                    if (!product) return null;
                    return (
                      <div
                        key={productId}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        <span>{product.nom}</span>
                        <button
                          onClick={() => removeProductFromSelection(productId)}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map(product => (
                    <div
                      key={product._id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => toggleProductSelection(product._id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.nom}
                        </div>
                      </div>
                      {selectedProducts.includes(product._id) && (
                        <Check size={18} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseAssign}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToProducts}
                disabled={selectedProducts.length === 0 || isAssigning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAssigning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Assign to {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};