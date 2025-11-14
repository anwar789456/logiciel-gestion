import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all bordereaucheques
export const getAllBordereaucheques = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-bordereaucheques`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bordereaucheques:', error);
    throw error;
  }
};

// Add new bordereaucheque
export const addBordereaucheque = async (bordereauchequeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-bordereaucheque`, bordereauchequeData);
    return response.data;
  } catch (error) {
    console.error('Error adding bordereaucheque:', error);
    throw error;
  }
};

// Update bordereaucheque by ID
export const updateBordereaucheque = async (id, bordereauchequeData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-bordereaucheque/${id}`, bordereauchequeData);
    return response.data;
  } catch (error) {
    console.error('Error updating bordereaucheque:', error);
    throw error;
  }
};

// Delete bordereaucheque by ID
export const deleteBordereaucheque = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-bordereaucheque/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bordereaucheque:', error);
    throw error;
  }
};
