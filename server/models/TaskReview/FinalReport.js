const mongoose = require("mongoose");

const FinalReportSchema = new mongoose.Schema({
    taskId: { type: String, required: true, unique: true }, // Unique taskId to ensure one report per task
    reportSummary: { type: String, required: false },
    difficulty: { type: String, required: true, enum: ["Easy", "Medium", "Hard"] },
    updatedBy: { type: String, required: false }, // Stores who last updated the report
    feedBack:{type :String ,default:"No reviewed"},
    lastUpdated: { type: Date, default: Date.now } // Stores last update timestamp
});

module.exports = mongoose.model("FinalReport", FinalReportSchema);
