import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { createBonReception, updateBonReception } from '../../api/BonReception/BonReception';
import toast from 'react-hot-toast';

export default function BonReceptionForm({ existingBon, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fournisseur: '',
    adresse: '',
    gsm: '',
    compteur: '',
    articles: [{ description: '', ref_couleur: '', quantity: '', pu_ht: '', remise: '' }],
    avance: '',
    reglement: ''
  });

  useEffect(() => {
    if (existingBon) {
      setFormData({
        fournisseur: existingBon.fournisseur || '',
        adresse: existingBon.adresse || '',
        gsm: existingBon.gsm || '',
        compteur: existingBon.compteur || '',
        articles: existingBon.articles?.length ? existingBon.articles : [{ description: '', ref_couleur: '', quantity: '', pu_ht: '', remise: '' }],
        avance: existingBon.avance || '',
        reglement: existingBon.reglement || ''
      });
    }
  }, [existingBon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArticleChange = (index, field, value) => {
    const updatedArticles = [...formData.articles];
    updatedArticles[index][field] = value;

    setFormData(prev => ({
      ...prev,
      articles: updatedArticles
    }));
  };

  const addArticle = () => {
    setFormData(prev => ({
      ...prev,
      articles: [...prev.articles, { description: '', ref_couleur: '', quantity: '', pu_ht: '', remise: '' }]
    }));
  };

  const removeArticle = (index) => {
    if (formData.articles.length > 1) {
      const updatedArticles = formData.articles.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        articles: updatedArticles
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fournisseur.trim()) {
      toast.error('Le nom du fournisseur est requis');
      return;
    }

    if (formData.articles.some(article => !article.description.trim())) {
      toast.error('Tous les articles doivent avoir une description');
      return;
    }

    try {
      setLoading(true);
      
      if (existingBon) {
        await updateBonReception(existingBon._id, formData);
        toast.success('Bon de réception modifié avec succès');
      } else {
        await createBonReception(formData);
        toast.success('Bon de réception créé avec succès');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(existingBon ? 'Erreur lors de la modification' : 'Erreur lors de la création');
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[95vh] overflow-hidden shadow-xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {existingBon ? 'Modifier' : 'Nouveau'} Bon de Réception
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="bon-reception-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Informations Fournisseur
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fournisseur *
              </label>
              <input
                type="text"
                name="fournisseur"
                value={formData.fournisseur}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GSM
              </label>
              <input
                type="text"
                name="gsm"
                value={formData.gsm}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Compteur
              </label>
              <input
                type="text"
                name="compteur"
                value={formData.compteur}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Articles
            </h3>
            <button
              type="button"
              onClick={addArticle}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {formData.articles.map((article, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={article.description}
                    onChange={(e) => handleArticleChange(index, 'description', e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Réf/Couleur
                  </label>
                  <input
                    type="text"
                    value={article.ref_couleur || ''}
                    onChange={(e) => handleArticleChange(index, 'ref_couleur', e.target.value)}
                    autoComplete="off"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantité
                  </label>
                  <input
                    type="text"
                    value={article.quantity}
                    onChange={(e) => handleArticleChange(index, 'quantity', e.target.value)}
                    autoComplete="off"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix Unitaire HT
                  </label>
                  <input
                    type="text"
                    value={article.pu_ht}
                    onChange={(e) => handleArticleChange(index, 'pu_ht', e.target.value)}
                    autoComplete="off"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remise %
                  </label>
                  <input
                    type="text"
                    value={article.remise}
                    onChange={(e) => handleArticleChange(index, 'remise', e.target.value)}
                    autoComplete="off"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="col-span-6 md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeArticle(index)}
                    disabled={formData.articles.length === 1}
                    className="w-full px-2 py-1.5 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Informations de Paiement
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avance (DT)
              </label>
              <input
                type="text"
                name="avance"
                value={formData.avance}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Règlement
              </label>
              <input
                type="text"
                name="reglement"
                value={formData.reglement}
                onChange={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="bon-reception-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={18} />
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
