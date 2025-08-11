import axios from 'axios';

const API_BASE_URL_GET = 'https://www.samethome.com/admin/api/get-products';
const API_BASE_URL_DEL = 'https://www.samethome.com/admin/api/delete-product/';
const API_BASE_URL_UPDATE = 'https://www.samethome.com/admin/api/update-product/';
const API_BASE_URL_ADD = 'https://www.samethome.com/admin/api/add-product';

// Product Types
const API_BASE_URL_GET_TYPES = 'https://www.samethome.com/admin/api/logiciel/get-type-produits';
const API_BASE_URL_DEL_TYPES = 'https://www.samethome.com/admin/api/logiciel/delete-type-produit/';
const API_BASE_URL_UPDATE_TYPES = 'https://www.samethome.com/admin/api/logiciel/update-type-produit/';
const API_BASE_URL_ADD_TYPES = 'https://www.samethome.com/admin/api/logiciel/create-type-produit';


// Fetch all products
export const FetchAllProductItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL_GET);
    return response.data;
  } catch (error) {
    console.error('Error finding products:', error);
    throw error;
  }
};
// Delete a product by its _id
export const DeleteProductById = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL_DEL}${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};
// Update a product by its _id
export const UpdateProductById = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL_UPDATE}${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};
// Function to add a new product
export const addProduct = async (newProductData) => {
  try {
    const response = await axios.post(API_BASE_URL_ADD, newProductData);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Fetch all product types
export const FetchAllProductTypeItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL_GET_TYPES);
    return response.data;
  } catch (error) {
    console.error('Error finding product types:', error);
    throw error;
  }
};

// Delete a product type by its _id
export const DeleteProductTypeById = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL_DEL_TYPES}${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product type with id ${id}:`, error);
    throw error;
  }
};

// Update a product type by its _id
export const UpdateProductTypeById = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL_UPDATE_TYPES}${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product type with id ${id}:`, error);
    throw error;
  }
};

// Function to add a new product type
export const addProductType = async (newProductTypeData) => {
  try {
    const response = await axios.post(API_BASE_URL_ADD_TYPES, newProductTypeData);
    return response.data;
  } catch (error) {
    console.error('Error adding product type:', error);
    throw error;
  }
};

// Get a product type by its _id
export const GetProductTypeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL_GET_TYPES}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting product type with id ${id}:`, error);
    throw error;
  }
};