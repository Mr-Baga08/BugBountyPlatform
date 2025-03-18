const FinalReport = require("../../models/TaskReview/FinalReport");

// Create or Update Final Report (Ensuring one report per taskId)
exports.createOrUpdateFinalReport = async (reportData) => {
    return await FinalReport.findOneAndUpdate(
        { taskId: reportData.taskId }, // Search for existing report by taskId
        { 
            $set: {
                reportSummary: reportData.reportSummary,
                difficulty: reportData.difficulty,
                updatedBy: reportData.updatedBy,
                lastUpdated: new Date()
            }
        },
        { new: true, upsert: true } // Create if not exists, update if exists
    );
};

// Get Final Report by taskId
exports.getFinalReportByTaskId = async (taskId) => {
    return await FinalReport.findOne({ taskId });
};
