// server/controllers/resourceControllers.js
const TextDoc = require("../models/TextDoc");
const VideoDoc = require("../models/VideoDoc");

// Text Documentation Controllers
exports.getTextDocs = async (req, res) => {
  try {
    const docs = await TextDoc.find().sort({ created_at: -1 });
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error fetching text docs:", error);
    res.status(500).json({ error: "Failed to fetch text docs" });
  }
};

exports.getTextDocById = async (req, res) => {
  try {
    const doc = await TextDoc.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json(doc);
  } catch (error) {
    console.error("Error fetching text doc:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
};

exports.createTextDoc = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    const newDoc = new TextDoc({
      title,
      content,
      created_at: new Date()
    });
    
    const savedDoc = await newDoc.save();
    res.status(201).json(savedDoc);
  } catch (error) {
    console.error("Error creating text doc:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
};

exports.updateTextDoc = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    const updatedDoc = await TextDoc.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    
    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.status(200).json(updatedDoc);
  } catch (error) {
    console.error("Error updating text doc:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
};

exports.deleteTextDoc = async (req, res) => {
  try {
    const deletedDoc = await TextDoc.findByIdAndDelete(req.params.id);
    
    if (!deletedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting text doc:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

// Video Documentation Controllers
exports.getVideoDocs = async (req, res) => {
  try {
    const videos = await VideoDoc.find().sort({ created_at: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching video docs:", error);
    res.status(500).json({ error: "Failed to fetch video docs" });
  }
};

exports.getVideoDocById = async (req, res) => {
  try {
    const video = await VideoDoc.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};

exports.createVideoDoc = async (req, res) => {
  try {
    const { title, url } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }
    
    // Simple URL validation
    if (!url.startsWith('http')) {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    
    const newVideo = new VideoDoc({
      title,
      url,
      created_at: new Date()
    });
    
    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error("Error creating video doc:", error);
    res.status(500).json({ error: "Failed to create video" });
  }
};

exports.updateVideoDoc = async (req, res) => {
  try {
    const { title, url } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }
    
    // Simple URL validation
    if (!url.startsWith('http')) {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    
    const updatedVideo = await VideoDoc.findByIdAndUpdate(
      req.params.id,
      { title, url },
      { new: true }
    );
    
    if (!updatedVideo) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
};

exports.deleteVideoDoc = async (req, res) => {
  try {
    const deletedVideo = await VideoDoc.findByIdAndDelete(req.params.id);
    
    if (!deletedVideo) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
};