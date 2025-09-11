import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Calculator, Upload, X } from 'lucide-react';
import { createFacture, updateFacture, uploadFactureLogo, getLogoUrl } from '../../api/facture/facture';
import ProductSelector from '../shared/ProductSelector';

const FactureForm = ({ existingFacture = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    clientType: 'particulier',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    email: '',
    // Champs entreprise
    companyName: '',
    rc: '',
    taxId: '',
    items: [
      {
        quantity: 1,
        description: '',
        refColor: '',
        unitPrice: 0,
        discount: 0
      }
    ],
    tvaRate: 19,
    notes: '',
    customLogo: ''
  });

  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalDiscount: 0,
    totalHT: 0,
    tvaAmount: 0,
    totalTTC: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (existingFacture) {
      setFormData({
        clientType: existingFacture.clientType || 'particulier',
        clientName: existingFacture.clientName || '',
        clientAddress: existingFacture.clientAddress || '',
        clientPhone: existingFacture.clientPhone || '',
        email: existingFacture.email || '',
        companyName: existingFacture.companyName || '',
        rc: existingFacture.rc || '',
        taxId: existingFacture.taxId || '',
        items: existingFacture.items || [{ quantity: 1, description: '', refColor: '', unitPrice: 0, discount: 0 }],
        tvaRate: existingFacture.tvaRate || 19,
        notes: existingFacture.notes || '',
        customLogo: existingFacture.customLogo || ''
      });
    }
  }, [existingFacture]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.clientType, formData.tvaRate]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTvaAmount = 0;

    formData.items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const basePrice = parseFloat(item.basePrice) || parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;
      const optionPrice = item.selectedOption ? parseFloat(item.selectedOption.prix_option) || 0 : 0;
      const productTva = parseFloat(item.tva) || 19;
      const optionTva = parseFloat(item.optionTva) || parseFloat(item.selectedOption?.tva) || productTva;
      
      // Calculer le sous-total avec prix de base + option
      const itemSubtotal = quantity * (basePrice + optionPrice);
      // Appliquer la remise uniquement sur le prix de base
      const itemDiscount = quantity * basePrice * (discount / 100);
      
      // Calculer la TVA pour chaque composant si c'est une entreprise
      if (formData.clientType === 'entreprise') {
        const basePriceAfterDiscount = quantity * basePrice * (1 - discount / 100);
        const optionPriceTotal = quantity * optionPrice;
        
        const baseTva = basePriceAfterDiscount * (productTva / 100);
        const optionTvaAmount = optionPriceTotal * (optionTva / 100);
        
        totalTvaAmount += baseTva + optionTvaAmount;
      }
      
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

    const totalHT = subtotal - totalDiscount;

    // Pour les entreprises, utiliser la TVA calculée par article
    // Pour les particuliers, pas de TVA
    const tvaAmount = formData.clientType === 'entreprise' ? totalTvaAmount : 0;
    const totalTTC = totalHT + tvaAmount;

    // For particulier: totalAmount = totalHT, for entreprise: totalAmount = totalTTC
    const totalAmount = formData.clientType === 'entreprise' ? totalTTC : totalHT;

    setTotals({
      subtotal,
      totalDiscount,
      totalHT,
      tvaAmount,
      totalTTC,
      totalAmount
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Logo upload functions
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;
    
    setUploadingLogo(true);
    try {
      const result = await uploadFactureLogo(logoFile);
      setFormData(prev => ({ ...prev, customLogo: result.logoPath }));
      return result.logoPath;
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Erreur lors de l\'upload du logo');
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, customLogo: '' }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'discount' ? parseFloat(value) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        quantity: 1, 
        description: '', 
        refColor: '', 
        unitPrice: 0, 
        discount: 0,
        tva: 19,
        optionTva: 19
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalFormData = { ...formData };

      // Upload logo si un nouveau fichier est sélectionné
      if (logoFile) {
        const logoPath = await uploadLogo();
        if (logoPath) {
          finalFormData.customLogo = logoPath;
        }
      }

      if (existingFacture) {
        await updateFacture(existingFacture._id, finalFormData);
      } else {
        await createFacture(finalFormData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving facture:', error);
      alert('Erreur lors de la sauvegarde de la facture: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {existingFacture ? 'Modifier la Facture' : 'Nouvelle Facture'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="facture-form"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>

        <form id="facture-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de client
              </label>
              <select
                name="clientType"
                value={formData.clientType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.clientType === 'entreprise' ? 'Nom du contact' : 'Nom du client'} *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse *
              </label>
              <textarea
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Logo de la Facture</h3>
            <div className="space-y-4">
              {/* Logo Preview */}
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                  ) : formData.customLogo ? (
                    <img src={getLogoUrl(formData.customLogo)} alt="Logo actuel" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Choisissez un logo personnalisé pour cette facture. Si aucun logo n'est sélectionné, le logo SAMET HOME sera utilisé par défaut.
                  </p>
                  <div className="flex space-x-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                    {(logoPreview || formData.customLogo) && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        disabled={uploadingLogo}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Supprimer
                      </button>
                    )}
                  </div>
                  {uploadingLogo && (
                    <p className="text-sm text-blue-600 mt-2">Upload en cours...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise-specific fields */}
          {formData.clientType === 'entreprise' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registre de Commerce *
                </label>
                <input
                  type="text"
                  name="rc"
                  value={formData.rc}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Identifiant fiscal
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Articles de la Facture</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Article</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const itemTotal = (item.quantity * item.unitPrice) * (1 - item.discount / 100);
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Article {index + 1}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Total: {itemTotal.toFixed(3)} DT
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <ProductSelector
                      value={item}
                      onChange={(newItem) => {
                        const updatedItems = [...formData.items];
                        // S'assurer que les champs TVA sont inclus
                        updatedItems[index] = {
                          ...newItem,
                          tva: newItem.tva || 19,
                          optionTva: newItem.optionTva || newItem.tva || 19
                        };
                        setFormData({ ...formData, items: updatedItems });
                      }}
                      showPrice={true}
                      showQuantity={true}
                      showRefColor={true}
                      itemIndex={index}
                      placeholder="Sélectionner un produit ou saisir manuellement"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* TVA Rate for Enterprises */}
          {formData.clientType === 'entreprise' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taux TVA (%)
                </label>
                <input
                  type="number"
                  name="tvaRate"
                  value={formData.tvaRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Récapitulatif</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
                <div className="font-semibold text-gray-900 dark:text-white">{totals.subtotal.toFixed(3)} DT</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Remise totale:</span>
                <div className="font-semibold text-red-600">{totals.totalDiscount.toFixed(3)} DT</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total HT:</span>
                <div className="font-semibold text-gray-900 dark:text-white">{totals.totalHT.toFixed(3)} DT</div>
              </div>
              {formData.clientType === 'entreprise' && (
                <>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">TVA ({formData.tvaRate}%):</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{totals.tvaAmount.toFixed(3)} DT</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total TTC:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{totals.totalTTC.toFixed(3)} DT</div>
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {formData.clientType === 'entreprise' ? 'Montant final (TTC):' : 'Montant final (HT):'}
                </span>
                <div className="text-xl font-bold text-blue-600">{totals.totalAmount.toFixed(3)} DT</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Notes additionnelles..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactureForm;
