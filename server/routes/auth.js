

const express = require("express");
const {
    registerUser,
    approveUser,
    loginUser,
    getCoachDashboard,
    getHunterDashboard,
    rejectUser,
    getPendingUsers
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// User Registration (Coach & Hunter Only)
router.post("/register", registerUser);

// Admin Approval of Pending Users
router.post("/approve-user", approveUser);
// User Login
router.post("/login", loginUser);

// Role-based Dashboards
router.get("/coach-dashboard", authMiddleware, getCoachDashboard);
router.get("/hunter-dashboard", authMiddleware, getHunterDashboard);

// Reject Pending User
router.post("/reject-user", rejectUser);

// Fetch All Pending Users
router.get("/pending-users", getPendingUsers);

module.exports = router;
