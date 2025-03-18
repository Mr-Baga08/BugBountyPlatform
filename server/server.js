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

// Add OPTIONS preflight handler before any other middleware
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://bug-bounty-platform-rmlo-oto0we9oe-mr-baga08s-projects.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// Use JSON middleware
app.use(express.json());
app.use(bodyParser.json());

// Configure CORS with expanded allowed origins
const allowedOrigins = [
  'https://bug-bounty-platform-rmlo-oto0we9oe-mr-baga08s-projects.vercel.app',
  'https://bug-bounty-platform-rmlo.vercel.app',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // For development or specific scenarios where origin might be null
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.some(allowedOrigin => {
      // Use includes to handle partial matches (for Vercel preview deployments)
      return origin.includes(allowedOrigin) || allowedOrigin.includes(origin);
    })) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      // Still return true to prevent blocking, but log the issue
      // This is a temporary solution to debug the issue
      callback(null, true);
      // In production, you might want to uncomment the following instead:
      // callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
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
app.use("/api/task-import", taskImportRoutes); // Add the new task import routes

// Root route
app.use("/", (req, res) => {
    console.log("Connected to backend...");
    res.status(200).json({ message: "API is running" });
}); 

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
