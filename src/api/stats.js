import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// API pour récupérer les statistiques générales
export const getGeneralStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/general`);
    return response.data;
  } catch (error) {
    console.error('Error fetching general stats:', error);
    throw error;
  }
};

// API pour récupérer les données des produits avec pagination
export const getProductsData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/products`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products data:', error);
    throw error;
  }
};

// API pour récupérer les données des commandes avec pagination
export const getCommandesData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/commandes`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commandes data:', error);
    throw error;
  }
};

// API pour récupérer les données des devis avec pagination
export const getDevisData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/devis`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching devis data:', error);
    throw error;
  }
};

// API pour récupérer les données des messages avec pagination
export const getMessagesData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/messages`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages data:', error);
    throw error;
  }
};

// API pour récupérer les données des graphiques
export const getChartsData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/charts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching charts data:', error);
    throw error;
  }
};

// API pour récupérer la liste des clients
export const getAvailableClients = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/clients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

// API pour récupérer les statistiques par période
export const getStatsByPeriod = async (period = 'month') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/period`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stats by period:', error);
    throw error;
  }
};
