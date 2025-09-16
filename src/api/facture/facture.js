import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get all factures
export const getAllFactures = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-factures`);
    return response.data;
  } catch (error) {
    console.error('Error fetching factures:', error);
    throw error;
  }
};

// Get facture by ID
export const getFactureById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/get-factures/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching facture:', error);
    throw error;
  }
};

// Create new facture
export const createFacture = async (factureData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/create-facture`, factureData);
    return response.data;
  } catch (error) {
    console.error('Error creating facture:', error);
    throw error;
  }
};

// Update facture
export const updateFacture = async (id, factureData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/api/logiciel/update-facture/${id}`, factureData);
    return response.data;
  } catch (error) {
    console.error('Error updating facture:', error);
    throw error;
  }
};

// Delete facture
export const deleteFacture = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/logiciel/delete-facture/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting facture:', error);
    throw error;
  }
};

// Generate and download PDF
export const downloadFacturePDF = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/facture-pdf/${id}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'facture.pdf';
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

// Upload logo for facture
export const uploadFactureLogo = async (logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/facture/upload-logo`, formData, {
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
  return `${API_BASE_URL}/admin/api/logiciel/facture/logo/${logoName}`;
};
