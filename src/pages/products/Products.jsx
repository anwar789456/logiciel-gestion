import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyPlus, LayoutTemplate, Tags, X, AlertCircle } from 'lucide-react';
import { FetchAllProductItems, DeleteProductById, FetchAllProductTypeItems } from '../../api/product';
import TableDisplayProduct from '../../components/product/TableDisplayProduct';
import AddFormProduct from '../../components/productForm/AddFormProduct';
import EditFormProduct from '../../components/productForm/EditFormProduct';
import ProductTypesModal from '../../components/productTypes/ProductTypesModal';
import AdvancedProductFilters from '../../components/product/AdvancedProductFilters';
import { Collapse } from 'react-bootstrap';


export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductTypesModal, setShowProductTypesModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, productId: null });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Advanced filters closed by default
  const [advancedFilters, setAdvancedFilters] = useState({
    // dateRange removed as requested
    // category removed as requested
    type: '',
    typeProd: '',
    status: '',
    priceRange: { min: '', max: '' },
    quantity: { min: '', max: '' },
    // period removed as requested
    search: ''
  });
  
  // Reference to the TableDisplayProduct component
  const tableRef = useRef(null);
  
  // Get unique categories and types from products
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  
  // Store the mapping between valueSous and titleSous for product types
  const [typeProdMapping, setTypeProdMapping] = useState({});
  
  // Extract unique categories and types from product data
  useEffect(() => {
    const fetchCategoriesAndTypes = async () => {
      try {
        const data = await FetchAllProductItems();
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(product => product.categorie).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Extract unique product types
        const uniqueTypes = [...new Set(data.map(product => product.typeProd).filter(Boolean))];
        setProductTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching categories and types:', error);
      }
    };
    
    fetchCategoriesAndTypes();
  }, []);
  
  // Fetch product types and create mapping between valueSous and titleSous
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const typeProduits = await FetchAllProductTypeItems();
        
        // Create a mapping between valueSous and titleSous
        const mapping = {};
        
        typeProduits.forEach(typeProduct => {
          if (typeProduct.sousTitles && Array.isArray(typeProduct.sousTitles)) {
            typeProduct.sousTitles.forEach(sousTitle => {
              if (sousTitle.valueSous && sousTitle.titleSous) {
                mapping[sousTitle.valueSous] = sousTitle.titleSous;
              }
            });
          }
        });
        
        setTypeProdMapping(mapping);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };
    
    fetchProductTypes();
  }, []);

  const fetchProducts = async (page = 1, itemsPerPage = 10, searchTerm = '') => {
    setLoading(true);
    try {
      const data = await FetchAllProductItems();
      
      // Apply all filters
      let filteredData = data;
      
      // Apply search term filter (from search bar or advanced filters)
      const effectiveSearchTerm = searchTerm || advancedFilters.search || '';
      if (effectiveSearchTerm) {
        const searchLower = effectiveSearchTerm.toLowerCase();
        filteredData = filteredData.filter(product => 
          product.nom?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.categorie?.toLowerCase().includes(searchLower) ||
          product.idProd?.toLowerCase().includes(searchLower)
        );
      }
      
      // Category filter removed as requested
      
      // Apply type filter (legacy)
      if (advancedFilters.type) {
        filteredData = filteredData.filter(product => 
          product.typeProd === advancedFilters.type
        );
      }
      
      // Apply typeProd filter (new schema)
      if (advancedFilters.typeProd) {
        filteredData = filteredData.filter(product => 
          product.typeProd === advancedFilters.typeProd
        );
      }
      
      // Apply status filter
      if (advancedFilters.status) {
        filteredData = filteredData.filter(product => 
          product.disponibilite === advancedFilters.status
        );
      }
      
      // Apply price range filter
      if (advancedFilters.priceRange.min || advancedFilters.priceRange.max) {
        filteredData = filteredData.filter(product => {
          const price = parseFloat(product.minPrice);
          if (isNaN(price)) return false;
          
          if (advancedFilters.priceRange.min && advancedFilters.priceRange.max) {
            return price >= parseFloat(advancedFilters.priceRange.min) && 
                   price <= parseFloat(advancedFilters.priceRange.max);
          } else if (advancedFilters.priceRange.min) {
            return price >= parseFloat(advancedFilters.priceRange.min);
          } else if (advancedFilters.priceRange.max) {
            return price <= parseFloat(advancedFilters.priceRange.max);
          }
          return true;
        });
      }
      
      // Apply quantity range filter
      if (advancedFilters.quantity.min || advancedFilters.quantity.max) {
        filteredData = filteredData.filter(product => {
          const quantity = parseInt(product.quantite);
          if (isNaN(quantity)) return false;
          
          if (advancedFilters.quantity.min && advancedFilters.quantity.max) {
            return quantity >= parseInt(advancedFilters.quantity.min) && 
                   quantity <= parseInt(advancedFilters.quantity.max);
          } else if (advancedFilters.quantity.min) {
            return quantity >= parseInt(advancedFilters.quantity.min);
          } else if (advancedFilters.quantity.max) {
            return quantity <= parseInt(advancedFilters.quantity.max);
          }
          return true;
        });
      }
      
      // Date range filter removed as requested
      
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
      console.error('Error fetching products:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await DeleteProductById(id);
      setDeleteConfirmation({ show: false, productId: null });
      // Refresh the product list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const columns = [
    // { header: 'ID', key: 'idProd', type: 'text', width: '10%' },
    { header: t('name'), key: 'nom', type: 'text', width: '25%' },
    // { header: t('category'), key: 'categorie', type: 'text', width: '15%' },
    { 
      header: t('type'), 
      key: 'typeProd', 
      type: 'custom',
      width: '15%',
      render: (value, row) => {
        // Display the titleSous if available, otherwise show 'N/A'
        if (value && typeProdMapping[value]) {
          return typeProdMapping[value];
        } else {
          return 'N/A'; // Show 'N/A' if no mapping found or no value
        }
      }
    },
    { header: t('quantity'), key: 'quantite', type: 'text', width: '10%' },
    { header: t('price'), key: 'minPrice', type: 'price', width: '15%' },
    { header: t('availability'), key: 'disponibilite', type: 'status', width: '15%' },
    {
      header: t('actions'),
      key: 'actions',
      type: 'custom',
      width: '20%'
    },
  ];

  return (
    <div className='pt-4'>
      <div className='pb-4 pl-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('products')}
          </h1>
        </div>
        <div className='flex pr-2'>
          <button
            onClick={() => setShowProductTypesModal(true)}
            className='flex items-center bg-transparent border border-blue-600
              hover:bg-blue-600 text-blue-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >
            <Tags className='mr-2 mt-0.5' size={20} />
            {t('product_types')}
          </button>
          <button
            className='flex items-center bg-transparent border border-blue-600
              hover:bg-blue-600 text-blue-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >
            <LayoutTemplate className='mr-2 mt-0.5' size={20} />
            {t('product_management')}
          </button>

          <button 
            onClick={() => setShowAddForm(true)}
            className='flex items-center bg-blue-600 
            hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl 
            active:scale-85
            cursor-pointer shadow-lg hover:shadow-lg active:shadow-inner 
            transition-all duration-400 ease-in-out'
          >
            <CopyPlus className='mr-2 mt-0.5' size={20} />
            {t('ajouter_produit')}
          </button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      <Collapse in={showAdvancedFilters}>
        <div className="px-0 py-0 border-b border-gray-200 dark:border-gray-700">
          <AdvancedProductFilters 
            filters={advancedFilters} 
            categories={categories}
            types={productTypes}
            setFilters={(newFilters) => {
              setAdvancedFilters(newFilters);
              // No need to trigger refresh here as it will be handled by onApplyFilters
            }} 
            onApplyFilters={() => {
              // Reset to first page when filters are applied
              if (tableRef.current) {
                // Use a small timeout to prevent UI jank
                setTimeout(() => {
                  tableRef.current.refreshData(1);
                }, 10);
              }
            }}
            onFiltersChange={(newFilters) => {
              setAdvancedFilters(newFilters);
              // No need to trigger refresh here as it will be handled by onApplyFilters
            }}
          />
        </div>
      </Collapse>
      
      {/* Product Table */}
      <div className="p-2">
        <TableDisplayProduct
          ref={tableRef}
          title={t('product_list')}
          columns={columns}
          fetchData={(page, itemsPerPage, searchTerm) => fetchProducts(page, itemsPerPage, searchTerm)}
          searchPlaceholder={t('search_products')}
          onRowClick={(product) => handleEditProduct(product)}
          onEdit={handleEditProduct}
          onDelete={(id) => setDeleteConfirmation({ show: true, productId: id })}
        />
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('add_product')}</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AddFormProduct onClose={() => setShowAddForm(false)} onSuccess={() => {
                setShowAddForm(false);
                fetchProducts();
              }} />
            </div>
            
            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  form="product-form"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditForm && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowEditForm(false);
              setSelectedProduct(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('edit_product')}</h2>
              <button 
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <EditFormProduct 
                product={selectedProduct} 
                onClose={() => {
                  setShowEditForm(false);
                  setSelectedProduct(null);
                }} 
                onSuccess={() => {
                  setShowEditForm(false);
                  setSelectedProduct(null);
                  fetchProducts();
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="mr-2" size={24} />
              <h2 className="text-xl font-semibold">{t('confirm_delete')}</h2>
            </div>
            <p className="mb-6">{t('delete_product_confirmation')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, productId: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmation.productId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Types Modal */}
      <ProductTypesModal 
        isOpen={showProductTypesModal} 
        onClose={() => setShowProductTypesModal(false)} 
      />
    </div>
  )
}
