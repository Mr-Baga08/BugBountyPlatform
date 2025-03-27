import React, { useState, useEffect } from "react";
import { Search, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Appbar/NavBar";
import API_BASE_URL from '../../../../assets/Componets/AdminDashboard/config';

export default function TaskDisplayView({ title, role }) {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);

  // Column parameters based on role
  const [columns, setColumns] = useState([
    "Task ID",
    "Project Name",
    "Industry",
    "Tool Link",
    "Status",
    "Last Updated",
    "Updated By",
  ]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Handle tool/task click
  const handleToolClick = (taskId, projectTask) => {
    // For Hunter role, navigate to the hunter tool page
    if (role === "hunter") {
      navigate(`/tool/${taskId}`, { state: projectTask });
    } 
    // For Coach role, navigate to coach review page
    else if (role === "coach") {
      navigate(`/coach/review/${taskId}`, { state: projectTask });
    } 
    // For Admin role, navigate to admin review page
    else if (role === "admin") {
      navigate(`/admin/review/${taskId}`, { state: projectTask });
    }
  };

  // Handle task detail click
  const handleTaskClick = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/task`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);

        // Extract unique industries for filter dropdown
        const uniqueIndustries = [...new Set(data.map(task => task.industry))];
        setIndustries(uniqueIndustries);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
        setFilteredTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Add action column for coach role
  useEffect(() => {
    if (role === "coach") {
      setColumns(prev => [...prev, "Action"]);
    }
  }, [role]);

  // Filter tasks based on search, status, industry and date range
  useEffect(() => {
    if (tasks.length === 0) return;

    let filtered = [...tasks];

    // Apply status filter
    if (status !== "All") {
      filtered = filtered.filter(task => task.status === status);
    }

    // Apply industry filter
    if (industry !== "All") {
      filtered = filtered.filter(task => task.industry === industry);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.taskId.toLowerCase().includes(query) ||
          task.projectName.toLowerCase().includes(query) ||
          task.industry.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.lastUpdated).toISOString().split("T")[0];
        return taskDate >= startDate && taskDate <= endDate;
      });
    }

    setFilteredTasks(filtered);
  }, [searchQuery, status, industry, startDate, endDate, tasks]);

  // Handle status change for a task
  const handleStatusChange = async (newStatus, taskId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/task/update-status/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            status: newStatus,
            updatedBy: localStorage.getItem("userName")
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const data = await response.json();

      // Update tasks state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? data.updatedTask : task
        )
      );

      // Show success message
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Unclaimed":
        return "bg-gray-200 text-gray-800";
      case "In Progress":
        return "bg-yellow-200 text-yellow-800";
      case "Completed":
        return "bg-green-200 text-green-800";
      case "Reviewed":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* <Navbar 
          title={title} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        /> */}

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Project Name, Task ID, or Industry..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Status Filter */}
              <select
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {["Unclaimed", "In Progress", "Completed", "Reviewed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Industry Filter */}
              <select
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="All">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              {/* Placeholder for third filter or action button */}
              <div></div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Task Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  No tasks found matching your criteria
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {columns.map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTasks.map((task) => (
                      <tr 
                        key={task._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                          onClick={() => handleTaskClick(task._id)}
                        >
                          {task.taskId}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {task.projectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {task.industry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleToolClick(task._id, task)}
                          className="text-blue-500 hover:text-blue-700 hover:underline font-medium transition-colors duration-150"
                        >
                          {role === "hunter" ? "View Tool" : 
                          role === "coach" ? "Review Task" : "Admin Review"}
                        </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {role === "coach" ? (
                            <select
                              className={`px-3 py-1 text-xs font-medium rounded-full border-0 ${getStatusBadgeColor(task.status)}`}
                              value={task.status}
                              onChange={(e) => handleStatusChange(e.target.value, task._id)}
                            >
                              {["Unclaimed", "In Progress", "Completed", "Reviewed"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(task.status)}`}>
                              {task.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {new Date(task.lastUpdated).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {task.updatedBy}
                        </td>
                        {role === "coach" && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button className="inline-flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-medium transition-colors duration-150">
                                <Edit size={14} className="mr-1" /> Edit
                              </button>
                              <button className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors duration-150">
                                <Eye size={14} className="mr-1" /> Review
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}