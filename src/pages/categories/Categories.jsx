import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyPlus, GripVertical, Trash2, Edit, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { 
  FetchAllCategoryItems, 
  AddCategoryItem, 
  UpdateCategoryItem, 
  DeleteCategoryItem,
  ReorderCategories 
} from '../../api/Category/category'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

// SortableSubcategory Component for drag-and-drop functionality of subcategories
const SortableSubcategory = ({ subLink, categoryId, onEdit, onDelete, t }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${categoryId}-${subLink.title}` })
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    touchAction: 'none', // Prevents touch scrolling while dragging on mobile
  }
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 ml-8 mb-2"
    >
      <div className="flex items-center">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1.5 mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          title={t('drag_to_reorder')}
        >
          <GripVertical size={16} />
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200">{subLink.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subLink.href}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(subLink)}
          className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          title={t('edit')}
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => onDelete(subLink.title)}
          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          title={t('delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// SortableCategory Component for drag-and-drop functionality
const SortableCategory = ({ category, onEdit, onDelete, t }) => {
  const [expanded, setExpanded] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id })
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    touchAction: 'none', // Prevents touch scrolling while dragging on mobile
  }
  
  const toggleExpanded = (e) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }
  
  return (
    <div className="mb-3">
      <div 
        ref={setNodeRef} 
        style={style} 
        className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab p-2 mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={t('drag_to_reorder')}
          >
            <GripVertical size={18} />
          </div>
          <button 
            onClick={toggleExpanded}
            className="p-1.5 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{category.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.subLinks?.length || 0} {t('subcategories')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
            title={t('edit')}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(category._id)}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
            title={t('delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Subcategories dropdown with drag-and-drop */}
      {expanded && category.subLinks && category.subLinks.length > 0 && (
        <div className="mt-2 space-y-2">
          <SortableContext 
            items={category.subLinks.map(sl => `${category._id}-${sl.title}`)} 
            strategy={verticalListSortingStrategy}
          >
            {category.subLinks.map((subLink, index) => (
              <SortableSubcategory 
                key={`${category._id}-${subLink.title}`}
                subLink={subLink}
                categoryId={category._id}
                onEdit={() => onEdit(category, subLink)}
                onDelete={(subLinkTitle) => onDelete(category._id, subLinkTitle)}
                t={t}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

// AddCategoryForm Component
const AddCategoryForm = ({ onClose, onSave, t }) => {
  const [formData, setFormData] = useState({
    title: '',
    href: '',
    subLinks: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate href from title if not provided
      if (!formData.href && formData.title) {
        formData.href = `/Shop/${formData.title.toLowerCase().replace(/\s+/g, '-')}`
      }

      await onSave(formData)
      onClose()
    } catch (err) {
      console.error('Error saving category:', err)
      setError(t('error_adding_category'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('add_category')}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Trash2 size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 m-4 rounded-lg flex items-start">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('category_name')} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('category_href')}
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-1">/Shop/</span>
              <input
                type="text"
                name="href"
                value={formData.href.replace('/Shop/', '')}
                onChange={(e) => handleChange({
                  target: {
                    name: 'href',
                    value: `/Shop/${e.target.value}`
                  }
                })}
                placeholder={formData.title ? formData.title.toLowerCase().replace(/\s+/g, '-') : ''}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('href_auto_generated')}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('saving')}
                </>
              ) : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// EditCategoryForm Component
const EditCategoryForm = ({ category, onClose, onSave, t }) => {
  const isEditingSubLink = category.selectedSubLink !== null && category.selectedSubLink !== undefined
  const [formData, setFormData] = useState({
    title: category.title || '',
    href: category.href || '',
    subLinks: category.subLinks || []
  })
  const [subLinkData, setSubLinkData] = useState({
    title: isEditingSubLink ? category.selectedSubLink.title : '',
    href: isEditingSubLink ? category.selectedSubLink.href : ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(isEditingSubLink ? 'sublink' : 'category')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (editMode === 'sublink') {
      setSubLinkData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editMode === 'sublink') {
        // If editing a sublink, update the sublink in the category's subLinks array
        const updatedSubLinks = [...formData.subLinks]
        
        if (isEditingSubLink) {
          // Update existing sublink
          const index = updatedSubLinks.findIndex(sl => sl.title === category.selectedSubLink.title)
          if (index !== -1) {
            updatedSubLinks[index] = subLinkData
          }
        } else {
          // Add new sublink
          updatedSubLinks.push(subLinkData)
        }
        
        await onSave(category._id, { ...formData, subLinks: updatedSubLinks })
      } else {
        // If editing the main category
        await onSave(category._id, formData)
      }
      onClose()
    } catch (err) {
      console.error('Error updating:', err)
      setError(editMode === 'sublink' ? t('error_updating_subcategory') : t('error_updating_category'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editMode === 'sublink' 
              ? (isEditingSubLink ? t('edit_subcategory') : t('add_subcategory')) 
              : t('edit_category')}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Trash2 size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 m-4 rounded-lg flex items-start">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode selector tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setEditMode('category')}
            className={`flex-1 py-3 px-4 text-center ${editMode === 'category' 
              ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            {t('category')}
          </button>
          <button
            type="button"
            onClick={() => setEditMode('sublink')}
            className={`flex-1 py-3 px-4 text-center ${editMode === 'sublink' 
              ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            {isEditingSubLink ? t('edit_subcategory') : t('add_subcategory')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {editMode === 'category' ? (
            /* Category edit form */
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('category_name')} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('category_href')}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-1">/Shop/</span>
                  <input
                    type="text"
                    name="href"
                    value={formData.href.replace('/Shop/', '')}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'href',
                        value: `/Shop/${e.target.value}`
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Subcategory edit form */
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('subcategory_name')} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={subLinkData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('subcategory_href')} *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-1">{formData.href}/</span>
                  <input
                    type="text"
                    name="href"
                    value={subLinkData.href.replace(`${formData.href}/`, '')}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'href',
                        value: `${formData.href}/${e.target.value}`
                      }
                    })}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('saving')}
                </>
              ) : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Categories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, categoryId: null, subLinkTitle: null })
  const [activeCategory, setActiveCategory] = useState(null) // Track which category has active subcategory drag

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
  )

  // Reference to track if an update is in progress
  const isUpdatingRef = useRef(false);
  // Reference to track the latest drag event
  const latestDragEventRef = useRef(null);
  // Timeout reference for debouncing
  const updateTimeoutRef = useRef(null);

  // Save categories to local storage for fallback
  const saveCategoriesLocally = useCallback((categories) => {
    try {
      localStorage.setItem('samet_categories_backup', JSON.stringify(categories));
      console.log('Categories saved to local storage as fallback');
    } catch (err) {
      console.error('Error saving categories to local storage:', err);
    }
  }, []);

  // Load categories from local storage if available
  const loadCategoriesFromLocalStorage = useCallback(() => {
    try {
      const savedCategories = localStorage.getItem('samet_categories_backup');
      if (savedCategories) {
        return JSON.parse(savedCategories);
      }
    } catch (err) {
      console.error('Error loading categories from local storage:', err);
    }
    return null;
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await FetchAllCategoryItems()
      setCategories(data)
      // Save to local storage for fallback
      saveCategoriesLocally(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching categories:', err)
      
      // Try to load from local storage if server request fails
      const localCategories = loadCategoriesFromLocalStorage()
      if (localCategories) {
        console.log('Using locally stored categories as fallback')
        setCategories(localCategories)
        setError(t('using_local_categories'))
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setError(null)
        }, 5000)
      } else {
        setError(t('error_fetching_categories'))
      }
    } finally {
      setLoading(false)
    }
  }, [t, saveCategoriesLocally, loadCategoriesFromLocalStorage])

  useEffect(() => {
    fetchCategories()
    
    // Cleanup function to cancel any pending updates when component unmounts
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [fetchCategories])

  // Debounced function to handle category updates
  const debouncedCategoryUpdate = useCallback((categoryIds) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      if (isUpdatingRef.current) return;
      
      try {
        isUpdatingRef.current = true;
        setLoading(true);
        
        console.log('Sending reordered categories to server:', categoryIds);
        const response = await ReorderCategories(categoryIds);
        console.log('Reorder categories success:', response);
      } catch (err) {
        console.error('Error reordering categories:', err);
        
        // Check if this is our specific server error message
        if (err.message === 'server_error_processing_categories') {
          setError(t('server_error_processing_categories'));
        } else {
          // Show general error notification to user
          setError(t('error_reordering_categories'));
        }
        
        // Don't refresh from server - keep the user's reordering in the UI
        // This prevents the visual reversion of the drag operation
        setTimeout(() => {
          setError(null);
        }, 5000); // Clear error after 5 seconds
      } finally {
        isUpdatingRef.current = false;
        setLoading(false);
      }
    }, 500); // 500ms debounce delay
  }, [t, setError, setLoading]);

  // Debounced function to handle subcategory updates
  const debouncedSubcategoryUpdate = useCallback((categoryId, updatedCategory) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      if (isUpdatingRef.current) return;
      
      try {
        isUpdatingRef.current = true;
        setLoading(true);
        
        const response = await UpdateCategoryItem(categoryId, updatedCategory);
        console.log('Reorder subcategories success:', response);
      } catch (err) {
        console.error('Error reordering subcategories:', err);
        
        // Check if this is our specific server error message
        if (err.message === 'server_error_processing_categories') {
          setError(t('server_error_processing_categories'));
        } else {
          // Show general error notification to user
          setError(t('error_reordering_subcategories'));
        }
        
        // Don't refresh from server - keep the user's reordering in the UI
        // This prevents the visual reversion of the drag operation
        setTimeout(() => {
          setError(null);
        }, 5000); // Clear error after 5 seconds
      } finally {
        isUpdatingRef.current = false;
        setLoading(false);
      }
    }, 500); // 500ms debounce delay
  }, [t, setError, setLoading]);

  // Handle drag end event for reordering categories and subcategories
  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!active || !over || active.id === over.id) return;
    
    // Store the latest drag event
    latestDragEventRef.current = event;
    
    // Check if this is a subcategory drag (IDs will be in format "categoryId-subLinkTitle")
    if (typeof active.id === 'string' && active.id.includes('-')) {
      // This is a subcategory drag
      const activeCategoryId = active.id.split('-')[0];
      const overCategoryId = over.id.split('-')[0];
      
      // Only allow reordering within the same category
      if (activeCategoryId === overCategoryId) {
        const activeSubLinkTitle = active.id.split('-')[1];
        const overSubLinkTitle = over.id.split('-')[1];
        
        // Update local state first for immediate UI feedback
        setCategories(prev => {
          const categoryIndex = prev.findIndex(cat => cat._id === activeCategoryId);
          if (categoryIndex === -1) return prev;
          
          const category = prev[categoryIndex];
          const subLinks = [...category.subLinks];
          
          const oldIndex = subLinks.findIndex(sl => sl.title === activeSubLinkTitle);
          const newIndex = subLinks.findIndex(sl => sl.title === overSubLinkTitle);
          
          if (oldIndex === -1 || newIndex === -1) return prev;
          
          const reorderedSubLinks = arrayMove(subLinks, oldIndex, newIndex);
          
          // Create a new category object with reordered subLinks
          const updatedCategory = {
            ...category,
            subLinks: reorderedSubLinks
          };
          
          // Create a new categories array with the updated category
          const updatedCategories = [...prev];
          updatedCategories[categoryIndex] = updatedCategory;
          
          // Save to local storage immediately for fallback
          saveCategoriesLocally(updatedCategories);
          
          // Debounce the API call to update the server
          debouncedSubcategoryUpdate(activeCategoryId, updatedCategory);
          
          return updatedCategories;
        });
      }
    } else {
      // This is a main category drag
      // Update local state first for immediate UI feedback
      setCategories((prev) => {
        const oldIndex = prev.findIndex(cat => cat._id === active.id);
        const newIndex = prev.findIndex(cat => cat._id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return prev;
        
        const reorderedCategories = arrayMove(prev, oldIndex, newIndex);
        
        // Save to local storage immediately for fallback
        saveCategoriesLocally(reorderedCategories);
        
        // Debounce the API call to update the server
        const categoryIds = reorderedCategories.map(cat => cat._id);
        debouncedCategoryUpdate(categoryIds);
        
        return reorderedCategories;
      });
    }
  }

  const handleAddCategory = async (categoryData) => {
    try {
      await AddCategoryItem(categoryData)
      fetchCategories() // Refresh the list
    } catch (err) {
      console.error('Error adding category:', err)
      throw err
    }
  }

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      await UpdateCategoryItem(id, categoryData)
      fetchCategories() // Refresh the list
    } catch (err) {
      console.error('Error updating category:', err)
      throw err
    }
  }

  const handleDeleteCategory = async (id, subLinkTitle = null) => {
    try {
      if (subLinkTitle) {
        // Find the category
        const category = categories.find(cat => cat._id === id)
        if (category) {
          // Filter out the subLink to delete
          const updatedSubLinks = category.subLinks.filter(sl => sl.title !== subLinkTitle)
          // Update the category with the new subLinks array
          await UpdateCategoryItem(id, { ...category, subLinks: updatedSubLinks })
        }
      } else {
        // Delete the entire category
        await DeleteCategoryItem(id)
      }
      setDeleteConfirmation({ show: false, categoryId: null, subLinkTitle: null })
      fetchCategories() // Refresh the list
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const handleEditCategory = (category, subLink = null) => {
    setSelectedCategory({
      ...category,
      selectedSubLink: subLink // Store the selected subLink if editing a subcategory
    })
    setShowEditForm(true)
  }

  if (loading && categories.length === 0) {
    return (
      <div className="pt-4 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('categories')}
          </h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-4 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('categories')}
          </h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-start">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchCategories}
              className="mt-2 text-sm bg-red-100 dark:bg-red-800/30 px-3 py-1 rounded-md hover:bg-red-200 dark:hover:bg-red-700/30 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 px-8">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-800 dark:text-white font-medium">{t('updating_categories')}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="pb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('categories')}
          </h1>
        </div>
        <div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center bg-blue-600 
            hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl 
            active:scale-85
            cursor-pointer shadow-lg hover:shadow-lg active:shadow-inner 
            transition-all duration-400 ease-in-out"
          >
            <CopyPlus className="mr-2 mt-0.5" size={20} />
            {t('add_category')}
          </button>
        </div>
      </div>

      {/* Categories List with Drag and Drop */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">{t('no_categories')}</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('add_first_category')}
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={categories.map(cat => cat._id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {categories.map((category) => (
                  <SortableCategory 
                    key={category._id} 
                    category={category} 
                    onEdit={handleEditCategory}
                    onDelete={(id, subLinkTitle = null) => setDeleteConfirmation({ 
                      show: true, 
                      categoryId: id, 
                      subLinkTitle: subLinkTitle 
                    })}
                    t={t}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Category Form Modal */}
      {showAddForm && (
        <AddCategoryForm 
          onClose={() => setShowAddForm(false)}
          onSave={handleAddCategory}
          t={t}
        />
      )}

      {/* Edit Category Form Modal */}
      {showEditForm && selectedCategory && (
        <EditCategoryForm 
          category={selectedCategory}
          onClose={() => {
            setShowEditForm(false)
            setSelectedCategory(null)
          }}
          onSave={handleUpdateCategory}
          t={t}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {t('confirm_delete')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {deleteConfirmation.subLinkTitle 
                ? t('delete_subcategory_confirmation') 
                : t('delete_category_confirmation')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, categoryId: null, subLinkTitle: null })}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmation.categoryId, deleteConfirmation.subLinkTitle)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
