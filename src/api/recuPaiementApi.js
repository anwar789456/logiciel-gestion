import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com/admin/api/logiciel';

// Create a new recu paiement
export const createRecuPaiement = async (recuPaiementData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create-recupaiement`, recuPaiementData);
    return response.data;
  } catch (error) {
    console.error('Error creating recu paiement:', error);
    throw error;
  }
};

// Get all recu paiements
export const getAllRecuPaiements = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-recupaiements`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recu paiements:', error);
    throw error;
  }
};

// Get recu paiement by ID
export const getRecuPaiementById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-recupaiement/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recu paiement:', error);
    throw error;
  }
};

// Update recu paiement
export const updateRecuPaiement = async (id, recuPaiementData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/update-recupaiement/${id}`, recuPaiementData);
    return response.data;
  } catch (error) {
    console.error('Error updating recu paiement:', error);
    throw error;
  }
};

// Delete recu paiement
export const deleteRecuPaiement = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/delete-recupaiement/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting recu paiement:', error);
    throw error;
  }
};

// Download recu paiement PDF
export const downloadRecuPaiementPDF = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recupaiement-pdf/${id}`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Try to get filename from response headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = `recu-paiement-${id}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Upload logo for recu paiement
export const uploadRecuPaiementLogo = async (logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await axios.post(`${API_BASE_URL}/recupaiement/upload-logo`, formData, {
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
  return `${API_BASE_URL}/recupaiement/logo/${logoName}`;
};
