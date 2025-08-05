import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDevisCompteur, updateDevisCompteur } from '../api/devis/devis';

export default function DevisCompteur() {
    const { t } = useTranslation();
    const [devisCounter, setDevisCounter] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        fetchDevisCounter();
    }, []);

    const fetchDevisCounter = async () => {
        try {
            setIsLoading(true);
            const counter = await getDevisCompteur();
            setDevisCounter(counter.devisComptValue);
            setInputValue(counter.devisComptValue.toString());
        } catch (error) {
            console.error('Error fetching devis counter:', error);
            setError(t('Failed_to_fetch_devis_counter'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCounter = async () => {
        const newValue = inputValue.trim();        
        if (!newValue || newValue === '') {
            setError(t('Please_enter_a_valid_counter_value'));
            return;
        }
        try {
            setIsLoading(true);
            setError('');
            setSuccessMessage('');
            const response = await updateDevisCompteur(newValue);
            setDevisCounter(response.devisComptValue);
            setInputValue(response.devisComptValue.toString());
            setSuccessMessage(t('Counter_updated_successfully!'));
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error('Error updating counter:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setError('');
        setSuccessMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleUpdateCounter();
        }
    };

    if (isLoading && devisCounter === 0) {
        return (
            <div className='p-4 rounded-lg bg-gray-100 dark:bg-gray-900'>
                <div className="animate-pulse text-black dark:text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className='rounded-lg space-y-4'>
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {t("devis_compteur")}
                </h3>
                
                {/* Help Button with Tooltip */}
                <div className="relative group">
                    <button
                        type="button"
                        className="w-5 h-5 rounded-full font-bold bg-gray-200 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 text-black text-xs flex items-center justify-center transition-colors cursor-help"
                        aria-label="Help information"
                    >
                        ?
                    </button>
                    
                    {/* Tooltip Message */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 w-96">
                            {/* Message bubble arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
                            
                            {/* Message content */}
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <div className="font-medium text-gray-800 dark:text-white mb-1">
                                    💡 Comment ça fonctionne
                                </div>
                                <p>
                                    La valeur que vous saisissez ici sera utilisée comme numéro de compteur pour votre prochain devis généré. 
                                    Par exemple, si vous entrez "100", votre prochain devis aura le compteur n°100.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Counter Section */}
            <div className="">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="">
                        <label htmlFor="counterInput" className="block text-sm text-gray-800 dark:text-white mb-1">
                            {t("new_counter_value")}
                        </label>
                        <input
                            id="counterInput"
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            className="w-fit font-semibold text-black dark:text-white px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                            placeholder="Enter new counter value"
                            autoComplete="off"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button
                        onClick={handleUpdateCounter}
                        disabled={isLoading || !inputValue.trim()}
                        className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : (
                            t("update")
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="w-fit mt-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
}