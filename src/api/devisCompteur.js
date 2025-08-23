import axios from 'axios';

const API_BASE_URL = 'http://localhost:5007';

// Get the current counter value
export const getDevisCounter = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/devis-counter`);
    return response.data;
  } catch (error) {
    console.error('Error fetching devis counter:', error);
    throw error;
  }
};

// Increment the counter
export const incrementDevisCounter = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/increment-devis-counter`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing devis counter:', error);
    throw error;
  }
};

// Update the counter to a specific value
export const updateDevisCounter = async (devisComptValue) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-devis-counter`, {
      devisComptValue
    });
    return response.data;
  } catch (error) {
    console.error('Error updating devis counter:', error);
    throw error;
  }
};
