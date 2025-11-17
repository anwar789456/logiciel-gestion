import axios from 'axios';

const API_URL = 'https://www.samethome.com';

// Create a new Bon de Réception
export const createBonReception = async (bonData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/api/logiciel/bonreception/create-bonreception`, bonData);
    return response.data;
  } catch (error) {
    console.error('Error creating bon de réception:', error);
    throw error;
  }
};

// Get all Bon de Réceptions
export const getAllBonReceptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/api/logiciel/bonreception/get-bonreceptions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bon de réceptions:', error);
    throw error;
  }
};

// Update a Bon de Réception
export const updateBonReception = async (id, bonData) => {
  try {
    const response = await axios.put(`${API_URL}/admin/api/logiciel/bonreception/update-bonreception/${id}`, bonData);
    return response.data;
  } catch (error) {
    console.error('Error updating bon de réception:', error);
    throw error;
  }
};

// Delete a Bon de Réception
export const deleteBonReception = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/api/logiciel/bonreception/delete-bonreception/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bon de réception:', error);
    throw error;
  }
};
