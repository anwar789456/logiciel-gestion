import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyPlus, GripVertical, Trash2, Edit, AlertCircle, ChevronDown, ChevronRight, X, Eye, ExternalLink, CheckCircle, Info } from 'lucide-react'
import { 
  FetchAllCategoryItems, 
  AddCategoryItem, 
  UpdateCategoryItem, 
  DeleteCategoryItem,
  ReorderCategories 
} from '../../api/Category/category'
import ProductCategoryScanner from '../../components/category/ProductCategoryScanner'
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
const SortableSubcategory = ({ subLink, categoryId, onEdit, onDelete, t, onToggleDisplay }) => {
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
  
  const handleToggleDisplay = (e) => {
    e.stopPropagation()
    onToggleDisplay(categoryId, subLink.title)
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
        <div className="flex items-center">
          {subLink.src && (
            <img 
              src={subLink.src} 
              alt={subLink.title} 
              className="h-8 w-8 object-cover rounded-md mr-3" 
              onError={(e) => e.target.src = 'https://via.placeholder.com/32?text=Error'}
            />
          )}
          <div>
            <div className="flex items-center">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{subLink.title}</h4>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${subLink.display === 'oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {subLink.display === 'oui' ? t('visible') : t('hidden')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subLink.href}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleDisplay}
          className="flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          title={subLink.display === 'oui' ? t('hide') : t('show')}
        >
          <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${subLink.display === 'oui' ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transform transition-transform duration-300 ${subLink.display === 'oui' ? 'translate-x-4' : ''}`}></div>
          </div>
        </button>
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
const SortableCategory = ({ category, onEdit, onDelete, t, onToggleDisplay, onPreview }) => {
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
  
  const handleToggleDisplay = (e) => {
    e.stopPropagation()
    onToggleDisplay(category._id)
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
          <div className="flex items-center">
            {category.src && (
              <img 
                src={category.src} 
                alt={category.title} 
                className="h-10 w-10 object-cover rounded-md mr-3" 
                onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=Error'}
              />
            )}
            <div>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900 dark:text-white">{category.title}</h3>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${category.display === 'oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {category.display === 'oui' ? t('visible') : t('hidden')}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.subLinks?.length || 0} {t('subcategories')}
              </p>
            </div>
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
            onClick={handleToggleDisplay}
            className="flex items-center justify-center p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
            title={category.display === 'oui' ? t('hide') : t('show')}
          >
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${category.display === 'oui' ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${category.display === 'oui' ? 'translate-x-5' : ''}`}></div>
            </div>
          </button>
          <button
            onClick={() => onPreview(category)}
            className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 hover:text-teal-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
            title={t('preview')}
          >
            <Eye size={16} />
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
          {/* Remove nested SortableContext - items are already in parent context */}
          {category.subLinks.map((subLink) => (
            <SortableSubcategory 
              key={`${category._id}-${subLink.title}`}
              subLink={subLink}
              categoryId={category._id}
              onEdit={() => onEdit(category, subLink)}
              onDelete={(subLinkTitle) => onDelete(category._id, subLinkTitle)}
              onToggleDisplay={onToggleDisplay}
              t={t}
            />
          ))}
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
    src: '',
    display: 'oui',
    subLinks: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoGenerateHref, setAutoGenerateHref] = useState(true)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Update the form data
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      }
      
      // If title is changing and autoGenerateHref is enabled, update href
      if (name === 'title' && autoGenerateHref) {
        const slugifiedTitle = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
        updatedData.href = `/Shop/${slugifiedTitle}`
      }
      
      return updatedData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Ensure href is properly formatted
      if (!formData.href && formData.title) {
        const slugifiedTitle = formData.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
        formData.href = `/Shop/${slugifiedTitle}`
      } else if (!formData.href.startsWith('/Shop/')) {
        // Ensure href starts with /Shop/
        const hrefValue = formData.href.startsWith('/') ? formData.href.substring(1) : formData.href
        formData.href = `/Shop/${hrefValue.replace(/^Shop\//i, '')}`
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
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
        <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('add_category')}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 m-6 rounded-xl flex items-start backdrop-blur-sm border border-red-200/50 dark:border-red-800/50">
            <AlertCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('category_href')}
              </label>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{t('auto_generate')}</span>
                <button
                  type="button"
                  onClick={() => setAutoGenerateHref(!autoGenerateHref)}
                  className="flex items-center justify-center focus:outline-none"
                  title={autoGenerateHref ? t('disable_auto_generate') : t('enable_auto_generate')}
                >
                  <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoGenerateHref ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${autoGenerateHref ? 'translate-x-5' : ''}`}></div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-1">/Shop/</span>
              <input
                type="text"
                name="href"
                value={formData.href.replace('/Shop/', '')}
                onChange={(e) => {
                  // If manually editing href, disable auto-generation
                  if (autoGenerateHref) setAutoGenerateHref(false);
                  handleChange({
                    target: {
                      name: 'href',
                      value: `/Shop/${e.target.value}`
                    }
                  });
                }}
                placeholder={formData.title ? formData.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') : ''}
                className="flex-1 px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {autoGenerateHref ? t('href_auto_generated') : t('href_manual')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('image_url')}
            </label>
            <input
              type="url"
              name="src"
              value={formData.src}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
            {formData.src && (
              <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                <img 
                  src={formData.src} 
                  alt={formData.title} 
                  className="h-24 object-contain mx-auto rounded" 
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Error'}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('display')}
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="display"
                  value="oui"
                  checked={formData.display === 'oui'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="display"
                  value="non"
                  checked={formData.display === 'non'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Non</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl mr-3 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600/90 text-white rounded-xl hover:bg-blue-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center hover:scale-105 backdrop-blur-sm shadow-lg"
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
    src: category.src || '',
    display: category.display || 'oui',
    subLinks: category.subLinks || []
  })
  const [subLinkData, setSubLinkData] = useState({
    title: isEditingSubLink ? category.selectedSubLink.title : '',
    href: isEditingSubLink ? category.selectedSubLink.href : '',
    src: isEditingSubLink ? category.selectedSubLink.src : '',
    display: isEditingSubLink ? category.selectedSubLink.display : 'oui'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(isEditingSubLink ? 'sublink' : 'category')
  const [autoGenerateHref, setAutoGenerateHref] = useState(true)
  const [autoGenerateSubLinkHref, setAutoGenerateSubLinkHref] = useState(true)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (editMode === 'sublink') {
      setSubLinkData(prev => {
        const updatedData = {
          ...prev,
          [name]: value
        }
        
        // If title is changing and autoGenerateSubLinkHref is enabled, update href
        if (name === 'title' && autoGenerateSubLinkHref) {
          const slugifiedTitle = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          updatedData.href = `${formData.href}-${slugifiedTitle}`
        }
        
        return updatedData
      })
    } else {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          [name]: value
        }
        
        // If title is changing and autoGenerateHref is enabled, update href
        if (name === 'title' && autoGenerateHref) {
          const slugifiedTitle = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          updatedData.href = `/Shop/${slugifiedTitle}`
          
          // Also update all sublinks hrefs if they exist
          if (prev.subLinks && prev.subLinks.length > 0) {
            updatedData.subLinks = prev.subLinks.map(subLink => {
              // Extract the subcategory-specific part (after the last hyphen or slash)
              const subLinkSpecificPart = subLink.href.replace(/^.*[\/\-]([^/\-]+)$/, '$1');
              // Create new href with hyphen separator
              return {
                ...subLink,
                href: `${updatedData.href}-${subLinkSpecificPart}`
              };
            });
          }
        }
        
        return updatedData
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editMode === 'sublink') {
        // Ensure sublink href is properly formatted
        let processedSubLinkData = {...subLinkData}
        
        if (!processedSubLinkData.href && processedSubLinkData.title) {
          const slugifiedTitle = processedSubLinkData.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          processedSubLinkData.href = `${formData.href}-${slugifiedTitle}`
        } else if (!processedSubLinkData.href.startsWith(formData.href)) {
          // Ensure href starts with parent category href
          processedSubLinkData.href = `${formData.href}-${processedSubLinkData.href.replace(/^.*[\/\-]([^/\-]+)$/, '$1')}`
        }
        
        // If editing a sublink, update the sublink in the category's subLinks array
        const updatedSubLinks = [...formData.subLinks]
        
        if (isEditingSubLink) {
          // Update existing sublink
          const index = updatedSubLinks.findIndex(sl => sl.title === category.selectedSubLink.title)
          if (index !== -1) {
            updatedSubLinks[index] = processedSubLinkData
          }
        } else {
          // Add new sublink
          updatedSubLinks.push(processedSubLinkData)
        }
        
        await onSave(category._id, { ...formData, subLinks: updatedSubLinks })
      } else {
        // Ensure category href is properly formatted
        let processedFormData = {...formData}
        
        if (!processedFormData.href && processedFormData.title) {
          const slugifiedTitle = processedFormData.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          processedFormData.href = `/Shop/${slugifiedTitle}`
        } else if (!processedFormData.href.startsWith('/Shop/')) {
          // Ensure href starts with /Shop/
          const hrefValue = processedFormData.href.startsWith('/') ? processedFormData.href.substring(1) : processedFormData.href
          processedFormData.href = `/Shop/${hrefValue.replace(/^Shop\//i, '')}`
        }
        
        // If editing the main category
        await onSave(category._id, processedFormData)
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
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
        <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editMode === 'sublink' 
              ? (isEditingSubLink ? t('edit_subcategory') : t('add_subcategory')) 
              : t('edit_category')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 m-6 rounded-xl flex items-start backdrop-blur-sm border border-red-200/50 dark:border-red-800/50">
            <AlertCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode selector tabs */}
        <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 mx-6">
          <button
            type="button"
            onClick={() => setEditMode('category')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 rounded-t-xl ${editMode === 'category' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 backdrop-blur-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'}`}
          >
            {t('category')}
          </button>
          <button
            type="button"
            onClick={() => setEditMode('sublink')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 rounded-t-xl ${editMode === 'sublink' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 backdrop-blur-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'}`}
          >
            {isEditingSubLink ? t('edit_subcategory') : t('add_subcategory')}
          </button>
        </div>
        
        {/* Parent category context when in sublink mode */}
        {editMode === 'sublink' && (
          <div className="mx-6 mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {formData.src ? (
                  <img 
                    src={formData.src} 
                    alt={formData.title} 
                    className="h-10 w-10 object-cover rounded-md" 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=Category'}
                  />
                ) : (
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 text-lg font-bold">
                      {formData.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  {t('parent_category')}: {formData.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.href}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('category_href')}
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{t('auto_generate')}</span>
                    <button
                      type="button"
                      onClick={() => setAutoGenerateHref(!autoGenerateHref)}
                      className="flex items-center justify-center focus:outline-none"
                      title={autoGenerateHref ? t('disable_auto_generate') : t('enable_auto_generate')}
                    >
                      <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoGenerateHref ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${autoGenerateHref ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-1">/Shop/</span>
                  <input
                    type="text"
                    name="href"
                    value={formData.href.replace('/Shop/', '')}
                    onChange={(e) => {
                      // If manually editing href, disable auto-generation
                      if (autoGenerateHref) setAutoGenerateHref(false);
                      handleChange({
                        target: {
                          name: 'href',
                          value: `/Shop/${e.target.value}`
                        }
                      });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {autoGenerateHref ? t('href_auto_generated') : t('href_manual')}
                  {formData.subLinks && formData.subLinks.length > 0 && (
                    <span className="text-amber-500 ml-1">{t('warning_sublinks_update')}</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('image_url')}
                </label>
                <input
                  type="url"
                  name="src"
                  value={formData.src}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
                {formData.src && (
                  <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <img 
                      src={formData.src} 
                      alt={formData.title} 
                      className="h-24 object-contain mx-auto rounded" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Error'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('display')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="oui"
                      checked={formData.display === 'oui'}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Oui</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="non"
                      checked={formData.display === 'non'}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Non</span>
                  </label>
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
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('subcategory_href')} *
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{t('auto_generate')}</span>
                    <button
                      type="button"
                      onClick={() => setAutoGenerateSubLinkHref(!autoGenerateSubLinkHref)}
                      className="flex items-center justify-center focus:outline-none"
                      title={autoGenerateSubLinkHref ? t('disable_auto_generate') : t('enable_auto_generate')}
                    >
                      <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoGenerateSubLinkHref ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${autoGenerateSubLinkHref ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-t-lg border border-gray-200 dark:border-gray-600 border-b-0">
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">{formData.href}-</span>
                  </div>
                  <input
                    type="text"
                    name="href"
                    value={subLinkData.href.replace(`${formData.href}-`, '')}
                    onChange={(e) => {
                      // If manually editing href, disable auto-generation
                      if (autoGenerateSubLinkHref) setAutoGenerateSubLinkHref(false);
                      handleChange({
                        target: {
                          name: 'href',
                          value: `${formData.href}-${e.target.value}`
                        }
                      });
                    }}
                    required
                    placeholder={subLinkData.title ? subLinkData.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') : ''}
                    className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-b-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {autoGenerateSubLinkHref ? t('href_auto_generated') : t('href_manual')}
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {t('full_path')}: <span className="font-mono">{formData.href}-{subLinkData.href.replace(`${formData.href}-`, '')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('image_url')}
                </label>
                <input
                  type="url"
                  name="src"
                  value={subLinkData.src}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
                {subLinkData.src && (
                  <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <img 
                      src={subLinkData.src} 
                      alt={subLinkData.title} 
                      className="h-24 object-contain mx-auto rounded" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Error'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('display')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="oui"
                      checked={subLinkData.display === 'oui'}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Oui</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="non"
                      checked={subLinkData.display === 'non'}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Non</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl mr-3 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600/90 text-white rounded-xl hover:bg-blue-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center hover:scale-105 backdrop-blur-sm shadow-lg"
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

// Preview Modal Component
const PreviewModal = ({ category, onClose, t }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
        <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {category.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Desktop Preview */}
          <div className="mb-8">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md">
              <div className="bg-gray-100 dark:bg-gray-900 p-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <div className="flex space-x-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  https://www.samethome.com{category.href}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6">
                <div className="flex flex-wrap -mx-2">
                  {/* Main category card */}
                  <div className="w-full md:w-1/4 px-2 mb-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {category.src ? (
                        <img 
                          src={category.src} 
                          alt={category.title} 
                          className="w-full h-40 object-cover" 
                          onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Category'}
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">{t('no_image')}</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">{category.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{category.href}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {category.subLinks && category.subLinks.map((subLink, index) => (
                    <div key={index} className="w-full md:w-1/4 px-2 mb-4">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {subLink.src ? (
                          <img 
                            src={subLink.src} 
                            alt={subLink.title} 
                            className="w-full h-40 object-cover" 
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Subcategory'}
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('no_image')}</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white">{subLink.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subLink.href}</p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${subLink.display === 'oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {subLink.display === 'oui' ? t('visible') : t('hidden')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(), 300); // Allow time for fade-out animation
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'info':
        return <Info size={18} className="text-blue-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/30';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border ${getBgColor()} ${getTextColor()} flex items-center transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} max-w-md z-50`}
    >
      <div className="mr-3 flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        {message}
      </div>
      <button 
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(), 300);
        }}
        className="ml-4 p-1 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default function Categories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, categoryId: null, subLinkTitle: null });
  // Removed bulk actions functionality
  const [previewCategory, setPreviewCategory] = useState(null);
  const [toast, setToast] = useState(null);

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

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
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
        showToast(t('using_local_categories'), 'info')
      } else {
        showToast(t('error_fetching_categories'), 'error')
        setError(t('error_fetching_categories'))
      }
    } finally {
      setLoading(false)
    }
  }, [t, saveCategoriesLocally, loadCategoriesFromLocalStorage, showToast])

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
    const isActiveSubcategory = typeof active.id === 'string' && active.id.includes('-');
    const isOverSubcategory = typeof over.id === 'string' && over.id.includes('-');
    
    if (isActiveSubcategory) {
      // This is a subcategory drag
      const activeCategoryId = active.id.split('-')[0];
      
      // Check if dropping on another subcategory or main category
      if (isOverSubcategory) {
        const overCategoryId = over.id.split('-')[0];
        
        // Only allow reordering within the same category
        if (activeCategoryId === overCategoryId) {
          const activeSubLinkTitle = active.id.split('-').slice(1).join('-'); // Handle titles with dashes
          const overSubLinkTitle = over.id.split('-').slice(1).join('-'); // Handle titles with dashes
          
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
      }
      // If dropping subcategory on main category, do nothing (not allowed)
      return;
    } else if (!isOverSubcategory) {
      // This is a main category drag to another main category
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
    // If dropping main category on subcategory, do nothing (not allowed)
  }

  const handleAddCategory = async (categoryData) => {
    try {
      await AddCategoryItem(categoryData)
      fetchCategories() // Refresh the list
      showToast(t('category_added_success', { title: categoryData.title }), 'success')
    } catch (err) {
      console.error('Error adding category:', err)
      showToast(t('error_adding_category'), 'error')
      throw err
    }
  }

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      await UpdateCategoryItem(id, categoryData)
      fetchCategories() // Refresh the list
      showToast(t('category_updated_success', { title: categoryData.title }), 'success')
    } catch (err) {
      console.error('Error updating category:', err)
      showToast(t('error_updating_category'), 'error')
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
          showToast(t('subcategory_deleted_success', { title: subLinkTitle }), 'success')
        }
      } else {
        // Find category name before deletion for the success message
        const categoryName = categories.find(cat => cat._id === id)?.title || '';
        // Delete the entire category
        await DeleteCategoryItem(id)
        showToast(t('category_deleted_success', { title: categoryName }), 'success')
      }
      setDeleteConfirmation({ show: false, categoryId: null, subLinkTitle: null })
      fetchCategories() // Refresh the list
    } catch (err) {
      console.error('Error deleting:', err)
      showToast(t('error_deleting_category'), 'error')
    }
  }

  const handleEditCategory = (category, subLink = null) => {
    setSelectedCategory({
      ...category,
      selectedSubLink: subLink // Store the selected subLink if editing a subcategory
    })
    setShowEditForm(true)
  }
  
  // Handle toggle display for category or subcategory
  const handleToggleDisplay = async (categoryId, subLinkTitle = null, updateUI = true) => {
    setLoading(true)
    try {
      // Find the category
      const categoryIndex = categories.findIndex(cat => cat._id === categoryId)
      if (categoryIndex === -1) {
        console.error('Category not found:', categoryId)
        return
      }
      
      const category = {...categories[categoryIndex]}
      
      if (subLinkTitle) {
        // Toggle subcategory display
        const subLinkIndex = category.subLinks.findIndex(sl => sl.title === subLinkTitle)
        if (subLinkIndex === -1) {
          console.error('Sublink not found:', subLinkTitle)
          return
        }
        
        // Create a new subLinks array with the updated sublink
        const updatedSubLinks = [...category.subLinks]
        const newDisplayValue = updatedSubLinks[subLinkIndex].display === 'oui' ? 'non' : 'oui';
        updatedSubLinks[subLinkIndex] = {
          ...updatedSubLinks[subLinkIndex],
          display: newDisplayValue
        }
        
        // Create updated category with new subLinks
        const updatedCategory = {
          ...category,
          subLinks: updatedSubLinks
        }
        
        // Update local state first for immediate UI feedback
        if (updateUI) {
          setCategories(prev => {
            const newCategories = [...prev]
            newCategories[categoryIndex] = updatedCategory
            return newCategories
          })
        }
        
        // Save to local storage for fallback
        saveCategoriesLocally([...categories])
        
        // Update on server
        await UpdateCategoryItem(categoryId, updatedCategory)
        
        // Show success toast only if not in bulk operation
        if (updateUI) {
          showToast(
            newDisplayValue === 'oui' 
              ? t('subcategory_shown_success', { title: updatedSubLinks[subLinkIndex].title }) 
              : t('subcategory_hidden_success', { title: updatedSubLinks[subLinkIndex].title }),
            'success'
          )
        }
      } else {
        // Toggle category display
        const newDisplayValue = category.display === 'oui' ? 'non' : 'oui';
        const updatedCategory = {
          ...category,
          display: newDisplayValue
        }
        
        // Update local state first for immediate UI feedback
        if (updateUI) {
          setCategories(prev => {
            const newCategories = [...prev]
            newCategories[categoryIndex] = updatedCategory
            return newCategories
          })
        }
        
        // Save to local storage for fallback
        saveCategoriesLocally([...categories])
        
        // Update on server
        await UpdateCategoryItem(categoryId, updatedCategory)
        
        // Show success toast only if not in bulk operation
        if (updateUI) {
          showToast(
            newDisplayValue === 'oui' 
              ? t('category_shown_success', { title: category.title }) 
              : t('category_hidden_success', { title: category.title }),
            'success'
          )
        }
      }
    } catch (err) {
      console.error('Error toggling display:', err)
      showToast(t('error_updating_visibility'), 'error')
      
      // Refresh categories to revert UI changes
      fetchCategories()
    } finally {
      setLoading(false)
    }
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
    <div className="pt-4">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
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
      <div className="pb-4 px-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('categories')}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <ProductCategoryScanner 
            onScanComplete={(count) => {
              showToast(`${count} produit(s) ajouté(s) aux catégories`, 'success');
              fetchCategories();
            }}
          />
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
      <div className="space-y-2 max-w-4xl mx-auto h-[calc(100vh-180px)] overflow-y-auto pr-4">
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
            {/* Single SortableContext for all draggable items */}
            <SortableContext 
              items={[
                ...categories.map(cat => cat._id),
                ...categories.flatMap(cat => 
                  cat.subLinks ? cat.subLinks.map(sl => `${cat._id}-${sl.title}`) : []
                )
              ]} 
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
                    onToggleDisplay={handleToggleDisplay}
                    onPreview={(category) => setPreviewCategory(category)}
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

      {/* Preview Modal */}
      {previewCategory && (
        <PreviewModal
          category={previewCategory}
          onClose={() => setPreviewCategory(null)}
          t={t}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
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
