import axios from 'axios';

const API_BASE_URL_GET = 'https://www.samethome.com/admin/api/get-commande';

// Fetch all Commandes
export const FetchAllCommandeItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL_GET);
    return response.data;
  } catch (error) {
    console.error('Error finding Commandes:', error);
    throw error;
  }
};