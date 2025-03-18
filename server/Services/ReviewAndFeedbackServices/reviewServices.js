// // const TaskReview = require("../../models/TaskReview/TaskReviewAndFeedback");

// // exports.createTaskReview = async (taskReviewData) => {
// //     return await TaskReview.create(taskReviewData);
// // };


// // // taskId here is not _id
// // exports.getTaskReviewByTaskId = async (taskId) => {
// //     return await TaskReview.find({ taskId:taskId });
// //     // return await TaskReview.find({ taskId }).populate("scriptId");
// // };


// // // here id is _id
// // exports.deleteTaskReview = async (id) => {
// //     return await TaskReview.findByIdAndDelete({_id:id});
// // };


// // const TaskReview = require("../../models/TaskReview/TaskReviewAndFeedback");

// // // Create or Update Task Review with File Upload
// // exports.createTaskReview = async (taskData, scriptFileId, supportFileId) => {
// //     return await TaskReview.create({
// //         ...taskData,
// //         scriptFile: scriptFileId,
// //         supportFile: supportFileId || null
// //     });
// // };

// // // Get Task Review by `taskId`
// // exports.getTaskReviewByTaskId = async (taskId) => {
// //     return await TaskReview.findOne({ taskId }).populate("scriptFile supportFile");
// //     // return await TaskReview.findOne({ taskId }).populate("scriptFile supportFile scriptId");
// // };

// // // Delete Task Review
// // exports.deleteTaskReview = async (id) => {
// //     return await TaskReview.findByIdAndDelete({_id:id});
// // };



// const TaskReview = require("../../models/TaskReview/TaskReviewAndFeedback");

// // Create or Update Task Review with File Upload
// exports.createTaskReview = async (taskData, scriptFileId, supportFileId) => {
//     return await TaskReview.create({
//         ...taskData,
//         scriptFile: scriptFileId,
//         supportFile: supportFileId || null
//     });
// };

// // Get Task Review by `taskId`
// exports.getTaskReviewByTaskId = async (taskId) => {
//     return await TaskReview.findOne({ taskId }).populate("scriptFile supportFile");
// };

// // Delete Task Review
// exports.deleteTaskReview = async (id) => {
//     return await TaskReview.findByIdAndDelete({ _id: id });
// };
