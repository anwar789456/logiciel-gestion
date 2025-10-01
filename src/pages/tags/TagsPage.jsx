import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchAllProductItems, UpdateProductById } from '../../api/product';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure CSS is imported
import { Search, Plus, X, Save, Tag, Image, Check, Info, Loader2, ChevronDown, ChevronUp, Trash2, Move, Maximize2, Minimize2, Edit3, Grid, List } from 'lucide-react';

const TagsPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageTags, setImageTags] = useState({}); // { imageId: [{ posX, posY, produitID }] }
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTag, setDraggedTag] = useState(null);
  const [draggedTagInitialPos, setDraggedTagInitialPos] = useState({ x: 0, y: 0 });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [expandedImageId, setExpandedImageId] = useState(null); // Track which image is expanded
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'expanded'
  const [tagProducts, setTagProducts] = useState([]);
  const [selectedTagProduct, setSelectedTagProduct] = useState(null);
  const [showTagProductDropdown, setShowTagProductDropdown] = useState(false);
  const [tagProductSearchTerm, setTagProductSearchTerm] = useState('');
  const [filteredTagProducts, setFilteredTagProducts] = useState([]);
  const [editingTag, setEditingTag] = useState(null); // Track which tag is being edited
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const imageRefs = useRef({});
  const tagProductDropdownRef = useRef(null);
  
  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.idProd?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);
  
  // Filter tag products based on search term
  useEffect(() => {
    if (tagProductSearchTerm.trim() === '') {
      setFilteredTagProducts(tagProducts);
    } else {
      const filtered = tagProducts.filter(product => 
        product.nom.toLowerCase().includes(tagProductSearchTerm.toLowerCase()) ||
        product.idProd?.toLowerCase().includes(tagProductSearchTerm.toLowerCase())
      );
      setFilteredTagProducts(filtered);
    }
  }, [tagProductSearchTerm, tagProducts]);
  
  // Close dropdowns when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      
      if (tagProductDropdownRef.current && !tagProductDropdownRef.current.contains(e.target)) {
        setShowTagProductDropdown(false);
      }
    };
    
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowTagProductDropdown(false);
      }
    };
    
    // Handle mouse up to end tag dragging
    const handleMouseUp = () => {
      if (isDragging) {
        handleTagDragEnd();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Initialize tag products with all products
  useEffect(() => {
    setTagProducts(products);
  }, [products]);
  
  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await FetchAllProductItems();
      setProducts(data);
      setFilteredProducts(data);
      setTagProducts(data);
      setFilteredTagProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t('error_fetching_products'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowDropdown(false);
    setSearchTerm('');
    
    // Initialize image tags with existing hyperpoints if available
    if (product.images && product.images.length > 0) {
      const newImageTags = { ...imageTags };
      
      product.images.forEach(image => {
        const imageId = image.id || `image-${image.img}`;
        
        // Initialize empty array if no tags exist for this image
        if (!newImageTags[imageId]) {
          newImageTags[imageId] = [];
        }
        
        // If image has hyperPoints, convert them to our tag format
        if (image.hyperPoints && image.hyperPoints.length > 0) {
          // Convert existing hyperPoints to our tag format
          const existingTags = image.hyperPoints.map(point => ({
            id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            posX: parseFloat(point.posX),
            posY: parseFloat(point.posY),
            produitID: point.produitID // This is already using the correct idProd format
          }));
          
          // Add existing tags to the image
          newImageTags[imageId] = [...existingTags];
        }
      });
      
      setImageTags(newImageTags);
    }
  };
  
  // Handle image click to add a tag
  const handleImageClick = (e, imageId) => {
    if (isDragging) return;
    
    const imageRef = imageRefs.current[imageId];
    if (!imageRef) return;
    
    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Add new tag
    const newTag = {
      id: `tag-${Date.now()}`,
      posX: x,
      posY: y,
      produitID: null
    };
    
    setImageTags(prev => ({
      ...prev,
      [imageId]: [...(prev[imageId] || []), newTag]
    }));
    
    // Select the new tag and start editing it
    setSelectedTagId(newTag.id);
    setSelectedImageId(imageId);
    setSelectedTagProduct(null);
    setEditingTag(newTag);
    setShowTagProductDropdown(true);
    
    // Make sure we're in expanded view
    if (viewMode === 'grid') {
      toggleExpandedView(imageId);
    }
  };
  
  // Handle tag click
  const handleTagClick = (e, tag, imageId) => {
    e.stopPropagation();
    setSelectedTagId(tag.id);
    setSelectedImageId(imageId);
    setSelectedTagProduct(tag.produitID ? products.find(p => p.idProd === tag.produitID) : null);
    
    // If we're in grid view, automatically expand the image
    if (viewMode === 'grid') {
      toggleExpandedView(imageId);
    }
    
    // Start editing the tag
    setEditingTag(tag);
  };
  
  // Handle tag drag start
  const handleTagDragStart = (e, tag, imageId) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    
    // Add a no-select class to the body to prevent text selection during drag
    document.body.classList.add('no-select');
    
    setIsDragging(true);
    setDraggedTag({ ...tag, imageId });
    
    const tagElement = e.target;
    const rect = tagElement.getBoundingClientRect();
    setDraggedTagInitialPos({
      x: tag.posX,
      y: tag.posY
    });
    setMouseOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // Select the tag being dragged
    setSelectedTagId(tag.id);
    setSelectedImageId(imageId);
  };
  
  // Handle tag drag
  const handleTagDrag = (e, imageId) => {
    if (!isDragging || !draggedTag || draggedTag.imageId !== imageId) return;
    
    // Prevent text selection during drag
    e.preventDefault();
    
    const imageRef = imageRefs.current[imageId];
    if (!imageRef) return;
    
    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain position to image boundaries (0-100%)
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));
    
    // Update tag position
    setImageTags(prev => {
      const updatedTags = prev[imageId].map(t => 
        t.id === draggedTag.id ? { ...t, posX: constrainedX, posY: constrainedY } : t
      );
      return { ...prev, [imageId]: updatedTags };
    });
  };
  
  // Handle tag drag end
  const handleTagDragEnd = () => {
    setIsDragging(false);
    setDraggedTag(null);
    
    // Remove the no-select class from the body
    document.body.classList.remove('no-select');
  };
  
  // Handle tag product selection
  const handleSelectTagProduct = (product) => {
    setSelectedTagProduct(product);
    setShowTagProductDropdown(false);
    setTagProductSearchTerm('');
    
    // Update the tag with the selected product
    if (selectedTagId && selectedImageId) {
      setImageTags(prev => {
        const updatedTags = prev[selectedImageId].map(t => 
          t.id === selectedTagId ? { ...t, produitID: product.idProd } : t
        );
        return { ...prev, [selectedImageId]: updatedTags };
      });
    }
  };
  
  // Handle tag deletion
  const handleDeleteTag = (e, tagId = selectedTagId, imageId = selectedImageId) => {
    if (e) e.stopPropagation();
    if (tagId && imageId) {
      setImageTags(prev => {
        const updatedTags = prev[imageId].filter(t => t.id !== tagId);
        return { ...prev, [imageId]: updatedTags };
      });
      
      // If we're deleting the currently selected tag, clear the selection
      if (tagId === selectedTagId) {
        setSelectedTagId(null);
        setSelectedImageId(null);
        setSelectedTagProduct(null);
        setEditingTag(null);
      }
    }
  };
  
  // Toggle expanded view for an image
  const toggleExpandedView = (imageId) => {
    if (expandedImageId === imageId) {
      // Collapse the current expanded image
      setExpandedImageId(null);
      setViewMode('grid');
    } else {
      // Expand the clicked image
      setExpandedImageId(imageId);
      setViewMode('expanded');
      setSelectedImageId(imageId);
    }
  };
  
  // Start editing a tag
  const startEditingTag = (tag, imageId) => {
    setEditingTag(tag);
    setSelectedTagId(tag.id);
    setSelectedImageId(imageId);
    setSelectedTagProduct(tag.produitID ? products.find(p => p.idProd === tag.produitID) : null);
  };
  
  // Get tag number (for display)
  const getTagNumber = (tagId, imageId) => {
    if (!imageId || !imageTags[imageId]) return '';
    return imageTags[imageId].findIndex(t => t.id === tagId) + 1;
  };
  
  // Handle save tags
  const handleSaveTags = async () => {
    if (!selectedProduct) {
      toast.error(t('no_product_selected'), {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create a deep copy of the selected product
      const updatedProduct = JSON.parse(JSON.stringify(selectedProduct));
      
      // Update the images array with hyperPoints
      updatedProduct.images = updatedProduct.images.map(image => {
        const imageId = image.id || `image-${image.img}`;
        const tagsForImage = imageTags[imageId] || [];
        
        // Convert our tag format to the hyperPoints format
        const hyperPoints = tagsForImage.map(tag => ({
          produitID: tag.produitID,
          posX: String(tag.posX),
          posY: String(tag.posY)
        })).filter(tag => tag.produitID); // Only include tags with a linked product
        
        return {
          ...image,
          hyperPoints: hyperPoints
        };
      });
      
      // Call the API to update the product
      await UpdateProductById(selectedProduct._id, updatedProduct);
      
      // Refresh the product data
      await fetchProducts();
      
      // Count tags for success message
      const tagCount = Object.values(imageTags)
        .flat()
        .filter(tag => tag.produitID)
        .length;
      
      // Show success toast with translation and enhanced styling
      toast.success(
        `${tagCount} ${tagCount === 1 ? t('tag_saved') : t('tags_saved')} ${t('for')} ${selectedProduct.nom}`, 
        {
          position: "top-center",
          autoClose: 6000,
          style: {
            background: "#ecfdf5",
            color: "#065f46",
            fontWeight: "500",
            padding: "16px",
            fontSize: "16px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #d1fae5"
          },
          progressStyle: {
            background: "#10b981"
          },
          icon: () => <Check className="h-6 w-6 text-green-600" />
        }
      );
      
      // Add a small delay before resetting the view for better UX
      setTimeout(() => {
        // Reset view mode to grid to show all images after saving
        setViewMode('grid');
        setExpandedImageId(null);
      }, 500);
    } catch (error) {
      console.error('Error saving tags:', error);
      
      // Show error toast with translation and enhanced styling
      toast.error(
        `${t('error_saving_tags')}: ${error.message || t('please_try_again')}`, 
        {
          position: "top-center",
          autoClose: 6000,
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            fontWeight: "500",
            padding: "16px",
            fontSize: "16px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #fee2e2"
          },
          progressStyle: {
            background: "#ef4444"
          },
          icon: () => <X className="h-6 w-6 text-red-600" />
        }
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">
      {/* Header with simple border bottom */}
      <div className="pb-4 pl-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('product_tags')}
          </h1>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Product Selection Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('select_product')}
            </h2>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder={t('search_products')}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
            </div>
            
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg max-h-80 overflow-auto border border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSelectProduct(product)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                    >
                      {product.images && product.images.length > 0 && product.images[0].img ? (
                        <img
                          src={product.images[0].img}
                          alt={product.nom}
                          className="w-12 h-12 object-cover rounded-md mr-3 border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md mr-3 flex items-center justify-center">
                          <Image size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{product.nom}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.idProd}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">{t('no_products_found')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      
        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {t('product_information')}
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
              {selectedProduct.images && selectedProduct.images.length > 0 && selectedProduct.images[0].img ? (
                <img
                  src={selectedProduct.images[0].img}
                  alt={selectedProduct.nom}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Image size={32} className="text-gray-400" />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {selectedProduct.nom}
                </h3>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  ID: {selectedProduct.idProd}
                </div>
                {selectedProduct.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                    {selectedProduct.description}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <Info size={16} className="mr-2 text-blue-600" />
                {t('click_to_add_tags')}
              </div>
            </div>
          </div>
        )}
        
        {/* View Mode Toggle and Save Button */}
        {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            {/* Save button in grid view */}
            {viewMode === 'grid' && Object.keys(imageTags).length > 0 && (
              <button
                onClick={handleSaveTags}
                disabled={loading}
                className={`px-4 py-2 rounded-lg shadow-sm flex items-center transition-all ${loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {t('save_tags')}
                  </>
                )}
              </button>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 flex ml-auto">
              <button 
                onClick={() => { setViewMode('grid'); setExpandedImageId(null); }}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title={t('grid_view')}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => viewMode === 'expanded' ? setViewMode('grid') : null}
                className={`p-2 rounded ${viewMode === 'expanded' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title={t('expanded_view')}
                disabled={viewMode !== 'expanded'}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        )}
        
        {/* Images and Tags */}
        {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid view with thumbnails
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selectedProduct.images.map((image, index) => {
                const imageId = image.id || `image-${image.img}`;
                const tagCount = imageTags[imageId] ? imageTags[imageId].length : 0;
                return (
                  <div key={imageId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        #{index + 1}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Tag size={12} className="mr-1" />
                        {tagCount}
                      </div>
                    </div>
                    <div 
                      className="relative"
                      onClick={() => toggleExpandedView(imageId)}
                    >
                      <img
                        src={image.img}
                        alt={`${selectedProduct.nom} - ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-md">
                          <Maximize2 size={16} className="text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Expanded view with side panel
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main image with tags */}
              <div className="lg:w-2/4 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <div className="flex items-center">
                    <Image size={18} className="text-blue-600 mr-2" />
                    {selectedProduct.images.findIndex(img => (img.id || `image-${img.img}`) === expandedImageId) > -1 && (
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        {t('image')} #{selectedProduct.images.findIndex(img => (img.id || `image-${img.img}`) === expandedImageId) + 1}
                      </h3>
                    )}
                  </div>
                  <button 
                    onClick={() => toggleExpandedView(expandedImageId)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title={t('minimize')}
                  >
                    <Minimize2 size={18} />
                  </button>
                </div>
                <div 
                  className="relative"
                  onClick={(e) => handleImageClick(e, expandedImageId)}
                  onMouseMove={(e) => handleTagDrag(e, expandedImageId)}
                  onMouseUp={handleTagDragEnd}
                  onMouseLeave={handleTagDragEnd}
                >
                  {selectedProduct.images.map((image) => {
                    const imageId = image.id || `image-${image.img}`;
                    if (imageId !== expandedImageId) return null;
                    
                    return (
                      <React.Fragment key={imageId}>
                        <img
                          ref={(el) => (imageRefs.current[imageId] = el)}
                          src={image.img}
                          alt={`${selectedProduct.nom}`}
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
                          }}
                        />
                        
                        {/* Hover instructions - subtle indicator in corner */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-md flex items-center">
                            <Plus size={16} className="text-blue-600 mr-1.5" />
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('click_to_add_tag')}</p>
                          </div>
                        </div>
                        
                        {/* Numbered Tags */}
                        {imageTags[imageId] && imageTags[imageId].map((tag, tagIndex) => {
                          const isSelected = tag.id === selectedTagId;
                          const hasProduct = !!tag.produitID;
                          const tagNumber = tagIndex + 1;
                          
                          return (
                            <div
                              key={tag.id}
                              className={`absolute flex items-center justify-center transition-all ${isSelected ? 'z-30' : 'z-20'}`}
                              style={{
                                left: `${tag.posX}%`,
                                top: `${tag.posY}%`,
                                transform: 'translate(-50%, -50%)',
                                cursor: isDragging && draggedTag?.id === tag.id ? 'grabbing' : 'grab'
                              }}
                              onClick={(e) => handleTagClick(e, tag, imageId)}
                              onMouseDown={(e) => handleTagDragStart(e, tag, imageId)}
                            >
                              {/* Numbered tag marker */}
                              <div 
                                className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-blue-300' : ''} ${hasProduct ? 'bg-blue-600' : 'bg-gray-500'}`}
                                onClick={() => startEditingTag(tag, imageId)}
                              >
                                <span className="text-white font-medium text-xs">{tagNumber}</span>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              
              {/* Side panel with tag list */}
              <div className="lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                      <Tag className="mr-2" size={16} />
                      {t('tags')}
                    </h3>
                    <button
                      onClick={handleSaveTags}
                      disabled={loading || !selectedProduct}
                      className={`px-4 py-1.5 rounded-lg shadow-sm flex items-center text-sm transition-all ${loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="mr-1.5 animate-spin" />
                          {t('saving')}
                        </>
                      ) : (
                        <>
                          <Save size={14} className="mr-1.5" />
                          {t('save_tags')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {expandedImageId && imageTags[expandedImageId] && imageTags[expandedImageId].length > 0 ? (
                    <div className="space-y-3">
                      {imageTags[expandedImageId].map((tag, index) => {
                        const tagNumber = index + 1;
                        const hasProduct = !!tag.produitID;
                        const linkedProduct = products.find(p => p.idProd === tag.produitID);
                        const isEditing = editingTag && editingTag.id === tag.id;
                        
                        return (
                          <div 
                            key={tag.id} 
                            className={`p-3 border rounded-lg ${isEditing ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full shadow-md ${isEditing ? 'ring-1 ring-white ring-offset-1 ring-offset-blue-300' : ''} ${hasProduct ? 'bg-blue-600' : 'bg-gray-500'} flex items-center justify-center mr-2`}>
                                  <span className="text-white text-xs font-medium">{tagNumber}</span>
                                </div>
                                <span className="font-medium text-gray-800 dark:text-white">
                                  {t('tag')} #{tagNumber}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => {
                                    startEditingTag(tag, expandedImageId);
                                    setShowTagProductDropdown(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title={t('edit')}
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => handleDeleteTag(e, tag.id, expandedImageId)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title={t('delete')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <div className="flex justify-between">
                                <span>{t('position')}:</span>
                                <span>X: {Math.round(tag.posX)}%, Y: {Math.round(tag.posY)}%</span>
                              </div>
                            </div>
                            
                            {isEditing ? (
                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {t('linked_product')}
                                </label>
                                <div className="relative" ref={tagProductDropdownRef}>
                                  <div className="flex">
                                    <input
                                      type="text"
                                      value={tagProductSearchTerm}
                                      onChange={(e) => setTagProductSearchTerm(e.target.value)}
                                      onFocus={() => setShowTagProductDropdown(true)}
                                      placeholder={selectedTagProduct ? selectedTagProduct.nom : t('search_products')}
                                      className="w-full p-2 pl-8 text-sm border border-gray-300 rounded-lg rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <button
                                      onClick={() => setShowTagProductDropdown(false)}
                                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg transition-colors"
                                      title={t('close')}
                                    >
                                      <X size={14} className="text-gray-500 dark:text-gray-300" />
                                    </button>
                                  </div>
                                  <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                                  
                                  {/* Product dropdown */}
                                  {showTagProductDropdown && (
                                    <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg max-h-60 overflow-auto border border-gray-200 dark:border-gray-700">
                                      {filteredTagProducts.length > 0 ? (
                                        filteredTagProducts.map((product) => (
                                          <div
                                            key={product._id}
                                            onClick={() => {
                                              // Update the tag with the selected product's idProd
                                              setImageTags(prev => {
                                                const updatedTags = prev[expandedImageId].map(t => 
                                                  t.id === tag.id ? { ...t, produitID: product.idProd } : t
                                                );
                                                return { ...prev, [expandedImageId]: updatedTags };
                                              });
                                              
                                              // Update UI state
                                              setSelectedTagProduct(product);
                                              setTagProductSearchTerm('');
                                              setShowTagProductDropdown(false);
                                              setEditingTag(null);
                                            }}
                                            className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                          >
                                            {product.images && product.images.length > 0 && product.images[0].img ? (
                                              <img
                                                src={product.images[0].img}
                                                alt={product.nom}
                                                className="w-8 h-8 object-cover rounded-md mr-2 border border-gray-200 dark:border-gray-600"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src = 'https://via.placeholder.com/32?text=No+Image';
                                                }}
                                              />
                                            ) : (
                                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md mr-2 flex items-center justify-center">
                                                <Image size={16} className="text-gray-400" />
                                              </div>
                                            )}
                                            <div>
                                              <div className="text-xs font-medium text-gray-800 dark:text-white">{product.nom}</div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400">{product.idProd}</div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="p-4 text-center">
                                          <Info className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_products_found')}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('linked_product')}:
                                </div>
                                {hasProduct && linkedProduct ? (
                                  <div className="flex items-center mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    {linkedProduct.images && linkedProduct.images.length > 0 && linkedProduct.images[0].img ? (
                                      <img
                                        src={linkedProduct.images[0].img}
                                        alt={linkedProduct.nom}
                                        className="w-8 h-8 object-cover rounded mr-2 border border-gray-200 dark:border-gray-600"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/32?text=No+Image';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mr-2 flex items-center justify-center">
                                        <Image size={16} className="text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-white">{linkedProduct.nom}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{linkedProduct.idProd}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                      {t('no_product_linked')}
                                    </div>
                                    <button
                                      onClick={() => {
                                        startEditingTag(tag, expandedImageId);
                                        setShowTagProductDropdown(true);
                                      }}
                                      className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    >
                                      {t('link_product')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Tag size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">{t('no_tags_yet')}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('click_on_image_to_add')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : selectedProduct ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <Image size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{t('no_images_for_product')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('add_images_to_product')}</p>
          </div>
        ) : null}
        
        {/* No bottom tag editor - all editing happens in the side panel */}
      </div>
    </div>
  );
};

export default TagsPage;