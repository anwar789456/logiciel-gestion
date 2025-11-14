import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all bordereautraiterecus
export const getAllBordereautraiterecus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-bordereautraiterecus`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bordereautraiterecus:', error);
    throw error;
  }
};

// Add new bordereautraiterecus
export const addBordereautraiterecus = async (bordereautraiterecusData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/add-bordereautraiterecus`, bordereautraiterecusData);
    return response.data;
  } catch (error) {
    console.error('Error adding bordereautraiterecus:', error);
    throw error;
  }
};

// Update bordereautraiterecus by ID
export const updateBordereautraiterecus = async (id, bordereautraiterecusData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-bordereautraiterecus/${id}`, bordereautraiterecusData);
    return response.data;
  } catch (error) {
    console.error('Error updating bordereautraiterecus:', error);
    throw error;
  }
};

// Delete bordereautraiterecus by ID
export const deleteBordereautraiterecus = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-bordereautraiterecus/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bordereautraiterecus:', error);
    throw error;
  }
};
