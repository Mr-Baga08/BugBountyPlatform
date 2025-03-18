// server/routes/taskImportRoutes.js
const express = require("express");
const router = express.Router();
const { 
  uploadTasksFile, 
  validateTasks, 
  importTasks, 
  getTaskTemplate 
} = require("../controllers/taskImportController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes require authentication
router.use(authMiddleware);

// Get template file
router.get("/template", getTaskTemplate);

// Upload Excel file
router.post("/upload", uploadTasksFile);

// Validate uploaded data
router.post("/validate", validateTasks);

// Import tasks
router.post("/import", importTasks);

module.exports = router;