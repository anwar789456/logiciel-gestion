import React from 'react'

function ErrorMessage({ message, details }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p className="font-medium">{message}</p>
      {details && <p className="text-sm mt-1">{details}</p>}
    </div>
  )
}

export default ErrorMessage