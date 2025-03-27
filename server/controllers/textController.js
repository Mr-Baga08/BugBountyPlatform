const TextDoc = require("../models/TextDoc");

const getTextDocs = async (req, res) => {
  try {
    const docs = await TextDoc.find();
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error fetching text docs:", error);
    res.status(500).json({ error: "Failed to fetch text docs" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, updatedBy, userEmail, tks } = req.body;
    const { taskId } = req.params;
    
    // Update task status
    const updatedTask = await taskService.updateTaskStatus(
      taskId,
      status,
      updatedBy
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Add task change history
    const updatedTaskChange = await taskService.addTaskChange(
      taskId,
      status,
      updatedBy
    );
    
    // Send email notification
    if (userEmail) {
      const { sendTaskStatusChangeEmail } = require("../config/email");
      await sendTaskStatusChangeEmail(updatedTask, status, updatedBy);
    }
    
    res.status(200).json({ 
      message: "Task status updated successfully", 
      updatedTask 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getTextDocs };