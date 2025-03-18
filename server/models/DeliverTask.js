const mongoose = require("mongoose");

// Embedded Review Schema
const deliveredReviewSchema = new mongoose.Schema({
        scriptFile: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files", required: true }, // Array for multiple files
        observedBehavior: { type: String, required: true },
        vulnerabilities: { type: String, required: false },
        supportFile: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files", required: false }, // Array for multiple files
        reviewBy: { type: String, required: true },
        feedBack:{type :String ,default:"No reviewed"},
});

// Embedded Final Review Schema
const deliveredFinalReviewSchema = new mongoose.Schema({
    reportSummary: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ["Easy", "Medium", "Hard"] },
    updatedBy: { type: String, required: true }, // Stores who last updated the report
    feedBack:{type :String ,default:"No reviewed"},
});

// Delivered Task Schema (Same as Task Schema)
const deliveredTaskSchema = new mongoose.Schema({
    taskId: { type: String, required: true, unique: true },
    projectName: { type: String, required: true },
    industry: { type: String, required: true },
    DomainLink: { type: String },
    Batch: { type: String },
    toolLink: { type: String , default:""},
    status: { type: String, default:"Delivered" },
    reviews: [deliveredReviewSchema], // Retaining reviews in nested JSON
    finalReview: deliveredFinalReviewSchema, 
    deliveredAt: { type: Date, default: Date.now } // Timestamp of delivery
});

module.exports = mongoose.model("DeliveredTask", deliveredTaskSchema);
