
// videoRoutes.js
const express = require("express");
const router = express.Router();
const { getVideoDocs } = require("../controllers/videoController");
router.get("/", getVideoDocs);
module.exports = router;
