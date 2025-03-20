// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bug-bounty-platform.vercel.app/api" || "https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app" || "https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app";
// // console.log("API Base URL:", API_BASE_URL); // Add logging for debugging
// // export default API_BASE_URL;

// // Simple, clean config - use only one API URL
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
// console.log("API Base URL:", API_BASE_URL);
// export default API_BASE_URL;
// bug_dashboard/src/assets/Componets/AdminDashboard/config.js
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// // Ensure the URL is properly formatted without double slashes
// const formatUrl = (url) => {
//   // Remove trailing slash if present
//   const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
//   return baseUrl;
// };

// // Export the formatted URL
// export default formatUrl(API_BASE_URL);


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
console.log("API Base URL:", API_BASE_URL); // For debugging
export default API_BASE_URL;