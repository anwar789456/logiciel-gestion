import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyPlus, Plus, LayoutTemplate, Tags, X, AlertCircle, Settings, GripVertical, CheckCircle } from 'lucide-react';
import { useAccessControl } from '../../hooks/useAccessControl';
import { FetchAllProductItems, DeleteProductById, FetchAllProductTypeItems } from '../../api/product';
import { ReorderProducts } from '../../api/Category/category';
import TableDisplayProduct from '../../components/product/TableDisplayProduct';
import AddFormProduct from '../../components/productForm/AddFormProduct';
import EditFormProduct from '../../components/productForm/EditFormProduct';
import ProductTypesModal from '../../components/productTypes/ProductTypesModal';
import AdvancedProductFilters from '../../components/product/AdvancedProductFilters';
import Options from '../../components/optionsProduct/OptionsProduct';
import { Collapse } from 'react-bootstrap';
import { toast } from 'react-toastify';


export default function Products() {
  const { t } = useTranslation();
  const { canWrite, showIfCanWrite } = useAccessControl();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductTypesModal, setShowProductTypesModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [showProductOrderingModal, setShowProductOrderingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [productsToOrder, setProductsToOrder] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dragNode = useRef();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, productId: null, password: '' });
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
  const [categoriesWithSubcategories, setCategoriesWithSubcategories] = useState([]);
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
        
        // Create a map of categories with their subcategories
        const categoryMap = {};
        data.forEach(product => {
          if (product.categorie && product.subcategorie) {
            if (!categoryMap[product.categorie]) {
              categoryMap[product.categorie] = new Set();
            }
            categoryMap[product.categorie].add(product.subcategorie);
          }
        });
        
        // Convert to array format
        const categoriesWithSubs = Object.keys(categoryMap).map(category => ({
          name: category,
          subcategories: Array.from(categoryMap[category])
        }));
        
        setCategoriesWithSubcategories(categoriesWithSubs);
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
      // Check if password is correct
      if (deleteConfirmation.password !== "123") {
        // Show error message
        toast.error(t('incorrect_password'));
        return;
      }
      
      await DeleteProductById(id);
      setDeleteConfirmation({ show: false, productId: null, password: '' });
      
      // Get the current page from tableRef and refresh while maintaining the page
      if (tableRef.current) {
        const currentPage = tableRef.current.getCurrentPage();
        tableRef.current.refreshData(currentPage);
      }
      
      // Show custom success message
      toast.custom(
        (t) => (
          <div className="flex items-center w-full max-w-sm bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-lg rounded-lg pointer-events-auto">
            <div className="flex-shrink-0 p-4 bg-green-50 dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('product_deleted_successfully')}
              </p>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t('close')}
              </button>
            </div>
          </div>
        ),
        {
          duration: 3000,
          position: "top-right"
        }
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('error_deleting_product'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'bg-red-500 text-white'
      });
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const handleCloneProduct = (product) => {
    setSelectedProduct(product); // Store the product data to be cloned
    setShowAddForm(true); // Open the add form
  };

  const columns = [
    // { header: 'ID', key: 'idProd', type: 'text', width: '10%' },
    { header: t('name'), key: 'nom', type: 'text', width: '20%' },
    // { header: t('category'), key: 'categorie', type: 'text', width: '15%' },
    { 
      header: t('type'), 
      key: 'typeProd', 
      type: 'custom',
      width: '15%',
      render: (value) => {
        // Display the titleSous if available, otherwise show 'N/A'
        if (value && typeProdMapping[value]) {
          return typeProdMapping[value];
        } else {
          return 'N/A'; // Show 'N/A' if no mapping found or no value
        }
      }
    },
    { header: t('quantity'), key: 'quantite', type: 'text', width: '10%' },
    { header: t('price'), key: 'minPrice', type: 'price', width: '10%' },
    { header: 'TVA', key: 'tva', type: 'text', width: '10%' },
    { header: t('availability'), key: 'disponibilite', type: 'status', width: '15%' },
    {
      header: t('actions'),
      key: 'actions',
      type: 'custom',
      width: '20%'
    },
  ];

  // Handle subcategory change (now first selection)
  const handleSublinkChange = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    
    // Find categories that have this subcategory
    const categoriesWithThisSubcategory = categoriesWithSubcategories.filter(c => 
      c.subcategories.includes(subcategory)
    );
    
    // If there's only one category with this subcategory, select it automatically
    if (categoriesWithThisSubcategory.length === 1) {
      const category = categoriesWithThisSubcategory[0].name;
      setSelectedCategory(category);
      
      // Fetch products for the selected category and subcategory
      fetchProductsForOrdering(category, subcategory);
    } else {
      // Reset category if multiple categories have this subcategory
      setSelectedCategory('');
    }
  };

  // Handle category change (now second selection)
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    
    // Fetch products for the selected category and subcategory
    if (selectedSubcategory) {
      fetchProductsForOrdering(category, selectedSubcategory);
    }
  };

  // Fetch products for ordering
  const fetchProductsForOrdering = async (category, subcategory) => {
    if (!category || !subcategory) return;
    
    try {
      const data = await FetchAllProductItems();
      const filteredProducts = data.filter(product => 
        product.categorie === category && product.subcategorie === subcategory
      );
      
      // Map to simpler structure for UI
      const mappedProducts = filteredProducts.map(product => {
        // Find the first valid image URL from the product's images array
        let imageUrl = null;
        if (product.images && Array.isArray(product.images)) {
          // Check each image until we find one with a valid URL
          for (const img of product.images) {
            if (img && (img.url || img.img)) {
              imageUrl = img.url || img.img;
              break;
            }
          }
        }
        
        return {
          id: product._id,
          name: product.nom,
          image: imageUrl,
          order: product.order || 0
        };
      });
      
      // Sort by existing order if available
      mappedProducts.sort((a, b) => a.order - b.order);
      
      setProductsToOrder(mappedProducts);
    } catch (error) {
      console.error('Error fetching products for ordering:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    dragNode.current = e.target;
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
    dragNode.current.classList.remove('opacity-50');
    dragNode.current = null;
  };

  const handleDrop = (e, dropIndex) => {
    if (draggedItem === null) return;
    
    // Reorder the products array
    const newProductsOrder = [...productsToOrder];
    const draggedItemContent = newProductsOrder[draggedItem];
    newProductsOrder.splice(draggedItem, 1);
    newProductsOrder.splice(dropIndex, 0, draggedItemContent);
    
    setProductsToOrder(newProductsOrder);
  };

  // Save the new product order
   const saveProductOrder = async () => {
     if (!selectedCategory || !selectedSubcategory || productsToOrder.length === 0) return;
     
     setIsReordering(true);
     
     try {
       // Extract product IDs in the correct order
       const productIds = productsToOrder.map(product => product.id);
       
       // Call API to save order
       await ReorderProducts(
         selectedCategory,
         selectedSubcategory,
         productIds
       );
       
       // Show success message
       setShowSuccessMessage(true);
       setTimeout(() => setShowSuccessMessage(false), 3000);
       
       // Close modal
       setShowProductOrderingModal(false);
       setSelectedCategory('');
       setSelectedSubcategory('');
       setProductsToOrder([]);
     } catch (error) {
       console.error('Error saving product order:', error);
       toast.error(t('common.error') + ': ' + (error.message || t('common.unknown_error')));
     } finally {
       setIsReordering(false);
     }
   };

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
            onClick={() => setShowOptionsModal(true)}
            className='flex items-center bg-transparent border border-blue-600
              hover:bg-blue-600 text-blue-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >
            <Settings className='mr-2 mt-0.5' size={20} />
            {t('options')}
          </button>
          <button
            onClick={() => setShowProductOrderingModal(true)}
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

          {showIfCanWrite(
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
          )}
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
          onClone={handleCloneProduct}
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
              setSelectedProduct(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[98vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('add_product')}</h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AddFormProduct 
                initialData={selectedProduct} 
                onClose={() => {
                  setShowAddForm(false);
                  setSelectedProduct(null);
                }} 
                onSuccess={() => {
                  setShowAddForm(false);
                  setSelectedProduct(null);
                  fetchProducts();
                }} 
              />
            </div>
            
            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedProduct(null);
                  }}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[98vh] overflow-hidden shadow-xl">
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
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
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
            <p className="mb-4">{t('delete_product_confirmation')}</p>
            
            {/* Password input field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('enter_password')}
              </label>
              <input 
                type="password" 
                value={deleteConfirmation.password}
                onChange={(e) => setDeleteConfirmation(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="********"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, productId: null, password: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
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
      
      {/* Options Modal */}
      {showOptionsModal && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowOptionsModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[80%] max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Options</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    // Afficher directement le formulaire via la prop
                    setShowOptionsForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors duration-300 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter
                </button>
                <button 
                  onClick={() => setShowOptionsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Options initialShowForm={showOptionsForm} onFormClose={() => setShowOptionsForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Product Ordering Modal */}
      {showProductOrderingModal && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowProductOrderingModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('product_management')}</h2>
              <button 
                onClick={() => setShowProductOrderingModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">{t('product_order_instructions')}</h3>
                  <p className="text-blue-700 dark:text-blue-400">
                    {t('drag_drop_products_instruction')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Selection - Reversed order */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      {t('categories')}
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('select_subcategory')}
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={selectedSubcategory || ''}
                        onChange={handleSublinkChange}
                      >
                        <option value="">{t('select_subcategory')}</option>
                        {/* Get all unique subcategories across all categories */}
                        {[...new Set(categoriesWithSubcategories.flatMap(c => c.subcategories))].map((subcategory) => (
                          <option key={subcategory} value={subcategory}>
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('select_category')}
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={!selectedSubcategory}
                        value={selectedCategory || ''}
                        onChange={handleCategoryChange}
                      >
                        <option value="">{t('select_category')}</option>
                        {/* Only show categories that have the selected subcategory */}
                        {selectedSubcategory ? 
                          categoriesWithSubcategories
                            .filter(c => c.subcategories.includes(selectedSubcategory))
                            .map((category) => (
                              <option key={category.name} value={category.name}>
                                {category.name}
                              </option>
                            ))
                          : categoriesWithSubcategories.map((category) => (
                              <option key={category.name} value={category.name}>
                                {category.name}
                              </option>
                            ))
                        }
                      </select>
                    </div>
                  </div>
                  
                  {/* Products Order */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      {t('products_order')}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[300px]">
                      {productsToOrder.length > 0 ? (
                        <div className="space-y-2">
                          {productsToOrder.map((product, index) => (
                            <div 
                              key={product.id}
                              className={`flex items-center p-2 bg-white dark:bg-gray-600 rounded-md shadow-sm cursor-move ${draggedItem === index ? 'opacity-50' : ''} ${draggedOverItem === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
                                handleDrop(e, index);
                              }}
                            >
                              <div className="flex-shrink-0 text-gray-400 dark:text-gray-300 mr-2">
                                <GripVertical size={18} />
                              </div>
                              <div className="flex-shrink-0 w-12 h-12 mr-3 overflow-hidden rounded-md">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `${product.images[0].url}`;
                                    }}
                                  />
                                ) : (
                                  <div 
                                    className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg"
                                    style={{
                                      backgroundImage: `${product.images[0].url}`
                                    }}
                                  >
                                    {product.name ? product.name.charAt(0).toUpperCase() : "P"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 dark:text-white">{product.name}</p>
                                {/* <p className="text-sm text-gray-500 dark:text-gray-300">ID: {product.id}</p> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                          {t('select_category_and_subcategory')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                        disabled={!productsToOrder.length || isReordering}
                        onClick={saveProductOrder}
                      >
                        {isReordering ? t('saving') : t('save')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 flex items-center">
          <CheckCircle size={20} className="mr-2" />
          <span>{t('product_order_saved')}</span>
          <button className="ml-4 text-green-500 hover:text-green-700" onClick={() => setShowSuccessMessage(false)}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
