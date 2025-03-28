const Task = require("../models/Task");
const TaskReviewAndFeedback = require("../models/TaskReview/TaskReviewAndFeedback");
const taskService = require("../Services/taskServices");
const DeliveredTask =require("../models/DeliverTask");
const transporter = require("../config/email");
require("dotenv").config();
exports.createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    console.log(tasks)
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await taskService.updateTask(
      req.params.taskId,
      req.body
    );
    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task updated", updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await taskService.deleteTask(req.params.taskId);
    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted", deletedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update this method in server/controllers/taskController.js
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, updatedBy, userEmail, tks } = req.body;
    const { taskId } = req.params;
    
    console.log(`Updating task status for ${taskId} to ${status} by ${updatedBy}`);
    
    // Validate the taskId is provided
    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    
    // Validate the status is one of the allowed values
    const allowedStatuses = ["Unclaimed", "In Progress", "Completed", "Reviewed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    // Attempt to send email notification (don't block on failure)
    try {
      if (userEmail && tks) {
        // Import transporter only if email sending is needed
        const transporter = require("../config/email").transporter;
        
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@bughuntplatform.com',
          to: userEmail,
          subject: "Task status change",
          html: `<p>Your submitted task: ${tks}</p>
                <p>Status change to: ${status}</p>
                <p>Changed by: ${updatedBy}</p>`
        };
        
        // Send email asynchronously (don't await)
        transporter.sendMail(mailOptions)
          .then(() => console.log(`Email sent to ${userEmail} about task ${tks}`))
          .catch(err => console.error('Email sending failed:', err));
      }
    } catch (emailError) {
      // Log email error but continue with task status update
      console.error('Error preparing email notification:', emailError);
    }
    
    // Update the task status
    const updatedTask = await taskService.updateTaskStatus(
      taskId,
      status,
      updatedBy
    );
    
    // Add to task change history
    const updatedTaskChange = await taskService.addTaskChange(
      taskId,
      status,
      updatedBy
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(200).json({ 
      message: "Task status updated successfully", 
      updatedTask 
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getAccordingToStatus = async (req, res) => {
  try {
    const {taskId} = req.query;
    let tasks ;
    if(taskId == "all" || !taskId){
        tasks = await Task.find({  status: req.params.status })
      .populate({ path: "reviews", strictPopulate: false }) // Populates the 'reviews' array
      .populate({ path: "finalReview", strictPopulate: false })
    }
    else
     tasks = await Task.find({_id: taskId ,  status: req.params.status })
      .populate({ path: "reviews", strictPopulate: false }) // Populates the 'reviews' array
      .populate({ path: "finalReview", strictPopulate: false })
      
    //   console.log(tasks);

    if (!tasks)
      return res.status(404).json({ message: "Task not found" });

    res
      .status(200)
      .json({ message: "Task status updated successfully", tasks });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
};

exports.deliverTask = async (req,res)=>{
    try{
        // console.log(taskId)
        const {  updatedBy,taskToDeliver } = req.body;
    const { taskId } = req.params;
    

    // const task = await Task.findOne({ taskId });

    // if (!task) {
    //   return res.status(404).json({ message: "Task not found" });
    // }

    // Delete the task (triggers the middleware to remove linked documents)

    await Task.findOneAndDelete({ _id: taskId });


    taskToDeliver.status = "Deliver"
    const putDeliverTask = new DeliveredTask(taskToDeliver);
    await putDeliverTask.save();
    const updatedTask = await Task.findOneAndUpdate(
      {_id:taskId},
      {status:"Deliver", updatedBy:updatedBy},
      {new:true}
    );

    console.log("swapnil here")
    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200)
      .json({ message: "Task status updated successfully", updatedTask });
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:error.message});
    }
};

exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    
    // Find the task and populate reviews and final report
    const task = await Task.findById(taskId)
      .populate({ path: "reviews", strictPopulate: false })
      .populate({ path: "finalReview", strictPopulate: false });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: error.message });
  }
};