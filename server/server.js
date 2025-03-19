
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
const compression = require('compression'); 

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();



const cors = require('cors');

// List all possible origins for your application
const allowedOrigins = [
  // Frontend URLs
  'https://bug-bounty-platform-frontend-v1.vercel.app',
  'https://bug-bounty-platform-frontend-v1-git-main.vercel.app',
  'https://bug-bounty-platform-rmlo.vercel.app',
  'https://bug-bounty-platform.vercel.app',
  // Add any other frontend domains
  
  // Local development
  'http://localhost:5173',
  'http://localhost:3000'
];

// CORS options with proper configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log blocked origins for debugging
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Express middleware function that handles CORS properly including preflight requests
const setupCors = (app) => {
  // Handle preflight requests explicitly
  app.options('*', cors(corsOptions));
  
  // Apply CORS to all routes
  app.use(cors(corsOptions));
  
  // Add additional CORS headers to ensure compatibility
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
};

module.exports = setupCors;
// Use compression for all routes
app.use(compression());


// Other Middleware
app.use(express.json());
app.use(bodyParser.json());


// Connect to Database before setting up routes
(async () => {
    try {
        await connectDB();
        console.log('Database connected before setting up routes');
        
        // Routes setup
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
            res.status(200).json({ message: "API is running" });
        });
        
        // Catch-all error handler
        app.use((err, req, res, next) => {
            console.error('Global error handler:', err.stack);
            res.status(500).json({ 
                message: "Internal server error", 
                error: process.env.NODE_ENV === 'development' ? err.message : undefined 
            });
        });

    } catch (error) {
        console.error('Database connection error during startup:', error);
    }
})();

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
