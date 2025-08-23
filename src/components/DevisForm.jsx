import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Calculator } from 'lucide-react';
import { createDevis, updateDevis } from '../api/devis/devis';

const DevisForm = ({ existingDevis = null, onSuccess, onCancel }) => {
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
    deliveryDelay: '45 jours à partir de la date de confirmation',
    paymentTerms: 'Tous les paiements sont effectués avant la livraison au showroom',
    deliveryCondition: 'LA LIVRAISON EST GRATUITE UNIQUEMENT SUR LE GRAND TUNIS (TUNIS, ARIANA, MANOUBA, BEN AROUS)',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalDiscount: 0,
    totalHT: 0,
    tvaAmount: 0,
    totalTTC: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (existingDevis) {
      setFormData({
        clientType: existingDevis.clientType || 'particulier',
        clientName: existingDevis.clientName || '',
        clientAddress: existingDevis.clientAddress || '',
        clientPhone: existingDevis.clientPhone || '',
        email: existingDevis.email || '',
        companyName: existingDevis.companyName || '',
        rc: existingDevis.rc || '',
        taxId: existingDevis.taxId || '',
        items: existingDevis.items || [{ quantity: 1, description: '', refColor: '', unitPrice: 0, discount: 0 }],
        tvaRate: existingDevis.tvaRate || 19,
        deliveryDelay: existingDevis.deliveryDelay || '45 jours à partir de la date de confirmation',
        paymentTerms: existingDevis.paymentTerms || 'Tous les paiements sont effectués avant la livraison au showroom',
        deliveryCondition: existingDevis.deliveryCondition || 'LA LIVRAISON EST GRATUITE UNIQUEMENT SUR LE GRAND TUNIS (TUNIS, ARIANA, MANOUBA, BEN AROUS)',
        notes: existingDevis.notes || ''
      });
    }
  }, [existingDevis]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.clientType, formData.tvaRate]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    formData.items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

    const totalHT = subtotal - totalDiscount;

    // Calculate TVA for enterprises
    const tvaRate = formData.clientType === 'entreprise' ? formData.tvaRate : 0;
    const tvaAmount = formData.clientType === 'entreprise' ? (totalHT * tvaRate / 100) : 0;
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
        {/* Client Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations Client
          </h3>

          {/* Type de Client */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de Client *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clientType"
                  value="particulier"
                  checked={formData.clientType === 'particulier'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Particulier</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clientType"
                  value="entreprise"
                  checked={formData.clientType === 'entreprise'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Entreprise</span>
              </label>
            </div>
          </div>

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

          {/* Champs spécifiques à l'entreprise */}
          {formData.clientType === 'entreprise' && (
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Informations Entreprise
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'Entreprise *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required={formData.clientType === 'entreprise'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registre de Commerce (RC) *
                  </label>
                  <input
                    type="text"
                    name="rc"
                    value={formData.rc}
                    onChange={handleInputChange}
                    required={formData.clientType === 'entreprise'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Identifiant Fiscal
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
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
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
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
                    Ref Color
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
                          value={item.refColor}
                          onChange={(e) => handleItemChange(index, 'refColor', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                          placeholder="Ref Color"
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
                <div className="text-sm text-gray-600 dark:text-gray-400">Total HT:</div>
                <div className="font-semibold">{totals.totalHT.toFixed(2)} DT</div>
              </div>
              {formData.clientType === 'entreprise' && (
                <>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">TVA ({formData.tvaRate}%):</div>
                    <div className="font-semibold text-blue-600">{totals.tvaAmount.toFixed(2)} DT</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total TTC:</div>
                    <div className="text-xl font-bold text-green-600">{totals.totalTTC.toFixed(2)} DT</div>
                  </div>
                </>
              )}
              {formData.clientType === 'particulier' && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total final:</div>
                  <div className="text-xl font-bold text-green-600">{totals.totalAmount.toFixed(2)} DT</div>
                </div>
              )}
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
