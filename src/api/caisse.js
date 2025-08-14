import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Fetch all caisse transactions
export const fetchAllCaisseTransactions = async () => {
  try {
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