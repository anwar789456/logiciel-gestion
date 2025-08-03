import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Calculator } from 'lucide-react';
import { createDevis, updateDevis } from '../api/devis/devis';

const DevisForm = ({ existingDevis = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    typeClient: 'particulier',
    societe: '',
    rc: '',
    tva: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    email: '',
    items: [
      {
        quantity: 1,
        description: '',
        reference: '',
        color: '',
        unitPrice: 0,
        discount: 0
      }
    ],
    deliveryDelay: '45 jours à partir de la date de confirmation',
    paymentTerms: 'Tous les paiements sont effectués avant la livraison au showroom',
    deliveryCondition: 'LA LIVRAISON EST GRATUITE UNIQUEMENT SUR LE GRAND TUNIS (TUNIS, ARIANA, MANOUBA, BEN AROUS)',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalDiscount: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (existingDevis) {
      setFormData({
        typeClient: existingDevis.typeClient || 'particulier',
        societe: existingDevis.societe || '',
        rc: existingDevis.rc || '',
        tva: existingDevis.tva || '',
        clientName: existingDevis.clientName || '',
        clientAddress: existingDevis.clientAddress || '',
        clientPhone: existingDevis.clientPhone || '',
        email: existingDevis.email || '',
        items: existingDevis.items || [{ quantity: 1, description: '', reference: '', color: '', unitPrice: 0, discount: 0 }],
        deliveryDelay: existingDevis.deliveryDelay || '45 jours à partir de la date de confirmation',
        paymentTerms: existingDevis.paymentTerms || 'Tous les paiements sont effectués avant la livraison au showroom',
        deliveryCondition: existingDevis.deliveryCondition || 'LA LIVRAISON EST GRATUITE UNIQUEMENT SUR LE GRAND TUNIS (TUNIS, ARIANA, MANOUBA, BEN AROUS)',
        notes: existingDevis.notes || ''
      });
    }
  }, [existingDevis]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    formData.items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

    const totalAmount = subtotal - totalDiscount;

    setTotals({
      subtotal,
      totalDiscount,
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
        reference: '',
        color: '',
        unitPrice: 0,
        discount: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingDevis) {
        await updateDevis(existingDevis._id, formData);
      } else {
        await createDevis(formData);
      }
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error saving devis:', error);
      alert('Erreur lors de la sauvegarde du devis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {existingDevis ? 'Modifier le Devis' : 'Nouveau Devis'}
          </h2>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <Calculator className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">
            Total: {totals.totalAmount.toFixed(2)} DT
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de client */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de client *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="typeClient" value="particulier" checked={formData.typeClient === 'particulier'} onChange={handleInputChange} />
              Particulier
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="typeClient" value="entreprise" checked={formData.typeClient === 'entreprise'} onChange={handleInputChange} />
              Entreprise
            </label>
          </div>
        </div>
        {/* Infos société si entreprise */}
        {formData.typeClient === 'entreprise' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la société *</label>
                <input type="text" name="societe" value={formData.societe} onChange={handleInputChange} required={formData.typeClient === 'entreprise'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RC *</label>
                <input type="text" name="rc" value={formData.rc} onChange={handleInputChange} required={formData.typeClient === 'entreprise'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">TVA *</label>
                <input type="text" name="tva" value={formData.tva} onChange={handleInputChange} required={formData.typeClient === 'entreprise'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
        )}
        {/* Client Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations Client
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du Client *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Articles du Devis
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter Article</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-600">
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Qté
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Référence
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Couleur
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prix Unit.
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Remise %
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const itemTotal = (item.quantity * item.unitPrice) * (1 - item.discount / 100);
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                          placeholder="Description de l'article"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2">
                        <input
                          type="text"
                          value={item.reference}
                          onChange={(e) => handleItemChange(index, 'reference', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                          placeholder="Référence"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2">
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                          placeholder="Couleur"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-right font-semibold">
                        {itemTotal.toFixed(2)} DT
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex justify-end space-x-8">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sous-total:</div>
                <div className="font-semibold">{totals.subtotal.toFixed(2)} DT</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Remise totale:</div>
                <div className="font-semibold text-red-600">-{totals.totalDiscount.toFixed(2)} DT</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total final:</div>
                <div className="text-xl font-bold text-green-600">{totals.totalAmount.toFixed(2)} DT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conditions
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Délais de livraison
              </label>
              <input
                type="text"
                name="deliveryDelay"
                value={formData.deliveryDelay}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conditions de paiement
              </label>
              <textarea
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conditions de livraison
              </label>
              <textarea
                name="deliveryCondition"
                value={formData.deliveryCondition}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DevisForm;
