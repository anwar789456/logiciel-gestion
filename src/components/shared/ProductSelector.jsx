import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { FetchAllProductItems } from '../../api/product';

const ProductSelector = ({ 
  value = {}, 
  onChange, 
  placeholder = "Sélectionner un produit ou saisir manuellement",
  showPrice = true,
  showQuantity = true,
  showRefColor = false,
  className = "",
  itemIndex = 0
}) => {
  const [products, setProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Valeurs par défaut
  const defaultValues = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    basePrice: 0, // Prix de base sans option
    discount: 0,
    refColor: '',
    reference: '',
    selectedOption: null,
    productOptions: [],
    tva: 19, // TVA du produit en %
    optionTva: 19 // TVA de l'option en %
  };

  const currentValues = { ...defaultValues, ...value };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await FetchAllProductItems();
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.idProd?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    const basePrice = parseFloat(product.minPrice) || 0;
    const productTva = parseFloat(product.tva) || 19;
    const selectedProduct = {
      description: product.nom || product.description || '',
      quantity: currentValues.quantity,
      unitPrice: basePrice,
      basePrice: basePrice, // Prix de base sans option
      discount: currentValues.discount,
      refColor: currentValues.refColor,
      reference: product.idProd || '',
      productId: product._id,
      selectedOption: null,
      productOptions: product.options || [],
      tva: productTva, // TVA du produit
      optionTva: productTva // TVA par défaut pour les options
    };
    
    onChange(selectedProduct);
    setIsDropdownOpen(false);
    setSearchTerm(product.nom || product.description || '');
    setIsManualMode(false);
  };

  const handleManualInput = (field, fieldValue) => {
    let updatedValues = {
      ...currentValues,
      [field]: fieldValue
    };
    
    // Si on modifie le prix unitaire manuellement, on met à jour aussi le prix de base
    if (field === 'unitPrice') {
      updatedValues.basePrice = fieldValue;
      // Recalculer le prix avec l'option si une option est sélectionnée
      if (currentValues.selectedOption) {
        const optionPrice = parseFloat(currentValues.selectedOption.prix_option) || 0;
        updatedValues.unitPrice = parseFloat(fieldValue) + optionPrice;
      }
    }
    
    onChange(updatedValues);
  };

  // Fonction utilitaire pour calculer le total avec remise sur prix de base uniquement
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const basePrice = parseFloat(item.basePrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const optionPrice = item.selectedOption ? parseFloat(item.selectedOption.prix_option) || 0 : 0;
    
    // Appliquer la remise uniquement sur le prix de base
    const basePriceAfterDiscount = basePrice * (1 - discount / 100);
    // Ajouter le prix de l'option (sans remise)
    const finalUnitPrice = basePriceAfterDiscount + optionPrice;
    
    return quantity * finalUnitPrice;
  };

  const handleOptionSelect = (option) => {
    const basePrice = parseFloat(currentValues.basePrice) || 0;
    const optionPrice = parseFloat(option.prix_option) || 0;
    const optionTva = parseFloat(option.tva) || parseFloat(currentValues.tva) || 19;
    const newPrice = basePrice + optionPrice;
    
    const updatedValues = {
      ...currentValues,
      selectedOption: option,
      unitPrice: newPrice,
      optionTva: optionTva
    };
    onChange(updatedValues);
  };

  const handleToggleManualMode = () => {
    setIsManualMode(!isManualMode);
    setIsDropdownOpen(false);
    if (!isManualMode) {
      // Passer en mode manuel - garder les valeurs actuelles
      onChange(currentValues);
    }
  };

  const clearSelection = () => {
    onChange(defaultValues);
    setIsManualMode(false);
    setSearchTerm('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Sélecteur principal */}
      <div className="relative">
        <div className="flex gap-2">
          {/* Champ de sélection/recherche */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={isManualMode ? currentValues.description : searchTerm}
              onChange={(e) => {
                if (isManualMode) {
                  handleManualInput('description', e.target.value);
                } else {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }
              }}
              onFocus={() => !isManualMode && setIsDropdownOpen(true)}
              placeholder={isManualMode ? "Description du produit" : placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            
            {!isManualMode && (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown size={20} />
              </button>
            )}
          </div>

          {/* Bouton mode manuel */}
          <button
            type="button"
            onClick={handleToggleManualMode}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              isManualMode
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
            }`}
            title={isManualMode ? "Passer en mode sélection" : "Passer en mode saisie manuelle"}
          >
            <Plus size={16} />
          </button>

          {/* Bouton effacer */}
          {(currentValues.description || currentValues.quantity > 1 || currentValues.unitPrice > 0) && (
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              title="Effacer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown des produits */}
        {isDropdownOpen && !isManualMode && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">Chargement...</div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.nom}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {product.idProd} - {parseFloat(product.minPrice || 0).toFixed(3)} DT
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options du produit */}
      {currentValues.productOptions && currentValues.productOptions.length > 0 && !isManualMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Options disponibles
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id={`no-option-${itemIndex}`}
                name={`option-${itemIndex}-${currentValues.productId || 'manual'}`}
                checked={!currentValues.selectedOption}
                onChange={() => {
                  const basePrice = parseFloat(currentValues.basePrice) || 0;
                  
                  const updatedValues = {
                    ...currentValues,
                    selectedOption: null,
                    unitPrice: basePrice
                  };
                  onChange(updatedValues);
                }}
                className="mr-2"
              />
              <label htmlFor={`no-option-${itemIndex}`} className="text-sm text-gray-700 dark:text-gray-300">
                Aucune option (prix de base)
              </label>
            </div>
            {currentValues.productOptions.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${itemIndex}-${index}`}
                  name={`option-${itemIndex}-${currentValues.productId || 'manual'}`}
                  checked={currentValues.selectedOption?.option_name === option.option_name}
                  onChange={() => handleOptionSelect(option)}
                  className="mr-2"
                />
                <label htmlFor={`option-${itemIndex}-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                  {option.option_name} (+{parseFloat(option.prix_option || 0).toFixed(3)} DT) - TVA: {parseFloat(option.tva || currentValues.tva || 19)}%
                </label>
              </div>
            ))}
          </div>
          {currentValues.selectedOption && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              Option sélectionnée : {currentValues.selectedOption.option_name}
            </div>
          )}
        </div>
      )}

      {/* Affichage du total calculé correctement */}
      {(currentValues.quantity > 0 && currentValues.basePrice > 0) && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Prix de base:</span>
              <span>{parseFloat(currentValues.basePrice || 0).toFixed(3)} DT</span>
            </div>
            {currentValues.selectedOption && (
              <div className="flex justify-between">
                <span>Option ({currentValues.selectedOption.option_name}):</span>
                <span>+{parseFloat(currentValues.selectedOption.prix_option || 0).toFixed(3)} DT</span>
              </div>
            )}
            {currentValues.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Remise ({currentValues.discount}% sur prix de base):</span>
                <span>-{(parseFloat(currentValues.basePrice || 0) * parseFloat(currentValues.discount || 0) / 100).toFixed(3)} DT</span>
              </div>
            )}
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
            <div className="flex justify-between font-semibold text-green-700 dark:text-green-400">
              <span>Total article:</span>
              <span>{calculateItemTotal(currentValues).toFixed(3)} DT</span>
            </div>
          </div>
        </div>
      )}

      {/* Champs détails */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Quantité */}
        {showQuantity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={currentValues.quantity}
              onChange={(e) => handleManualInput('quantity', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {/* Prix unitaire */}
        {showPrice && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prix unitaire (DT)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={currentValues.unitPrice}
              onChange={(e) => handleManualInput('unitPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {/* Remise */}
        {showPrice && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remise (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={currentValues.discount}
              onChange={(e) => handleManualInput('discount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {/* TVA */}
        {showPrice && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              TVA (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={currentValues.tva}
              onChange={(e) => handleManualInput('tva', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {/* Référence couleur */}
        {showRefColor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Réf. Couleur
            </label>
            <input
              type="text"
              value={currentValues.refColor}
              onChange={(e) => handleManualInput('refColor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Référence produit (si sélectionné) */}
      {isManualMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Référence
          </label>
          <input
            type="text"
            value={currentValues.reference}
            onChange={(e) => handleManualInput('reference', e.target.value)}
            placeholder="Référence du produit"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
