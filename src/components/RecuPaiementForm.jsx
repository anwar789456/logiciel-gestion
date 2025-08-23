import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, X } from 'lucide-react';
import { createRecuPaiement, updateRecuPaiement } from '../api/recuPaiementApi';

const RecuPaiementForm = ({ existingRecuPaiement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    commandeNumber: '',
    date: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    items: [{
      quantity: 1,
      description: '',
      refColor: '',
      unitPrice: 0,
      discount: 0,
      total: 0
    }],
    totalAmount: 0,
    avance: 0,
    reglement: 0,
    resteAPayer: 0,
    notes: '',
    status: 'pending'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingRecuPaiement) {
      setFormData({
        ...existingRecuPaiement,
        date: new Date(existingRecuPaiement.date).toISOString().split('T')[0],
        deliveryDate: new Date(existingRecuPaiement.deliveryDate).toISOString().split('T')[0]
      });
    }
  }, [existingRecuPaiement]);

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    return subtotal - discountAmount;
  };

  const updateItemTotal = (index, updatedItem) => {
    const total = calculateItemTotal(updatedItem);
    const newItems = [...formData.items];
    newItems[index] = { ...updatedItem, total };
    
    const totalAmount = newItems.reduce((sum, item) => sum + item.total, 0);
    const resteAPayer = totalAmount - formData.avance - formData.reglement;
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount,
      resteAPayer: Math.max(0, resteAPayer)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItem = {
      ...formData.items[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'discount' ? 
        parseFloat(value) || 0 : value
    };
    updateItemTotal(index, updatedItem);
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
        total: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      const totalAmount = newItems.reduce((sum, item) => sum + item.total, 0);
      const resteAPayer = totalAmount - formData.avance - formData.reglement;
      
      setFormData(prev => ({
        ...prev,
        items: newItems,
        totalAmount,
        resteAPayer: Math.max(0, resteAPayer)
      }));
    }
  };

  const handlePaymentChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const updatedData = { ...formData, [field]: numValue };
    
    if (field === 'avance' || field === 'reglement') {
      updatedData.resteAPayer = Math.max(0, formData.totalAmount - updatedData.avance - updatedData.reglement);
    }
    
    setFormData(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clientName.trim()) newErrors.clientName = 'Nom du client requis';
    if (!formData.clientAddress.trim()) newErrors.clientAddress = 'Adresse requise';
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Téléphone requis';
    if (!formData.commandeNumber.trim()) newErrors.commandeNumber = 'Numéro de commande requis';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Date de livraison requise';
    
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description requise';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantité doit être > 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${index}_unitPrice`] = 'Prix unitaire doit être ≥ 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        date: new Date(formData.date),
        deliveryDate: new Date(formData.deliveryDate)
      };
      
      let result;
      if (existingRecuPaiement) {
        result = await updateRecuPaiement(existingRecuPaiement._id, submitData);
      } else {
        result = await createRecuPaiement(submitData);
      }
      
      onSave(result);
    } catch (error) {
      console.error('Error saving recu paiement:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {existingRecuPaiement ? 'Modifier le reçu de paiement' : 'Nouveau reçu de paiement'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du client *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className={`w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.clientName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom du client"
              />
              {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de commande *
              </label>
              <input
                type="text"
                value={formData.commandeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, commandeNumber: e.target.value }))}
                className={`w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.commandeNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="N°049/25"
              />
              {errors.commandeNumber && <p className="text-red-500 text-sm mt-1">{errors.commandeNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={formData.clientAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                className={`w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.clientAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adresse du client"
              />
              {errors.clientAddress && <p className="text-red-500 text-sm mt-1">{errors.clientAddress}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                className={`w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.clientPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Téléphone du client"
              />
              {errors.clientPhone && <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Email du client (optionnel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de livraison *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                className={`w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.deliveryDate && <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="partial">Partiel</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Articles</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un article
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Description de l'article"
                    />
                    {errors[`item_${index}_description`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_description`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ref Couleur
                    </label>
                    <input
                      type="text"
                      value={item.refColor}
                      onChange={(e) => handleItemChange(index, 'refColor', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ref couleur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`item_${index}_unitPrice`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`item_${index}_unitPrice`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_unitPrice`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remise (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total: {item.total.toFixed(2)} DT
                      </label>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux et paiements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paiements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avance (DT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.avance}
                    onChange={(e) => handlePaymentChange('avance', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Règlement (DT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.reglement}
                    onChange={(e) => handlePaymentChange('reglement', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Résumé</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span>{formData.totalAmount.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span>Avance:</span>
                  <span>{formData.avance.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span>Règlement:</span>
                  <span>{formData.reglement.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Reste à payer:</span>
                  <span>{formData.resteAPayer.toFixed(2)} DT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : existingRecuPaiement ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecuPaiementForm;
