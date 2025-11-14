import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all echancierchequerecus
export const getAllEchancierchequerecus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-echancierchequerecus`);
    return response.data;
  } catch (error) {
    console.error('Error fetching echancierchequerecus:', error);
    throw error;
  }
};

// Add new echancierchequerecus
export const addEchancierchequerecus = async (echancierchequerecusData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-echancierchequerecus`, echancierchequerecusData);
    return response.data;
  } catch (error) {
    console.error('Error adding echancierchequerecus:', error);
    throw error;
  }
};

// Update echancierchequerecus by ID
export const updateEchancierchequerecus = async (id, echancierchequerecusData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-echancierchequerecus/${id}`, echancierchequerecusData);
    return response.data;
  } catch (error) {
    console.error('Error updating echancierchequerecus:', error);
    throw error;
  }
};

// Delete echancierchequerecus by ID
export const deleteEchancierchequerecus = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-echancierchequerecus/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting echancierchequerecus:', error);
    throw error;
  }
};
