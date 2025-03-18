import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Target, ChevronLeft, Crown, Award } from "lucide-react";
import API_BASE_URL from '../AdminDashboard/config';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("weekly");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard`, {
        params: { timeRange },
      });
      
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      const formattedData = response.data.map((user, index) => ({
        id: index + 1,
        name: user._id !== null ? user._id : "Unknown",
        tasksCompleted: user.tasksCompleted || 0,
      }));
      
      setUsers(formattedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setUsers([]);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="text-yellow-400 w-6 h-6" />;
    if (rank === 2) return <Medal className="text-gray-400 w-6 h-6" />;
    if (rank === 3) return <Medal className="text-amber-600 w-6 h-6" />;
    return <Award className="text-blue-400 w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header with navigation */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300">
          <div className="flex flex-wrap justify-center space-x-2">
            {["weekly", "monthly", "quarterly"].map((range) => (
              <button
                key={range}
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  timeRange === range 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading leaderboard data...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">No data available for this time period.</p>
            </div>
          ) : (
            <div>
              {/* Top 3 Users Spotlight */}
              {users.length >= 3 && (
                <div className="flex flex-col items-center px-4 pt-8 pb-12 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Top Performers</h2>
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 shadow-md">
                        <FaMedal className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{users[1]?.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{users[1]?.tasksCompleted} tasks</p>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center -mt-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 shadow-lg ring-2 ring-yellow-400">
                        <FaCrown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{users[0]?.name}</p>
                      <p className="text-blue-600 dark:text-blue-400">{users[0]?.tasksCompleted} tasks</p>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 shadow-md">
                        <FaMedal className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
                      </div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{users[2]?.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{users[2]?.tasksCompleted} tasks</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Rankings Table */}
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rank</th>
                      <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Member</th>
                      <th className="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className={`border-b border-gray-200 dark:border-gray-700 ${
                          user.id <= 3 ? "bg-blue-50 dark:bg-blue-900/10" : ""
                        }`}
                      >
                        <td className="py-4 flex items-center">
                          <span className="flex items-center gap-2">
                            {getRankIcon(user.id)}
                            <span className={`
                              ${user.id <= 3 ? "font-bold" : ""}
                              ${user.id === 1 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}
                            `}>
                              #{user.id}
                            </span>
                          </span>
                        </td>
                        <td className={`py-4 ${user.id <= 3 ? "font-semibold" : ""} text-gray-800 dark:text-gray-200`}>{user.name}</td>
                        <td className="py-4 text-center">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                            {user.tasksCompleted}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;