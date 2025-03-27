import React, { useEffect, useState } from "react";
import { ChevronDown, Upload, Plus, FileText, Video, X, BookOpen } from "lucide-react";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import API_BASE_URL from '../AdminDashboard/config';

const SecurityTestingDashboard = () => {
  const location = useLocation();
  const projectTask = location.state || {};
  const [scriptName, setScriptName] = useState("");
  const [category, setCategory] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [difficultyRating, setDifficultyRating] = useState("Medium");
  const [isTestingScriptsOpen, setIsTestingScriptsOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);
  const [observedBehavior, setObservedBehavior] = useState("");
  const [vulnerabilities, setVulnerabilities] = useState("");
  const [file, setFile] = useState(null);
  const [supportingFiles, setSupportingFiles] = useState(null);
  const { taskId } = useParams(); // Extract taskId from URL
  const [reviewList, setReviewList] = useState([]);
  const [dbScripts, setDbScripts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [script, setScript] = useState({});
  const [newScript, setNewScript] = useState({
    name: "",
    category: "",
    code: "",
  });
  
  // Resources panel state
  const [showResources, setShowResources] = useState(false);
  const [resources, setResources] = useState({ texts: [], videos: [] });
  const [resourceType, setResourceType] = useState("text"); // "text" or "video"
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceSearchTerm, setResourceSearchTerm] = useState("");
  const [isResourcesLoading, setIsResourcesLoading] = useState(false);
  // Add these states to the existing state declarations in tool.jsx
  const [coachFeedback, setCoachFeedback] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const fetchTaskReview = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/taskReview/allreview/${taskId}`
        );
        const data = await response.json();
        setReviewList(data.allTask);
        console.log(data);
        reviewList.map((index) => {
          console.log(index);
        });
        console.log(Array.isArray(reviewList));
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchTaskReview();
  }, []);

  // Role selection state
  const [selectedRole, setSelectedRole] = useState("hunter");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const role = localStorage.getItem('userRole')
  const roles = [
    { id: "Hunter", label: "View as Hunter" },
    { id: "coach", label: "View as Coach" },
    { id: "admin", label: "View as Admin" },
  ];

  const fetchScripts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scripts`);
      console.log("Fetched scripts:", response.data);
      setDbScripts(response.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  // Fetch resource data when the resources panel is opened
  useEffect(() => {
    if (showResources) {
      fetchResources();
    }
  }, [showResources]);

  const fetchResources = async () => {
    setIsResourcesLoading(true);
    try {
      const [textResponse, videoResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/texts`),
        axios.get(`${API_BASE_URL}/videos`)
      ]);
      
      setResources({
        texts: textResponse.data || [],
        videos: videoResponse.data || []
      });
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsResourcesLoading(false);
    }
  };

  // Filter the fetched scripts based on search term
  const filteredScripts = dbScripts.filter((script) => {
    const cat = script.category || "";
    const act = script.activity || "";
    return (
      cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter resources based on search term
  const filteredResources = resourceType === "text" 
    ? resources.texts.filter(doc => 
        doc.title.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(resourceSearchTerm.toLowerCase())
      )
    : resources.videos.filter(video => 
        video.title.toLowerCase().includes(resourceSearchTerm.toLowerCase())
      );

  // Handle input changes for the new script form
  const handleNewScriptInputChange = (e) => {
    setNewScript({ ...newScript, [e.target.name]: e.target.value });
  };

  // Handle new script submission – note the keys we send!
  const handleAddNewScript = async () => {
    console.log("New script data:", newScript);
    if (!newScript.name || !newScript.category || !newScript.code) {
      alert("Please fill in all fields!");
      return;
    }
    // Send keys that your backend expects
    const scriptData = {
      script_name: newScript.name, // maps to activity in the backend
      category: newScript.category,
      script_code: newScript.code, // maps to tools_technique in the backend
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/scripts/create`,
        scriptData,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("New script added:", response.data);
      alert("Script added successfully!");
      setNewScript({ name: "", category: "", code: "" });
      fetchScripts();
    } catch (error) {
      console.error("Error adding script:", error.response?.data || error.message);
      alert("Failed to add script. Check the console for details.");
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setIsRoleDropdownOpen(false);
  };

  // Testing scripts data
  const standardScripts = {
    XSS: {
      description: "Cross-site scripting test scripts",
      scripts: ["Basic XSS Test", "DOM-based XSS Test", "Stored XSS Test"],
    },
    "SQL Injection": {
      description: "SQL injection test scripts",
      scripts: ["Basic SQL Injection", "Time-based Blind", "Union-based Test"],
    },
  };

  // Handle script selection
  const handleScriptSelect = (scriptType, script) => {
    setSelectedScript({ type: scriptType, name: script });
    setScriptName(script);
    setScriptCode(`// ${script} Template\n// Add your test cases here\n`);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (event.target.id === "file-upload") {
      setFile(event.target.files[0]);
      alert("added file successfully");
    } else {
      // alert(event.target.files)
      setSupportingFiles(event.target.files[0]);
      alert("added supporting files successfully");
    }
    if (file) {
      console.log("File selected:", file.name);
    }
  };

  const handleFinalReportSubmit = async (e) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/finalReport/createOrUpdate`,
        {
          taskId: taskId,  // No need to use template literals
          reportSummary: reportSummary,
          difficulty: difficultyRating,
          updatedBy: localStorage.getItem("userName"),
          userEmail: localStorage.getItem("userEmail")
        },
        {
          headers: { "Content-Type": "application/json" }, // Use application/json
        }
      );
      alert("submitted successfully");
      setReportSummary("");
    }
    catch (e) {
      alert("Not able to submit");
    }
  };

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
  
  const fetchFile = async (fileId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/taskReview/file/${fileId}`, {
        responseType: "blob", // Ensures we get the file as a binary Blob
      });
  
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      // Create an anchor element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `file_${fileId}`; // Default filename (can be changed)
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const deleteReview = async (id, supportFile, scriptFile) => {
    try {
      const response1 = await axios.delete(
        `${API_BASE_URL}/taskReview/fileDelete/${supportFile}`,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    
      console.log("Deleting task review:", id);
      const response2 = await axios.delete(
        `${API_BASE_URL}/taskReview/deleteReview/${id}`,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    
      console.log("Deleting scriptFile:", scriptFile);
      const response3 = await axios.delete(
        `${API_BASE_URL}/taskReview/fileDelete/${scriptFile}`,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setReviewList((prevList) => prevList.filter((review) => review._id !== id));
      alert("Deleted the review");
    }
    catch (error) {
      alert("Not able to delete");
      console.error("Error fetching file:", error);
    }
  };
  
  // Toggle resources panel
  const toggleResourcesPanel = () => {
    setShowResources(!showResources);
    if (!showResources && resources.texts.length === 0 && resources.videos.length === 0) {
      fetchResources();
    }
  };

  // Add this function to handle coach feedback submission
const handleCoachFeedbackSubmit = async (reviewId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/taskReview/addFeedBack/${reviewId}`, {
      feedBack: coachFeedback
    });
    
    // Send email notification to hunter
    await sendEmailNotification({
      toEmail: task.userEmail || projectTask.userEmail,
      subject: `Feedback on Task ${projectTask.taskId}`,
      templateParams: {
        username: localStorage.getItem("userName"),
        taskId: projectTask.taskId,
        status: "Feedback Provided",
        message: "The coach has provided feedback on your task submission."
      }
    });
    
    alert("Feedback submitted successfully!");
    setCoachFeedback("");
    setShowFeedbackForm(false);
    // Refresh review list
    fetchTaskReview();
  } catch (error) {
    console.error("Error submitting feedback:", error);
    alert("Failed to submit feedback. Please try again.");
  }
};

// Add this function to send email notifications using EmailJS
const sendEmailNotification = async (params) => {
  try {
    const { toEmail, subject, templateParams } = params;
    
    // Add required parameters to template
    const emailParams = {
      to_email: toEmail,
      subject: subject,
      to_name: templateParams.username || "User",
      task_id: templateParams.taskId,
      status: templateParams.status,
      message: templateParams.message,
      from_name: "Bug Hunt Platform",
      reply_to: "no-reply@bughuntplatform.com"
    };
    
    // Send email using EmailJS
    // You'll need to replace these with your actual EmailJS credentials
    const serviceID = "service_afpqudj";
    const templateID = "template_duudxl1";
    const userID = "sNAmtd-Gt3OneaeG0";
    
    await emailjs.send(serviceID, templateID, emailParams, userID);
    console.log("Email notification sent successfully");
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
};

// Add this function to handle admin approval
const handleAdminApproval = async (taskId, task) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/task/deliver/${taskId}`, {
      status: "Deliver",
      updatedBy: localStorage.getItem("userName"),
      taskToDeliver: task
    });
    
    // Send email notification
    await sendEmailNotification({
      toEmail: task.userEmail || projectTask.userEmail,
      subject: `Task ${projectTask.taskId} Approved for Delivery`,
      templateParams: {
        username: "Team",
        taskId: projectTask.taskId,
        status: "Approved for Delivery",
        message: "The task has been approved for delivery by the administrator."
      }
    });
    
    alert("Task approved for delivery!");
    // Refresh or redirect
    navigate("/admin-dashboard");
  } catch (error) {
    console.error("Error approving task:", error);
    alert("Failed to approve task. Please try again.");
  }
};

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Task ID: {projectTask.taskId}</h1>
          <a
            href="https://example.com/target-app"
            className="text-blue-500 hover:underline text-sm"
          >
            {}
          </a>
        </div>

        {/* Role Selector and Status */}
        <div className="flex items-center gap-4">
          <span className="text-blue-500">{}</span>
          
          {/* Help Resources Button */}
          <button
            className={`px-4 py-2 flex items-center gap-2 ${
              showResources 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            } border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}
            onClick={toggleResourcesPanel}
          >
            <BookOpen className="h-5 w-5" />
            {showResources ? "Hide Resources" : "View Resources"}
          </button>
          
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            >
              {roles.find((role) => role.id === selectedRole)?.label}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isRoleDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setSelectedRole(role.id);
                      setIsRoleDropdownOpen(false);
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resources Panel (Slide-in panel from the right) */}
      {showResources && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl z-40 transition-transform transform-gpu duration-300 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Resources</h2>
              <button 
                onClick={toggleResourcesPanel}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Resource Type Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  resourceType === "text"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => {
                  setResourceType("text");
                  setSelectedResource(null);
                }}
              >
                <FileText className="h-4 w-4 inline-block mr-1" />
                Documentation
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  resourceType === "video"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => {
                  setResourceType("video");
                  setSelectedResource(null);
                }}
              >
                <Video className="h-4 w-4 inline-block mr-1" />
                Video Tutorials
              </button>
            </div>
            
            {/* Search Box */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search resources..."
                value={resourceSearchTerm}
                onChange={(e) => setResourceSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Resources Content */}
            {isResourcesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : selectedResource ? (
              <div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center"
                >
                  ← Back to list
                </button>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedResource.title}
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                    {selectedResource.content && selectedResource.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {resourceType === "text" ? (
                  filteredResources.length > 0 ? (
                    filteredResources.map(doc => (
                      <div 
                        key={doc._id} 
                        onClick={() => setSelectedResource(doc)}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{doc.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {doc.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No documentation available
                    </div>
                  )
                ) : (
                  filteredResources.length > 0 ? (
                    filteredResources.map(video => (
                      <div 
                        key={video._id} 
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{video.title}</h3>
                        <a 
                          href={video.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Watch Tutorial
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No video tutorials available
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Help & Resources with New Script Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Help & Resources</h2>
            <div className="space-y-4">
              {/* Testing Scripts Dropdown */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>Standard Testing Scripts</span>
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="border-t p-3">
                    {/* Search Bar for Dropdown */}
                    <input
                      type="text"
                      placeholder="Search scripts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded mb-3"
                    />
                    {filteredScripts.length > 0 ? (
                      filteredScripts.map((script) => (
                        <div key={script._id} className="mb-1">
                         <button onClick={() => setScript(script)}>
                          <div className="mb-2">
                            <div className="font-bold">{script.category}</div>
                            <div className="ml-2">{script.activity}</div>
                          </div>
                         </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No scripts available</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 max-w-3xl mx-auto">
                <h1 className="text-xl font-semibold mb-2">📚 Documentation & Tutorials</h1>
                {isResourcesLoading ? (
                  <p className="text-gray-500 text-sm">Loading resources...</p>
                ) : (resources.texts.length === 0 && resources.videos.length === 0) ? (
                  <p className="text-gray-500 text-sm">No resources available</p>
                ) : (
                  <div className="grid gap-3">
                    {resources.texts.map((resource) => (
                      <div key={resource._id} className="p-3 shadow-sm border border-gray-300 rounded-md bg-white">
                        <button
                          onClick={() => {
                            setResourceType("text");
                            setSelectedResource(resource);
                            setShowResources(true);
                          }}
                          className="text-base font-medium text-blue-600 hover:underline text-left"
                        >
                          {resource.title}
                        </button>
                        <p className="text-xs text-gray-600 mt-1">Documentation</p>
                      </div>
                    ))}
                    {resources.videos.map((resource) => (
                      <div key={resource._id} className="p-3 shadow-sm border border-gray-300 rounded-md bg-white">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-blue-600 hover:underline"
                        >
                          {resource.title}
                        </a>
                        <p className="text-xs text-gray-600 mt-1">Video Tutorial</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>  

              {/* Add New Script Form */}
              <div className="space-y-4">
                <h3 className="font-medium">Add New Script</h3>
                <input
                  type="text"
                  name="name"
                  placeholder="Script Name"
                  className="w-full p-2 border rounded"
                  value={newScript.name}
                  onChange={handleNewScriptInputChange}
                />
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  className="w-full p-2 border rounded"
                  value={newScript.category}
                  onChange={handleNewScriptInputChange}
                />
                <textarea
                  name="code"
                  placeholder="Script Code"
                  className="w-full p-2 border rounded min-h-[100px]"
                  value={newScript.code}
                  onChange={handleNewScriptInputChange}
                />
                <button
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  onClick={handleAddNewScript}
                >
                  Add Script
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Review & Feedback</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Script Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={script.category || ""}
                  readOnly
                />
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                onClick={() => document.getElementById("file-upload").click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">Upload a file</div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div>
                <label className="block mb-2">Observed Behavior</label>
                <textarea
                  className="w-full p-2 border rounded min-h-[100px]"
                  value={observedBehavior}
                  onChange={(e) => setObservedBehavior(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2">
                  Potential Vulnerabilities Identified
                </label>
                <textarea
                  className="w-full p-2 border rounded min-h-[100px]"
                  value={vulnerabilities}
                  onChange={(e) => setVulnerabilities(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2">Supporting Files</label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                  onClick={() =>
                    document.getElementById("supporting-files").click()
                  }
                >
                  <div className="mt-2">Add files</div>
                  <input
                    id="supporting-files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <button
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                onClick={(e) => handleSubmit(e)} // Pass event
              >
                Submit Review 
              </button>
            </div>
          </div>

          {Array.isArray(reviewList) &&
            reviewList.map((review, index) => (
              <div key={review._id || index} className="border p-4 rounded-lg shadow-md">
                <p><strong>Reviewed By:</strong> {review.reviewBy}</p>
                <p><strong>Observed Behavior:</strong> {review.observedBehavior}</p>
                <p><strong>Vulnerabilities:</strong> {review.vulnerabilities}</p>
                <p><strong>Last Review:</strong> {new Date(review.lastReview).toLocaleString()}</p>
                <p><strong>FeedBack:</strong> {review.feedBack}</p>
                {/* Clickable links to fetch files */}
                <p>
                  <strong>Script File:</strong>{" "}
                  <span
                    className="text-blue-500 cursor-pointer underline"
                    onClick={() => fetchFile(review.scriptFile)}
                  >
                    Download Script
                  </span>
                </p>

                <p>
                  <strong>Supporting File:</strong>{" "}
                  <span
                    className="text-blue-500 cursor-pointer underline"
                    onClick={() => fetchFile(review.supportFile)}
                  >
                    Download Support File
                  </span>
                </p>
                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => {
                    deleteReview(review._id, review.supportFile, review.scriptFile)
                  }}
                >
                  Delete
                </button>
              </div>
            ))}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Final Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Report Summary</label>
                <textarea
                  placeholder="Provide a comprehensive summary of your findings..."
                  className="w-full p-2 border rounded min-h-[100px]"
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2">Difficulty Rating</label>
                <select
                  className="w-full p-2 border rounded"
                  value={difficultyRating}
                  onChange={(e) => setDifficultyRating(e.target.value)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                onClick={(e) => handleFinalReportSubmit(e)}
              >
                Submit Final Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoachFeedbackModal = ({ isOpen, onClose, review, onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Provide Feedback</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Review Details</h3>
              <p><strong>Reviewed By:</strong> {review.reviewBy}</p>
              <p><strong>Observed Behavior:</strong> {review.observedBehavior}</p>
              <p><strong>Vulnerabilities:</strong> {review.vulnerabilities}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Provide detailed feedback on this review..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmit(feedback);
                  setFeedback("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskWorkflow = ({ currentStatus }) => {
  const statuses = ["Unclaimed", "In Progress", "Completed", "Reviewed", "Deliver"];
  const currentIndex = statuses.indexOf(currentStatus);
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {statuses.map((status, index) => (
          <React.Fragment key={status}>
            <div className="relative flex flex-col items-center">
              <div className={`rounded-full transition duration-500 ease-in-out h-12 w-12 flex items-center justify-center ${
                index <= currentIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <span className="text-white text-xs">{index + 1}</span>
              </div>
              <div className="text-xs text-center mt-2 w-24">
                <span className={`font-medium ${
                  index <= currentIndex ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {status}
                </span>
              </div>
            </div>
            {index < statuses.length - 1 && (
              <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                index < currentIndex ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const handleResourceAddition = async (type, data) => {
  try {
    setIsLoading(true);
    
    let endpoint;
    if (type === 'text') {
      endpoint = `${API_BASE_URL}/resources/texts/add`;
    } else {
      endpoint = `${API_BASE_URL}/resources/videos/add`;
    }
    
    const response = await axios.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      }
    });
    
    // Update resources list
    if (type === 'text') {
      setResources(prev => ({
        ...prev,
        texts: [...prev.texts, response.data]
      }));
    } else {
      setResources(prev => ({
        ...prev,
        videos: [...prev.videos, response.data]
      }));
    }
    
    showAlert('success', `${type === 'text' ? 'Documentation' : 'Video link'} added successfully!`);
    
    // Reset form
    if (type === 'text') {
      setNewTextDoc({ title: '', content: '' });
    } else {
      setNewVideo({ title: '', url: '' });
    }
  } catch (error) {
    console.error(`Error adding ${type}:`, error);
    showAlert('error', `Failed to add ${type}. Please try again.`);
  } finally {
    setIsLoading(false);
  }
};


export default SecurityTestingDashboard;