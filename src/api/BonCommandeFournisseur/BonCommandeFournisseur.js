import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com/admin/api/logiciel/boncommandefournisseur';

// Create a new Bon de Commande Fournisseur
export const createBonCommandeFournisseur = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/createboncommandefournisseur`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating bon de commande fournisseur:', error);
    throw error;
  }
};

// Get all Bon de Commande Fournisseurs
export const getAllBonCommandeFournisseurs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getboncommandefournisseurs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bon de commande fournisseurs:', error);
    throw error;
  }
};

// Update a Bon de Commande Fournisseur by ID
export const updateBonCommandeFournisseur = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/updateboncommandefournisseur/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating bon de commande fournisseur with id ${id}:`, error);
    throw error;
  }
};

// Delete a Bon de Commande Fournisseur by ID
export const deleteBonCommandeFournisseur = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/deleteboncommandefournisseur/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting bon de commande fournisseur with id ${id}:`, error);
    throw error;
  }
};
