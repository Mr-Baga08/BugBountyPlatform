const express = require("express");
const router = express.Router();
const finalReportController = require("../../controllers/ReviewAndFeedbackControllers/FinalReviewController");

router.post("/createOrUpdate", finalReportController.createOrUpdateFinalReport);

router.get("/:taskId", finalReportController.getFinalReportByTaskId);
router.post("/finalreviewFeedback/:reviewId",finalReportController.reviewFeedback);
module.exports = router;
