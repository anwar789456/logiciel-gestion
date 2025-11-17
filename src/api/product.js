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
    // Process the response data to ensure sizes is properly formatted
    const processedData = response.data.map(product => {
      // Make a copy to avoid modifying the original
      const processedProduct = {...product};
      
      // Check if sizes exists and is a string
      if (processedProduct.sizes && typeof processedProduct.sizes === 'string') {
        try {
          const parsedSizes = JSON.parse(processedProduct.sizes);
          processedProduct.sizes = parsedSizes;
        } catch (error) {
          console.error(`Product ${processedProduct.idProd}: Error parsing sizes string:`, error);
        }
      }
      
      // Ensure tva field exists - set default if missing
      if (!processedProduct.tva || processedProduct.tva === null || processedProduct.tva === undefined) {
        processedProduct.tva = '19'; // Default TVA value (matches the datalist format)
      }
      
      return processedProduct;
    });
    
    return processedData;
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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.error) {
        // Check if there's a validation error object
        if (error.response.data.error.errors) {
          console.error('Validation errors:', error.response.data.error.errors);
        }
        // Check if there's a message in the error object
        if (error.response.data.error.message) {
          console.error('Error message from server:', error.response.data.error.message);
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
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

// Fetch a single product by ID
export const fetchProductById = async (id) => {
  try {
    console.log(`Fetching product with ID: ${id}...`);
    // Use the existing API endpoint with a filter for the specific product ID
    const response = await axios.get(`${API_BASE_URL_GET}?_id=${id}`);
    console.log('Single product API response received:', response.data);
    
    // Process the product data
    let product = null;
    
    // Find the product with the matching ID
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('Response is an array with', response.data.length, 'items');
      product = response.data.find(p => p._id === id) || response.data[0];
    } else {
      product = response.data;
    }
    
    // Process sizes if it's a string
    if (product && product.sizes && typeof product.sizes === 'string') {
      try {
        console.log('Product sizes is a string, attempting to parse:', product.sizes);
        const parsedSizes = JSON.parse(product.sizes);
        product.sizes = parsedSizes;
        console.log('Parsed sizes:', product.sizes);
      } catch (error) {
        console.error('Error parsing sizes string:', error);
        // If parsing fails, ensure sizes is at least an empty array
        product.sizes = [];
      }
    } else if (!product.sizes) {
      // Ensure sizes is at least an empty array
      product.sizes = [];
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Check if a product ID already exists
export const checkProductIdExists = async (idProd) => {
  try {
    // If idProd is empty, return false (doesn't exist)
    if (!idProd || idProd.trim() === '') {
      console.log('Empty product ID, returning exists: false');
      return { exists: false };
    }
    
    console.log(`Checking if product ID '${idProd}' exists...`);
    const response = await axios.get(`${API_BASE_URL_GET}`);
    
    console.log('API response for product ID check:', response.data);
    
    // If the response contains products with this ID, it exists
    // We need to check if any product in the response has this exact idProd
    const matchingProducts = response.data.filter(product => 
      product.idProd && product.idProd.toString() === idProd.toString()
    );
    
    const exists = matchingProducts.length > 0;
    console.log(`Product ID '${idProd}' exists:`, exists, 
                `(found ${matchingProducts.length} matching products)`);
    
    return { exists, products: matchingProducts };
  } catch (error) {
    console.error(`Error checking if product ID ${idProd} exists:`, error);
    // In case of error, assume it doesn't exist to avoid blocking the user
    return { exists: false, error: error.message };
  }
};