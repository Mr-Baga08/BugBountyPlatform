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
const resourceRoutes = require("./routes/resourceRoutes");



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

// Define hardcoded known frontend origins
const knownOrigins = [
  // Previously known origins
  'https://bug-bounty-platform-frontend-v1.vercel.app',
  'https://bug-bounty-platform-frontend-v1-git-main.vercel.app',
  'https://bug-bounty-platform-rmlo.vercel.app',
  'https://bug-bounty-platform.vercel.app',
  'bug-bounty-platform-frontend-v1-3tcc1hf0n-mr-baga08s-projects.vercel.app',
  'https://bug-hunt-platform-frontend-mwho12h1x-mr-baga08s-projects.vercel.app',
  
  // Assigned Vercel domains
  'https://bug-hunt-platform-frontend.vercel.app',
  'https://bug-hunt-platform-frontend-mr-baga08s-projects.vercel.app',
  'https://bug-hunt-platform-frontend-mr-baga08-mr-baga08s-projects.vercel.app',
  
  // Development origins
  'http://localhost:5173', 
  'http://localhost:3000'
];

// Get additional origins from environment variables
const envOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Combine all origins or use wildcard for development
const allowedOrigins = [...new Set([...knownOrigins, ...envOrigins])];

// Log all configured origins at startup
console.log("CORS Allowed Origins:", allowedOrigins);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'No origin'}`);
  if (req.method === 'OPTIONS') {
    console.log(`Access-Control-Request-Method: ${req.headers['access-control-request-method']}`);
    console.log(`Access-Control-Request-Headers: ${req.headers['access-control-request-headers']}`);
  }
  next();
});

// Handle preflight OPTIONS requests explicitly - critical for CORS
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Always set Access-Control-Allow-Origin to the requesting origin
  // This is the most permissive approach but ensures CORS works in development
  res.header('Access-Control-Allow-Origin', origin || '*');
  
  // Log the CORS decision
  if (origin) {
    console.log(`OPTIONS: Setting Access-Control-Allow-Origin to: ${origin}`);
  } else {
    console.log('OPTIONS: Setting Access-Control-Allow-Origin to: *');
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
  
  // Always set Access-Control-Allow-Origin to the requesting origin
  // This is the most permissive approach but ensures CORS works in development
  res.header('Access-Control-Allow-Origin', origin || '*');
  
  // Log the CORS decision
  if (origin) {
    console.log(`Setting Access-Control-Allow-Origin to: ${origin}`);
  } else {
    console.log('Setting Access-Control-Allow-Origin to: *');
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
    // Allow all origins
    callback(null, true);
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
    uptime: process.uptime(),
    corsConfig: {
      allowedOrigins
    }
  });
});

// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS test successful",
    origin: req.headers.origin || "No origin header",
    originInAllowedList: req.headers.origin ? allowedOrigins.includes(req.headers.origin) : false,
    corsResponseHeaders: {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin') || 'not set',
      'access-control-allow-credentials': res.getHeader('access-control-allow-credentials') || 'not set',
      'access-control-allow-methods': res.getHeader('access-control-allow-methods') || 'not set'
    },
    allowedOrigins
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
app.use("/api", resourceRoutes);


// Add to your server.js or routes file
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendVerificationEmail } = require('./config/email');
    const result = await sendVerificationEmail({
      username: 'TestUser',
      email: 'test@example.com',
      role: 'hunter'
    });
    res.status(200).json({ success: true, message: 'Test email sent' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bug Hunt Platform API",
    health: "/health",
    corsTest: "/api/cors-test",
    version: "1.0.1",
    environment: process.env.NODE_ENV || "development"
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
const PORT = process.env.PORT || 8081; // GCP Cloud Run provides PORT env variable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS configuration: ${allowedOrigins.includes('*') ? 'allowing all origins' : 'restricted to specific origins'}`);
});

// Add graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  });
});

// const PORT = process.env.PORT || 8081;
// app.listen(PORT, () => {
//   console.log(`🚀 Server starting...`);
//   console.log(`✅ Running on port: ${PORT}`);
//   console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
// });

// Export for serverless environments
module.exports = app;