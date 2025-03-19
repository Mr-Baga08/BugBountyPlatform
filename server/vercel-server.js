// // vercel-server.js - Optimized entry point for Vercel deployment
// const express = require("express");
// const cors = require("cors");
// const compression = require('compression');
// const bodyParser = require("body-parser");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");

// // Import Routes
// const userRoutes = require("./routes/auth");
// const adminRoutes = require("./routes/adminRoutes");
// const taskRoute = require("./routes/taskRoutes");
// const taskReviewRoutes = require("./routes/ReviewAndFeedback/reviewRoutes");
// const finalReportRoutes = require("./routes/ReviewAndFeedback/finalReviewRoutes");
// const scriptRoutes = require("./routes/scriptRoutes");
// const textRoutes = require("./routes/textRoutes");
// const videoRoutes = require("./routes/videoRoutes");
// const taskHistoryRoutes = require("./routes/taskHistoryRoutes");
// const taskLeaderboard = require("./routes/taskLeaderboard");
// const taskImportRoutes = require("./routes/taskImportRoutes");

// // Load environment variables
// dotenv.config();

// // Create Express app
// const app = express();

// // Enable gzip compression for better performance
// app.use(compression());

// // Connect to Database (but don't crash if it fails initially)
// connectDB().catch(err => {
//   console.error("Initial database connection error:", err.message);
//   console.log("Will retry on subsequent requests");
// });

// // ============================================================================
// // CORS CONFIGURATION - CRITICAL FOR VERCEL DEPLOYMENTS
// // ============================================================================

// // Define all possible frontend origins
// const knownOrigins = [
//   // Production domains
//   "https://bug-bounty-platform-rmlo.vercel.app",
//   "https://bug-bounty-platform.vercel.app",
//   // Preview/development domains
//   "https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app",
//   "https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app",
//   // Local development
//   "http://localhost:5173"
// ];

// // Get additional origins from environment variables
// const envOrigins = process.env.ALLOWED_ORIGINS 
//   ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
//   : [];

// // Combine all origins
// const allowedOrigins = [...new Set([...knownOrigins, ...envOrigins])];

// // Log configured origins (helpful for debugging)
// console.log("CORS allowed origins:", allowedOrigins);

// // Configure CORS middleware with proper error handling
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) {
//       return callback(null, true);
//     }
    
//     // Check if origin is allowed
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       // For security in production, log rejected origins but don't expose details
//       console.log(`CORS blocked origin: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // Pre-flight OPTIONS requests
// app.options('*', cors());

// // ============================================================================
// // REGULAR SERVER CONFIGURATION
// // ============================================================================

// // Standard middleware
// app.use(express.json());
// app.use(bodyParser.json());

// // API Routes
// app.use("/api/auth", userRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/task", taskRoute);
// app.use("/api/taskReview", taskReviewRoutes);
// app.use("/api/finalReport", finalReportRoutes);
// app.use("/api/texts", textRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/scripts", scriptRoutes);
// app.use("/api/task-history", taskHistoryRoutes);
// app.use("/api", taskLeaderboard);
// app.use("/api/task-import", taskImportRoutes);

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     message: "API is running",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development"
//   });
// });

// // Test endpoint for CORS verification
// app.get("/api/cors-test", (req, res) => {
//   res.status(200).json({
//     origin: req.headers.origin || "No origin",
//     success: true,
//     message: "CORS is properly configured!"
//   });
// });

// // Simple endpoint to get API version
// app.get("/api/version", (req, res) => {
//   res.status(200).json({
//     version: "1.0.0",
//     timestamp: new Date().toISOString()
//   });
// });

// // Root route
// app.get("/", (req, res) => {
//   res.status(200).json({
//     message: "Bug Hunt Platform API",
//     docs: "/api/docs",
//     health: "/api/health"
//   });
// });

// // Global error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Global error:", err.message);
//   res.status(500).json({
//     error: true,
//     message: err.message,
//     // Only show stack trace in development
//     ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
//   });
// });

// // 404 handler - must be last
// app.use((req, res) => {
//   res.status(404).json({
//     error: true,
//     message: `Cannot ${req.method} ${req.path}`
//   });
// });

// // For local development only - Vercel uses the exported app
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// // Export for Vercel serverless deployment
// module.exports = app;

// vercel-server.js - Optimized entry point for Vercel deployment
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
const corsTestRoutes = require("./routes/corsTestRoutes");

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

// ============================================================================
// CORS CONFIGURATION - CRITICAL FOR VERCEL DEPLOYMENTS
// ============================================================================

// Define all possible frontend origins
const knownOrigins = [
  // Production domains
  "https://bug-bounty-platform-rmlo.vercel.app",
  "https://bug-bounty-platform.vercel.app",
  // Preview/development domains
  "https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app",
  "https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app",
  // Local development
  "http://localhost:5173"
];

// Get additional origins from environment variables
const envOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Combine all origins
const allowedOrigins = [...new Set([...knownOrigins, ...envOrigins])];

// Log configured origins (helpful for debugging)
console.log("CORS allowed origins:", allowedOrigins);

// Configure CORS middleware with proper error handling
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For security in production, log rejected origins but don't expose details
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Pre-flight OPTIONS requests
app.options('*', cors());

// ============================================================================
// REGULAR SERVER CONFIGURATION
// ============================================================================

// Standard middleware
app.use(express.json());
app.use(bodyParser.json());

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Test endpoint for CORS verification
app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    origin: req.headers.origin || "No origin",
    success: true,
    message: "CORS is properly configured!"
  });
});

// Simple endpoint to get API version
app.get("/api/version", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bug Hunt Platform API",
    docs: "/api/docs",
    health: "/api/health"
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

// For local development only - Vercel uses the exported app
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;
