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

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, updatedBy ,userEmail ,tks} = req.body;
    const { taskId } = req.params;
    // ---- sending mail
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Task status change",
        html: `<p>Your submited task: ${tks}</p>
               <p>Status change to: ${status}</p>`
    };
    // transporter.sendMail
    transporter.sendMail(mailOptions);
    // ------------------
    // const putDeliverTask = await Del
    const updatedTask = await taskService.updateTaskStatus(
      taskId,
      status,
      updatedBy
    );
    const updatedTaskChange = await taskService.addTaskChange(
      taskId,
      status,
      updatedBy
    );

    
    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200)
      .json({ message: "Task status updated successfully", updatedTask });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
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