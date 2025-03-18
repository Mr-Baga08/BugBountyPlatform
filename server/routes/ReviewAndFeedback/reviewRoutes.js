const express = require("express");
const router = express.Router();
const { createTaskReview , fetchAllReview, reviewFeedback,deleteReview,addReviewFeedBack } = require("../../controllers/ReviewAndFeedbackControllers/ReviewController");
const { upload, uploadToGridFS,getFileFromGridFS , deleteFileFromGridFS} = require("../../config/multerOfConfig");

// router.post("/create" ,upload, uploadToGridFS,taskReviewController.createTaskReview);
router.get("/allreview/:taskId",fetchAllReview );

router.post("/create",
    upload, 
    uploadToGridFS,
    createTaskReview
);  
router.get("/file/:id", getFileFromGridFS);
router.patch("/addFeedBack/:id" ,addReviewFeedBack) ;
router.post("/reviewFeedback/:reviewId",reviewFeedback);
router.delete("/fileDelete/:id",deleteFileFromGridFS)
router.delete("/deleteReview/:id",deleteReview)

module.exports = router;