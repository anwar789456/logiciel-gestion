import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmButtonText, cancelButtonText, confirmButtonClass, cancelButtonClass }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onHide();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && show) {
        onHide();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title || t('confirm_action')}
          </h3>
          <button 
            onClick={onHide}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700 dark:text-gray-300">{message || t('confirm_delete_message')}</p>
        </div>
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
          <button
            onClick={onHide}
            className={`px-4 py-2 rounded-md transition-colors duration-200 shadow-sm ${cancelButtonClass || 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white'}`}
          >
            {cancelButtonText || t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md transition-colors duration-200 shadow-sm ${confirmButtonClass || 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {confirmButtonText || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;