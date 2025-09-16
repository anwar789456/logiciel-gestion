import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get the current counter value
export const getDevisCounter = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/devis-compteur/get-devis-counter`);
    return response.data;
  } catch (error) {
    console.error('Error fetching devis counter:', error);
    throw error;
  }
};

// Increment the counter
export const incrementDevisCounter = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/devis-compteur/increment`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing devis counter:', error);
    throw error;
  }
};

// Update the counter to a specific value
export const updateDevisCounter = async (devisComptValue) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/devis-compteur/update`, {
      devisComptValue
    });
    return response.data;
  } catch (error) {
    console.error('Error updating devis counter:', error);
    throw error;
  }
};
