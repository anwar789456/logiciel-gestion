import React, { useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, Tag, Package, Truck, Info, Layers, DollarSign, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FetchAllProductTypeItems } from '../../api/product';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const [typeProdMapping, setTypeProdMapping] = useState({});
  
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
    
    if (isOpen) {
      fetchProductTypes();
    }
  }, [isOpen]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Format availability status with proper styling
  const getAvailabilityBadge = (status) => {
    const statusColors = {
      'En stock': 'bg-green-100 text-green-800 border-green-200',
      'Hors stock': 'bg-red-100 text-red-800 border-red-200',
      'En arrivage': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sur commande': 'bg-amber-100 text-amber-800 border-amber-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl p-6 relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full p-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.nom}</h2>
          <div className="flex items-center mt-2">
            {getAvailabilityBadge(product.disponibilite)}
            <span className="ml-4 text-gray-700 dark:text-gray-300">{t('id')}: {product.idProd}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Image and basic info */}
          <div className="space-y-6">
            {/* Product image */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md h-64 flex items-center justify-center">
              {product.images && product.images.length > 0 && product.images[0].img ? (
                <img 
                  src={product.images[0].img} 
                  alt={product.nom} 
                  className="object-contain h-full w-full p-4" 
                />
              ) : product.image ? (
                <img 
                  src={product.image} 
                  alt={product.nom} 
                  className="object-contain h-full w-full p-4" 
                />
              ) : (
                <Package size={64} className="text-gray-400" />
              )}
            </div>
            
            {/* Price info */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <DollarSign size={20} className="text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('price_information')}</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('min_price')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{product.minPrice} DT</p>
                </div>
                {product.maxPrice && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('max_price')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{product.maxPrice} DT</p>
                  </div>
                )}
                {product.tva && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">TVA</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{product.tva}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Details */}
          <div className="space-y-6">
            {/* Basic information */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-3">
                <Info size={20} className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('basic_info')}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Tag className="text-gray-500 mr-3 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('type')}</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {product.typeProd && typeProdMapping[product.typeProd] 
                        ? typeProdMapping[product.typeProd] 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Layers className="text-gray-500 mr-3 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('category')}</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{product.categorie}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ShoppingBag className="text-gray-500 mr-3 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('quantity')}</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{product.quantite}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dimensions */}
            {(product.longueur || product.largeur || product.hauteur) && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md">
                <div className="flex items-center mb-3">
                  <Ruler size={20} className="text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dimensions')}</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {product.longueur && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('length')}</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{product.longueur} cm</p>
                    </div>
                  )}
                  
                  {product.largeur && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('width')}</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{product.largeur} cm</p>
                    </div>
                  )}
                  
                  {product.hauteur && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('height')}</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{product.hauteur} cm</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Description */}
            {product.description && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md">
                <div className="flex items-center mb-3">
                  <Info size={20} className="text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('description')}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;