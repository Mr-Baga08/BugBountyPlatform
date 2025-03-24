const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bug-hunt-backend-970777025928.us-central1.run.app/api";

// Ensure consistent URL format (remove trailing slash if present)
const formatUrl = (url) => {
  // If URL ends with a slash, remove it
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Log for debugging
if (import.meta.env.DEV) {
  console.log("API Base URL:", API_BASE_URL);
}

// Export the formatted URL
export default formatUrl(API_BASE_URL);