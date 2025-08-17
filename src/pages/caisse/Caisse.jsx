import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyPlus, X, Edit, Trash2, Plus, Filter, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, DollarSign } from 'lucide-react';
import { fetchAllCaisseTransactions, deleteCaisseTransaction, findInitialBalanceDocument } from '../../api/caisse';
import AddTransactionForm from '../../components/caisse/AddTransactionForm';
import EditTransactionForm from '../../components/caisse/EditTransactionForm';
import SoldePartForm from '../../components/caisse/SoldePartForm';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

export default function Caisse() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSoldePartForm, setShowSoldePartForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    soldeDepart: 0,
    soldeDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    transactionType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, transactionId: null });
  
  // No pagination dropdown to close
  
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      // Find the dedicated initial balance document first
      const initialBalanceDoc = await findInitialBalanceDocument();
      
      // Get solde_depart and date from the initial balance document or default to 0 and today
      const soldeDepart = initialBalanceDoc && initialBalanceDoc.solde_depart ? 
        parseFloat(initialBalanceDoc.solde_depart) : 0;
      
      // Get the date from the initial balance document or default to today
      let soldeDate = new Date().toISOString().split('T')[0];
      try {
        if (initialBalanceDoc && initialBalanceDoc.datetransaction) {
          // Handle both string and Date object formats
          if (typeof initialBalanceDoc.datetransaction === 'string') {
            soldeDate = initialBalanceDoc.datetransaction.includes('T') ? 
              initialBalanceDoc.datetransaction.split('T')[0] : initialBalanceDoc.datetransaction;
          } else {
            soldeDate = new Date(initialBalanceDoc.datetransaction).toISOString().split('T')[0];
          }
        }
      } catch (dateError) {
        console.error('Error parsing date:', dateError);
        // Keep default date if there's an error
      }
      
      // Fetch all transactions
      const transactionsData = await fetchAllCaisseTransactions();
      
      // Filter out the initial balance document from the transactions list
      const filteredTransactionsData = transactionsData.filter(transaction => {
        // Skip the transaction if it's the initial balance document
        return !(transaction.solde_depart && 
                (transaction.libele === 'Initial Balance' || transaction.name === 'Initial Balance') &&
                (transaction.montant === '0' || transaction.montant === 0 || !transaction.montant));
      });
      
      setTransactions(filteredTransactionsData);
      
      // Calculate summary directly from transactions
      const totalIncome = transactionsData
        .filter(t => t.transactiontype === 'Entrée')
        .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
      
      const totalExpenses = transactionsData
        .filter(t => t.transactiontype === 'Sortie')
        .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
      
      const balance = soldeDepart + totalIncome - totalExpenses;
      
      setSummary({
        totalIncome: totalIncome.toString(),
        totalExpenses: totalExpenses.toString(),
        balance: balance.toString(),
        soldeDepart: soldeDepart.toString(),
        soldeDate: soldeDate
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(t('error_fetching_transactions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenDeleteModal = (id) => {
    setDeleteConfirmation({ show: true, transactionId: id });
  };

  const handleCloseDeleteModal = () => {
    setDeleteConfirmation({ show: false, transactionId: null });
  };

  const handleDeleteTransaction = async () => {
    try {
      await deleteCaisseTransaction(deleteConfirmation.transactionId);
      fetchTransactions();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(t('error_deleting_transaction'));
    }
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditForm(true);
  };

  // Removed pagination handlers

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (data) => {
    return data.filter(transaction => {
      // Filter by transaction type
      if (filters.transactionType && transaction.transactiontype !== filters.transactionType) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.datetransaction);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const transactionDate = new Date(transaction.datetransaction);
        const toDate = new Date(filters.dateTo);
        if (filters.dateTo.indexOf(':') === -1) {
          // If time is not included, set to end of day
          toDate.setHours(23, 59, 59, 999);
        }
        if (transactionDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Apply filters and sort by date (oldest to newest)
  const filteredTransactions = applyFilters(transactions)
    .sort((a, b) => new Date(a.datetransaction) - new Date(b.datetransaction));

  // Use summary data from API including solde_depart

  return (
    <div className='pt-4'>
      {/* Header with title and add button */}
      <div className='pb-4 pl-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('caisse')}
          </h1>
        </div>
        <div className='flex pr-2'>
          <button
            onClick={() => setShowSoldePartForm(true)}
            className='flex items-center bg-transparent border border-green-600
              hover:bg-green-600 text-green-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >
            <DollarSign className='mr-2 mt-0.5' size={20} />
            {t('starting_balance')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center bg-transparent border border-blue-600
              hover:bg-blue-600 text-blue-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >
            <Filter className='mr-2 mt-0.5' size={20} />
            {t('filters')}
          </button>
          <button
            onClick={fetchTransactions}
            className='flex items-center bg-transparent border border-blue-600
              hover:bg-blue-600 text-blue-600 font-bold 
              hover:text-white
              py-2 px-4 rounded-xl cursor-pointer
              mr-2
              shadow-lg hover:shadow-lg active:shadow-inner
              active:scale-85
              transition-all duration-400 ease-in-out'
          >
            <RefreshCw className='mr-2 mt-0.5' size={20} />
            {t('refresh')}
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className='flex items-center bg-blue-600 
            hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl 
            active:scale-85
            cursor-pointer shadow-lg hover:shadow-lg active:shadow-inner 
            transition-all duration-400 ease-in-out'
          >
            <CopyPlus className='mr-2 mt-0.5' size={20} />
            {t('add_transaction')}
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('transaction_type')}</label>
              <select
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
              >
                <option value="">{t('all_types')}</option>
                <option value="Entrée">{t('credit')}</option>
                <option value="Sortie">{t('debit')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date_from')}</label>
              <input
                type="datetime-local"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date_to')}</label>
              <input
                type="datetime-local"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">{t('total_credit')}</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{parseFloat(summary.totalIncome).toFixed(3)} DT</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">{t('total_debit')}</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{parseFloat(summary.totalExpenses).toFixed(3)} DT</p>
        </div>
        <div className={`${parseFloat(summary.balance) >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'} rounded-lg p-4 shadow-sm`}>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300 mb-2">{t('balance')}</h3>
          <p className={`text-2xl font-bold ${parseFloat(summary.balance) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{parseFloat(summary.balance).toFixed(3)} DT</p>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="p-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('no_transactions_found')}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto" style={{ maxHeight: '64vh', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('transaction_date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Libele
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Debit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Credit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('balance')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Solde Depart Row */}
                  <tr className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {/* Display the date from the initial balance document */}
                      {new Date(summary.soldeDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {t('starting_balance')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {/* Empty debit cell */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {/* Empty credit cell */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {parseFloat(summary.soldeDepart || 0).toFixed(3)} DT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setShowSoldePartForm(true)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                  
                  {filteredTransactions.map((transaction, index) => {
                    // Calculate running balance for each transaction including the current transaction
                    const previousTransactions = filteredTransactions.slice(0, index + 1);
                    const runningBalance = previousTransactions.reduce((acc, curr) => {
                      if (curr.transactiontype === 'Entrée') {
                        return acc + parseFloat(curr.montant);
                      } else {
                        return acc - parseFloat(curr.montant);
                      }
                    }, parseFloat(summary.soldeDepart || 0));
                    
                    return (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(transaction.datetransaction).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                          {transaction.note || transaction.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {transaction.transactiontype === 'Sortie' ? `${parseFloat(transaction.montant).toFixed(3)} DT` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {transaction.transactiontype === 'Entrée' ? `${parseFloat(transaction.montant).toFixed(3)} DT` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {runningBalance.toFixed(3)} DT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(transaction._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-bold">
                    <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                      {t('total')}:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {filteredTransactions
                        .filter(t => t.transactiontype === 'Sortie')
                        .reduce((sum, t) => sum + parseFloat(t.montant), 0)
                        .toFixed(3)} DT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {filteredTransactions
                        .filter(t => t.transactiontype === 'Entrée')
                        .reduce((sum, t) => sum + parseFloat(t.montant), 0)
                        .toFixed(3)} DT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                      {parseFloat(summary.balance).toFixed(3)} DT
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Pagination removed - now using endless scrolling */}
          </div>
        )}
      </div>
      
      {/* Solde Part Form Modal */}
      {showSoldePartForm && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowSoldePartForm(false);
            }
          }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('starting_balance')}</h2>
              <button 
                onClick={() => setShowSoldePartForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <SoldePartForm 
                onClose={() => setShowSoldePartForm(false)} 
                onSuccess={() => {
                  setShowSoldePartForm(false);
                  fetchTransactions();
                }}
                currentSoldeDepart={summary.soldeDepart}
                currentDate={summary.soldeDate}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Add Transaction Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('add_transaction')}</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AddTransactionForm onClose={() => setShowAddForm(false)} onSuccess={() => {
                setShowAddForm(false);
                fetchTransactions();
              }} />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Transaction Modal */}
      {showEditForm && selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowEditForm(false);
            }
          }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('edit_transaction')}</h2>
              <button 
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <EditTransactionForm 
                transaction={selectedTransaction} 
                onClose={() => setShowEditForm(false)} 
                onSuccess={() => {
                  setShowEditForm(false);
                  fetchTransactions();
                }} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        show={deleteConfirmation.show} 
        onHide={handleCloseDeleteModal} 
        onConfirm={handleDeleteTransaction} 
        title={t('confirm_delete')}
        message={t('confirm_delete_transaction')} 
        confirmButtonText={t('delete')}
        cancelButtonText={t('cancel')}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        cancelButtonClass="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
      />
    </div>
  );
}
