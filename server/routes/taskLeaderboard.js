
const express = require("express");
const router = express.Router();
const TaskChangeHistory = require("../models/TaskChangeHistory");

// Utility function to calculate date limits based on time range
const getDateLimit = (timeRange) => {
  const now = new Date();
  let dateLimit = new Date();

  if (timeRange === "weekly") {
    dateLimit.setDate(now.getDate() - 7);
  } else if (timeRange === "monthly") {
    dateLimit.setMonth(now.getMonth() - 1);
  } else if (timeRange === "quarterly") {
    dateLimit.setMonth(now.getMonth() - 3);
  }

  return dateLimit;
};

// Leaderboard route
router.get("/leaderboard", async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "weekly"; // Default to weekly
    const dateLimit = getDateLimit(timeRange);

    // Aggregate tasks completed per user within the given time range
    const leaderboardData = await TaskChangeHistory.aggregate([
      { 
        $match: { 
          lastUpdated: { $gte: dateLimit },  // Filter by time range
          
          changeBy: { $exists: true, $ne: null, $ne: "" }, // Ensure valid changeBy
          statusChangeTo: "Completed", // Only count 'Completed' tasks
          taskChangeId: { $exists: true } // Ensure valid taskChangeId
        } 
      },
      {
        $group: {
          _id: "$changeBy", // Group by user (changeBy field)          
          tasksCompleted: { $sum: 1 }, // Count completed tasks
        },
      },
      { $sort: { tasksCompleted: -1 } }, // Sort by tasks completed
      { $limit: 10 }, // Get top 10 users
    ]);

    res.json(leaderboardData.length ? leaderboardData : []); // Return data or empty array
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
});

module.exports = router;
