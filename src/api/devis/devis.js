import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all devis
export const getAllDevis = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-devis`);
    return response.data;
  } catch (error) {
    console.error('Error fetching devis:', error);
    throw error;
  }
};

// Get devis by ID
export const getDevisById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-devis/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching devis:', error);
    throw error;
  }
};

// Create new devis
export const createDevis = async (devisData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-devis`, devisData);
    return response.data;
  } catch (error) {
    console.error('Error creating devis:', error);
    throw error;
  }
};

// Update devis
export const updateDevis = async (id, devisData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-devis/${id}`, devisData);
    return response.data;
  } catch (error) {
    console.error('Error updating devis:', error);
    throw error;
  }
};

// Delete devis
export const deleteDevis = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-devis/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting devis:', error);
    throw error;
  }
};

// Generate and download PDF
export const downloadDevisPDF = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/devis-pdf/${id}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'devis.pdf';
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

// Upload logo for devis
export const uploadDevisLogo = async (logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/upload-logo`, formData, {
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
  if (!logoName) return null;
  return `${API_BASE_URL}/admin/api/logiciel/logo/${logoName}`;
};
