import React, { useState, useEffect, useRef, useCallback } from 'react';
import Select from 'react-select';
import { Pencil, Trash2, GripVertical, CopyPlus, AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddCarouselItem, UpdateCarouselItem, DeleteCarouselItem, FetchAllCarouselItems, DeleteAllCarouselItems } from '../../api/Homepage/Carousel';
import { FetchAllProductItems } from '../../api/product';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// SortableCarouselItem Component for drag-and-drop functionality
const SortableCarouselItem = ({ item, index, onEdit, onDelete, t }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id })
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    touchAction: 'none', // Prevents touch scrolling while dragging on mobile
  }
  
  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 border-b border-gray-200 dark:border-gray-700"
    >
      <td className="px-4 whitespace-nowrap">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab w-fit p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={t('drag_to_reorder')}
        >
          <GripVertical size={18} />
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.idC.replace('/ProductPage/', '')}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.title}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <img src={item.image} alt={item.title} className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-gray-700" />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <img src={item.image_mob} alt={item.title} className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-gray-700" />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button 
          className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          onClick={() => onEdit(item)}
          title={t('edit')}
        >
          <Pencil size={16} />
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button 
          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          onClick={() => onDelete(item._id)}
          title={t('delete')}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  )
}

const Carousel = () => {
  const { t } = useTranslation();
  const [carouselItems, setCarouselItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ idC: '', title: '', image: '', image_mob: '' });
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removeItemId, setRemoveItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reference to track if an update is in progress
  const isUpdatingRef = useRef(false);
  // Reference to track the latest drag event
  const latestDragEventRef = useRef(null);
  // Timeout reference for debouncing
  const updateTimeoutRef = useRef(null);
  
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

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        const response = await FetchAllCarouselItems();
        setCarouselItems(response || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching carousel data:', error);
        setError(t('error_fetching_carousel'));
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const data = await FetchAllProductItems();
        const uniqueProducts = Array.from(new Map(data.map(item => [item.idProd, item])).values());
        setProducts(uniqueProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchCarouselData();
    fetchProducts();
  }, [t]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrUpdateItem = async () => {
    try {
      if (editMode) {
        const updatedData = {
          image: formData.image,
          image_mob: formData.image_mob,
          title: formData.title,
          idC: `/ProductPage/${formData.idC}`,
        };
        await UpdateCarouselItem(editItemId, updatedData);
      } else {
        const newItem = {
          image: formData.image,
          image_mob: formData.image_mob,
          title: formData.title,
          idC: `/ProductPage/${formData.idC}`,
        };
        await AddCarouselItem(newItem);
      }
      setShowAddEditForm(false);
      setEditMode(false);
      setFormData({ idC: '', title: '', image: '', image_mob: '' });
      const response = await FetchAllCarouselItems();
      setCarouselItems(response || []);
    } catch (error) {
      console.error('Error adding/updating carousel item:', error);
      setError(editMode ? t('error_updating_carousel') : t('error_adding_carousel'));
    }
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      setFormData({
        idC: item.idC.replace('/ProductPage/', ''),
        title: item.title,
        image: item.image,
        image_mob: item.image_mob
      });
      setEditMode(true);
      setEditItemId(item._id);
    } else {
      setFormData({ idC: '', title: '', image: '', image_mob: '' });
      setEditMode(false);
    }
    setShowAddEditForm(true);
  };

  const handleOpenDeleteModal = (id) => {
    setRemoveItemId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRemoveItemId(null);
  };

  const handleConfirmRemove = async () => {
    try {
      await DeleteCarouselItem(removeItemId);
      setCarouselItems((prev) => prev.filter((item) => item._id !== removeItemId));
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      setError(t('error_deleting_carousel'));
    } finally {
      handleCloseModal();
    }
  };

  // Save carousel items to local storage for fallback
  const saveCarouselItemsLocally = useCallback((items) => {
    try {
      localStorage.setItem('samet_carousel_backup', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving carousel items to local storage:', error);
    }
  }, []);

  // Debounced function to update carousel items order
  const debouncedCarouselUpdate = useCallback(async (items) => {
    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set a new timeout
    updateTimeoutRef.current = setTimeout(async () => {
      // If already updating, don't start another update
      if (isUpdatingRef.current) return;

      isUpdatingRef.current = true;
      setLoading(true);

      try {
        await DeleteAllCarouselItems();
        for (const item of items) {
          await AddCarouselItem(item);
        }
        setError(null);
      } catch (error) {
        console.error("Error reordering carousel items:", error);
        setError(t('error_saving_order'));
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      } finally {
        isUpdatingRef.current = false;
        setLoading(false);
      }
    }, 500); // 500ms debounce delay
  }, [t]);

  // Handle drag end event for reordering carousel items
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) return;
    
    // Store the latest drag event
    latestDragEventRef.current = event;
    
    // Update local state first for immediate UI feedback
    setCarouselItems((prev) => {
      const oldIndex = prev.findIndex(item => item._id === active.id);
      const newIndex = prev.findIndex(item => item._id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const reorderedItems = arrayMove(prev, oldIndex, newIndex);
      
      // Save to local storage immediately for fallback
      saveCarouselItemsLocally(reorderedItems);
      
      // Debounce the API call to update the server
      debouncedCarouselUpdate(reorderedItems);
      
      return reorderedItems;
    });
  };

  return (
    <div className="pt-4">
      <div className='pb-4 pl-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('carousel')}</h1>
        </div>
        <div className='flex pr-2'>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 shadow-sm"
            onClick={() => handleOpenForm()}
          >
            <CopyPlus className='mr-2 mt-0.5' size={20} />
            {t('add_carousel_item')}
          </button>
        </div>
      </div>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}...</p>
        </div>
      ) : (
        <>


          {carouselItems.length === 0 ? (
            <div className="mt-8 p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">{t('no_carousel_items')}</p>
              <button 
                onClick={() => handleOpenForm()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('add_carousel_item')}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 px-8 mb-2 flex items-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  <p className="text-sm">{t('drag_to_reorder_carousel')}</p>
                </div>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                <div className="mt-2 mx-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('drag')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('product')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('title')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('web_image')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('mobile_image')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('edit_button')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('delete')}</th>
                      </tr>
                    </thead>
                    <SortableContext 
                      items={carouselItems.map(item => item._id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {carouselItems.map((item, index) => (
                          <SortableCarouselItem 
                            key={item._id} 
                            item={item} 
                            index={index} 
                            onEdit={handleOpenForm}
                            onDelete={handleOpenDeleteModal}
                            t={t}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </DndContext>
            </>
          )}
        </>
      )}

      <ConfirmationModal 
        show={isModalOpen} 
        onHide={handleCloseModal} 
        onConfirm={handleConfirmRemove} 
        title={t('confirm_action')}
        message={t('confirm_delete_carousel')} 
        confirmButtonText={t('delete')}
        cancelButtonText={t('cancel')}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        cancelButtonClass="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
      />

      {/* Add/Edit Carousel Item Modal */}
      {showAddEditForm && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowAddEditForm(false);
            }
          }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editMode ? t('edit_carousel_item') : t('add_carousel_item')}</h2>
              <button 
                onClick={() => setShowAddEditForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <Select
                    styles={{ 
                      control: (provided) => ({...provided, borderColor: '#d1d5db', borderRadius: '0.375rem'}),
                      singleValue: (provided) => ({...provided, color: 'black'}), 
                      option: (provided) => ({...provided, color: 'black'}) 
                    }}
                    options={products.map((product) => ({
                      label: `${product.idProd} - ${product.nom}`,
                      value: product.idProd,
                    }))}
                    value={
                      products.find((product) => product.idProd === formData.idC)
                        ? {
                            label: `${products.find((product) => product.idProd === formData.idC).idProd} - ${products.find((product) => product.idProd === formData.idC).nom}`,
                            value: formData.idC,
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      setFormData({ ...formData, idC: selectedOption.value });
                    }}
                    placeholder={t('select_product')}
                    className="mb-4"
                  />
                </div>

                <div>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder={t('title')} 
                    value={formData.title} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('web_image')}:</label>
                  <input 
                    type="text" 
                    name="image" 
                    placeholder={t('web_image')} 
                    value={formData.image} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.image && (
                    <img src={formData.image} alt={formData.title} className="mt-2 h-24 object-contain rounded border border-gray-200 dark:border-gray-700" />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('mobile_image')}:</label>
                  <input 
                    type="text" 
                    name="image_mob" 
                    placeholder={t('mobile_image')} 
                    value={formData.image_mob} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.image_mob && (
                    <img src={formData.image_mob} alt={formData.title} className="mt-2 h-24 object-contain rounded border border-gray-200 dark:border-gray-700" />
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 shadow-sm"
                  onClick={handleAddOrUpdateItem}
                >
                  {editMode ? t('update') : t('add_carousel_item')}
                </button>
                <button 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200 shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  onClick={() => setShowAddEditForm(false)}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
