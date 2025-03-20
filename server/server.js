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

// ✅ **CORS Middleware Setup**
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🛑 CORS blocked request from: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// ✅ **Apply Middleware Before Routes**
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle Preflight Requests
app.use(compression()); // Compression for better performance
app.use(express.json());
app.use(bodyParser.json());

// ✅ **Log Incoming Requests (For Debugging)**
app.use((req, res, next) => {
  console.log(`📥 Incoming Request: ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// ✅ **Ensure CORS Headers Are Set for All Requests**
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ **Connect to Database Before Starting Server**
(async () => {
  try {
    await connectDB();
    console.log("✅ Database Connected");

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

    // ✅ **Root Route**
    app.get("/", (req, res) => {
      res.status(200).json({ message: "🚀 API is running" });
    });

    // ✅ **Global Error Handler**
    app.use((err, req, res, next) => {
      console.error("❌ Global Error Handler:", err.stack);
      res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // ✅ **Start Server**
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    process.exit(1);
  }
})();
