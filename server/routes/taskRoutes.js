const express = require("express");
const { createTask, getAllTasks, updateTask, deleteTask ,getAccordingToStatus,updateTaskStatus,deliverTask } = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/add", authMiddleware, createTask);       // ✅ Create a new task
router.get("/", authMiddleware, getAllTasks);          // ✅ Get all tasks
router.get("/statusFetch/:status", getAccordingToStatus);   
router.patch("/update-status/:taskId", updateTaskStatus);
router.post("/deliver/:taskId",deliverTask)
// router.put("/update/:taskId", updateTask); // ✅ Update a task
// router.delete("/delete/:taskId", deleteTask); // ✅ Delete a task

module.exports = router;
