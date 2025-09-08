import React, { useState, useEffect, useRef } from 'react'
import { FetchAllProductItems } from '../../Api/Products/Products'
import { FetchAllCategoryItems, ReorderProducts } from '../../api/Category/category'
import { GripVertical, CheckCircle, X } from 'lucide-react'
import './productOrdering.scss'

function ProductOrdering() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSublink, setSelectedSublink] = useState(null)
  const [assignedProducts, setAssignedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedOverItem, setDraggedOverItem] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const dragNode = useRef()

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
    // When a sublink is selected, load its associated products
    if (selectedCategory && selectedSublink) {
      const category = categories.find(cat => cat.href === selectedCategory)
      if (category) {
        const sublink = category.subLinks.find(sub => sub.href === selectedSublink)
        if (sublink && sublink.products) {
          // Map product IDs to actual product objects from the products list
          const productObjects = sublink.products
            .map(prod => {
              // Look for products using either _id or idProd
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

  // Hide success message after 3 seconds
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

  const handleDragStart = (e, index) => {
    dragNode.current = e.target
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = "move"
    
    // Add a timeout to apply the dragging class after drag starts
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.classList.add('dragging')
      }
    }, 0)
  }

  const handleDragEnter = (e, index) => {
    if (index !== draggedItem) {
      setDraggedOverItem(index)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.classList.remove('dragging')
    }
    
    if (draggedItem !== null && draggedOverItem !== null && draggedItem !== draggedOverItem) {
      const newProducts = [...assignedProducts]
      // Remove the dragged item
      const draggedItemContent = newProducts.splice(draggedItem, 1)[0]
      // Insert it at the new position
      newProducts.splice(draggedOverItem, 0, draggedItemContent)
      setAssignedProducts(newProducts)
    }
    
    setDraggedItem(null)
    setDraggedOverItem(null)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
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

  // const saveProductOrder = async () => {
  //   if (!selectedCategory || !selectedSublink || assignedProducts.length === 0) return
  //   try {
  //     const productIds = assignedProducts.map(product => product._id || product.idProd)
  //     await ReorderProducts(selectedCategory, selectedSublink, productIds)
  //     const updatedCategories = await FetchAllCategoryItems()
  //     setCategories(updatedCategories)
  //     setShowSuccessMessage(true)
  //   } catch (error) {
  //     console.error('Error saving product order:', error)
  //   }
  // }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="product-ordering-container">
      {showSuccessMessage && (
        <div className="success-message">
          <div className="success-content">
            <CheckCircle size={20} />
            <span>Product order saved successfully!</span>
            <button className="close-btn" onClick={closeSuccessMessage}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      <h1>Product Ordering</h1>
      
      <div className="selection-container">
        <div className="selection-group">
          <label>Select Category:</label>
          <select 
            value={selectedCategory || ''} 
            onChange={handleCategoryChange}
            className="select-input"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.href}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
        
        {selectedCategory && (
          <div className="selection-group">
            <label>Select Sublink:</label>
            <select 
              value={selectedSublink || ''} 
              onChange={handleSublinkChange}
              className="select-input"
            >
              <option value="">Select a sublink</option>
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
        <div className="ordering-workspace">
          <div className="assigned-panel full-width">
            <h2>Products Order</h2>
            <p className="drag-instruction">Drag to reorder products</p>
            
            <div className="assigned-products-list">
              {assignedProducts.length === 0 ? (
                <div className="no-products">No products in this category</div>
              ) : (
                assignedProducts.map((product, index) => (
                  <div 
                    key={product._id || product.idProd}
                    className={`assigned-product-item ${draggedItem === index ? 'dragging' : ''} ${draggedOverItem === index ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => e.preventDefault()}
                  >
                    <div className="drag-handle">
                      <GripVertical size={18} />
                    </div>
                    
                    {/* Check if product has images array or image objects with img property */}
                    {((product.images && product.images.length > 0) || 
                     (product.images && product.images[0]?.img)) && (
                      <img 
                        src={product.images[0]?.img || product.images[0]} 
                        alt={product.title || product.nom} 
                        className="product-thumbnail"
                      />
                    )}
                    
                    <div className="product-info">
                      <div className="product-title">{product.title || product.nom}</div>
                      <div className="product-id">ID: {product._id || product.idProd}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                className="save-btn"
                onClick={saveProductOrder}
                disabled={!selectedCategory || !selectedSublink || assignedProducts.length === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductOrdering