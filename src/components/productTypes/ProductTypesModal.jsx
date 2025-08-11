import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { 
  FetchAllProductTypeItems, 
  addProductType, 
  UpdateProductTypeById, 
  DeleteProductTypeById,
  GetProductTypeById
} from '../../api/product';

const ProductTypesModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States for add/edit form
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  
  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, typeId: null });
  
  // Fetch all product types
  const fetchProductTypes = async () => {
    setLoading(true);
    try {
      const data = await FetchAllProductTypeItems();
      setProductTypes(data);
    } catch (error) {
      console.error('Error fetching product types:', error);
      setError(t('error_fetching_product_types'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchProductTypes();
    }
  }, [isOpen]);
  
  // Handle delete product type
  const handleDeleteProductType = async (id) => {
    try {
      await DeleteProductTypeById(id);
      setDeleteConfirmation({ show: false, typeId: null });
      // Refresh the product types list
      fetchProductTypes();
    } catch (error) {
      console.error('Error deleting product type:', error);
      setError(t('error_deleting_product_type'));
    }
  };
  
  // Handle edit product type
  const handleEditProductType = (type) => {
    setSelectedType(type);
    setShowEditForm(true);
    setShowAddForm(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('product_types')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-500 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          ) : (
            <>
              {/* Product Types List */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('product_types_list')}</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setShowEditForm(false);
                      setSelectedType(null);
                    }}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    <Plus size={18} className="mr-1" />
                    {t('add_product_type')}
                  </button>
                </div>
                
                {productTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('no_product_types_found')}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {productTypes.map((type) => (
                        <div key={type._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{type.title}</h4>
                              {type.sousTitles && type.sousTitles.length > 0 && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subtitles')}:</h5>
                                  <ul className="pl-4 space-y-1">
                                    {type.sousTitles.map((sousTitle, index) => (
                                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">{sousTitle.titleSous}:</span> {sousTitle.valueSous}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProductType(type)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                                title={t('edit')}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmation({ show: true, typeId: type._id })}
                                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                                title={t('delete')}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Add Form */}
              {showAddForm && (
                <AddProductTypeForm 
                  onClose={() => setShowAddForm(false)} 
                  onSuccess={() => {
                    setShowAddForm(false);
                    fetchProductTypes();
                  }} 
                />
              )}
              
              {/* Edit Form */}
              {showEditForm && selectedType && (
                <EditProductTypeForm 
                  productType={selectedType} 
                  onClose={() => {
                    setShowEditForm(false);
                    setSelectedType(null);
                  }} 
                  onSuccess={() => {
                    setShowEditForm(false);
                    setSelectedType(null);
                    fetchProductTypes();
                  }} 
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="mr-2" size={24} />
              <h2 className="text-xl font-semibold">{t('confirm_delete')}</h2>
            </div>
            <p className="mb-6">{t('delete_product_type_confirmation')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, typeId: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDeleteProductType(deleteConfirmation.typeId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors duration-200"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Product Type Form Component
const AddProductTypeForm = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    sousTitles: [{ titleSous: '', valueSous: '' }]
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSousTitleChange = (index, field, value) => {
    const updatedSousTitles = [...formData.sousTitles];
    updatedSousTitles[index][field] = value;
    setFormData(prev => ({
      ...prev,
      sousTitles: updatedSousTitles
    }));
  };
  
  const addSousTitle = () => {
    setFormData(prev => ({
      ...prev,
      sousTitles: [...prev.sousTitles, { titleSous: '', valueSous: '' }]
    }));
  };
  
  const removeSousTitle = (index) => {
    const updatedSousTitles = [...formData.sousTitles];
    updatedSousTitles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      sousTitles: updatedSousTitles
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError(t('title_required'));
      return;
    }
    
    // Filter out empty sousTitles
    const filteredSousTitles = formData.sousTitles.filter(
      item => item.titleSous.trim() !== '' && item.valueSous.trim() !== ''
    );
    
    setLoading(true);
    try {
      await addProductType({
        ...formData,
        sousTitles: filteredSousTitles
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding product type:', error);
      setError(t('error_adding_product_type'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={(e) => {
      // Close modal when clicking outside
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('add_product_type')}</h3>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-500 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('title')} *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('subtitles')}
            </label>
            <button
              type="button"
              onClick={addSousTitle}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer transition-colors duration-200"
            >
              <Plus size={16} className="mr-1" />
              {t('add_subtitle')}
            </button>
          </div>
          
          {formData.sousTitles.map((sousTitle, index) => (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('subtitle_name')}
                  value={sousTitle.titleSous}
                  onChange={(e) => handleSousTitleChange(index, 'titleSous', e.target.value)}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('subtitle_value')}
                  value={sousTitle.valueSous}
                  onChange={(e) => handleSousTitleChange(index, 'valueSous', e.target.value)}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSousTitle(index)}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                title={t('remove')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer transition-colors duration-200"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] cursor-pointer transition-colors duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              t('save')
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

// Edit Product Type Form Component
const EditProductTypeForm = ({ productType, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: productType.title || '',
    sousTitles: productType.sousTitles && productType.sousTitles.length > 0 
      ? productType.sousTitles 
      : [{ titleSous: '', valueSous: '' }]
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSousTitleChange = (index, field, value) => {
    const updatedSousTitles = [...formData.sousTitles];
    updatedSousTitles[index][field] = value;
    setFormData(prev => ({
      ...prev,
      sousTitles: updatedSousTitles
    }));
  };
  
  const addSousTitle = () => {
    setFormData(prev => ({
      ...prev,
      sousTitles: [...prev.sousTitles, { titleSous: '', valueSous: '' }]
    }));
  };
  
  const removeSousTitle = (index) => {
    const updatedSousTitles = [...formData.sousTitles];
    updatedSousTitles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      sousTitles: updatedSousTitles
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError(t('title_required'));
      return;
    }
    
    // Filter out empty sousTitles
    const filteredSousTitles = formData.sousTitles.filter(
      item => item.titleSous.trim() !== '' && item.valueSous.trim() !== ''
    );
    
    setLoading(true);
    try {
      await UpdateProductTypeById(productType._id, {
        ...formData,
        sousTitles: filteredSousTitles
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating product type:', error);
      setError(t('error_updating_product_type'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={(e) => {
      // Close modal when clicking outside
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('edit_product_type')}</h3>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-500 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('title')} *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('subtitles')}
            </label>
            <button
              type="button"
              onClick={addSousTitle}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer transition-colors duration-200"
            >
              <Plus size={16} className="mr-1" />
              {t('add_subtitle')}
            </button>
          </div>
          
          {formData.sousTitles.map((sousTitle, index) => (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('subtitle_name')}
                  value={sousTitle.titleSous}
                  onChange={(e) => handleSousTitleChange(index, 'titleSous', e.target.value)}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('subtitle_value')}
                  value={sousTitle.valueSous}
                  onChange={(e) => handleSousTitleChange(index, 'valueSous', e.target.value)}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSousTitle(index)}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                title={t('remove')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer transition-colors duration-200"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] cursor-pointer transition-colors duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              t('save')
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default ProductTypesModal;