// vercel-server.js - Entry point for GCP Cloud Run deployment
const express = require("express");
const cors = require("cors");
const compression = require('compression');
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Import Routes
const userRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const taskRoute = require("./routes/taskRoutes");
const taskReviewRoutes = require("./routes/ReviewAndFeedback/reviewRoutes");
const finalReportRoutes = require("./routes/ReviewAndFeedback/finalReviewRoutes");
const scriptRoutes = require("./routes/scriptRoutes");
const textRoutes = require("./routes/textRoutes");
const videoRoutes = require("./routes/videoRoutes");
const taskHistoryRoutes = require("./routes/taskHistoryRoutes");
const taskLeaderboard = require("./routes/taskLeaderboard");
const taskImportRoutes = require("./routes/taskImportRoutes");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Enable gzip compression for better performance
app.use(compression());

// Connect to Database (but don't crash if it fails initially)
connectDB().catch(err => {
  console.error("Initial database connection error:", err.message);
  console.log("Will retry on subsequent requests");
});

// Define allowed origins or use wildcard for development
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['*'];

console.log("CORS Allowed Origins:", allowedOrigins);

// Handle preflight OPTIONS requests explicitly - critical for CORS
app.options('*', (req, res) => {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // For development, or if ALLOWED_ORIGINS contains '*', allow all origins
  if (allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
  } 
  // Otherwise check if the origin is in the allowed list
  else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  // Default fallback - allow for development
  else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Unrecognized origin in preflight: ${origin}`);
  }
  
  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Send 200 response for OPTIONS method
  res.status(200).end();
});

// CORS middleware for all other requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // For development, or if ALLOWED_ORIGINS contains '*', allow all origins
  if (allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
  } 
  // Otherwise check if the origin is in the allowed list
  else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  // Default fallback - allow for development
  else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Unrecognized origin: ${origin}`);
  }
  
  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Also use the cors middleware for additional safety
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes('*')) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      // Allow all origins during development/testing
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Standard middleware
app.use(express.json());
app.use(bodyParser.json());

// Health Check Endpoints for GCP Cloud Run
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "bug-hunt-platform-api",
    uptime: process.uptime()
  });
});

// API-prefixed health check for API clients
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "bug-hunt-platform-api",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime()
  });
});

// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS test successful",
    origin: req.headers.origin || "No origin header",
    allowedOrigins: allowedOrigins,
    headers: {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin') || 'not set',
      'access-control-allow-credentials': res.getHeader('access-control-allow-credentials') || 'not set'
    }
  });
});

// API Routes
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/task", taskRoute);
app.use("/api/taskReview", taskReviewRoutes);
app.use("/api/finalReport", finalReportRoutes);
app.use("/api/texts", textRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/task-history", taskHistoryRoutes);
app.use("/api", taskLeaderboard);
app.use("/api/task-import", taskImportRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bug Hunt Platform API",
    health: "/health",
    corsTest: "/api/cors-test"
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(500).json({
    error: true,
    message: err.message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start the server
const PORT = process.env.PORT || 8080; // GCP Cloud Run provides PORT env variable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for serverless environments
module.exports = app;