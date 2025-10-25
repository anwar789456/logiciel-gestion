import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Fetch the banner advertisement (only one document exists)
export const FetchBannerAdvertisement = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-banner-advertisement`);
    return response.data;
  } catch (error) {
    console.error('Error fetching banner advertisement:', error);
    throw error;
  }
};

// Update specific fields of the banner advertisement
export const UpdateBannerAdvertisement = async (updatedData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/admin/api/logiciel/update-banner-advertisement`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating banner advertisement:', error);
    throw error;
  }
};

// Create or update the banner advertisement (full replacement)
export const UpsertBannerAdvertisement = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/upsert-banner-advertisement`, data);
    return response.data;
  } catch (error) {
    console.error('Error upserting banner advertisement:', error);
    throw error;
  }
};
