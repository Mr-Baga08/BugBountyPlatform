
// const mongoose = require("mongoose");

// // Define the schema
// const ScriptSchema = new mongoose.Schema({
//     script_name: {
//         type: String,
//         required: true,
//     },
//     category: {
//         type: String,
//         required: true,
//     },
//     script_code: {
//         type: String,
//         required: true,
//     },
//     created_at: {
//         type: Date,
//         default: Date.now,
//     },
// });

// // Create the model
// const Script = mongoose.model("Script", ScriptSchema);

// // Export the model
// module.exports = Script;
const mongoose = require("mongoose");

const ScriptSchema = new mongoose.Schema({
    activity: { type: String, required: true, default: "No Activity Provided" },
    category: { type: String, required: true },
    tools_technique: { type: String },
    created_at: { type: Date, default: Date.now }
  });

  //
  
const Script = mongoose.model("Script", ScriptSchema);
module.exports = Script;