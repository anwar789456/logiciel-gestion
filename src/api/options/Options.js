import axios from 'axios';
// const API_BASE_URL_GET = 'http://localhost:3001/admin/api/get-options';
// const API_BASE_URL_DEL = 'http://localhost:3001/admin/api/delete-option/';
// const API_BASE_URL_UPDATE = 'http://localhost:3001/admin/api/update-option/';
// const API_BASE_URL_ADD = 'http://localhost:3001/admin/api/add-option';

const API_BASE_URL_GET = 'https://www.samethome.com/admin/api/get-options';
const API_BASE_URL_DEL = 'https://www.samethome.com/admin/api/delete-option/';
const API_BASE_URL_UPDATE = 'https://www.samethome.com/admin/api/update-option/';
const API_BASE_URL_ADD = 'https://www.samethome.com/admin/api/add-option';

// Fetch all Options
export const FetchAllOptionItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL_GET);
    return response.data;
  } catch (error) {
    console.error('Error finding Options:', error);
    throw error;
  }
};
// Delete a Option by its _id
export const DeleteOptionById = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL_DEL}${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting Option with id ${id}:`, error);
    throw error;
  }
};
// Update a Option by its _id
export const UpdateOptionById = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL_UPDATE}${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating Option with id ${id}:`, error);
    throw error;
  }
};
// Function to add a new Option
export const addOption = async (newOptionData) => {
  try {
    const response = await axios.post(API_BASE_URL_ADD, newOptionData);
    return response.data;
  } catch (error) {
    console.error('Error adding Option:', error);
    throw error;
  }
};