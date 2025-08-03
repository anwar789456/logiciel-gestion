import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Get backup information (collections count, etc.)
export const getBackupInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/logiciel/backup/info`);
    return response.data;
  } catch (error) {
    console.error('Error getting backup info:', error);
    throw error;
  }
};

// Export selected collections in specified format
export const exportCollections = async (collections, format = 'json') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/api/logiciel/backup/export`, {
      collections,
      format
    }, {
      responseType: 'blob', // Important for file download
    });
    
    // Determine file extension based on format
    let fileExtension = 'zip';
    let mimeType = 'application/zip';
    
    switch (format) {
      case 'excel':
        fileExtension = 'xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'pdf':
        fileExtension = 'pdf';
        mimeType = 'application/pdf';
        break;
      case 'json':
      default:
        fileExtension = 'zip';
        mimeType = 'application/zip';
        break;
    }
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const collectionsStr = collections.length === 1 ? collections[0] : 'multiple';
    link.setAttribute('download', `backup-${collectionsStr}-${date}.${fileExtension}`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting collections:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const downloadBackup = async () => {
  try {
    // Get all available collections
    const info = await getBackupInfo();
    const allCollections = info.collections.map(col => col.name);
    
    // Export all collections as JSON
    return await exportCollections(allCollections, 'json');
  } catch (error) {
    console.error('Error downloading backup:', error);
    throw error;
  }
};
