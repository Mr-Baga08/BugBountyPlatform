// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bug-bounty-platform.vercel.app/api" || "https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app" || "https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app";
// console.log("API Base URL:", API_BASE_URL); // Add logging for debugging
// export default API_BASE_URL;

// Simple, clean config - use only one API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
console.log("API Base URL:", API_BASE_URL);
export default API_BASE_URL;
