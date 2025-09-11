import axios from 'axios';

const API_BASE_URL = 'http://localhost:5007/admin/api/logiciel/fichecommande';

const ficheCommandeApi = {
  // Import Excel file
  importExcel: async (file) => {
    const formData = new FormData();
    formData.append('excelFile', file);
    
    const response = await axios.post(`${API_BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all fiche commandes with filters and pagination
  getAllFicheCommandes: async (params = {}) => {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  // Get summary statistics
  getSummary: async () => {
    const response = await axios.get(`${API_BASE_URL}/summary`);
    return response.data;
  },

  // Get filter options (files, sheets)
  getFilterOptions: async (file = null) => {
    const params = file ? { file } : {};
    const response = await axios.get(`${API_BASE_URL}/filter-options`, { params });
    return response.data;
  },

  // Get single fiche commande by ID
  getFicheCommandeById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create new fiche commande (manual entry)
  createFicheCommande: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/add`, data);
    return response.data;
  },

  // Update fiche commande
  updateFicheCommande: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete fiche commande
  deleteFicheCommande: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Delete all records from a specific file
  deleteByFile: async (fileName) => {
    const response = await axios.delete(`${API_BASE_URL}/file/${encodeURIComponent(fileName)}`);
    return response.data;
  },

  // Aliases for backward compatibility
  getAll: function(params) { return this.getAllFicheCommandes(params); },
  create: function(data) { return this.createFicheCommande(data); },
  update: function(id, data) { return this.updateFicheCommande(id, data); },
  delete: function(id) { return this.deleteFicheCommande(id); },
};

export default ficheCommandeApi;
