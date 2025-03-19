
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Import Routes (These are fine as they are)
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



// Explicitly adding CORS headers to every response
app.use((req, res, next) => {
  // Get origin from request headers
  const origin = req.headers.origin;
  
  // Allow all origins in the allowedOrigins array
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Set other CORS headers
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Keep the regular CORS middleware as a backup
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // During deployment, allow all origins temporarily
      callback(null, true);
      // Once everything is stable, you can reinstate strict CORS:
      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Allowed Origins -  DYNAMIC from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "https://bug-bounty-platform-rmlo.vercel.app",
        "https://bug-bounty-platform.vercel.app",
        "https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app",
        "https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app",
        "http://localhost:5173" //For local development
    ];

// CORS Configuration -  DYNAMIC origin handling
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            // Allow requests with no origin (mobile apps, curl)
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            // Allowed origin
            return callback(null, true);
        } else {
            // Blocked origin
            console.error("CORS Blocked Origin:", origin);
            return callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, //  IMPORTANT: Allows cookies/authorization headers
    maxAge: 86400, // Cache preflight response for 24 hours (optional)
};

// Apply CORS middleware to ALL routes
app.use(cors(corsOptions));

// Explicitly handle preflight requests (best practice)
app.options("*", cors(corsOptions));

// Other Middleware
app.use(express.json());
app.use(bodyParser.json());

// Connect to Database
connectDB();

// Routes (These are all fine)
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

// Root Route
app.get("/", (req, res) => {
    console.log("Connected to backend...");
    res.status(200).json({ message: "API is running" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
