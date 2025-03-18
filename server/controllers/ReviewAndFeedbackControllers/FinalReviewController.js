const Task = require("../../models/Task");
const FinalReport = require("../../models/TaskReview/FinalReport");
const finalReportService = require("../../Services/ReviewAndFeedbackServices/finalReviewServices");

// Create or Update Final Report
exports.createOrUpdateFinalReport = async (req, res) => {
    try {
    // console.log("swapnil herer", req.body);
        // const 
        const updatedReport = await Task.findOneAndUpdate(
            { _id:req.body.taskId }, // Find report by taskId
            { $set: { status:"Completed", lastUpdated: new Date() } }, // Update status
            { new: true, upsert: true } // Return updated doc, create if not found
          );
        const report = await finalReportService.createOrUpdateFinalReport(req.body);
        const pushIntask = await Task.findByIdAndUpdate(
            {_id:req.body.taskId}, 
            { finalReview: report._id , userEmail:req.body.userEmail } , 
            { new: true, upsert: true } // Return updated task, create if not found
          );
          
        res.status(200).json(report);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

// Get Final Report by taskId
exports.getFinalReportByTaskId = async (req, res) => {
    try {
        const report = await finalReportService.getFinalReportByTaskId(req.params.taskId);
        if (!report) {
            return res.status(404).json({ message: "Final report not found for this taskId" });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.reviewFeedback = async(req,res)=>{
    try{
        // console.log("swapnil is here")
        // FinalReport
        const feedback = await FinalReport.findOneAndUpdate(
            {_id : req.params.reviewId},
            {feedBack : req.body.feedBack},
            { new :true},
        )
        res.status(200).json({message:"feedback send", feedback});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}