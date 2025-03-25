const express = require("express");
const router = express.Router();

// Check if these imports are correctly defined
const { loginAdmin, createAdmin } = require("../controllers/adminController");

// Add console logs to debug the imported functions
console.log("Controller functions:", { 
  loginAdmin: typeof loginAdmin, 
  createAdmin: typeof createAdmin 
});

// Only register routes with valid handler functions
if (typeof loginAdmin === 'function') {
  router.post("/login", loginAdmin);
} else {
  console.error("loginAdmin is not a function:", loginAdmin);
  // Provide a temporary handler
  router.post("/login", (req, res) => res.status(503).json({ 
    message: "Login service temporarily unavailable" 
  }));
}

if (typeof createAdmin === 'function') {
  router.post("/register", createAdmin);
} else {
  console.error("createAdmin is not a function:", createAdmin);
  // Provide a temporary handler
  router.post("/register", (req, res) => res.status(503).json({ 
    message: "Registration service temporarily unavailable" 
  }));
}

// The debug route
router.get("/check", async (req, res) => {
  try {
    const Admin = require("../models/Admin");
    const admins = await Admin.find({}, { email: 1 });
    res.status(200).json({ 
      message: "Admin check successful", 
      count: admins.length,
      admins: admins.map(a => ({ id: a._id, email: a.email }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking admins", error: error.message });
  }
});

module.exports = router;