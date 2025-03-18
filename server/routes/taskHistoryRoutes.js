const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const TaskChangeHistory = require("../models/TaskChangeHistory"); // Updated model name

router.get("/:taskId", async (req, res) => {
    try {
        let { taskId } = req.params;
        taskId = taskId.trim(); // ✅ Remove spaces and newlines

        console.log("Received taskId:", JSON.stringify(taskId));
        
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ error: "Invalid Task ID format" });
        }

        // ✅ Convert taskid to ObjectId before querying
        const history = await TaskChangeHistory.find({
            taskChangeId: new mongoose.Types.ObjectId(taskId),
            changeBy: { $exists: true, $ne: "" } // ✅ Filter out empty or missing changeBy values
        }).sort({ lastUpdated: -1 });

        if (!history.length) {
            return res.status(404).json({ message: "No history found for this task." });
        }

        res.json({ history });
    } catch (error) {
        console.error("Error fetching task change history:", error);
        res.status(500).json({ error: error.message });
    }
});

 module.exports = router;