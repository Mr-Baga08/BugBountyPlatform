// server/routes/adminRoutes.js
const express = require("express");
const { authenticate } = require("../middleware/auth"); // Middleware for authentication
const { loginAdmin, createAdmin } = require("../controllers/adminController")
const router = express.Router();

// Admin Login Route (public)
router.post("/login", loginAdmin);

// TEMPORARY: Admin Registration Route (public)
router.post("/register", createAdmin);

// Keep this commented out while testing
// router.post("/create-admin", authenticate, createAdmin);

module.exports = router;