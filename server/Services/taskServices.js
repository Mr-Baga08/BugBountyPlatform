const Task = require("../models/Task");
const TaskChangeHistory = require("../models/TaskChangeHistory");

// ✅ Create Task
exports.createTask = async (taskData) => {
    taskData.lastUpdated = taskData.lastUpdated || Date.now();
    const task = new Task(taskData);
    return await task.save();
};

// ✅ Get All Tasks
exports.getAllTasks = async () => {
    return await Task.find();
};

// ✅ Update Task
exports.updateTask = async (taskId, updateData) => {
    updateData.lastUpdated = Date.now();
    return await Task.findOneAndUpdate({ taskId }, updateData, { new: true });
};

// ✅ Delete Task
exports.deleteTask = async (taskId) => {
    return await Task.findOneAndDelete({ taskId });
};

// ✅ Update Task Status
exports.updateTaskStatus = async (taskId, status, updatedBy) => {
    const allowedStatuses = ["Unclaimed", "In Progress", "Completed" , "Reviewed"];
    if (!allowedStatuses.includes(status)) throw new Error("Invalid status value");

    return await Task.findOneAndUpdate(
        { _id:taskId },
        { status, updatedBy, lastUpdated: Date.now() },
        { new: true }
    );
};

exports.addTaskChange = async ( taskId, status, updatedBy ) => {
    const taskChange = new TaskChangeHistory({taskChangeId:taskId, statusChangeTo:status, changeBy: updatedBy , lastUpdated: Date.now()})
    return await taskChange.save();
}