import React, { useEffect, useState } from "react";
import { ChevronDown, Upload, Plus } from "lucide-react";
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

  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [texts, videos] = await Promise.all([
          fetch(`${API_BASE_URL}/texts`).then((res) => res.json()).catch(() => []),
          fetch(`${API_BASE_URL}/videos`).then((res) => res.json()).catch(() => []),
        ]);

        console.log("Fetched Texts:", texts);
        console.log("Fetched Videos:", videos);
        setResources([...texts, ...videos]);
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
    };

    fetchResources();
  }, []);

  // Filter the fetched scripts based on search term
  const filteredScripts = dbScripts.filter((script) => {
    const cat = script.category || "";
    const act = script.activity || "";
    return (
      cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
                  {resources.length === 0 ? (
                    <p className="text-gray-500 text-sm">Loading resources...</p>
                  ) : (
                    <div className="grid gap-3">
                      {resources.map((resource) => (
                        <div key={resource._id} className="p-3 shadow-sm border border-gray-300 rounded-md bg-white">
                          <a
                            href={resource.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium text-blue-600 hover:underline"
                          >
                            {resource.title}
                          </a>
                          <p className="text-xs text-gray-600">{resource.description}</p>
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

export default SecurityTestingDashboard;
