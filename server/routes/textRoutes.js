const express = require("express");
const router = express.Router();
const { getTextDocs } = require("../controllers/textController");

router.get("/", getTextDocs);

module.exports = router;