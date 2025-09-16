import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Obtenir tous les bons de livraison
export const getAllBonLivraisons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-bonlivraisons`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bon de livraisons:', error);
    throw error;
  }
};

// Obtenir un bon de livraison par ID
export const getBonLivraisonById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-bonlivraisons/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bon de livraison:', error);
    throw error;
  }
};

// Créer un nouveau bon de livraison
export const createBonLivraison = async (bonLivraisonData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-bonlivraison`, bonLivraisonData);
    return response.data;
  } catch (error) {
    console.error('Error creating bon de livraison:', error);
    throw error;
  }
};

// Mettre à jour un bon de livraison
export const updateBonLivraison = async (id, bonLivraisonData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-bonlivraison/${id}`, bonLivraisonData);
    return response.data;
  } catch (error) {
    console.error('Error updating bon de livraison:', error);
    throw error;
  }
};

// Supprimer un bon de livraison
export const deleteBonLivraison = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-bonlivraison/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bon de livraison:', error);
    throw error;
  }
};

// Télécharger le PDF d'un bon de livraison
export const downloadBonLivraisonPDF = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/bonlivraison-pdf/${id}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'bon-livraison.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'PDF téléchargé avec succès' };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Upload logo for bon de livraison
export const uploadBonLivraisonLogo = async (logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/bonlivraison/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
};

// Get logo URL
export const getLogoUrl = (logoName) => {
  return `${API_BASE_URL}/admin/api/logiciel/bonlivraison/logo/${logoName}`;
};
