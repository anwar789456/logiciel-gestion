import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get current facture counter
export const getFactureCounter = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/facture-counter`);
    return response.data;
  } catch (error) {
    console.error('Error fetching facture counter:', error);
    throw error;
  }
};

// Increment the counter
export const incrementFactureCounter = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/increment-facture-counter`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing facture counter:', error);
    throw error;
  }
};

// Update the counter to a specific value
export const updateFactureCounter = async (factureComptValue) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-facture-counter`, {
      factureComptValue
    });
    return response.data;
  } catch (error) {
    console.error('Error updating facture counter:', error);
    throw error;
  }
};
