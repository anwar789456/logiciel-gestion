import axios from 'axios';

const API_BASE_URL = 'https://samethome.com';

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


// API pour récupérer les données des factures
export const getFacturesData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/factures`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching factures data:', error);
    throw error;
  }
};

// API pour récupérer les données des bons de livraison
export const getBonLivraisonData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/bonlivraison`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bon livraison data:', error);
    throw error;
  }
};

// API pour récupérer les données des fiches de commande
export const getFicheCommandeData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/fichecommande`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fiche commande data:', error);
    throw error;
  }
};

// API pour récupérer les données des reçus de paiement
export const getRecuPaiementData = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/recupaiement`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recu paiement data:', error);
    throw error;
  }
};

// API pour récupérer les statistiques financières
export const getFinancialStats = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/financial`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    throw error;
  }
};

// API pour récupérer les données des messages
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

// API pour récupérer la liste des clients disponibles
export const getAvailableClients = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/stats/clients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available clients:', error);
    throw error;
  }
};
