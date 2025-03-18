


const mongoose = require("mongoose");

const TaskReviewSchema = new mongoose.Schema({
    taskId: { type: String, required: true },
    scriptId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Script" }],
    scriptFile: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files", required: true }, // Array for multiple files
    observedBehavior: { type: String, required: false },
    vulnerabilities: { type: String, required: false },
    supportFile: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files", required: false }, // Array for multiple files
    reviewBy: { type: String, required: false },
    feedBack:{type :String ,default:"No reviewed"},
    lastReview: { type: Date, default: Date.now },
}); 

module.exports = mongoose.model("TaskReview", TaskReviewSchema);
