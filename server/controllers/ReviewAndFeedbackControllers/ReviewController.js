const Task = require("../../models/Task");
const TaskReview = require("../../models/TaskReview/TaskReviewAndFeedback");



// Create Task Review with File Uploads
exports.createTaskReview = async (req, res) => {
    try {
        // console.log("swapnil on controller" , req.uploadedFiles[1]["supportFile"])

        const { taskId, observedBehavior, vulnerabilities, reviewBy } = req.body;
        if (!req.files || (!req.files["scriptFile"] && !req.files["supportFile"])) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        const scriptFiles = req.uploadedFiles[0]["scriptFile"]
        const supportFiles = req.uploadedFiles[1]["supportFile"]
        // console.log("swapnil on controller")
        // console.log(supportFiles)
        // Check if file IDs exist
        if (scriptFiles.length === 0) {
            return res.status(500).json({ error: "Script file upload failed" });
        }
        console.log(taskId)
        const taskReview = new TaskReview({
            taskId,
            scriptId: [], // Assuming scripts are referenced separately
            scriptFile: scriptFiles || null, // Store first file reference
            supportFile: supportFiles || null,
            observedBehavior,
            vulnerabilities,
            reviewBy
        });
        const pushIntask = await Task.findByIdAndUpdate(
            taskId, 
            { $push: { reviews: taskReview._id } }, // Push new review ID
            { new: true, upsert: true } // Return updated task, create if not found
          );
          
        // const pushIntask = await Task.findByIdAndUpdate({_id:taskId,reviews:[...reviews,taskReview._id]});
        // const pushIntask = await Task.findByIdAndUpdate(
        //     taskId, // Find by ID
        //     { 
        //       $push: { reviews: taskReview._id }, // Push review ID into the reviews array
        //       $setOnInsert: { reviews: [] } // Ensure reviews array exists (only on insert)
        //     },
        //     { new: true, upsert: true } // Return updated document and create if not found
        //   );
          
        await taskReview.save();
        console.log("swapnil herer",taskReview)
        res.status(201).json({ message: "Task review created successfully", taskReview });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

exports.fetchAllReview = async(req,res)=>{
    try{
        console.log("swapnil is here")
        const allTask = await TaskReview.find({taskId:req.params.taskId});
        console.log(allTask);
        res.status(201).json({message:"all task fetch successfully", allTask});
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message});
    }
}

exports.reviewFeedback = async(req,res)=>{
    try{
        console.log("swapnil is here")
        const feedback = await TaskReview.findOneAndUpdate(
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

exports.deleteReview = async(req,res)=>{
    try{
        const findtask = await TaskReview.findOne({_id:req.params.id});
        // console.log("deleting..",findtask);
        const updatedTask = await Task.findByIdAndUpdate(
            {_id:findtask.taskId}, // Find the task by its ID
            { $pull: { reviews: req.params.id } }, // Remove req.params.id from reviews array
            { new: true } // Return the updated task
          );
        //   console.log(deletedTask)
        const deleteReview = await TaskReview.deleteOne({_id:req.params.id});
        res.status(200).json({message:"delete successfully"});
    }
    catch(error){
        console.log(error   )
        res.status(500).json({error:error.message});
    }
}

exports.addReviewFeedBack = async(req,res)=>{
    try{
        const updateReview = await TaskReview.findByIdAndUpdate(
            {_id:req.params.id},
            {feedBack:req.body.feedBack},
            {new:true}
        )
        res.status(200).json({updateReview});
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message});
    }
}

