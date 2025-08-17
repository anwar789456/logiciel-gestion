import React, { useEffect, useState } from 'react';
import { FetchAllOptionItems, DeleteOptionById, UpdateOptionById, addOption } from '../../api/options/Options';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import { OptionsDisplay } from './OptionsDisplay'

const Options = ({ initialShowForm = false, onFormClose }) => {
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState({ nomOption: '', typeOption: '', customOptions: [], sizesOptions: [], mousseOptions: []});
  const [editId, setEditId] = useState(null);
  const [customOption, setCustomOption] = useState({ option_name: '', prix_option: '' });
  const [customEditIndex, setCustomEditIndex] = useState(null);
  const [sizeOption, setSizeOption] = useState({ longueur: '', largeur: '', prix_option: '', prix_coffre: '' });
  const [sizeEditIndex, setSizeEditIndex] = useState(null);
  const [mousseOption, setMousseOption] = useState({ mousse_name: '', mousse_prix: '' });
  const [mousseEditIndex, setMousseEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(initialShowForm);
  
  // Écouter les changements de initialShowForm
  useEffect(() => {
    setShowForm(initialShowForm);
  }, [initialShowForm]);
  
  // Fonction pour fermer le formulaire
  const closeForm = () => {
    setShowForm(false);
    if (onFormClose) onFormClose();
  };
  
  // Écouter l'événement toggleForm depuis le modal parent
  useEffect(() => {
    const handleToggleForm = (event) => {
      if (event.detail && event.detail.show !== undefined) {
        setShowForm(event.detail.show);
      } else {
        setShowForm(prev => !prev);
      }
    };
    
    document.addEventListener('toggleForm', handleToggleForm);
    
    return () => {
      document.removeEventListener('toggleForm', handleToggleForm);
    };
  }, []);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await FetchAllOptionItems();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCustomOptionChange = (e) => {
    const { name, value } = e.target;
    setCustomOption((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSizeOptionChange = (e) => {
    const { name, value } = e.target;
    setSizeOption((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleMousseOptionChange = (e) => {
    const { name, value } = e.target;
    setMousseOption((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddCustomOption = () => {
    if (customEditIndex !== null) {
      setFormData((prev) => {
        const updatedCustomOptions = [...prev.customOptions];
        updatedCustomOptions[customEditIndex] = customOption;
        return { ...prev, customOptions: updatedCustomOptions };
      });
      setCustomEditIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        customOptions: [...prev.customOptions, customOption],
      }));
    }
    setCustomOption({ option_name: '', prix_option: '' });
  };
  
  const handleAddSizeOption = () => {
    if (sizeEditIndex !== null) {
      setFormData((prev) => {
        const updatedSizesOptions = [...prev.sizesOptions];
        updatedSizesOptions[sizeEditIndex] = sizeOption;
        return { ...prev, sizesOptions: updatedSizesOptions };
      });
      setSizeEditIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        sizesOptions: [...prev.sizesOptions, sizeOption],
      }));
    }
    setSizeOption({ longueur: '', largeur: '', prix_option: '', prix_coffre: '' });
  };
  
  const handleAddMousseOption = () => {
    if (mousseEditIndex !== null) {
      setFormData((prev) => {
        const updatedMousseOptions = [...prev.mousseOptions];
        updatedMousseOptions[mousseEditIndex] = mousseOption;
        return { ...prev, mousseOptions: updatedMousseOptions };
      });
      setMousseEditIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        mousseOptions: [...prev.mousseOptions, mousseOption],
      }));
    }
    setMousseOption({ mousse_name: '', mousse_prix: '' });
  };
  
  const handleEditCustomOption = (index) => {
    setCustomEditIndex(index);
    setCustomOption({ ...formData.customOptions[index] });
  };
  
  const handleEditSizeOption = (index) => {
    setSizeEditIndex(index);
    setSizeOption({ ...formData.sizesOptions[index] });
  };
  
  const handleEditMousseOption = (index) => {
    setMousseEditIndex(index);
    setMousseOption({ ...formData.mousseOptions[index] });
  };
  
  const handleRemoveCustomOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      customOptions: prev.customOptions.filter((_, i) => i !== index),
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await UpdateOptionById(editId, formData);
      } else {
        await addOption(formData);
      }
      
      // Rafraîchir la liste des options
      const data = await FetchAllOptionItems();
      setOptions(data);
      
      // Réinitialiser le formulaire
      setFormData({ nomOption: '', typeOption: '', customOptions: [], sizesOptions: [], mousseOptions: []});
      setEditId(null);
      
      // Fermer le formulaire
      closeForm();
    } catch (error) {
      console.error('Error submitting option:', error);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await DeleteOptionById(id);
        setOptions((prevOptions) => prevOptions.filter((option) => option._id !== id));
        alert('Option deleted successfully');
      } catch (error) {
        console.error('Error deleting option:', error); 
      }
    }
  };
  
  const handleEdit = (option) => {
    setEditId(option._id);    
    setFormData(option);
    setShowForm(true);
  };
  
  return (
    <div className="w-full options-component">
      {/* Bouton d'ajout masqué - maintenant géré par le bouton dans l'en-tête du modal */}
      <button 
        onClick={() => setShowForm(!showForm)}
        className="hidden mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 items-center"
      >
        {showForm ? (
          <>
            <X size={18} className="mr-2" />
            Masquer le formulaire
          </>
        ) : (
          <>
            <Plus size={18} className="mr-2" />
            Afficher le formulaire
          </>
        )}
      </button>
      
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => {
          // Fermer le formulaire en cliquant à l'extérieur
          if (e.target === e.currentTarget) {
            closeForm();
          }
        }}>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
            <button 
              type="button"
              onClick={() => closeForm()} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'option:</label>
              <input 
                type="text" 
                name="nomOption" 
                value={formData.nomOption} 
                onChange={handleInputChange} 
                required 
                autoComplete="off" 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'option:</label>
              <select 
                name="typeOption" 
                value={formData.typeOption} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value=""></option>
                <option value="options">Tarification Tissus</option>
                <option value="sizes">Dimensions</option>
                <option value="mousse">Mousse</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="mb-4">
              {formData.typeOption === 'options' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Tarification Tissus</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input 
                      type="text" 
                      name="option_name" 
                      autoComplete="off" 
                      value={customOption.option_name} 
                      placeholder="Option Name" 
                      onChange={handleCustomOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="text" 
                      name="prix_option" 
                      autoComplete="off" 
                      value={customOption.prix_option} 
                      placeholder="Option Price" 
                      onChange={handleCustomOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCustomOption} 
                      className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      <Plus size={18} className="mr-2" />
                      {customEditIndex !== null ? 'Update' : 'Tarif Tissus'}
                    </button>
                  </div>
                </div>
              )}
              
              {formData.typeOption === 'sizes' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Size Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                    <input 
                      type="text" 
                      name="longueur" 
                      autoComplete="off" 
                      value={sizeOption.longueur} 
                      placeholder="Longueur" 
                      onChange={handleSizeOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="text" 
                      name="largeur" 
                      autoComplete="off" 
                      value={sizeOption.largeur} 
                      placeholder="Largeur" 
                      onChange={handleSizeOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="text" 
                      name="prix_option" 
                      autoComplete="off" 
                      value={sizeOption.prix_option} 
                      placeholder="Prix Dimension" 
                      onChange={handleSizeOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="text" 
                      name="prix_coffre" 
                      autoComplete="off" 
                      value={sizeOption.prix_coffre} 
                      placeholder="Prix Coffre" 
                      onChange={handleSizeOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSizeOption} 
                      className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      <Plus size={18} className="mr-2" />
                      {sizeEditIndex !== null ? 'Update' : 'Dimension'}
                    </button>
                  </div>
                </div>
              )}
              
              {formData.typeOption === 'mousse' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Options de Mousse</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input 
                      type="text" 
                      name="mousse_name" 
                      autoComplete="off" 
                      value={mousseOption.mousse_name} 
                      placeholder="Nom de la mousse" 
                      onChange={handleMousseOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                      type="text" 
                      name="mousse_prix" 
                      autoComplete="off" 
                      value={mousseOption.mousse_prix} 
                      placeholder="Prix de la mousse" 
                      onChange={handleMousseOptionChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddMousseOption} 
                      className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      <Plus size={18} className="mr-2" />
                      {mousseEditIndex !== null ? 'Mettre à jour' : 'Mousse'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {(formData.customOptions.length > 0 || formData.sizesOptions.length > 0 || formData.mousseOptions.length > 0) && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {formData.typeOption === 'options' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom de l'option</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix de l'option</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Modifier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supprimer</th>
                        </>
                      )}
                      {formData.typeOption === 'sizes' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Longueur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Largeur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix Dimension</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix Coffre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Edit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Delete</th>
                        </>
                      )}
                      {formData.typeOption === 'mousse' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom de la mousse</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix de la mousse</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Modifier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supprimer</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {formData.typeOption === 'options' &&
                      formData.customOptions.map((custom, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{custom.option_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{custom.prix_option}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              type="button" 
                              onClick={() => handleEditCustomOption(index)} 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Pencil size={18} />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCustomOption(index)} 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {formData.typeOption === 'sizes' &&
                      formData.sizesOptions.map((size, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{size.longueur}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{size.largeur}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{size.prix_option}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{size.prix_coffre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              type="button" 
                              onClick={() => handleEditSizeOption(index)} 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Pencil size={18} />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              type="button" 
                              onClick={() => setFormData((prev) => ({
                                ...prev,
                                sizesOptions: prev.sizesOptions.filter((_, i) => i !== index),
                              }))} 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {formData.typeOption === 'mousse' &&
                      formData.mousseOptions.map((mousse, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{mousse.mousse_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{mousse.mousse_prix}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              type="button" 
                              onClick={() => handleEditMousseOption(index)} 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Pencil size={18} />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              type="button" 
                              onClick={() => setFormData((prev) => ({ 
                                ...prev, 
                                mousseOptions: prev.mousseOptions.filter((_, i) => i !== index),
                              }))} 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
          >
            {editId ? 'Mettre à jour l\'option' : 'Ajouter l\'option'}
          </button>
        </form>
      </div>
      )}
      
      {options && (
        <OptionsDisplay options={options} handleEdit={handleEdit} handleDelete={handleDelete} />
      )}
    </div>
  );
};

export default Options;