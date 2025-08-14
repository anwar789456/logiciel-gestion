import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Trash2, Upload, GripVertical } from 'lucide-react'
import { UpdateProductById, FetchAllProductTypeItems } from '../../api/product'
import { FetchAllCategoryItems } from '../../api/Category/category'
import { FetchAllOptionItems } from '../../api/options/Options'
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
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-2 py-1 text-sm"
      />
    </div>
  );
};

const EditFormProduct = ({ product, onClose, onSuccess }) => {
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
    quantite: '0',
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
    dimensions: [],
    selectedOptionName: '',
    selectedSizeName: '',
    selectedMousseName: ''
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

      }
    };
    
    fetchProductTypes();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await FetchAllCategoryItems();
        setCategories(data);
      } catch (error) {

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

      }
    };
    
    fetchOptions();
  }, []);

  // Load product data when product prop changes
  useEffect(() => {
    if (product) {
      
      // Initialize form with product data
      const processedImages = product.images?.length 
        ? product.images.map(img => ({
            ...img,
            id: img.id || `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }))
        : [{ id: `image-${Date.now()}`, img: '', hyperPoints: [] }];
      
      // Create a new formData object with all product data
      const newFormData = {
        idProd: product.idProd || '',
        typeProd: product.typeProd || '',
        nom: product.nom || '',
        description: product.description || '',
        quantite: product.quantite || '0',
        images: processedImages,
        minPrice: product.minPrice || '',
        maxPrice: product.maxPrice || '',
        longueur: product.longueur || '',
        largeur: product.largeur || '',
        hauteur: product.hauteur || '',
        profondeur_assise: product.profondeur_assise || '',
        display: product.display || 'oui',
        categorie: product.subcategorie || product.categorie || '',
        disponibilite: product.disponibilite || 'disponible',
        options: product.options?.length ? product.options : [],
        sizes: product.sizes?.length ? product.sizes : [],
        mousse: product.mousse?.length ? product.mousse : [],
        subcategorie: product.categorie || '',
        direction: product.direction || '',
        delai: product.delai || '',
        dimensions: product.dimensions?.length ? product.dimensions : [],
        selectedOptionName: '',
        selectedSizeName: '',
        selectedMousseName: ''
      };
      
      // Update formData state
      setFormData(newFormData);
    }
  }, [product]);
  
  // Set selected option names when options are loaded
  useEffect(() => {
    if (product && options.length > 0) {
      // Find matching option names for the product's options, sizes, and mousse
      let selectedOptionName = '';
      let selectedSizeName = '';
      let selectedMousseName = '';
      
      // Find option name for options
      if (product.options?.length > 0) {
        const matchingOption = options.find(option => 
          option.typeOption === 'options' && 
          JSON.stringify(option.customOptions) === JSON.stringify(product.options)
        );
        if (matchingOption) {
          selectedOptionName = matchingOption.nomOption;
        }
      }
      
      // Find option name for sizes
      if (product.sizes?.length > 0) {
        const matchingSize = options.find(option => 
          option.typeOption === 'sizes' && 
          JSON.stringify(option.sizesOptions) === JSON.stringify(product.sizes)
        );
        if (matchingSize) {
          selectedSizeName = matchingSize.nomOption;
        }
      }
      
      // Find option name for mousse
      if (product.mousse?.length > 0) {
        const matchingMousse = options.find(option => 
          option.typeOption === 'mousse' && 
          JSON.stringify(option.mousseOptions) === JSON.stringify(product.mousse)
        );
        if (matchingMousse) {
          selectedMousseName = matchingMousse.nomOption;
        }
      }
      
      // Update formData with selected option names
      setFormData(prevData => ({
        ...prevData,
        selectedOptionName,
        selectedSizeName,
        selectedMousseName
      }));
    }
  }, [product, options]);
  
  // Set selected category and subcategories when product or categories change
  useEffect(() => {
    if (product && categories.length > 0) {
      // Find the main category based on product.subcategorie
      let mainCategory = null;
      
      // Look for the main category that matches product.subcategorie
      mainCategory = categories.find(category => 
        category.href.replace("/Shop/", "") === product.subcategorie
      );
      
      console.log('Looking for main category with href:', product.subcategorie);
      console.log('Found main category:', mainCategory ? mainCategory.title : 'Not found');
      
      if (mainCategory) {
        // Set the main category as the selected category
        setSelectedCategory(mainCategory.href.replace("/Shop/", ""));
        
        // Set the subcategories list from the main category's subLinks
        if (mainCategory.subLinks && mainCategory.subLinks.length > 0) {
          console.log('Setting subcategories from main category:', mainCategory.subLinks.length, 'items');
          setSubCategories(mainCategory.subLinks);
          
          // Find the subcategory that matches product.categorie
          const subCategory = mainCategory.subLinks.find(subLink => 
            subLink.href.replace("/Shop/", "") === product.categorie
          );
          
          console.log('Looking for subcategory with href:', product.categorie);
          console.log('Found subcategory:', subCategory ? subCategory.title : 'Not found');
          
          // Update formData with the correct category and subcategory
          setFormData(prev => ({
            ...prev,
            categorie: mainCategory.href.replace("/Shop/", ""), // Main category href
            subcategorie: product.categorie // Use product.categorie directly as it should match subcategory href
          }));
        } else {
          console.log('No subcategories found for this category');
          setSubCategories([]);
          
          // Update formData with main category only
          setFormData(prev => ({
            ...prev,
            categorie: mainCategory.href.replace("/Shop/", ""),
            subcategorie: ''
          }));
        }
      } else {
        // If no matching category found, use the product's subcategorie as fallback
        const fallbackCategory = product.subcategorie || '';
        setSelectedCategory(fallbackCategory);
        setSubCategories([]);
        
        // Update formData with fallback values
        setFormData(prev => ({
          ...prev,
          categorie: fallbackCategory,
          subcategorie: product.categorie || ''
        }));
      }
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for category changes
    if (name === 'categorie') {
      // Find the selected category object by its href
      const selectedCat = categories.find(cat => cat.href.replace("/Shop/", "") === value);
      
      console.log('Category changed to:', value);
      console.log('Selected category object:', selectedCat);
      
      // Update the selected category state
      setSelectedCategory(value);
      
      // Update subcategories list and reset subcategory
      if (selectedCat && selectedCat.subLinks && selectedCat.subLinks.length > 0) {
        console.log('Setting subcategories from selected category:', selectedCat.subLinks.length, 'items');
        console.log('First subcategory:', selectedCat.subLinks[0].title, selectedCat.subLinks[0].href);
        setSubCategories(selectedCat.subLinks);
      } else {
        console.log('No subcategories found for this category');
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
      console.log('Subcategory changed to:', value);
      
      // Find the selected subcategory object
      const selectedSubCat = subCategories.find(sub => sub.href.replace("/Shop/", "") === value);
      console.log('Selected subcategory object:', selectedSubCat ? selectedSubCat.title : 'Not found');
      
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
  
  // Monitor changes to subCategories state
  useEffect(() => {
    console.log('subCategories state updated:', subCategories.length, 'items');
    if (subCategories.length > 0) {
      console.log('First subcategory:', subCategories[0].title, subCategories[0].href.replace("/Shop/", ""));
    }
  }, [subCategories]);
  
  // Monitor changes to formData state
  useEffect(() => {
    if (formData) {
      console.log('formData updated:', {
        categorie: formData.categorie,
        subcategorie: formData.subcategorie
      });
    }
  }, [formData.categorie, formData.subcategorie]);
  
  useEffect(() => {
    if (!categories.length || !selectedCategory || !formData) return;
    
    // Skip during initial load to prevent overriding the values set in the product loading useEffect
    if (product && !formData.categorie_changed) {
      console.log('Skipping category update during initial load');
      return;
    }
    
    console.log('Updating based on selectedCategory change:', selectedCategory);
    
    // Find the selected category object by its href
    const selectedCat = categories.find(cat => cat.href.replace("/Shop/", "") === selectedCategory);
    console.log('Found category object:', selectedCat ? selectedCat.title : 'None');
    
    if (selectedCat && selectedCat.subLinks && selectedCat.subLinks.length > 0) {

      setSubCategories(selectedCat.subLinks);
      
      // If we have a subcategory in formData but it's not in the new subCategories list,
      // we need to reset it to prevent showing an invalid selection
      if (formData.subcategorie) {
        const subcategoryExists = selectedCat.subLinks.some(
          subcat => subcat.href.replace("/Shop/", "") === formData.subcategorie
        );
        
        if (!subcategoryExists) {

          setFormData(prev => ({
            ...prev,
            subcategorie: ''
          }));
        } else {

        }
      }
    } else {

      setSubCategories([]);
      
      // Reset subcategory if there are no subLinks
      if (formData.subcategorie) {

        setFormData(prev => ({
          ...prev,
          subcategorie: ''
        }));
      }
    }
  }, [categories, selectedCategory, formData, product]);

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
      images: [...prev.images, { id: `image-${Date.now()}`, img: '', hyperPoints: [] }]
    }));
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: updatedImages.length ? updatedImages : [{ id: `image-${Date.now()}`, img: '', hyperPoints: [] }]
    }));
  };
  
  // Setup for drag-and-drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.images.findIndex((img) => img.id === active.id);
        const newIndex = prev.images.findIndex((img) => img.id === over.id);
        
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };

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
  
  const handleOptionSelect = (e) => {
    const { name, value } = e.target;
    const selectedOption = options.find((opt) => opt.nomOption === value);
    
    setFormData((prevData) => {
      if (!selectedOption) {
        return {
          ...prevData,
          [name === 'customOptions' ? 'options' : name]: [],
          selectedOptionName: name === 'customOptions' ? '' : prevData.selectedOptionName,
          selectedSizeName: name === 'sizes' ? '' : prevData.selectedSizeName,
          selectedMousseName: name === 'mousse' ? '' : prevData.selectedMousseName
        };
      }
      
      switch (name) {
        case "customOptions":
          return { 
            ...prevData, 
            options: selectedOption.customOptions || [],
            selectedOptionName: value
          };
        case "sizes":
          return { 
            ...prevData, 
            sizes: selectedOption.sizesOptions || [], 
            selectedSizeName: value
          };
        case "mousse":
          return { 
            ...prevData, 
            mousse: selectedOption.mousseOptions || [], 
            selectedMousseName: value
          };
        default:
          return prevData;
      }
    });
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { longueur: '', largeur: '', prix_option: '', prix_coffre: '' }]
    }));
  };

  const handleDimensionChange = (index, field, value) => {
    const updatedDimensions = [...formData.dimensions];
    updatedDimensions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      dimensions: updatedDimensions
    }));
  };

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
      
      // Log the form data before submission
      console.log('Form data before submission:', {
        categorie: cleanedData.categorie,
        subcategorie: cleanedData.subcategorie
      });
      
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
      
      if (cleanedData.dimensions.length === 0 || 
          (cleanedData.dimensions.length === 1 && !cleanedData.dimensions[0].thedimensiontype)) {
        cleanedData.dimensions = [];
      }

      // Filter out empty images
      cleanedData.images = cleanedData.images.filter(img => img.img.trim() !== '');
      if (cleanedData.images.length === 0) {
        cleanedData.images = [{ img: '', hyperPoints: [] }];
      }
      
      // Ensure subcategory is properly set (this will be the product.categorie in the database)
      if (cleanedData.subcategorie === undefined || cleanedData.subcategorie === null) {
        cleanedData.subcategorie = ''; // Ensure it's an empty string rather than undefined or null
      }
      
      // Store the main category title in product.categorie and the subcategory title in product.subcategorie
      // This is the opposite of what the field names suggest, but matches the database schema
      const tempCategory = cleanedData.categorie; // Main category (parent)
      cleanedData.categorie = cleanedData.subcategorie; // Set product.categorie to the subcategory title
      cleanedData.subcategorie = tempCategory; // Set product.subcategorie to the main category title
      
      // Remove the category_changed flag as it's only used for UI logic
      delete cleanedData.categorie_changed;

      await UpdateProductById(product._id, cleanedData);

      onSuccess();
    } catch (error) {

      setError(error.message || t('error_updating_product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full" style={{ maxHeight: 'calc(90vh - 200px)' }}>
      <div className="flex-1 overflow-y-auto pr-0">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">{t('basic_info')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_id')}</label>
            <input
              type="text"
              name="idProd"
              value={formData.idProd}
              onChange={handleChange}
              autoComplete="off"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_name')} *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              autoComplete="off"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_type')}</label>
            <select
              name="typeProd"
              value={formData.typeProd}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            >
              <option value="">{t('all_product_types')}</option>
              {typeProdOptions.map((option, index) => (
                <option 
                  key={`type-${option.value || 'header'}-${index}`} 
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('quantity')}</label>
            <input
              type="number"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              autoComplete="off"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('min_price')}</label>
              <input
                type="text"
                name="minPrice"
                value={formData.minPrice}
              onChange={handleChange}
              autoComplete="off"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
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
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
        
        {/* Category and Availability */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">{t('category_availability')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('main_category')} *</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
              key={`category-select-${categories.length}`}
            >
              <option value="">{t('select_main_category')}</option>
              {categories.map((category, index) => {
                return (
                  <option 
                    key={`category-${category._id || index}-${index}`} 
                    value={category.href.replace("/Shop/", "")}
                  >
                    {category.title}
                  </option>
                );
              })}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subcategory')}</label>
            <select
              name="subcategorie"
              value={formData.subcategorie}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
              key={`subcategory-select-${selectedCategory || 'none'}-${subCategories.length}-${formData.subcategorie || 'none'}`}
            >
              <option value="">{t('select_subcategory')}</option>
              {subCategories.length > 0 ? (
                subCategories.map((subcategory, index) => {
                  const subcategoryValue = subcategory.href.replace("/Shop/", "");
                  return (
                    <option 
                      key={`subcategory-${subcategory._id || index}-${index}`} 
                      value={subcategoryValue}
                      selected={subcategoryValue === formData.subcategorie}
                    >
                      {subcategory.title}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>No subcategories available</option>
              )}
            </select>
            {/* Debug info */}
            {/* <div className="text-xs text-gray-500 mt-1">
              {`Selected subcategory: ${formData.subcategorie || 'None'}`}
              <div className="text-amber-600 font-semibold">
                (Matches product.categorie in database)
              </div>
              <br />
              {`Available subcategories: ${subCategories.length}`}
            </div> */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('availability')}</label>
              <select
                name="disponibilite"
                value={formData.disponibilite}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
              >
                <option value="En stock">{t('en stock')}</option>
                <option value="Hors stock">{t('hors stock')}</option>
                <option value="En arrivage">{t('en arrivage')}</option>
                <option value="Sur commande">{t('sur commande')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('display')}</label>
              <select
                name="display"
                value={formData.display}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
              >
                <option value="oui">{t('yes')}</option>
                <option value="non">{t('no')}</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('direction')}</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
              >
                <option value="">{t('select_direction')}</option>
                <option value="Gauche">{t('left')}</option>
                <option value="Droite">{t('right')}</option>
                <option value="Gauche et Droite">{t('left_and_right')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('delay')}</label>
              <input
                type="text"
                name="delai"
                value={formData.delai}
                onChange={handleChange}
                autoComplete="off"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Dimensions */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">{t('dimensions')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('length')}</label>
            <input
              type="text"
              name="longueur"
              value={formData.longueur}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('width')}</label>
            <input
              type="text"
              name="largeur"
              value={formData.largeur}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('height')}</label>
            <input
              type="text"
              name="hauteur"
              value={formData.hauteur}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('seat_depth')}</label>
            <input
              type="text"
              name="profondeur_assise"
              value={formData.profondeur_assise}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {/* Images */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('images')}</h3>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('options')}</h3>
        </div>
        
        <div className="form-item mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('option_tarification')}</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2" 
            name="customOptions" 
            value={formData.selectedOptionName || ""}
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
        
        {/* {formData.options.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">{t('no_options_added')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('select_from_dropdown')}</p>
          </div>
        ) : (
          <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('options_selected')}: <span className="font-medium">{formData.options.length}</span></p>
          </div>
        )} */}
      </div>
      
      {/* Sizes */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('sizes')}</h3>
        </div>
        
        <div className="form-item mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('size_options')}</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2" 
            name="sizes" 
            value={formData.selectedSizeName || ""}
            onChange={handleOptionSelect}
          >
            <option value="">{t('select_size')}</option>
            {options
              .filter((option) => option.typeOption === "sizes")
              .map((option) => (
                <option key={option._id} value={option.nomOption}>
                  {option.nomOption}
                </option>
              ))}
          </select>
        </div>
        
        {/* {formData.sizes.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">{t('no_sizes_added')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('select_from_dropdown')}</p>
          </div>
        ) : (
          <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('sizes_selected')}: <span className="font-medium">{formData.sizes.length}</span></p>
          </div>
        )} */}
      </div>
      
      {/* Mousse */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('foam')}</h3>
        </div>
        
        <div className="form-item mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('foam_options')}</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2" 
            name="mousse" 
            value={formData.selectedMousseName || ""}
            onChange={handleOptionSelect}
          >
            <option value="">{t('select_foam')}</option>
            {options
              .filter((option) => option.typeOption === "mousse")
              .map((option) => (
                <option key={option._id} value={option.nomOption}>
                  {option.nomOption}
                </option>
              ))}
          </select>
        </div>
        
        {/* {formData.mousse.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">{t('no_mousse_added')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('select_from_dropdown')}</p>
          </div>
        ) : (
          <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('foam_selected')}: <span className="font-medium">{formData.mousse.length}</span></p>
          </div>
        )} */}
      </div>
      
      {/* Additional Dimensions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('additional_dimensions')}</h3>
        </div>
        
        {formData.dimensions.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">{t('no_dimensions_added')}</p>
          </div>
        ) : (
          formData.dimensions.map((dimension, index) => (
            <div key={`dimension-${index}-${dimension.thedimensiontype}`} className="space-y-4 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dimension_type')}</label>
                  <input
                    type="text"
                    value={dimension.thedimensiontype}
                    onChange={(e) => handleDimensionChange(index, 'thedimensiontype', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('display')}</label>
                  <select
                    value={dimension.display}
                    onChange={(e) => handleDimensionChange(index, 'display', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  >
                    <option value="oui">{t('yes')}</option>
                    <option value="non">{t('no')}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('length')}</label>
                  <input
                    type="text"
                    value={dimension.longueur}
                    onChange={(e) => handleDimensionChange(index, 'longueur', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('width')}</label>
                  <input
                    type="text"
                    value={dimension.largeur}
                    onChange={(e) => handleDimensionChange(index, 'largeur', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('height')}</label>
                  <input
                    type="text"
                    value={dimension.hauteur}
                    onChange={(e) => handleDimensionChange(index, 'hauteur', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('long')}</label>
                  <input
                    type="text"
                    value={dimension.long}
                    onChange={(e) => handleDimensionChange(index, 'long', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('larg')}</label>
                  <input
                    type="text"
                    value={dimension.larg}
                    onChange={(e) => handleDimensionChange(index, 'larg', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('image_url')}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={dimension.image_url}
                    onChange={(e) => handleDimensionChange(index, 'image_url', e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      </div>
      {/* Form Actions - Fixed Footer */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </form>
  )
}

export default EditFormProduct
