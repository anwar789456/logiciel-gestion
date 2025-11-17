import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all encoursproduction
export const getAllEncoursproduction = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-encoursproduction`);
    return response.data;
  } catch (error) {
    console.error('Error fetching encoursproduction:', error);
    throw error;
  }
};

// Add new encoursproduction
export const addEncoursproduction = async (encoursproductionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-encoursproduction`, encoursproductionData);
    return response.data;
  } catch (error) {
    console.error('Error adding encoursproduction:', error);
    throw error;
  }
};

// Update encoursproduction by ID
export const updateEncoursproduction = async (id, encoursproductionData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-encoursproduction/${id}`, encoursproductionData);
    return response.data;
  } catch (error) {
    console.error('Error updating encoursproduction:', error);
    throw error;
  }
};

// Delete encoursproduction by ID
export const deleteEncoursproduction = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-encoursproduction/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting encoursproduction:', error);
    throw error;
  }
};
