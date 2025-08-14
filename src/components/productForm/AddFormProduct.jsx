import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Trash2, Upload, GripVertical } from 'lucide-react'
import { addProduct, FetchAllProductTypeItems } from '../../api/product'
import { FetchAllCategoryItems, updateCategorySubLink } from '../../api/Category/category';
import { FetchAllOptionItems } from '../../api/options/Options';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

// SortableImage Component for drag-and-drop functionality
const SortableImage = ({ image, index, handleImageChange, removeImage, t }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    touchAction: 'none', // Prevents touch scrolling while dragging on mobile
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex flex-col bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full"
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={t('drag_to_reorder')}
        >
          <GripVertical size={14} />
        </div>
        <button
          type="button"
          onClick={() => removeImage(index)}
          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title={t('remove')}
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      {image.img && (
        <div className="mb-2 relative">
          <img 
            src={image.img} 
            alt={`Preview ${index + 1}`} 
            className="w-full h-24 object-cover rounded-md" 
          />
        </div>
      )}
      
      <input
        type="text"
        value={image.img}
        onChange={(e) => handleImageChange(index, e.target.value)}
        placeholder={t('image_url')}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-2 py-1 text-sm"
      />
    </div>
  );
};

const AddFormProduct = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [typeProdOptions, setTypeProdOptions] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [options, setOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    idProd: '',
    typeProd: '',
    nom: '',
    description: '',
    quantite: '',
    images: [{ img: '', hyperPoints: [] }],
    minPrice: '',
    maxPrice: '',
    longueur: '',
    largeur: '',
    hauteur: '',
    profondeur_assise: '',
    display: 'oui',
    categorie: '',
    disponibilite: 'En stock',
    options: [],
    sizes: [],
    mousse: [],
    subcategorie: '',
    direction: '',
    delai: '',
    dimensions: [] // Dimensions are only used in EditFormProduct
  });
  
  // Fetch product types and process them for the dropdown
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const data = await FetchAllProductTypeItems();
        setProductTypes(data);
        
        // Process product types to extract sousTitles for the dropdown
        const options = [];
        data.forEach(type => {
          if (type.sousTitles && type.sousTitles.length > 0) {
            // Add the main title as a disabled option header
            options.push({
              value: '',
              label: type.title,
              disabled: true,
              isHeader: true
            });
            
            // Add subtitles as selectable options
            type.sousTitles.forEach(subTitle => {
              if (subTitle.valueSous && subTitle.titleSous) {
                // Only add unique values
                if (!options.some(option => option.value === subTitle.valueSous)) {
                  options.push({
                    value: subTitle.valueSous,
                    label: `  ${subTitle.titleSous}`,
                    disabled: false
                  });
                }
              }
            });
          }
        });
        
        setTypeProdOptions(options);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };
    
    fetchProductTypes();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await FetchAllCategoryItems();
        console.log('Fetched categories:', data);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch options
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for category changes
    if (name === 'categorie') {
      
      // Find the selected category object by its href
      const selectedCat = categories.find(cat => cat.href.replace("/Shop/", "") === value);
      
      setSelectedCategory(selectedCat);
      
      // Update subcategories list and reset subcategory
      if (selectedCat && selectedCat.subLinks && selectedCat.subLinks.length > 0) {
        setSubCategories(selectedCat.subLinks);
      } else {
        setSubCategories([]);
      }
      
      // Reset subcategory when category changes and add a flag to indicate user changed the category
      setFormData(prev => ({
        ...prev,
        [name]: value,  // Set the category value (main category)
        subcategorie: '', // Reset subcategory
        categorie_changed: true // Flag to indicate user changed the category
      }));
    } else if (name === 'subcategorie') {
      // For subcategory changes, update the subcategory field and keep the main category
      setFormData(prev => ({
        ...prev,
        [name]: value, // Set subcategory value
        categorie_changed: true // Flag to indicate category/subcategory was changed
      }));
    } else {
      // Update form data with the new value for other fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleOptionSelect = (e) => {
    const { name, value } = e.target;
    const selectedOption = options.find((opt) => opt.nomOption === value);
    
    setFormData((prevData) => {
      if (!selectedOption) {
        return {
          ...prevData,
          [name]: [],
        };
      }
      
      switch (name) {
        case "customOptions":
          return { 
            ...prevData, 
            options: selectedOption.customOptions || [],
          };
        case "sizes":
          return { 
            ...prevData, 
            sizes: selectedOption.sizesOptions || [], 
          };
        case "mousse":
          return { 
            ...prevData, 
            mousse: selectedOption.mousseOptions || [], 
          };
        default:
          return prevData;
      }
    });
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index].img = value;
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { img: '', hyperPoints: [], id: `image-${Date.now()}` }]
    }));
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: updatedImages.length ? updatedImages : [{ img: '', hyperPoints: [], id: `image-${Date.now()}` }]
    }));
  };
  
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Reduced distance for easier activation
        tolerance: 5, // Added tolerance for better touch handling
        delay: 150, // Short delay to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.images.findIndex(img => img.id === active.id);
        const newIndex = prev.images.findIndex(img => img.id === over.id);
        
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };
  
  // Initialize images with IDs if they don't have them
  useEffect(() => {
    if (formData.images.some(img => !img.id)) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, index) => 
          img.id ? img : { ...img, id: `image-${Date.now()}-${index}` }
        )
      }));
    }
  }, []);

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { option_name: '', prix_option: '' }]
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const removeOption = (index) => {
    const updatedOptions = [...formData.options];
    updatedOptions.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { longueur: '', largeur: '', prix_option: '', prix_coffre: '' }]
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index][field] = value;
    setFormData(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const removeSize = (index) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const addMousse = () => {
    setFormData(prev => ({
      ...prev,
      mousse: [...prev.mousse, { mousse_name: '', mousse_prix: '' }]
    }));
  };

  const handleMousseChange = (index, field, value) => {
    const updatedMousse = [...formData.mousse];
    updatedMousse[index][field] = value;
    setFormData(prev => ({
      ...prev,
      mousse: updatedMousse
    }));
  };

  const removeMousse = (index) => {
    const updatedMousse = [...formData.mousse];
    updatedMousse.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      mousse: updatedMousse
    }));
  };

  // Dimension functions removed as they are only needed in EditFormProduct

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.nom || !formData.categorie) {
        throw new Error(t('required_fields_missing'));
      }

      // Clean up empty arrays
      const cleanedData = { ...formData };
      if (cleanedData.options.length === 0 || 
          (cleanedData.options.length === 1 && !cleanedData.options[0].option_name)) {
        cleanedData.options = [];
      }
      
      if (cleanedData.sizes.length === 0 || 
          (cleanedData.sizes.length === 1 && !cleanedData.sizes[0].longueur)) {
        cleanedData.sizes = [];
      }
      
      if (cleanedData.mousse.length === 0 || 
          (cleanedData.mousse.length === 1 && !cleanedData.mousse[0].mousse_name)) {
        cleanedData.mousse = [];
      }
      
      // Dimensions are handled in EditFormProduct only
      cleanedData.dimensions = [];

      // Filter out empty images
      cleanedData.images = cleanedData.images.filter(img => img.img.trim() !== '');
      if (cleanedData.images.length === 0) {
        cleanedData.images = [{ img: '', hyperPoints: [] }];
      }
      
      // Ensure subcategory is properly set (this will be the product.categorie in the database)
      if (cleanedData.subcategorie === undefined || cleanedData.subcategorie === null) {
        cleanedData.subcategorie = ''; // Ensure it's an empty string rather than undefined or null
      }
      
      // Store the main category title in product.subcategorie and the subcategory title in product.categorie
      // This is the opposite of what the field names suggest, but matches the database schema
      const tempCategory = cleanedData.categorie; // Main category (parent)
      cleanedData.categorie = cleanedData.subcategorie; // Set product.categorie to the subcategory title
      cleanedData.subcategorie = tempCategory; // Set product.subcategorie to the main category title
      
      console.log('Final product.categorie (subcategory):', cleanedData.categorie);
      console.log('Final product.subcategorie (main category):', cleanedData.subcategorie);

      await addProduct(cleanedData);
      onSuccess();
    } catch (error) {
      setError(error.message || t('error_adding_product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">{t('basic_info')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_id')}</label>
            <input
              type="text"
              name="idProd"
              value={formData.idProd}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_name')}</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_type')}</label>
            <select
              name="typeProd"
              value={formData.typeProd}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
            >
              <option value="">{t('all_product_types')}</option>
              {typeProdOptions.map((option, index) => (
                <option 
                  key={index} 
                  value={option.value} 
                  disabled={option.disabled}
                  style={option.isHeader ? { fontWeight: 'bold', backgroundColor: '#f3f4f6' } : {}}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('quantity')}</label>
            <input
              type="text"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('min_price')}</label>
              <input
                type="text"
                name="minPrice"
                value={formData.minPrice}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('max_price')}</label>
              <input
                type="text"
                name="maxPrice"
                value={formData.maxPrice}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {/* Category and Availability */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">{t('category_availability')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('main_category')}</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
            >
              <option value="">{t('select_main_category')}</option>
              {categories.map((category, index) => (
                <option key={index} value={category.href.replace("/Shop/", "")}>
                  {/* {category.title} */}
                  {category.href.replace("/Shop/", "")}
                </option>
              ))}
            </select>
            {/* Debug info */}
            {/* <div className="text-xs text-gray-500 mt-1">
              {`Selected main category: ${formData.categorie || 'None'}`}
              <div className="text-amber-600 font-semibold">
                (Matches product.subcategorie in database)
              </div>
            </div> */}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('subcategory')}</label>
            <select
              name="subcategorie"
              value={formData.subcategorie}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
            >
              <option value="">{t('select_subcategory')}</option>
                {subCategories.map((sub, index) => {
                  return (
                    <option key={index} value={sub.href.replace("/Shop/", "")}>
                      {sub.title}
                    </option>
                  );
                })}
            </select>
            {/* Debug info */}
            {/* <div className="text-xs text-gray-500 mt-1">
              {`Selected subcategory: ${formData.subcategorie || 'None'}`}
              <div className="text-amber-600 font-semibold">
                (Matches product.categorie in database)
              </div>
              <div className="text-blue-600 font-semibold">
                {`Available subcategories: ${subCategories.length}`}
              </div>
            </div> */}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('availability')}</label>
            <select
              name="disponibilite"
              value={formData.disponibilite}
              onChange={handleChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="En stock">{t('en stock')}</option>
              <option value="Hors stock">{t('hors stock')}</option>
              <option value="En arrivage">{t('en arrivage')}</option>
              <option value="Sur commande">{t('sur commande')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('display')}</label>
            <select
              name="display"
              value={formData.display}
              onChange={handleChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="oui">{t('yes')}</option>
              <option value="non">{t('no')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('direction')} (Canapé d'angle)</label>
            <select
              name="direction"
              value={formData.direction}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
            >
              <option value="">{t('select_direction')}</option>
              <option value="droite">{t('right')}</option>
              <option value="gauche">{t('left')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('delay')}</label>
            <input
              type="text"
              name="delai"
              value={formData.delai}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {/* Dimensions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">{t('dimensions')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('length')}</label>
            <input
              type="text"
              name="longueur"
              value={formData.longueur}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('width')}</label>
            <input
              type="text"
              name="largeur"
              value={formData.largeur}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('height')}</label>
            <input
              type="text"
              name="hauteur"
              value={formData.hauteur}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('seat_depth')}</label>
            <input
              type="text"
              name="profondeur_assise"
              value={formData.profondeur_assise}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {/* Images */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('images')}</h3>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus size={16} className="mr-1" />
            {t('add_image')}
          </button>
        </div>
        
        <div className="image-preview-container p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            measuring={{ droppable: { strategy: 'always' } }}
          >
            <SortableContext 
              items={formData.images.map(img => img.id)} 
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {formData.images.length > 0 ? (
                formData.images.map((image, index) => (
                  <SortableImage 
                    key={image.id} 
                    image={image} 
                    index={index} 
                    handleImageChange={handleImageChange}
                    removeImage={removeImage}
                    t={t}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 col-span-full">
                  <Upload size={28} className="mx-auto mb-2" />
                  <p>{t('no_images_added')}</p>
                  <p className="text-sm">{t('click_add_image')}</p>
                </div>
              )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
      
      {/* Options */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('options')}</h3>
        </div>
        
        <div className="form-item">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('option_tarification')}</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" 
            name="customOptions" 
            onChange={handleOptionSelect}
          >
            <option value="">{t('select_option')}</option>
            {options
              .filter((option) => option.typeOption === "options")
              .map((option) => (
                <option key={option._id} value={option.nomOption}>
                  {option.nomOption}
                </option>
              ))}
          </select>
        </div>
      </div>
      
      {/* Sizes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('sizes')}</h3>
        </div>
        
        <div className="form-item">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('option_dimensions')}</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" 
            name="sizes" 
            onChange={handleOptionSelect}
          >
            <option value="">{t('select_option')}</option>
            {options
              .filter((option) => option.typeOption === "sizes")
              .map((option) => (
                <option key={option._id} value={option.nomOption}>
                  {option.nomOption}
                </option>
              ))}
          </select>
        </div>
      </div>
      
      {/* Mousse */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('foam')}</h3>
        </div>
        
        <div className="form-item">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('option_mousse')}</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" 
            name="mousse" 
            onChange={handleOptionSelect}
          >
            <option value="">{t('select_option')}</option>
            {options
              .filter((option) => option.typeOption === "mousse")
              .map((option) => (
                <option key={option._id} value={option.nomOption}>
                  {option.nomOption}
                </option>
              ))}
          </select>
        </div>
      </div>
    </form>
  )
}

export default AddFormProduct
