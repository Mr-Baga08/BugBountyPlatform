import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserCheck, Shield, ChevronLeft, RefreshCw,
  FileUp, Grid, PlusCircle
} from "lucide-react";
import axios from "axios";
import TaskDisplayView from "../../../App/Common/Container/TaskDisplay/TaskDisplayView";
import PendingUserSection from "./PendingUserSection";
import TaskUploadComponent from "./TaskUploadComponent";
import Navbar from "../../../App/Common/Container/Appbar/NavBar";
import API_BASE_URL from "./config";

export default function AdminBoard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

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
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "approvals") {
      refreshPendingUsers();
    }
  };

  const approveUser = async (pendingUserId) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/approve-user`, { pendingUserId });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== pendingUserId));
      setPendingCount((prevCount) => prevCount - 1);
      alert("User approved successfully!");
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  const rejectUser = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/reject-user`, { userId });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      setPendingCount((prevCount) => prevCount - 1);
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

  const downloadTemplate = () => {
    window.location.href = `${API_BASE_URL}/task-import/template`;
  };

  const uploadTasks = async () => {
    if (errors.length > 0) {
      setUploadStatus({ success: false, message: "Please fix the errors before uploading." });
      return;
    }

    if (parsedData.length === 0) {
      setUploadStatus({ success: false, message: "No data to upload." });
      return;
    }

    setLoading(true);
    setUploadStatus(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/task-import/import`,
        { tasks: parsedData },
        { headers: { "Content-Type": "application/json", Authorization: localStorage.getItem("token") } }
      );

      setUploadStatus({ success: true, message: response.data.message, details: response.data.results.failures });

      if (response.data.results.failed === 0) {
        setFile(null);
        setParsedData([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus({ success: false, message: `Failed to upload tasks: ${error.response?.data?.message || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar title="Admin Dashboard" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6">
            <button onClick={() => handleTabChange("tasks")} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "tasks" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              <Grid className="w-4 h-4 mr-2" /> Task Dashboard
            </button>
            <button onClick={() => handleTabChange("createTasks")} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "createTasks" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              <PlusCircle className="w-4 h-4 mr-2" /> Create Tasks
            </button>
            <button onClick={() => handleTabChange("approvals")} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "approvals" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              <UserCheck className="w-4 h-4 mr-2" /> User Approvals ({pendingCount})
            </button>
          </nav>
        </div>
        {activeTab === "tasks" ? <TaskDisplayView title="" role="admin" /> : activeTab === "createTasks" ? <TaskUploadComponent /> : <PendingUserSection pendingUsers={pendingUsers} loading={loading} approveUser={approveUser} rejectUser={rejectUser} />}
      </div>
    </div>
  );
}
