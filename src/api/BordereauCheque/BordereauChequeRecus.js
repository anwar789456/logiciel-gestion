import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all bordereauchequereçus
export const getAllBordereauchequereçus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-bordereauchequerecus`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bordereauchequereçus:', error);
    throw error;
  }
};

// Add new bordereauchequereçu
export const addBordereauchequereçu = async (bordereauchequereçuData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-bordereauchequerecu`, bordereauchequereçuData);
    return response.data;
  } catch (error) {
    console.error('Error adding bordereauchequereçu:', error);
    throw error;
  }
};

// Update bordereauchequereçu by ID
export const updateBordereauchequereçu = async (id, bordereauchequereçuData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-bordereauchequerecu/${id}`, bordereauchequereçuData);
    return response.data;
  } catch (error) {
    console.error('Error updating bordereauchequereçu:', error);
    throw error;
  }
};

// Delete bordereauchequereçu by ID
export const deleteBordereauchequereçu = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-bordereauchequerecu/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bordereauchequereçu:', error);
    throw error;
  }
};
