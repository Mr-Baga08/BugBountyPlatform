import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Moon, Sun, Search, Eye, LogOut, Trophy, 
  Calendar, Filter, ChevronDown, Home, Plus,
  Clock, CheckCircle, AlertCircle, FileText
} from "lucide-react";
import emailjs from 'emailjs-com';
import API_BASE_URL from '../../../assets/Componets/AdminDashboard/config';

export default function TaskDisplayView({ title, role }) {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const [status, setStatus] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [IndustryArray, setIndustryArray] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [project, setProject] = useState([]);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // Navigate to tool page
  const handleToolClick = (taskId, projectTask) => {
    if (role === "coach") {
      navigate(`/tool-coach/${taskId}`, { state: projectTask });
    } else if (role === "admin") {
      navigate(`/tool-admin/${taskId}`, { state: projectTask });
    } else {
      navigate(`/tool/${taskId}`, { state: projectTask });
    }
  };

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");

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
        setProject(data);

        // Extract unique industries for filter
        const industriesSet = new Set(data.map(task => task.industry));
        setIndustryArray(Array.from(industriesSet));
      } catch (error) {
        console.error("Unable to fetch tasks", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);


// Then, update the handleFinalReportSubmit function to include email notification

const handleFinalReportSubmit = async (e) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/finalReport/createOrUpdate`,
      {
        taskId: taskId,
        reportSummary: reportSummary,
        difficulty: difficultyRating,
        updatedBy: localStorage.getItem("userName"),
        userEmail: localStorage.getItem("userEmail")
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    // Send email notification to coach about final report submission
    try {
      // EmailJS parameters
      const templateParams = {
        to_name: 'Coach',
        from_name: localStorage.getItem("userName") || 'Hunter',
        message: `Final report has been submitted for task ${projectTask.taskId || taskId}`,
        task_id: projectTask.taskId || taskId,
        status: 'Final Report Submitted',
        reply_to: 'noreply@bughuntplatform.com'
      };
      
      // Using EmailJS for frontend email sending
      await emailjs.send(
        'service_afpqudj', // Replace with your EmailJS service ID
        'template_6zz78vq', // Replace with your EmailJS template ID for coach notifications
        templateParams,
        'sNAmtd-Gt3OneaeG0' // Replace with your EmailJS user ID
      );
      
      console.log('Email notification sent to coach about final report submission');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue execution even if email fails
    }
    
    alert("submitted successfully");
    setReportSummary("");
  }
  catch (e) {
    console.error("Error submitting final report:", e);
    alert("Not able to submit");
  }
};

// Also update the handleSubmit function for task review submission

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  if (!file) {
    alert("please select file"); 
    return;
  }
  if (!supportingFiles) {
    alert("please select supportingFiles"); 
    return;
  }
  formData.append("scriptId", script.scriptId);
  formData.append("scriptFile", file);
  formData.append("observedBehavior", observedBehavior);
  formData.append("vulnerabilities", vulnerabilities);
  formData.append("taskId", taskId);
  formData.append("supportFile", supportingFiles);
  formData.append("reviewBy", localStorage.getItem("userName"));

  try {
    const response = await axios.post(
      `${API_BASE_URL}/taskReview/create`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("Response:", response.data);
    
    // Send email notification to coach about review submission
    try {
      // EmailJS parameters
      const templateParams = {
        to_name: 'Coach',
        from_name: localStorage.getItem("userName") || 'Hunter',
        message: `A new review has been submitted for task ${projectTask.taskId || taskId}`,
        task_id: projectTask.taskId || taskId,
        status: 'Review Submitted',
        reply_to: 'noreply@bughuntplatform.com'
      };
      
      // Using EmailJS for frontend email sending
      await emailjs.send(
        'service_afpqudj',
        'template_6zz78vq',
        templateParams,
        'sNAmtd-Gt3OneaeG0'
      );
      
      console.log('Email notification sent to coach about review submission');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue execution even if email fails
    }
    
    alert("Review submitted successfully!");

    setReviewList([...reviewList, response.data.taskReview]);

    setObservedBehavior("");
    setVulnerabilities("");
    setFile(null);
    setSupportingFiles(null);
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to submit.", error);
  }
};

  // Handle task status change
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
            updatedBy: localStorage.getItem("userName"),
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update status");

      const data = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? data.updatedTask : task
        )
      );

      alert("Status updated successfully!");
    } catch (error) {
      alert("Error updating status");
    }
  };

  // Filter tasks based on search, status, industry and date
  useEffect(() => {
    const filtered = tasks.filter((task) => {
      let matchesSearch = 
        task.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.industry?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = status === "All" || task.status === status;
      let matchesIndustry = industry === "All" || task.industry === industry;
      
      let matchesDate = true;
      if (startDate && endDate) {
        const taskDate = new Date(task.lastUpdated).toISOString().split("T")[0];
        matchesDate = taskDate >= startDate && taskDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesIndustry && matchesDate;
    });
    
    setProject(filtered);
  }, [searchQuery, status, industry, startDate, endDate, tasks]);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Unclaimed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "Reviewed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Navigation Bar */}
      {/* <nav className="bg-white dark:bg-gray-800 shadow-md p-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/leaderboard"
              className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <span className="flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-yellow-300" />
                Leaderboard
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
              <span className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            </Link>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by Project Name, Task ID, or industry..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Section - Collapsible */}
            <div>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFilterOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      {["Unclaimed", "In Progress", "Completed", "Reviewed"].map(
                        (s) => (
                          <option key={s} value={s}>{s}</option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="All">All Industries</option>
                      {IndustryArray.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filters */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <input
                        type="date"
                        className="p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
              </div>
            ) : project.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mb-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search criteria.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {["Task ID", "Project Name", "Industry", "Tool Link", "Status", "Last Updated", "Updated By", 
                    role === "coach" ? "Actions" : null].filter(Boolean).map((heading) => (
                      <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {project.map((project) => (
                    <tr 
                      key={project._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                          onClick={() => navigate(`/task/${project._id}`)}
                        >
                          {project.taskId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {project.projectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {project.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToolClick(project._id, project)}
                          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Tool
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(project.lastUpdated)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {project.updatedBy}
                      </td>
                      {role === "coach" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button 
                              className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40 transition-colors duration-300"
                              title="Review"
                              onClick={() => handleToolClick(project._id, project)}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40 transition-colors duration-300"
                              title="Mark as Reviewed"
                              onClick={() => handleStatusChange("Reviewed", project._id)}
                            >
                              <CheckCircle className="h-4 w-4" />
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
  );
  
}