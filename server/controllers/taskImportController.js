// server/controllers/taskImportController.js
const Task = require("../models/Task");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// Configure storage for temporary Excel files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up multer for file uploads
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept Excel files and CSV
    const filetypes = /xlsx|xls|csv/;
    const acceptedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream', // Sometimes Excel files get this generic type
      'text/csv'  // For CSV support
    ];
  
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    console.log("File MIME type:", file.mimetype);
    console.log("File original name:", file.originalname);
    
    if (acceptedMimeTypes.includes(file.mimetype) || extname) {
      return cb(null, true);
    }
    cb(new Error("Only Excel and CSV files are allowed"));
  },
}).single("excelFile");

// Handle the Excel file upload
exports.uploadTasksFile = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload an Excel file" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      filename: req.file.filename
    });
  });
};

// Parse and validate the uploaded Excel file
exports.validateTasks = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ 
        success: false, 
        message: "Filename is required" 
      });
    }
    
    const filePath = path.join(__dirname, "../uploads", filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: "File not found" 
      });
    }
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Excel file is empty" 
      });
    }
    
    // Validate the data
    const validationResults = validateTaskData(jsonData);
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: "Data validated",
      data: jsonData,
      errors: validationResults.errors,
      isValid: validationResults.isValid
    });
  } catch (error) {
    console.error("Error validating Excel file:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error validating Excel file", 
      error: error.message 
    });
  }
};

// Validate the task data
function validateTaskData(data) {
  const errors = [];
  const requiredFields = ["taskId", "projectName", "industry"];
  const taskIds = new Set();
  let isValid = true;
  
  // Check each row
  data.forEach((row, index) => {
    // Check required fields
    for (const field of requiredFields) {
      if (!row[field]) {
        errors.push(`Row ${index + 1} is missing required field: ${field}`);
        isValid = false;
      }
    }
    
    // Check for duplicate taskIds
    if (row.taskId) {
      if (taskIds.has(row.taskId)) {
        errors.push(`Duplicate taskId found: ${row.taskId} at row ${index + 1}`);
        isValid = false;
      } else {
        taskIds.add(row.taskId);
      }
    }
  });
  
  return { isValid, errors };
}

// Import tasks from validated data
exports.importTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No tasks provided for import" 
      });
    }
    
    const results = {
      successful: 0,
      failed: 0,
      failures: []
    };
    
    // Process each task
    for (const taskData of tasks) {
      try {
        // Add default fields if not present
        const task = {
          ...taskData,
          status: taskData.status || "Unclaimed",
          updatedBy: req.user ? req.user.id : "admin",
          lastUpdated: Date.now()
        };
        
        // Check if task already exists
        const existingTask = await Task.findOne({ taskId: task.taskId });
        if (existingTask) {
          results.failed++;
          results.failures.push({
            taskId: task.taskId,
            error: "Task ID already exists"
          });
          continue;
        }
        
        // Create the task
        await Task.create(task);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.failures.push({
          taskId: taskData.taskId || "Unknown",
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Created ${results.successful} tasks, failed to create ${results.failed} tasks.`,
      results
    });
  } catch (error) {
    console.error("Error importing tasks:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error importing tasks", 
      error: error.message 
    });
  }
};

// Get a template Excel file
exports.getTaskTemplate = (req, res) => {
  try {
    // Create template data
    const templateData = [
      {
        taskId: 'TASK-001',
        projectName: 'Web Application Security Assessment',
        industry: 'Technology',
        DomainLink: 'https://example.com',
        Batch: 'Batch-2023-Q1',
        toolLink: 'https://securitytool.example.com',
        userEmail: 'user@example.com',
        status: 'Unclaimed'
      }
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    
    // Create temp file path
    const tempFilePath = path.join(__dirname, "../uploads", "task_template.xlsx");
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Write to file
    XLSX.writeFile(wb, tempFilePath);
    
    // Send file
    res.setHeader('Content-Disposition', 'attachment; filename=task_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const filestream = fs.createReadStream(tempFilePath);
    filestream.pipe(res);
    
    // Clean up file after sending
    filestream.on('close', () => {
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error generating template", 
      error: error.message 
    });
  }
};