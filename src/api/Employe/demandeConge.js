import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all demande de congé
export const getAllDemandesConge = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-demandes-conge`);
    return response.data;
  } catch (error) {
    console.error('Error fetching demandes de congé:', error);
    throw error;
  }
};

// Get demande de congé by ID
export const getDemandeCongeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-demande-conge/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching demande de congé:', error);
    throw error;
  }
};

// Create new demande de congé
export const createDemandeConge = async (demandeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-demande-conge`, demandeData);
    return response.data;
  } catch (error) {
    console.error('Error creating demande de congé:', error);
    throw error;
  }
};

// Update demande de congé
export const updateDemandeConge = async (id, demandeData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-demande-conge/${id}`, demandeData);
    return response.data;
  } catch (error) {
    console.error('Error updating demande de congé:', error);
    throw error;
  }
};

// Delete demande de congé
export const deleteDemandeConge = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-demande-conge/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting demande de congé:', error);
    throw error;
  }
};