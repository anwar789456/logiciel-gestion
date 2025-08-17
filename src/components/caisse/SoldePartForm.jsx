import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { updateSoldeDepart } from '../../api/caisse';

const SoldePartForm = ({ onClose, onSuccess, currentSoldeDepart, currentDate }) => {
  const { t } = useTranslation();
  const [soldeDepart, setSoldeDepart] = useState(currentSoldeDepart || '0');
  const [date, setDate] = useState(() => {
    // Format the date properly
    try {
      if (currentDate) {
        // Handle different date formats
        if (typeof currentDate === 'string') {
          return currentDate.includes('T') ? 
            currentDate.split('T')[0] : currentDate;
        } else if (currentDate instanceof Date) {
          return currentDate.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    // Default to today if there's an issue
    return new Date().toISOString().split('T')[0];
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'soldeDepart') {
      setSoldeDepart(value);
    } else if (name === 'date') {
      setDate(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert to number to ensure proper formatting
      const numericSoldeDepart = parseFloat(soldeDepart);
      if (isNaN(numericSoldeDepart)) {
        throw new Error(t('valid_amount_required'));
      }
      
      // Make sure the value is positive
      if (numericSoldeDepart < 0) {
        throw new Error(t('amount_must_be_positive'));
      }
      
      console.log('Sending solde_depart update with data:', { 
        solde_depart: numericSoldeDepart.toString(),
        date: date
      });
      
      // Add a try-catch specifically for the API call to get more detailed error information
      try {
        const result = await updateSoldeDepart({ 
          solde_depart: numericSoldeDepart.toString(),
          date: date
        });
        console.log('Update solde_depart result:', result);
        onSuccess();
      } catch (apiError) {
        console.error('API Error details:', apiError.response ? apiError.response.data : 'No response data');
        console.error('API Error status:', apiError.response ? apiError.response.status : 'No status');
        throw apiError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error updating solde_depart:', error);
      setError(t('error_updating_solde_depart') + (error.message ? `: ${error.message}` : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('starting_balance')}</label>
          <input
            type="text"
            name="soldeDepart"
            value={soldeDepart}
            onChange={handleChange}
            required
            autoComplete="off"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  );
};

export default SoldePartForm;