import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all echancierchequeemis
export const getAllEchancierchequeemis = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-echancierchequeemis`);
    return response.data;
  } catch (error) {
    console.error('Error fetching echancierchequeemis:', error);
    throw error;
  }
};

// Add new echancierchequeemis
export const addEchancierchequeemis = async (echancierchequeemisData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-echancierchequeemis`, echancierchequeemisData);
    return response.data;
  } catch (error) {
    console.error('Error adding echancierchequeemis:', error);
    throw error;
  }
};

// Update echancierchequeemis by ID
export const updateEchancierchequeemis = async (id, echancierchequeemisData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-echancierchequeemis/${id}`, echancierchequeemisData);
    return response.data;
  } catch (error) {
    console.error('Error updating echancierchequeemis:', error);
    throw error;
  }
};

// Delete echancierchequeemis by ID
export const deleteEchancierchequeemis = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-echancierchequeemis/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting echancierchequeemis:', error);
    throw error;
  }
};
