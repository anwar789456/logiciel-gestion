import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all bordereautraiteemis
export const getAllBordereautraiteemis = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-bordereautraiteemis`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bordereautraiteemis:', error);
    throw error;
  }
};

// Add new bordereautraiteemis
export const addBordereautraiteemis = async (bordereautraiteemisData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-bordereautraiteemis`, bordereautraiteemisData);
    return response.data;
  } catch (error) {
    console.error('Error adding bordereautraiteemis:', error);
    throw error;
  }
};

// Update bordereautraiteemis by ID
export const updateBordereautraiteemis = async (id, bordereautraiteemisData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-bordereautraiteemis/${id}`, bordereautraiteemisData);
    return response.data;
  } catch (error) {
    console.error('Error updating bordereautraiteemis:', error);
    throw error;
  }
};

// Delete bordereautraiteemis by ID
export const deleteBordereautraiteemis = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-bordereautraiteemis/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bordereautraiteemis:', error);
    throw error;
  }
};
