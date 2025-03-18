import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Moon, Sun, LogOut, Trophy, Home, UserCheck, UserX,
  Users, Check, X, RefreshCw, Filter, ChevronDown 
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "./config";
import Navbar from "../../../App/Common/Container/Appbar/NavBar";

export default function Admin() {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const navigate = useNavigate();

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

  // Verify admin access
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch pending users on component mount
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/auth/pending-users`);
      setPendingUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching pending users", error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter pending users by search query and role
  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Handle user approval
  const approveUser = async (pendingUserId) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/approve-user`, { pendingUserId });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== pendingUserId));
      
      // Show success notification
      const successElement = document.getElementById("success-notification");
      if (successElement) {
        successElement.classList.remove("opacity-0");
        successElement.classList.add("opacity-100");
        setTimeout(() => {
          successElement.classList.remove("opacity-100");
          successElement.classList.add("opacity-0");
        }, 3000);
      }
    } catch (error) {
      console.error("Error approving user:", error.response?.data || error.message);
      alert("Failed to approve user");
    }
  };

  // Handle user rejection
  const rejectUser = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/reject-user`, { userId });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      
      // Show rejection notification
      const rejectionElement = document.getElementById("rejection-notification");
      if (rejectionElement) {
        rejectionElement.classList.remove("opacity-0");
        rejectionElement.classList.add("opacity-100");
        setTimeout(() => {
          rejectionElement.classList.remove("opacity-100");
          rejectionElement.classList.add("opacity-0");
        }, 3000);
      }
    } catch (error) {
      console.error("Error rejecting user", error);
      alert("Failed to reject user");
    }
  };

  return (
    <>
      <Navbar title="Admin Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Approval Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage user registration requests
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link 
              to="/admin-dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-300"
            >
              <Home className="h-4 w-4 mr-2" />
              Task Dashboard
            </Link>
            <button 
              onClick={fetchPendingUsers}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Success Notification */}
        <div 
          id="success-notification" 
          className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-300 opacity-0 z-50"
        >
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <p>User approved successfully!</p>
          </div>
        </div>
        
        {/* Rejection Notification */}
        <div 
          id="rejection-notification" 
          className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md transition-opacity duration-300 opacity-0 z-50"
        >
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            <p>User rejected successfully.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  <Filter className="w-4 h-4" />
                  Filter by Role
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFilterExpanded ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isFilterExpanded && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterRole("all");
                          setIsFilterExpanded(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          filterRole === "all" 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        } transition-colors duration-300`}
                      >
                        All Roles
                      </button>
                      <button
                        onClick={() => {
                          setFilterRole("coach");
                          setIsFilterExpanded(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          filterRole === "coach" 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        } transition-colors duration-300`}
                      >
                        Team Lead (Coach)
                      </button>
                      <button
                        onClick={() => {
                          setFilterRole("hunter");
                          setIsFilterExpanded(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          filterRole === "hunter" 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        } transition-colors duration-300`}
                      >
                        Security Hunter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Users List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading pending users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              {pendingUsers.length === 0 ? (
                <>
                  <div className="mb-4">
                    <UserCheck className="h-12 w-12 mx-auto text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending approvals</h3>
                  <p className="text-gray-600 dark:text-gray-400">All user requests have been processed.</p>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <Users className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching users</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "coach" 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}>
                          {user.role === "coach" ? "Team Lead" : "Security Hunter"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveUser(user._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Summary Footer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  "Loading..."
                ) : (
                  <span>
                    Showing {filteredUsers.length} of {pendingUsers.length} pending users
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Click
                </span>
                <button 
                  onClick={fetchPendingUsers}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-300"
                >
                  refresh
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  to update
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}