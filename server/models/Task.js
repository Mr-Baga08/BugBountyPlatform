const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    taskId: { type: String, required: true, unique: true }, // Unique Task ID
    projectName: { type: String, required: true },          // Project Name
    industry: { type: String, required: true },
    DomainLink: { type: String, required: false },
    Batch : {type : String , require:false},             
    toolLink: { type: String, required: false }, 
    userEmail: { type: String, required: false },           // Optional Tool Link
    status: { type: String, required: true,default:"Unclaimed", enum: ["Unclaimed", "In Progress", "Completed","Reviewed" , "Deliver"] }, // Status Enum
    lastUpdated: { type: Date, default: Date.now },         
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "TaskReview" }] ,
    finalReview: { type: mongoose.Schema.Types.ObjectId, ref: "FinalReport" } ,
    updatedBy: { type: String, required: true,  default:"admin"}             // User who updated it
});

taskSchema.pre("findOneAndDelete", async function (next) {
    try {
      const TaskReview = mongoose.model("TaskReview");
      const FinalReport = mongoose.model("FinalReport");
  
      const taskId = this.getQuery()._id; // Get task ID from the query
  
      if (!taskId) {
        return next(new Error("Task ID not found"));
      }
  
      console.log("Deleting task with ID:", taskId);
  
      // Delete all reviews linked to this task
      await TaskReview.deleteMany({ taskId });
  
      // Delete the final report linked to this task
      await FinalReport.deleteOne({ taskId });
  
      next();
    } catch (error) {
      console.error("Error deleting task dependencies:", error);
      next(error);
    }
  });
  


// Export the model
module.exports = mongoose.model("Task", taskSchema);

