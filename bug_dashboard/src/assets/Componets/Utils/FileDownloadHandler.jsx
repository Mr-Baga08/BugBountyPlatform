// bug_dashboard/src/assets/Componets/Utils/FileDownloadHandler.js
import axios from 'axios';
import API_BASE_URL from '../../Componets/AdminDashboard/config';

/**
 * Utility function to download files from GridFS
 * @param {string} fileId - The ID of the file to download
 * @param {string} fileName - Optional custom filename to use (defaults to file-{fileId})
 * @returns {Promise<void>}
 */
export const downloadFile = async (fileId, fileName = null) => {
  if (!fileId) {
    console.error('No file ID provided for download');
    throw new Error('No file ID provided');
  }

  try {
    console.log(`Downloading file with ID: ${fileId}`);
    
    // Set responseType to blob to handle binary data
    const response = await axios.get(`${API_BASE_URL}/taskReview/file/${fileId}`, {
      responseType: 'blob',
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
    
    // Create a blob from the response data
    const blob = new Blob([response.data], { 
      // Try to guess content type from the response, or default to octet-stream
      type: response.headers['content-type'] || 'application/octet-stream' 
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Set the download attribute with the filename
    link.setAttribute('download', fileName || `file-${fileId}`);
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    
    // Provide more detailed error messages
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Handle downloading a file with error handling and user feedback
 * @param {string} fileId - The ID of the file to download
 * @param {string} fileType - Type of file (for user feedback)
 */
export const handleDownloadFile = async (fileId, fileType = 'file') => {
  try {
    await downloadFile(fileId);
    // Return success message
    return {
      success: true,
      message: `${fileType} downloaded successfully!`
    };
  } catch (error) {
    // Return error message
    return {
      success: false,
      message: `Failed to download ${fileType}: ${error.message}`
    };
  }
};

export default {
  downloadFile,
  handleDownloadFile
};