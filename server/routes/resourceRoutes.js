// server/routes/resourceRoutes.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const TextDoc = require("../models/TextDoc");
const VideoDoc = require("../models/VideoDoc");

// Authorization middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admin only." });
};

// ===================== TEXT DOCUMENTATION ROUTES =====================

// Get all text documentation
router.get("/texts", async (req, res) => {
  try {
    const docs = await TextDoc.find().sort({ created_at: -1 });
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error fetching text docs:", error);
    res.status(500).json({ error: "Failed to fetch text docs" });
  }
});

// Get a single text document by ID
router.get("/texts/:id", async (req, res) => {
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
});

// Add a new text document (admin only)
router.post("/texts/add", authMiddleware, isAdmin, async (req, res) => {
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
    console.error("Error adding text doc:", error);
    res.status(500).json({ error: "Failed to add document" });
  }
});

// Update a text document (admin only)
router.put("/texts/:id", authMiddleware, isAdmin, async (req, res) => {
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
});

// Delete a text document (admin only)
router.delete("/texts/:id", authMiddleware, isAdmin, async (req, res) => {
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
});

// ===================== VIDEO DOCUMENTATION ROUTES =====================

// Get all video documentation
router.get("/videos", async (req, res) => {
  try {
    const videos = await VideoDoc.find().sort({ created_at: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching video docs:", error);
    res.status(500).json({ error: "Failed to fetch video docs" });
  }
});

// Get a single video document by ID
router.get("/videos/:id", async (req, res) => {
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
});

// Add a new video (admin only)
router.post("/videos/add", authMiddleware, isAdmin, async (req, res) => {
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
    console.error("Error adding video:", error);
    res.status(500).json({ error: "Failed to add video" });
  }
});

// Update a video (admin only)
router.put("/videos/:id", authMiddleware, isAdmin, async (req, res) => {
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
});

// Delete a video (admin only)
router.delete("/videos/:id", authMiddleware, isAdmin, async (req, res) => {
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
});

module.exports = router;