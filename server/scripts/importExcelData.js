

const XLSX = require('xlsx');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Script = require('../models/ScriptModel'); // Adjust path if needed

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  importExcelData();
})
.catch(err => {
  console.error(" MongoDB connection error:", err);
  process.exit(1);
});

const importExcelData = () => {
  try {
    const workbook = XLSX.readFile("./Web Pentest Checklist.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    console.log("📄 Excel JSON data:", jsonData);

    const formattedData = jsonData.map((row) => ({
        activity: row["Activity"] || "No Activity Provided",
        category: row["Category"] && row["Category"].trim() ? row["Category"].trim() : "General",
        tools_technique: row["Tools/Technique"] || ""
      }));
    
      
    Script.deleteMany({})
      .then(() => {
        console.log("Old scripts deleted. Inserting new records...");
        Script.insertMany(formattedData)
          .then((docs) => {
            console.log(`Inserted ${docs.length} scripts successfully.`);
            mongoose.connection.close();
          })
          .catch((error) => {
            console.error("Error inserting scripts:", error);
            mongoose.connection.close();
          });
      })
      .catch((err) => {
        console.error(" Error deleting old scripts:", err);
      });
  } catch (error) {
    console.error("Error reading Excel file:", error);
  }
};