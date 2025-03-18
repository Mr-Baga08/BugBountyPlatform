// Centralized API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Export the base URL for use throughout the application
export default API_BASE_URL;