import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { FetchAllProductItems } from '../../api/product';
import { FetchAllCategoryItems, UpdateCategoryItem } from '../../api/Category/category';

const ProductCategoryScanner = ({ onScanComplete }) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, found, complete, error
  const [uncategorizedProducts, setUncategorizedProducts] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const scanProducts = async () => {
    try {
      setIsScanning(true);
      setScanStatus('scanning');
      setScanProgress(0);
      setScannedCount(0);

      // Fetch all products and categories
      const products = await FetchAllProductItems();
      const categories = await FetchAllCategoryItems();

      setTotalProducts(products.length);

      // Create a Set of all idProds that exist in categories
      const categorizedProductIds = new Set();
      categories.forEach(category => {
        if (category.subLinks && Array.isArray(category.subLinks)) {
          category.subLinks.forEach(subLink => {
            if (subLink.products && Array.isArray(subLink.products)) {
              subLink.products.forEach(product => {
                if (product.idprod) {
                  categorizedProductIds.add(product.idprod);
                }
              });
            }
          });
        }
      });

      // Find uncategorized products with animation
      const uncategorized = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Simulate scanning animation
        await new Promise(resolve => setTimeout(resolve, 20));
        
        setScannedCount(i + 1);
        setScanProgress(((i + 1) / products.length) * 100);

        // Check if product's idProd exists in any category
        if (product.idProd && !categorizedProductIds.has(product.idProd)) {
          console.log('Uncategorized product found:', {
            idProd: product.idProd,
            nom: product.nom,
            categorie: product.categorie,
            subcategorie: product.subcategorie
          });

          // Try to find the best matching category based on product.categorie
          // Note: product.categorie contains the sublink title, product.subcategorie contains the main category
          let matchingCategory = null;
          let matchingSubLink = null;

          // Try to match by sublink title (stored in product.categorie)
          if (product.categorie) {
            matchingCategory = categories.find(cat => 
              cat.subLinks && cat.subLinks.some(sub => 
                sub.title === product.categorie || 
                sub.href === product.categorie ||
                sub.title?.toLowerCase() === product.categorie?.toLowerCase()
              )
            );

            if (matchingCategory) {
              matchingSubLink = matchingCategory.subLinks.find(sub => 
                sub.title === product.categorie || 
                sub.href === product.categorie ||
                sub.title?.toLowerCase() === product.categorie?.toLowerCase()
              );
            }
          }

          // If no match found, try matching by main category title (stored in product.subcategorie)
          if (!matchingCategory && product.subcategorie) {
            matchingCategory = categories.find(cat => 
              cat.title === product.subcategorie || 
              cat.href === product.subcategorie ||
              cat.title?.toLowerCase() === product.subcategorie?.toLowerCase()
            );

            // If we found a category by main title, use its first sublink or try to find best match
            if (matchingCategory && matchingCategory.subLinks && matchingCategory.subLinks.length > 0) {
              // Try to find a sublink that matches the product.categorie
              matchingSubLink = matchingCategory.subLinks.find(sub => 
                sub.title === product.categorie || 
                sub.href === product.categorie
              ) || matchingCategory.subLinks[0]; // Fallback to first sublink
            }
          }

          console.log('Match result:', {
            foundCategory: matchingCategory?.title,
            foundSubLink: matchingSubLink?.title
          });

          uncategorized.push({
            product,
            suggestedCategory: matchingCategory,
            suggestedSubLink: matchingSubLink
          });
        }
      }

      setUncategorizedProducts(uncategorized);
      
      if (uncategorized.length > 0) {
        setScanStatus('found');
        setShowConfirmation(true);
      } else {
        setScanStatus('complete');
        setTimeout(() => {
          setIsScanning(false);
          setScanStatus('idle');
        }, 2000);
      }
    } catch (error) {
      console.error('Error scanning products:', error);
      setScanStatus('error');
      setTimeout(() => {
        setIsScanning(false);
        setScanStatus('idle');
      }, 3000);
    }
  };

  const handleAutoCategorize = async () => {
    try {
      setScanStatus('scanning');
      setShowConfirmation(false);
      setScanProgress(0);

      let successCount = 0;
      const validProducts = uncategorizedProducts.filter(
        item => item.suggestedCategory && item.suggestedSubLink
      );

      console.log('Starting auto-categorization:', {
        totalUncategorized: uncategorizedProducts.length,
        validProducts: validProducts.length,
        products: validProducts.map(v => ({
          idProd: v.product.idProd,
          category: v.suggestedCategory?.title,
          sublink: v.suggestedSubLink?.title
        }))
      });

      for (let i = 0; i < validProducts.length; i++) {
        const { product, suggestedCategory, suggestedSubLink } = validProducts[i];
        
        try {
          console.log(`Processing product ${i + 1}/${validProducts.length}:`, {
            idProd: product.idProd,
            categoryId: suggestedCategory._id,
            sublinkTitle: suggestedSubLink.title
          });

          // Fetch the latest category data to avoid overwriting concurrent updates
          const allCategories = await FetchAllCategoryItems();
          const freshCategory = allCategories.find(cat => cat._id === suggestedCategory._id);
          
          if (!freshCategory) {
            console.error(`Category ${suggestedCategory._id} not found`);
            continue;
          }

          // Find the sublink in the fresh category data
          let productAdded = false;
          const updatedSubLinks = freshCategory.subLinks.map(sub => {
            if (sub.title === suggestedSubLink.title) {
              // Add the product to this sublink's products array
              const products = sub.products || [];
              if (!products.some(p => p.idprod === product.idProd)) {
                productAdded = true;
                console.log(`Adding product ${product.idProd} to sublink ${sub.title}`);
                return {
                  ...sub,
                  products: [...products, { idprod: product.idProd }]
                };
              } else {
                console.log(`Product ${product.idProd} already exists in sublink ${sub.title}`);
              }
            }
            return sub;
          });

          if (productAdded) {
            // Update the category with the new subLinks
            console.log('Updating category:', freshCategory._id);
            await UpdateCategoryItem(freshCategory._id, {
              ...freshCategory,
              subLinks: updatedSubLinks
            });

            successCount++;
            console.log(`Successfully added product ${product.idProd}. Total success: ${successCount}`);
          }

          setScanProgress(((i + 1) / validProducts.length) * 100);
        } catch (error) {
          console.error(`Error categorizing product ${product.idProd}:`, error);
        }
      }

      console.log('Auto-categorization complete. Success count:', successCount);

      setScanStatus('complete');
      setTimeout(() => {
        setIsScanning(false);
        setScanStatus('idle');
        setUncategorizedProducts([]);
        if (onScanComplete) {
          onScanComplete(successCount);
        }
      }, 2000);
    } catch (error) {
      console.error('Error auto-categorizing products:', error);
      setScanStatus('error');
      setTimeout(() => {
        setIsScanning(false);
        setScanStatus('idle');
      }, 3000);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setIsScanning(false);
    setScanStatus('idle');
    setUncategorizedProducts([]);
  };

  return (
    <div className="relative">
      {/* Scan Button */}
      {!isScanning && scanStatus === 'idle' && (
        <button
          onClick={scanProducts}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Search size={18} />
          <span>Scanner les produits</span>
        </button>
      )}

      {/* Scanning Animation Modal */}
      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            {/* Header with Shield Icon (Avast-style) */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  scanStatus === 'scanning' ? 'bg-blue-100 dark:bg-blue-900' :
                  scanStatus === 'found' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  scanStatus === 'complete' ? 'bg-green-100 dark:bg-green-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  {scanStatus === 'scanning' && (
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                  {scanStatus === 'found' && (
                    <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                  )}
                  {scanStatus === 'complete' && (
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  )}
                  {scanStatus === 'error' && (
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                  )}
                </div>
                
                {/* Pulsing ring animation */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {scanStatus === 'scanning' && !showConfirmation && 'Analyse en cours...'}
                {scanStatus === 'scanning' && showConfirmation && 'Catégorisation...'}
                {scanStatus === 'found' && 'Produits trouvés'}
                {scanStatus === 'complete' && 'Terminé !'}
                {scanStatus === 'error' && 'Erreur'}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {scanStatus === 'scanning' && !showConfirmation && `${scannedCount} / ${totalProducts} produits analysés`}
                {scanStatus === 'scanning' && showConfirmation && 'Ajout des produits aux catégories...'}
                {scanStatus === 'found' && `${uncategorizedProducts.length} produit(s) sans catégorie`}
                {scanStatus === 'complete' && 'Tous les produits ont été traités'}
                {scanStatus === 'error' && 'Une erreur est survenue'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    scanStatus === 'scanning' ? 'bg-blue-600' :
                    scanStatus === 'found' ? 'bg-yellow-600' :
                    scanStatus === 'complete' ? 'bg-green-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${scanProgress}%` }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
              <div className="text-right mt-1 text-xs text-gray-500 dark:text-gray-400">
                {Math.round(scanProgress)}%
              </div>
            </div>

            {/* Confirmation Message */}
            {showConfirmation && scanStatus === 'found' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>{uncategorizedProducts.filter(p => p.suggestedCategory).length}</strong> produit(s) 
                    {uncategorizedProducts.filter(p => p.suggestedCategory).length === 1 ? ' ne fait' : ' ne font'} partie 
                    d'aucune catégorie. Voulez-vous les ajouter automatiquement ?
                  </p>
                  {uncategorizedProducts.filter(p => !p.suggestedCategory).length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Note : {uncategorizedProducts.filter(p => !p.suggestedCategory).length} produit(s) 
                      n'ont pas de catégorie correspondante et seront ignorés.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAutoCategorize}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Oui, ajouter
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {scanStatus === 'complete' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  ✓ Opération terminée avec succès
                </p>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  ✗ Une erreur est survenue lors de l'opération
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add shimmer animation to CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductCategoryScanner;
