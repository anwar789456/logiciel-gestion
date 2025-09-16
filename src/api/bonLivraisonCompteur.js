import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get the current counter value
export const getBonLivraisonCounter = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/bonlivraison-compteur/get-bonlivraison-counter`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bon livraison counter:', error);
    throw error;
  }
};

// Increment the counter
export const incrementBonLivraisonCounter = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/bonlivraison-compteur/increment`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing bon livraison counter:', error);
    throw error;
  }
};

// Update the counter to a specific value
export const updateBonLivraisonCounter = async (bonLivraisonComptValue) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/bonlivraison-compteur/update`, {
      bonLivraisonComptValue
    });
    return response.data;
  } catch (error) {
    console.error('Error updating bon livraison counter:', error);
    throw error;
  }
};
