import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useAccessControl } from '../../hooks/useAccessControl';
import { useTranslation } from 'react-i18next';

/**
 * ProductActions component that displays edit and delete buttons
 * based on user's access rights to the current route
 */
const ProductActions = ({ onEdit, onDelete, product }) => {
  const { t } = useTranslation();
  const { canWrite } = useAccessControl();

  // If user doesn't have write access, don't render any buttons
  if (!canWrite()) {
    return null;
  }

  return (
    <div className="flex space-x-2">
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          title={t('edit')}
        >
          <Edit size={16} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product._id);
          }}
          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          title={t('delete')}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default ProductActions;