const mongoose = require("mongoose");

const VideoDocSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const VideoDoc = mongoose.model("VideoDoc", VideoDocSchema);
module.exports = VideoDoc;