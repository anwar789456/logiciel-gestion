import React from 'react'

function LoadingSpinner({ size = 'medium' }) {
  // Size variants
  const sizes = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-t-2 border-b-2',
    large: 'h-16 w-16 border-4'
  }
  
  const sizeClass = sizes[size] || sizes.medium
  
  return (
    <div className="flex justify-center items-center h-full">
      <div className={`animate-spin rounded-full ${sizeClass} border-primary-600`}></div>
    </div>
  )
}

export default LoadingSpinner