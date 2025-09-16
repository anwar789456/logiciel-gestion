import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get the current counter value
export const getRecuPaiementCounter = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/recupaiement-compteur/get-recupaiement-counter`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recu paiement counter:', error);
    throw error;
  }
};

// Increment the counter
export const incrementRecuPaiementCounter = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/recupaiement-compteur/increment`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing recu paiement counter:', error);
    throw error;
  }
};

// Update the counter to a specific value
export const updateRecuPaiementCounter = async (recupaiementcompt) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/recupaiement-compteur/update`, {
      recupaiementcompt
    });
    return response.data;
  } catch (error) {
    console.error('Error updating recu paiement counter:', error);
    throw error;
  }
};
