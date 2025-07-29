import axios from 'axios';


const API_BASE_URL_GET = 'https://www.samethome.com/admin/api/logiciel/get-devis';
const API_BASE_URL_DEL = 'https://www.samethome.com/admin/api/logiciel/delete-devis/';
const API_BASE_URL_UPDATE = 'https://www.samethome.com/admin/api/logiciel/update-devis/';

// Fetch all Deviss
export const FetchAllDevisItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL_GET);
    return response.data;
  } catch (error) {
    console.error('Error finding Devis:', error);
    throw error;
  }
};
// Delete a Devis by its _id
export const DeleteDevisById = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL_DEL}${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting Devis with id ${id}:`, error);
    throw error;
  }
};
// Update a Devis by its _id
export const UpdateDevisById = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL_UPDATE}${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating Devis with id ${id}:`, error);
    throw error;
  }
};