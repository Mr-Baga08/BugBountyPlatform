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

const AdminTaskStats = () => {
  const [stats, setStats] = useState({
    unclaimed: 0,
    inProgress: 0,
    completed: 0,
    reviewed: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch tasks
        const response = await axios.get(`${API_BASE_URL}/task`, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        
        // Calculate statistics
        const tasks = response.data;
        const unclaimed = tasks.filter(task => task.status === 'Unclaimed').length;
        const inProgress = tasks.filter(task => task.status === 'In Progress').length;
        const completed = tasks.filter(task => task.status === 'Completed').length;
        const reviewed = tasks.filter(task => task.status === 'Reviewed').length;
        const delivered = tasks.filter(task => task.status === 'Deliver').length;
        
        setStats({
          unclaimed,
          inProgress,
          completed,
          reviewed,
          delivered
        });
      } catch (error) {
        console.error('Error fetching task statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const statCards = [
    { name: 'Unclaimed Tasks', value: stats.unclaimed, color: 'bg-gray-100 text-gray-800' },
    { name: 'In Progress', value: stats.inProgress, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Completed', value: stats.completed, color: 'bg-green-100 text-green-800' },
    { name: 'Reviewed', value: stats.reviewed, color: 'bg-blue-100 text-blue-800' },
    { name: 'Delivered', value: stats.delivered, color: 'bg-purple-100 text-purple-800' }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status Overview</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div key={stat.name} className={`${stat.color} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm">{stat.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};