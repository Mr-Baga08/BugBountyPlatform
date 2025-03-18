const VideoDoc = require("../models/VideoDoc");

const getVideoDocs = async (req, res) => {
  try {
    const docs = await VideoDoc.find();
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error fetching video docs:", error);
    res.status(500).json({ error: "Failed to fetch video docs" });
  }
};

module.exports = { getVideoDocs };