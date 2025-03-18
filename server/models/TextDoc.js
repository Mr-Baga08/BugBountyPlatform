
const mongoose = require("mongoose");

const TextDocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const TextDoc = mongoose.model("TextDoc", TextDocSchema);
module.exports = TextDoc;
