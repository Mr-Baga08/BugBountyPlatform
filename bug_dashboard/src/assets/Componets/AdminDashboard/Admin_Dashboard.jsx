// bug_dashboard/src/assets/Componets/AdminDashboard/Admin_Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserCheck, Shield, ChevronLeft, RefreshCw,
  FileUp, Grid, PlusCircle, FileText
} from "lucide-react";
import axios from "axios";
import TaskDisplayView from "../../../App/Common/Container/TaskDisplay/TaskDisplayView";
import PendingUserSection from "./PendingUserSection";
import TaskUploadComponent from "./TaskUploadComponent";
import Navbar from "../../../App/Common/Container/Appbar/NavBar";
import API_BASE_URL from "./config";
import AdminResourceManager from './AdminResourceManager';
// Remove or comment out the problematic import
// import TrialExpirationNotice from "../Pricing/TrialExpirationNotice";

export default function AdminBoard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verify admin access
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch pending users count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/pending-users`);
        const users = Array.isArray(response.data) ? response.data : [];
        setPendingCount(users.length);
        setPendingUsers(users);
      } catch (error) {
        console.error("Error fetching pending users count", error);
        setPendingCount(0);
      }
    };

    fetchPendingCount();
    
    // Set up interval to check for new pending users
    const interval = setInterval(fetchPendingCount, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "approvals") {
      setLoading(true);
      axios.get(`${API_BASE_URL}/auth/pending-users`)
        .then(response => {
          setPendingUsers(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching pending users", error);
          setPendingUsers([]);
          setLoading(false);
        });
    }
  };

  // Handle user approval
  const approveUser = async (pendingUserId) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/approve-user`, { pendingUserId });
      setPendingUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((user) => user._id !== pendingUserId);
        setPendingCount(updatedUsers.length);
        return updatedUsers;
      });
      
      // Show success notification
      alert("User approved successfully!");
    } catch (error) {
      console.error("Error approving user:", error.response?.data || error.message);
      alert("Failed to approve user. Please try again.");
    }
  };

  // Handle user rejection
  const rejectUser = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/reject-user`, { userId });
      setPendingUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((user) => user._id !== userId);
        setPendingCount(updatedUsers.length);
        return updatedUsers;
      });
      
      // Show success notification
      alert("User rejected successfully.");
    } catch (error) {
      console.error("Error rejecting user", error);
      alert("Failed to reject user. Please try again.");
    }
  };

  const refreshPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/pending-users`);
      setPendingUsers(Array.isArray(response.data) ? response.data : []);
      setPendingCount(Array.isArray(response.data) ? response.data.length : 0);
    } catch (error) {
      console.error("Error refreshing pending users", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar title="Admin Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Commented out the TrialExpirationNotice component since it doesn't exist yet 
        {isTrialAccount && <TrialExpirationNotice />} */}
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => handleTabChange("tasks")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "tasks"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                } transition-colors duration-300`}
              >
                <Grid className="w-4 h-4 mr-2" />
                Task Dashboard
              </button>
              <button
                onClick={() => handleTabChange("createTasks")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "createTasks"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                } transition-colors duration-300`}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Tasks
              </button>
              <button
                onClick={() => handleTabChange("approvals")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "approvals"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                } transition-colors duration-300`}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                User Approvals
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange("resources")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "resources"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                } transition-colors duration-300`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Resources
              </button>
              {activeTab === "approvals" && (
                <button
                  onClick={refreshPendingUsers}
                  className="ml-auto py-4 px-1 font-medium text-sm flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "resources" ? (
          <AdminResourceManager />
        ) : activeTab === "tasks" ? (
          <TaskDisplayView title="" role="admin" />
        ) : activeTab === "createTasks" ? (
          <TaskUploadComponent />
        ) : (
          <PendingUserSection 
            pendingUsers={pendingUsers} 
            loading={loading} 
            approveUser={approveUser} 
            rejectUser={rejectUser} 
          />
        )}
      </div>
    </div>
  );
}