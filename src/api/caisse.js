import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Fetch all caisse transactions
export const fetchAllCaisseTransactions = async () => {
  try {
    // Real API implementation
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-caisse-transactions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching caisse transactions:', error);
    throw error;
  }
};

// Fetch caisse summary (total income, total expense, balance)
export const fetchCaisseSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-caisse-summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching caisse summary:', error);
    throw error;
  }
};

// Add a new caisse transaction
export const addCaisseTransaction = async (transactionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-caisse-transaction`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error adding caisse transaction:', error);
    throw error;
  }
};

// Update a caisse transaction
export const updateCaisseTransaction = async (id, transactionData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-caisse-transaction/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating caisse transaction with id ${id}:`, error);
    throw error;
  }
};

// Delete a caisse transaction
export const deleteCaisseTransaction = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-caisse-transaction/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting caisse transaction with id ${id}:`, error);
    throw error;
  }
};

// Find the initial balance document (solde_depart)
export const findInitialBalanceDocument = async () => {
  try { 
    // Real API implementation below
    const transactions = await fetchAllCaisseTransactions();
    
    // Find a document that has solde_depart and date, but no credit/debit transaction
    // This would be our dedicated initial balance document
    const initialBalanceDoc = transactions.find(transaction => 
      transaction.solde_depart && 
      transaction.datetransaction && 
      (transaction.montant === '0' || transaction.montant === 0 || !transaction.montant) && 
      (transaction.libele === 'Initial Balance' || transaction.name === 'Initial Balance')
    );
    
    if (initialBalanceDoc) {
      // Ensure the document has an id field (might be _id in MongoDB)
      if (!initialBalanceDoc.id && initialBalanceDoc._id) {
        initialBalanceDoc.id = initialBalanceDoc._id;
      }
    } else {
      console.log('No initial balance document found');
    }
    
    return initialBalanceDoc || null;
  } catch (error) {
    console.error('Error finding initial balance document:', error);
    // Return null instead of throwing to prevent app crashes
    return null;
  }
};

// Update solde_depart (starting balance)
export const updateSoldeDepart = async (soldeData) => {
  try {
    // Validate the input data
    if (!soldeData || !soldeData.solde_depart) {
      throw new Error('Invalid solde_depart data');
    }
    
    // Use the provided date or default to today
    const transactionDate = soldeData.date || new Date().toISOString().split('T')[0];
    
    // First, try to find a dedicated initial balance document
    const initialBalanceDoc = await findInitialBalanceDocument();
    
    // Determine which ID to use (_id or id)
    const docId = initialBalanceDoc ? (initialBalanceDoc.id || initialBalanceDoc._id) : null;
    
    if (initialBalanceDoc && docId) {

      const updatedTransaction = {
        ...initialBalanceDoc,
        solde_depart: soldeData.solde_depart,
        datetransaction: transactionDate,
        // Ensure these fields are set correctly
        libele: initialBalanceDoc.libele || 'Initial Balance',
        name: initialBalanceDoc.name || 'Initial Balance',
        montant: initialBalanceDoc.montant || '0',
        transactiontype: initialBalanceDoc.transactiontype || 'Entrée',
        note: initialBalanceDoc.note || 'Initial balance setup',
        personne: initialBalanceDoc.personne || 'System'
      };
      
      try {
        const documentId = initialBalanceDoc.id || initialBalanceDoc._id;
        const response = await axios.put(
          `${API_BASE_URL}/admin/api/logiciel/update-caisse-transaction/${documentId}`, 
          updatedTransaction
        );
        return response.data;
      } catch (apiError) {
        console.error('API error details:', apiError.response ? {
          status: apiError.response.status,
          data: apiError.response.data,
          headers: apiError.response.headers
        } : 'No response');
        
        throw apiError;
      }
    } else {
      const newTransaction = {
        libele: 'Initial Balance',
        name: 'Initial Balance',
        personne: 'System',
        montant: '0',
        transactiontype: 'Entrée',
        datetransaction: transactionDate,
        note: 'Initial balance setup',
        solde_depart: soldeData.solde_depart
      };
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/admin/api/logiciel/create-caisse-transaction`, 
          newTransaction
        );
        return response.data;
      } catch (createError) {
        console.error('Error creating initial balance document:', createError);
        throw createError;
      }
    }
  } catch (error) {
    console.error('Error updating solde_depart:', error);
    console.error('Error response:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : 'No response');
    throw error;
  }
};