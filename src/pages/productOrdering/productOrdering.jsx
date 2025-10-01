import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FetchAllProductItems } from '../../api/product'
import { FetchAllCategoryItems, ReorderProducts } from '../../api/Category/category'
import { GripVertical, CheckCircle, X, AlertCircle } from 'lucide-react'
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

// SortableProductItem Component
const SortableProductItem = ({ product, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product._id || product.idProd })
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none',
  }
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm mb-2 transition-all duration-200 hover:shadow-md hover:border-gray-300"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 mr-3 p-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical size={18} />
      </div>
      
      {((product.images && product.images.length > 0) || 
       (product.images && product.images[0]?.img)) && (
        <img 
          src={product.images[0]?.img || product.images[0]} 
          alt={product.title || product.nom} 
          className="w-12 h-12 mr-4 object-cover rounded-md border border-gray-200"
        />
      )}
      
      <div className="flex-1">
        <div className="font-medium text-gray-800">{product.title || product.nom}</div>
        <div className="text-sm text-gray-500">ID: {product._id || product.idProd}</div>
      </div>
    </div>
  )
}

function ProductOrdering() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSublink, setSelectedSublink] = useState(null)
  const [assignedProducts, setAssignedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
        tolerance: 5,
        delay: 150,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          FetchAllProductItems(),
          FetchAllCategoryItems()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCategory && selectedSublink) {
      const category = categories.find(cat => cat.href === selectedCategory)
      if (category) {
        const sublink = category.subLinks.find(sub => sub.href === selectedSublink)
        if (sublink && sublink.products) {
          const productObjects = sublink.products
            .map(prod => {
              const foundProduct = products.find(p => 
                p._id === prod.idprod || p.idProd === prod.idprod
              )
              return foundProduct ? { ...foundProduct, orderId: prod.idprod } : null
            })
            .filter(p => p !== null)
          
          setAssignedProducts(productObjects)
        } else {
          setAssignedProducts([])
        }
      }
    } else {
      setAssignedProducts([])
    }
  }, [selectedCategory, selectedSublink, categories, products])

  useEffect(() => {
    let timer
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
    return () => clearTimeout(timer)
  }, [showSuccessMessage])

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)
    setSelectedSublink(null)
    setAssignedProducts([])
  }

  const handleSublinkChange = (event) => {
    setSelectedSublink(event.target.value)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (!active || !over || active.id === over.id) return
    
    setAssignedProducts((prev) => {
      const oldIndex = prev.findIndex(item => (item._id || item.idProd) === active.id)
      const newIndex = prev.findIndex(item => (item._id || item.idProd) === over.id)
      
      if (oldIndex === -1 || newIndex === -1) return prev
      
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const closeSuccessMessage = () => {
    setShowSuccessMessage(false)
  }

  const saveProductOrder = async () => {
    if (!selectedCategory || !selectedSublink || assignedProducts.length === 0) return
    try {
      const productIds = assignedProducts.map(product => product.orderId)
      await ReorderProducts(selectedCategory, selectedSublink, productIds)
      const updatedCategories = await FetchAllCategoryItems()
      setCategories(updatedCategories)
      setShowSuccessMessage(true)
    } catch (error) {
      console.error('Error saving product order:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-600 text-lg">{t('loading')}</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
          <div className="flex items-center">
            <CheckCircle size={20} className="mr-2" />
            <span>{t('product_order_saved')}</span>
            <button className="ml-auto text-green-500 hover:text-green-700" onClick={closeSuccessMessage}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('product_ordering')}</h1>
      
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[250px]">
          <label className="block mb-2 font-medium text-gray-700">{t('select_category')}:</label>
          <select 
            value={selectedCategory || ''} 
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('select_category')}</option>
            {categories.map((category) => (
              <option key={category._id} value={category.href}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
        
        {selectedCategory && (
          <div className="flex-1 min-w-[250px]">
            <label className="block mb-2 font-medium text-gray-700">{t('select_sublink')}:</label>
            <select 
              value={selectedSublink || ''} 
              onChange={handleSublinkChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('select_sublink')}</option>
              {categories
                .find(cat => cat.href === selectedCategory)?.subLinks
                .map((sublink) => (
                  <option key={sublink.href} value={sublink.href}>
                    {sublink.title}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
      
      {selectedCategory && selectedSublink && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{t('products_order')}</h2>
            
            <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-lg flex items-center">
              <AlertCircle size={16} className="mr-2" />
              <p className="text-sm">{t('drag_to_reorder_products')}</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[300px]">
              {assignedProducts.length === 0 ? (
                <div className="text-gray-500 text-center py-12">{t('no_products_in_category')}</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={assignedProducts.map(p => p._id || p.idProd)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {assignedProducts.map((product, index) => (
                      <SortableProductItem 
                        key={product._id || product.idProd}
                        product={product}
                        index={index}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={saveProductOrder}
                disabled={!selectedCategory || !selectedSublink || assignedProducts.length === 0}
              >
                {t('save_order')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductOrdering