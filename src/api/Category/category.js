import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com/admin/api';

const API_BASE_URL_GET = 'https://www.samethome.com/admin/api/get-category';
const API_BASE_URL_ADD = 'https://www.samethome.com/admin/api/add-category';
const API_BASE_URL_DEL = 'https://www.samethome.com/admin/api/delete-category/';
const API_BASE_URL_UPD = 'https://www.samethome.com/admin/api/update-category/';
// Try alternative endpoint format that might be more reliable
// The original endpoint seems to have server-side issues
const API_BASE_URL_UPD_ORDER = 'https://www.samethome.com/admin/api/reorder-categories';
// Fallback endpoint if needed
const API_BASE_URL_UPD_ORDER_ALT = `${API_BASE_URL}/reorder-categories`;
const API_BASE_URL_PROD_ORDER = 'https://www.samethome.com/admin/api/reorder-products';



/**
 * Fetch all Category items.
 */
export const FetchAllCategoryItems = async () => {
    try {
        const response = await axios.get(API_BASE_URL_GET);
        return response.data;
    } catch (error) {
        console.error("Error fetching Category data:", error);
        throw error;
    }
};


/**
 * Add a new Category item.
 * @param {Object} dataToSave - The Category item to add.
 */
export const AddCategoryItem = async (dataToSave) => {
    try {
        const response = await axios.post(API_BASE_URL_ADD, dataToSave);
        return response.data;
    } catch (error) {
        console.error('Error adding Category item:', error);
        throw error;
    }
};


/**
 * Update a Category item by its MongoDB _id.
 * @param {string} id - The _id of the Category item to update.
 * @param {Object} updatedData - The updated data for the Category item.
 * @param {number} retryCount - Current retry attempt (internal use).
 * @param {number} maxRetries - Maximum number of retry attempts (internal use).
 */
export const UpdateCategoryItem = async (id, updatedData, retryCount = 0, maxRetries = 3) => {
    try {
        const response = await axios.put(`${API_BASE_URL_UPD}${id}`, updatedData, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating Category item (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Determine if we should retry based on the error type
        const shouldRetry = (
            retryCount < maxRetries && 
            (error.code === 'ECONNABORTED' || // Timeout
             error.code === 'ETIMEDOUT' || // Connection timeout
             (error.response && (error.response.status >= 500 || error.response.status === 429)) || // Server error or rate limiting
             !error.response) // Network error (no response)
        );
        
        if (shouldRetry) {
            console.log(`Retrying UpdateCategoryItem (attempt ${retryCount + 2}/${maxRetries + 1})...`);
            // Exponential backoff: 1s, 2s, 4s, etc.
            const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 8000);
            
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            return UpdateCategoryItem(id, updatedData, retryCount + 1, maxRetries);
        }
        
        // If we've exhausted retries or shouldn't retry, throw the error
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            
            // Handle the specific "Cannot read properties of undefined (reading 'map')" error
            if (error.response.data?.error && error.response.data.error.includes("Cannot read properties of undefined (reading 'map')")) {
                console.error('Server error: The server is trying to map over undefined data');
                // This specific error message will be translated in the UI
                throw new Error('server_error_processing_categories');
            }
            
            throw new Error(error.response.data?.message || `Failed to update category: ${error.response.status}`);
        } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response received from server. Please check your network connection.');
        } else {
            console.error('Error message:', error.message);
            throw error;
        }
    }
};


/**
 * Reorder categories based on the provided array of category IDs.
 * @param {Array<string>} categoryIds - Array of category IDs in the desired order.
 * @param {number} retryCount - Current retry attempt (internal use).
 * @param {number} maxRetries - Maximum number of retry attempts (internal use).
 * @param {boolean} useAltEndpoint - Whether to use the alternative endpoint (internal use).
 */
export const ReorderCategories = async (categoryIds, retryCount = 0, maxRetries = 3, useAltEndpoint = false) => {
    try {
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new Error('Invalid category IDs provided for reordering');
      }
      
      // Select which endpoint to use
      const endpoint = useAltEndpoint ? API_BASE_URL_UPD_ORDER_ALT : API_BASE_URL_UPD_ORDER;
      console.log(`Using endpoint: ${endpoint} (${useAltEndpoint ? 'alternative' : 'primary'})`);

      // Validate categoryIds to ensure it's an array before mapping
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        console.error('Invalid categoryIds:', categoryIds);
        throw new Error('Invalid category IDs provided. Expected a non-empty array.');
      }

      // Create an array of objects with categoryId and order
      // Filter out any null or undefined categoryIds to prevent server errors
      const orderedCategories = categoryIds
        .filter(id => id !== null && id !== undefined) // Filter out null/undefined values
        .map((id, index) => ({
          categoryId: id,
          order: index + 1 // Order starts from 1
        }));
      
      // Verify we still have categories to reorder after filtering
      if (orderedCategories.length === 0) {
        throw new Error('No valid category IDs provided for reordering after filtering');
      }
      
      console.log('Sending to server:', { orderedCategories });
      
      // Try different payload formats based on common API patterns
      // Format 1: Simple array of IDs (most common)
      let payload = categoryIds;
      
      // Use axios with timeout and retry logic
      // Add more detailed error handling to capture the exact server error
      try {
        console.log('Trying simple array format:', JSON.stringify(payload, null, 2));
        
        const response = await axios.put(endpoint, payload, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.data) {
          throw new Error('Server returned empty response');
        }
        
        console.log('Server response:', response.data);
        return response.data;
      } catch (axiosError) {
        console.error('Detailed server error:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Error headers:', axiosError.response?.headers);
        
        // If simple array format fails, try alternative formats
        if (axiosError.response?.status === 500 && 
            axiosError.response?.data?.error?.includes("Cannot read properties of undefined (reading 'map')")) {
          
          console.log('Simple array format failed, trying object format...');
          
          // Format 2: Object with categoryIds array
          const altPayload1 = { categoryIds: categoryIds };
          
          try {
            console.log('Trying object format:', JSON.stringify(altPayload1, null, 2));
            const response = await axios.put(endpoint, altPayload1, {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });
            
            if (!response.data) {
              throw new Error('Server returned empty response');
            }
            
            console.log('Server response (object format):', response.data);
            return response.data;
          } catch (altError1) {
            console.log('Object format also failed, trying ordered array format...');
            
            // Format 3: Array of objects with id and order
            const altPayload2 = categoryIds.map((id, index) => ({
              _id: id,
              order: index + 1
            }));
            
            try {
              console.log('Trying ordered array format:', JSON.stringify(altPayload2, null, 2));
              const response = await axios.put(endpoint, altPayload2, {
                timeout: 10000,
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                }
              });
              
              if (!response.data) {
                throw new Error('Server returned empty response');
              }
              
              console.log('Server response (ordered array format):', response.data);
              return response.data;
            } catch (altError2) {
              console.log('All payload formats failed, throwing original error');
              throw axiosError;
            }
          }
        }
        
        throw axiosError;
      }
    } catch (error) {
      console.error(`Error in ReorderCategories (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
      
      // Check if we should try the alternative endpoint
      // If we're getting the specific 500 error about mapping undefined data and not already using alt endpoint
      if (!useAltEndpoint && 
          error.response && 
          error.response.status === 500 && 
          error.response.data?.error && 
          error.response.data.error.includes("Cannot read properties of undefined (reading 'map')")) {
        console.log('Detected server mapping error. Trying alternative endpoint...');
        return ReorderCategories(categoryIds, 0, maxRetries, true); // Reset retry count when switching endpoints
      }
      
      // Determine if we should retry based on the error type
      const shouldRetry = (
        retryCount < maxRetries && 
        (error.code === 'ECONNABORTED' || // Timeout
         error.code === 'ETIMEDOUT' || // Connection timeout
         (error.response && (error.response.status >= 500 || error.response.status === 429)) || // Server error or rate limiting
         !error.response) // Network error (no response)
      );
      
      if (shouldRetry) {
        console.log(`Retrying ReorderCategories (attempt ${retryCount + 2}/${maxRetries + 1})...`);
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 8000);
        
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return ReorderCategories(categoryIds, retryCount + 1, maxRetries, useAltEndpoint);
      }
      
      // If we've exhausted retries or shouldn't retry, throw the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Handle the specific "Cannot read properties of undefined (reading 'map')" error
        if (error.response.data?.error && error.response.data.error.includes("Cannot read properties of undefined (reading 'map')")) {
          console.error('Server error: The server is trying to map over undefined data');
          // This specific error message will be translated in the UI
          throw new Error('server_error_processing_categories');
        }
        
        throw new Error(error.response.data?.message || `Failed to reorder categories: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        throw new Error('No response received from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        throw error;
      }
    }
};

/**
 * Delete a Category item by its MongoDB _id.
 * @param {string} id - The _id of the Category item to delete.
 */
export const DeleteCategoryItem = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL_DEL}${id}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error response:', error.response.data);
            throw new Error(error.response.data.message || 'Failed to delete item');
        } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response from server');
        } else {
            console.error('Error message:', error.message);
            throw new Error('Error setting up request');
        }
    }
};

/**
 * Reorder products within a sublink
 * @param {string} categoryHref - The href of the category
 * @param {string} sublinkHref - The href of the sublink
 * @param {Array} productIds - Array of product IDs in the desired order
 */
export const ReorderProducts = async (categoryHref, sublinkHref, productIds) => {
  try {
    const response = await axios.put(API_BASE_URL_PROD_ORDER, {
      categoryHref,
      sublinkHref,
      productIds
    });
    return response.data;
  } catch (error) {
    console.error('Error reordering products:', error);
    throw error;
  }
};

export const updateCategorySubLink = async (categoryId, subLinkTitle, updatedSubLink) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/sublinks/${encodeURIComponent(subLinkTitle)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSubLink),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update category sublink: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating category sublink:', error);
    throw error;
  }
};