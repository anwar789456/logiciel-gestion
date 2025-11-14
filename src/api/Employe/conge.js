import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all conges
export const getAllConges = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-all-conges`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conges:', error);
    throw error;
  }
};

// Create new conge
export const createConge = async (congeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-conge`, congeData);
    return response.data;
  } catch (error) {
    console.error('Error creating conge:', error);
    throw error;
  }
};

// Update conge by ID
export const updateConge = async (id, congeData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-conge/${id}`, congeData);
    return response.data;
  } catch (error) {
    console.error('Error updating conge:', error);
    throw error;
  }
};

// Delete conge by ID
export const deleteConge = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-conge/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting conge:', error);
    throw error;
  }
};

// Helper function to create conge from demande de conge
// This function extracts the necessary data from a demande de conge and creates a conge record
export const createCongeFromDemande = async (demandeConge, decisionType) => {
  try {
    // Determine which date range to use based on decision type
    const dateRange = decisionType === 'accord_total' 
      ? demandeConge.dateRange 
      : demandeConge.dateRangePartiel;

    // Calculate number of days
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    const congeData = {
      collaborateur: demandeConge.username,
      nbr_jour: diffDays.toString(),
      date_debut: dateRange.startDate,
      date_fin: dateRange.endDate,
      nature: demandeConge.motif
    };

    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-conge`, congeData);
    return response.data;
  } catch (error) {
    console.error('Error creating conge from demande:', error);
    throw error;
  }
};
