const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/auth');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');
const taskRoute = require('./routes/taskRoutes');
const taskReviewRoutes = require('./routes/ReviewAndFeedback/reviewRoutes');
const finalReportRoutes = require('./routes/ReviewAndFeedback/finalReviewRoutes');
const scriptRoutes = require("./routes/scriptRoutes");
const textRoutes = require("./routes/textRoutes");
const videoRoutes = require("./routes/videoRoutes");
const taskHistoryRoutes = require('./routes/taskHistoryRoutes');
const taskLeaderboard = require('./routes/taskLeaderboard');
const taskImportRoutes = require("./routes/taskImportRoutes");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Use JSON middleware
app.use(express.json());
app.use(bodyParser.json());

// Simple CORS configuration - during development, allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/task", taskRoute);
app.use("/api/taskReview", taskReviewRoutes);
app.use("/api/finalReport", finalReportRoutes);
app.use("/api/texts", textRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/scripts", scriptRoutes);
app.use('/api/task-history', taskHistoryRoutes);
app.use('/api', taskLeaderboard);
app.use("/api/task-import", taskImportRoutes);

// Root route
app.get("/", (req, res) => {
    console.log("Connected to backend...");
    res.status(200).json({ message: "API is running" });
}); 

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
