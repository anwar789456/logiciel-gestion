import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Fetch all carousel items
export const FetchAllCarouselItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/get-carousel`);
    return response.data;
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    throw error;
  }
};

// Add a new carousel item
export const AddCarouselItem = async (carouselData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/add-carousel`, carouselData);
    return response.data;
  } catch (error) {
    console.error('Error adding carousel item:', error);
    throw error;
  }
};

// Update a carousel item by its ID
export const UpdateCarouselItem = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/update-carouselaccueil/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating carousel item with id ${id}:`, error);
    throw error;
  }
};

// Delete a carousel item by its ID
export const DeleteCarouselItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/delete-carousel/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting carousel item with id ${id}:`, error);
    throw error;
  }
};

// Delete all carousel items (used for reordering)
export const DeleteAllCarouselItems = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/delelte-all-carousel`);
    return response.data;
  } catch (error) {
    console.error('Error deleting all carousel items:', error);
    throw error;
  }
};