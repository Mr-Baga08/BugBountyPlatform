// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const userRoutes = require('./routes/auth');
// const dotenv = require('dotenv');
// const adminRoutes = require('./routes/adminRoutes');
// const taskRoute = require('./routes/taskRoutes');
// const taskReviewRoutes = require('./routes/ReviewAndFeedback/reviewRoutes');
// const finalReportRoutes = require('./routes/ReviewAndFeedback/finalReviewRoutes');
// const scriptRoutes = require("./routes/scriptRoutes");
// const textRoutes = require("./routes/textRoutes");
// const videoRoutes = require("./routes/videoRoutes");
// const taskHistoryRoutes = require('./routes/taskHistoryRoutes');
// const taskLeaderboard = require('./routes/taskLeaderboard');
// const taskImportRoutes = require("./routes/taskImportRoutes");

// // Load environment variables
// dotenv.config();

// // Initialize Express
// // const express = require('express');
// // const app = express();

// // // Define trusted origins
// // const trustedOrigins = [
// //   'https://bug-bounty-platform-rmlo.vercel.app',
// //    'https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app',
// //    'https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app',
// // ];

// // app.use((req, res, next) => {
// //   const origin = req.headers.origin;
// //   if (trustedOrigins.includes(origin)) {
// //     // If the origin is in the trusted list, allow it
// //     res.setHeader('Access-Control-Allow-Origin', origin);
// //     // Add other headers as needed
// //     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
// //     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// //   }
// //   next();
// // });

// const express = require('express');
// const cors = require('cors');
// const app = express();

// const allowedOrigins = [
//   'https://bug-bounty-platform-rmlo.vercel.app',
//    'https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app',
//    'https://bug-bounty-platform-rmlo-kdolidgrp-mr-baga08s-projects.vercel.app',
// ];;

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.includes(origin) || !origin) { // Allow requests with no origin (like from curl or mobile apps)
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'], // Allowed methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
//   credentials: true // If you are sending cookies
// };

// app.use(cors(corsOptions)); // Enable CORS for all routes

// // // Add CORS headers to all responses
// // // CORS configuration - SIMPLE VERSION
// // app.use((req, res, next) => {
// //   // Get the origin from the request headers
// //   const origin = req.headers.origin;
  
// //   // If the origin is from a bug-bounty-platform-rmlo deployment, allow it
// //   if (origin && (
// //     origin.includes('bug-bounty-platform-rmlo') || 
// //     origin.includes('localhost')
// //   )) {
// //     res.header('Access-Control-Allow-Origin', origin);
// //   } else {
// //     // For all other origins, use a wildcard during development
// //     res.header('Access-Control-Allow-Origin', '*');
// //   }
  
// //   // Rest of your CORS headers
// //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
// //   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
// //   res.header('Access-Control-Allow-Credentials', 'true');
  
// //   // Handle preflight requests
// //   if (req.method === 'OPTIONS') {
// //     return res.status(204).end();
// //   }
  
// //   next();
// // });

// // Remove the existing CORS middleware or replace it with:
// // app.use(cors({ 
// //   origin: '*',  // During development/testing
// //   credentials: true
// // }));

// // Use JSON middleware
// // app.use(express.json());
// // app.use(bodyParser.json());

// // // Simple CORS configuration - during development, allow all origins
// // app.use(cors({
// //   origin: ['https://bug-bounty-platform-rmlo.vercel.app',
// //            'https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app',
// //            'https://bug-bounty-platform-rmlo-ok80c5vm1-mr-baga08s-projects.vercel.app'],
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// //   credentials: true
// // }));

// // app.options('*', cors());
// // Connect to database
// connectDB();

// // Routes
// app.use('/api/auth', userRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/task", taskRoute);
// app.use("/api/taskReview", taskReviewRoutes);
// app.use("/api/finalReport", finalReportRoutes);
// app.use("/api/texts", textRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/scripts", scriptRoutes);
// app.use('/api/task-history', taskHistoryRoutes);
// app.use('/api', taskLeaderboard);
// app.use("/api/task-import", taskImportRoutes);

// // Root route
// app.get("/", (req, res) => {
//     console.log("Connected to backend...");
//     res.status(200).json({ message: "API is running" });
// }); 

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;


const express = require("express");
const cors = require("cors");
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

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Allowed Origins
const allowedOrigins = [
  "https://bug-bounty-platform-rmlo.vercel.app",
  "https://bug-bounty-platform-rmlo-git-main-mr-baga08s-projects.vercel.app",
  "https://bug-bounty-platform-rmlo-ok80c5vm1-mr-baga08s-projects.vercel.app",
];

// Use CORS Middleware


// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
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
