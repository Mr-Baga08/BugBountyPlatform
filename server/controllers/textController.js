const TextDoc = require("../models/TextDoc");

const getTextDocs = async (req, res) => {
  try {
    const docs = await TextDoc.find();
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error fetching text docs:", error);
    res.status(500).json({ error: "Failed to fetch text docs" });
  }
};

module.exports = { getTextDocs };