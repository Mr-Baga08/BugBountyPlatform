const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const compression = require("compression");

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

// Initialize Express App
const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  'https://bug-bounty-platform-frontend-v1.vercel.app',
  'https://bug-bounty-platform-frontend-v1-git-main.vercel.app',
  'https://bug-bounty-platform-rmlo.vercel.app',
  'https://bug-bounty-platform.vercel.app',
  'bug-bounty-platform-frontend-v1-3tcc1hf0n-mr-baga08s-projects.vercel.app',
  'http://localhost:5173', // Local Development
  'http://localhost:3000'
];

// Get additional origins from environment variables
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

// ✅ **CORS Middleware Setup**
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🛑 CORS blocked request from: ${origin}`);
      callback(null, true); // Allow all origins in production temporarily
      // In strict mode use: callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// ✅ **Apply Middleware Before Routes**
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle Preflight Requests
app.use(compression()); // Compression for better performance
app.use(express.json());
app.use(bodyParser.json());

// ✅ **Log Incoming Requests (For Debugging)**
app.use((req, res, next) => {
  console.log(`📥 Request: ${req.method} ${req.url} from ${req.headers.origin || 'Unknown'}`);
  next();
});

// ✅ **Ensure CORS Headers Are Set for All Requests**
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*"); // Fallback
  }
  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ **DB Connection Middleware - Connect for each request**
app.use(async (req, res, next) => {
  try {
    // Only attempt to connect if not already connected
    if (!global.mongoose?.conn) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Request-time DB connection error:', error.message);
    res.status(500).json({ message: "Database connection error, please try again" });
  }
});

// ✅ **Setup Routes**
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

// CORS test endpoint - helpful for debugging
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

// ✅ **Root Route**
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "🚀 Bug Hunt Platform API",
    documentation: "/api/health",
    corsTest: "/api/cors-test"
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({ 
    message: "Bug Hunt Platform API is running",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      tasks: "/api/task",
      health: "/api/health"
    }
  });
});

// ✅ **Global Error Handler**
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Cannot ${req.method} ${req.path}`
  });
});

// For local development - Vercel uses the exported app
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;
