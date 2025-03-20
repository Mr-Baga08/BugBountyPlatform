const express = require("express");
const { authenticate } = require("../middleware/auth"); // Middleware for authentication
const { loginAdmin, createAdmin } = require("../controllers/adminController")
const router = express.Router();

// ✅ Admin Login Route

// router.post("/login",)

router.post("/login", loginAdmin);
// ✅ Create Admin (Restricted to Authenticated Admins)
router.post("/create-admin", authenticate, createAdmin);


module.exports = router;
