// bug_dashboard/src/assets/Componets/Tool/tool.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Check, AlertCircle, CheckCircle, Moon, Sun,
  Plus, FileText, Upload, Trash2, Download, Eye, ExternalLink,
  HelpCircle, Code, BookOpen, Award, Server
} from "lucide-react";
import API_BASE_URL from '../AdminDashboard/config';
import emailjs from 'emailjs-com';

const SecurityTestingDashboard = () => {
  const location = useLocation();
  const projectTask = location.state || {};
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  // State variables for permissions and display settings
  const [isTaskOwner, setIsTaskOwner] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [finalReportVisible, setFinalReportVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [activeTab, setActiveTab] = useState("scripts"); // scripts, resources, help
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  
  // Task related data
  const [task, setTask] = useState(projectTask);
  const [allScripts, setAllScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [uploadedScripts, setUploadedScripts] = useState([]);
  
  // Form fields for script upload
  const [scriptName, setScriptName] = useState("");
  const [scriptCategory, setScriptCategory] = useState("");
  const [scriptDescription, setScriptDescription] = useState("");
  const [scriptFile, setScriptFile] = useState(null);
  
  // Form fields for review submission
  const [file, setFile] = useState(null);
  const [supportingFiles, setSupportingFiles] = useState(null);
  const [observedBehavior, setObservedBehavior] = useState("");
  const [vulnerabilities, setVulnerabilities] = useState("");
  const [reviewList, setReviewList] = useState([]);
  
  // Form fields for final report
  const [reportSummary, setReportSummary] = useState("");
  const [difficultyRating, setDifficultyRating] = useState("Medium");
  const [finalReportFile, setFinalReportFile] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddScriptForm, setShowAddScriptForm] = useState(false);
  
  // Resource links
  const [resources, setResources] = useState([
    { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
    { title: 'Web Security Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
    { title: 'Bug Bounty Methodology', url: 'https://github.com/KathanP19/HowToHunt' },
  ]);
  
  // Standard testing scripts templates
  const [standardScripts, setStandardScripts] = useState([
    { name: 'SQL Injection', description: 'Basic SQL injection testing', category: 'Injection' },
    { name: 'XSS Detection', description: 'Cross-site scripting test cases', category: 'XSS' },
    { name: 'CSRF Testing', description: 'Cross-site request forgery scenarios', category: 'CSRF' },
  ]);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Check if the current user is the owner of this task
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        setLoading(true);
        let taskData = projectTask;
        
        // If we don't have the task data from location state, fetch it
        if (!projectTask || !projectTask._id) {
          const response = await axios.get(`${API_BASE_URL}/task/${taskId}`, {
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          });
          
          taskData = response.data;
          setTask(taskData);
        }
        
        if (!taskData) {
          setError("Task not found");
          setLoading(false);
          return;
        }
        
        // Check if the current user is the task owner or has proper permissions
        if (userRole === 'hunter' && taskData.status === 'In Progress' && taskData.updatedBy === userName) {
          setIsTaskOwner(true);
          setCanSubmit(true);
        } else if (userRole === 'hunter' && taskData.status === 'Unclaimed') {
          // Unclaimed task - hunter should claim it first
          alert("Please claim this task first to start working on it");
          navigate(`/task/${taskId || taskData._id}`);
          return;
        } else if (userRole === 'hunter' && taskData.status !== 'Unclaimed' && taskData.updatedBy !== userName) {
          // Task is claimed by someone else
          alert("This task is being worked on by another user");
          navigate(`/task/${taskId || taskData._id}`);
          return;
        } else if (userRole === 'coach' || userRole === 'admin') {
          // Coaches and admins can view but not submit reviews for tasks
          setCanSubmit(true);
        }
        
        // Fetch scripts and reviews
        fetchScripts();
        fetchReviews();
        fetchUploads();
      } catch (error) {
        console.error("Error checking task ownership:", error);
        setError("Error loading task data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    checkOwnership();
  }, [projectTask, taskId, userRole, userName, navigate]);

  // Fetch all scripts for dropdown
  const fetchScripts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scripts`);
      setAllScripts(response.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  // Fetch existing uploads/scripts for this task
  const fetchUploads = async () => {
    try {
      // This endpoint would need to be implemented on the backend
      // For now, we'll just simulate with some dummy data
      setUploadedScripts([
        { id: '1', name: 'SQLi Basic Test', file: 'sqli-basic.txt', description: 'Tests for basic SQL injection vulnerabilities', category: 'Injection' },
        { id: '2', name: 'XSS Detection', file: 'xss-payload.js', description: 'Scripts to detect various XSS vulnerabilities', category: 'XSS' },
      ]);
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  // Fetch existing reviews for this task
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/taskReview/allreview/${taskId}`);
      if (response.data.allTask) {
        setReviewList(response.data.allTask);
        // Show final report option if there are already reviews
        if (response.data.allTask.length > 0) {
          setFinalReportVisible(true);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Handle file selection for script upload
  const handleScriptFileChange = (e) => {
    setScriptFile(e.target.files[0]);
  };

  // Handle script upload
  const handleScriptUpload = async (e) => {
    e.preventDefault();
    
    if (!scriptName || !scriptCategory || !scriptFile) {
      alert("Please fill all required fields and select a file");
      return;
    }
    
    try {
      // Here you would upload to your backend
      // For now, just simulate adding to the list
      const newScript = {
        id: Date.now().toString(),
        name: scriptName,
        file: scriptFile.name,
        description: scriptDescription,
        category: scriptCategory
      };
      
      setUploadedScripts([...uploadedScripts, newScript]);
      
      // Reset form
      setScriptName("");
      setScriptCategory("");
      setScriptDescription("");
      setScriptFile(null);
      
      // Reset file input
      document.getElementById('scriptUploadFile').value = '';
      
      // Hide form
      setShowAddScriptForm(false);
      
      alert("Script uploaded successfully!");
    } catch (error) {
      console.error("Error uploading script:", error);
      alert("Failed to upload script. Please try again.");
    }
  };

  // Handle file selection for review
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle supporting file selection
  const handleSupportingFilesChange = (e) => {
    setSupportingFiles(e.target.files[0]);
  };

  // Handle final report file selection
  const handleFinalReportFileChange = (e) => {
    setFinalReportFile(e.target.files[0]);
  };

  // Handle script selection
  const handleScriptChange = (e) => {
    const selectedId = e.target.value;
    
    if (selectedId === "") {
      setSelectedScript(null);
      return;
    }
    
    const script = allScripts.find((s) => s._id === selectedId);
    setSelectedScript(script || null);
  };

  // Handle task review submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Early return if user can't submit reviews
    if (!canSubmit) {
      alert("You don't have permission to submit reviews for this task");
      return;
    }

    if (!selectedScript || !selectedScript._id) {
      alert("Please select a script");
      return;
    }

    const formData = new FormData();
    if (!file) {
      alert("Please select a script file"); 
      return;
    }
    if (!supportingFiles) {
      alert("Please select supporting files"); 
      return;
    }
    
    formData.append("scriptId", selectedScript._id);
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
          message: `A new review has been submitted for task ${task.taskId || taskId}`,
          task_id: task.taskId || taskId,
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
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
      
      alert("Review submitted successfully!");

      // Update the review list and show final report option
      setReviewList([...reviewList, response.data.taskReview]);
      setFinalReportVisible(true);

      // Reset form fields
      setObservedBehavior("");
      setVulnerabilities("");
      setFile(null);
      setSupportingFiles(null);
      
      // Reset file input fields by clearing their values
      document.getElementById('scriptFile').value = '';
      document.getElementById('supportFile').value = '';
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  // Handle final report submission
  const handleFinalReportSubmit = async (e) => {
    e.preventDefault();
    
    // Early return if user can't submit reports
    if (!canSubmit) {
      alert("You don't have permission to submit final reports for this task");
      return;
    }
    
    if (!reportSummary.trim()) {
      alert("Please provide a report summary");
      return;
    }
    
    try {
      // First, upload the final report file if it exists
      let finalReportFileId = null;
      if (finalReportFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", finalReportFile);
        
        // This endpoint would need to be implemented
        // For now, just simulate successful upload
        console.log("Would upload final report file:", finalReportFile.name);
        finalReportFileId = "simulated-file-id";
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/finalReport/createOrUpdate`,
        {
          taskId: taskId,
          reportSummary: reportSummary,
          difficulty: difficultyRating,
          updatedBy: localStorage.getItem("userName"),
          userEmail: localStorage.getItem("userEmail"),
          finalReportFileId: finalReportFileId
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
          message: `Final report has been submitted for task ${task.taskId || taskId}`,
          task_id: task.taskId || taskId,
          status: 'Final Report Submitted',
          reply_to: 'noreply@bughuntplatform.com'
        };
        
        // Using EmailJS for frontend email sending
        await emailjs.send(
          'service_afpqudj',
          'template_6zz78vq',
          templateParams,
          'sNAmtd-Gt3OneaeG0'
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
      
      alert("Final report submitted successfully!");
      setReportSummary("");
      setFinalReportFile(null);
      document.getElementById('finalReportFile').value = '';
    }
    catch (error) {
      console.error("Error submitting final report:", error);
      alert("Failed to submit final report. Please try again.");
    }
  };

  // Delete uploaded script
  const handleDeleteScript = (scriptId) => {
    if (confirm("Are you sure you want to delete this script?")) {
      setUploadedScripts(uploadedScripts.filter(script => script.id !== scriptId));
    }
  };

  // Handle navigation back to task detail
  const handleBack = () => {
    navigate(`/task/${taskId}`);
  };

  // Download a script template
  const handleDownloadTemplate = (scriptName) => {
    alert(`Template for ${scriptName} would be downloaded here.`);
    // Implementation would depend on how you store templates
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={handleBack} 
            className="mt-2 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Task Ownership Banner */}
      {userRole === 'hunter' && (
        <div className={`mb-4 p-4 rounded-lg ${
          isTaskOwner 
            ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800" 
            : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800"
        }`}>
          {isTaskOwner ? (
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <p className="text-green-800 dark:text-green-300 font-medium">You are working on this task</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Submit your findings using the forms below. You can add multiple reviews and a final report.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-300 font-medium">You are viewing this task in read-only mode</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  You need to claim this task first before submitting reviews or reports.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Header & Resource Access */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{task.projectName || "Security Testing Tool"}</h1>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="mr-3">Task ID: {task.taskId || taskId}</span>
                {task.DomainLink && (
                  <a 
                    href={task.DomainLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" /> Domain Link
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
              task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
              'bg-gray-100 text-gray-800 dark:bg-gray-700/80 dark:text-gray-300'
            }`}>
              {task.status || "Status Unknown"}
            </span>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Resource Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-3 font-medium text-sm flex items-center ${
              activeTab === 'scripts'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('scripts')}
          >
            <Code className="h-4 w-4 mr-2" />
            Scripts & Testing
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex items-center ${
              activeTab === 'resources'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('resources')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex items-center ${
              activeTab === 'help'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Resources
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex items-center ${
              activeTab === 'standards'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('standards')}
          >
            <Server className="h-4 w-4 mr-2" />
            Standard Scripts
          </button>
        </div>
      </div>

      {/* Main Content Area - Changes based on active tab */}
      {activeTab === 'scripts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Script Management & Upload */}
          <div className="lg:col-span-2">
            {/* Script Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scripts & Testing</h2>
                <button
                  onClick={() => setShowAddScriptForm(!showAddScriptForm)}
                  className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                    showAddScriptForm
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200'
                  }`}
                >
                  {showAddScriptForm ? 'Cancel' : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Script
                    </>
                  )}
                </button>
              </div>
              
              {/* Add New Script Form */}
              {showAddScriptForm && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Add New Script</h3>
                  <form onSubmit={handleScriptUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Script Name*
                      </label>
                      <input
                        type="text"
                        value={scriptName}
                        onChange={(e) => setScriptName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="E.g., SQL Injection Test"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category*
                      </label>
                      <select
                        value={scriptCategory}
                        onChange={(e) => setScriptCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Injection">Injection</option>
                        <option value="Authentication">Authentication</option>
                        <option value="Authorization">Authorization</option>
                        <option value="XSS">Cross-site Scripting</option>
                        <option value="CSRF">Cross-site Request Forgery</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={scriptDescription}
                        onChange={(e) => setScriptDescription(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Describe what this script does..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Script File*
                      </label>
                      <input
                        type="file"
                        id="scriptUploadFile"
                        onChange={handleScriptFileChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Upload scripts, code, or testing files (.txt, .js, .py, etc.)
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Script
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Uploaded Scripts List */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Your Uploaded Scripts</h3>
                {uploadedScripts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <Upload className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No scripts uploaded yet.</p>
                    <button
                      onClick={() => setShowAddScriptForm(true)}
                      className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Upload your first script
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedScripts.map((script) => (
                      <div key={script.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">{script.name}</h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteScript(script.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete script"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{script.description || "No description provided"}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded">
                              {script.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-end md:justify-start">
                            <button 
                              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                              title="Download script file"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {script.file}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit Review Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submit Security Review</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Script Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Test Script
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onChange={handleScriptChange}
                    value={selectedScript?._id || ""}
                    disabled={!canSubmit}
                  >
                    <option value="">-- Select a script --</option>
                    {allScripts.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.category} - {s.activity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload - Script */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Script File
                  </label>
                  <input
                    type="file"
                    id="scriptFile"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={!canSubmit}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Upload your script file (.txt, .js, .py, etc.)
                  </p>
                </div>

                {/* File Upload - Supporting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Supporting Files
                  </label>
                  <input
                    type="file"
                    id="supportFile"
                    onChange={handleSupportingFilesChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={!canSubmit}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Upload supporting files (screenshots, logs, etc.)
                  </p>
                </div>

                {/* Observed Behavior */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observed Behavior
                  </label>
                  <textarea
                    value={observedBehavior}
                    onChange={(e) => setObservedBehavior(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe what you observed during testing..."
                    disabled={!canSubmit}
                  />
                </div>

                {/* Vulnerabilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vulnerabilities
                  </label>
                  <textarea
                    value={vulnerabilities}
                    onChange={(e) => setVulnerabilities(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe any vulnerabilities found..."
                    disabled={!canSubmit}
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                      canSubmit 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!canSubmit}
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>

            {/* Final Report Section - Only visible after at least one review */}
            {finalReportVisible && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submit Final Report</h2>
                
                <form onSubmit={handleFinalReportSubmit} className="space-y-4">
                  {/* Report Summary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Report Summary
                    </label>
                    <textarea
                      value={reportSummary}
                      onChange={(e) => setReportSummary(e.target.value)}
                      rows={6}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Provide a comprehensive summary of your findings..."
                      disabled={!canSubmit}
                    />
                  </div>

                  {/* Difficulty Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty Rating
                    </label>
                    <select
                      value={difficultyRating}
                      onChange={(e) => setDifficultyRating(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={!canSubmit}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  {/* Upload Final Report File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Final Report (Optional)
                    </label>
                    <input
                      type="file"
                      id="finalReportFile"
                      onChange={handleFinalReportFileChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={!canSubmit}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload a comprehensive final report document (PDF, DOCX, etc.)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        canSubmit 
                          ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canSubmit}
                    >
                      Submit Final Report
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Previous Reviews */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Previous Reviews</h2>
              
              {reviewList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No reviews submitted yet
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewList.map((review, index) => (
                    <div key={review._id || index} className="border p-4 rounded-lg shadow-md">
                      <p><strong>Reviewed By:</strong> {review.reviewBy}</p>
                      <p><strong>Observed Behavior:</strong> {review.observedBehavior}</p>
                      <p><strong>Vulnerabilities:</strong> {review.vulnerabilities}</p>
                      <p><strong>Last Review:</strong> {new Date(review.lastReview).toLocaleString()}</p>
                      
                      {/* Coach Feedback (if any) */}
                      {review.feedBack && review.feedBack !== "No reviewed" && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <p className="font-medium text-blue-700 dark:text-blue-400">Coach Feedback:</p>
                          <p className="text-blue-600 dark:text-blue-300">{review.feedBack}</p>
                        </div>
                      )}
                      
                      {/* Files */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.scriptFile && (
                          <button
                            onClick={() => handleDownloadFile(review.scriptFile)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Download className="h-3 w-3 mr-1" /> Script File
                          </button>
                        )}
                        
                        {review.supportFile && (
                          <button
                            onClick={() => handleDownloadFile(review.supportFile)}
                            className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            <Download className="h-3 w-3 mr-1" /> Support File
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Resources Tab Content */}
      {activeTab === 'resources' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Security References</h3>
              <ul className="space-y-3">
                {resources.map((resource, index) => (
                  <li key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{resource.title}</h4>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit Resource
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Project-Specific Resources</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Project Details</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li><strong>Industry:</strong> {task.industry}</li>
                  {task.Batch && <li><strong>Batch:</strong> {task.Batch}</li>}
                  {task.toolLink && (
                    <li>
                      <strong>Tool Link:</strong>{" "}
                      <a
                        href={task.toolLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Tool
                      </a>
                    </li>
                  )}
                </ul>
                
                <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Testing Guidelines</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p>This testing assignment requires careful analysis of the target system for security vulnerabilities. Focus on:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Authentication mechanisms</li>
                    <li>Authorization controls</li>
                    <li>Input validation</li>
                    <li>Session management</li>
                    <li>Data protection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Help & Resources Tab Content */}
      {activeTab === 'help' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Help & Documentation</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Using the Testing Tool</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>This tool helps you organize and submit your security testing findings. Follow these steps:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Upload your testing scripts and files</li>
                  <li>Document your findings in the review section</li>
                  <li>Provide supporting evidence (screenshots, logs, etc.)</li>
                  <li>Submit a comprehensive final report</li>
                </ol>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">FAQ</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">How many reviews can I submit?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">You can submit multiple reviews for a single task. Each review should focus on a specific aspect or vulnerability.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">When should I submit the final report?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">After submitting all your individual reviews, provide a final comprehensive report that summarizes all findings.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Who reviews my submissions?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Team Leads (coaches) review your submissions and provide feedback. Administrators make the final approval.</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Need More Help?</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p>If you need additional assistance, contact your Team Lead or Administrator.</p>
                <p className="mt-2">Email: support@bughuntplatform.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Standard Scripts Tab Content */}
      {activeTab === 'standards' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Standard Testing Scripts</h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            These are standard testing scripts and methodologies that can be used as templates for your security testing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardScripts.map((script, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 dark:text-white">{script.name}</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                    {script.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{script.description}</p>
                <button
                  onClick={() => handleDownloadTemplate(script.name)}
                  className="mt-3 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Template
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Testing Methodology Guidelines</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>When using these standard scripts, follow these guidelines:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Test all possible inputs and edge cases</li>
                <li>Document every step of your testing process</li>
                <li>Provide clear evidence for each finding</li>
                <li>Rate the severity of each vulnerability</li>
                <li>Suggest remediation steps when possible</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityTestingDashboard;