// Updates to make in bug_dashboard/src/assets/Componets/Tool/tool.jsx

// Add these state checks at the beginning of the component function
const SecurityTestingDashboard = () => {
  const location = useLocation();
  const projectTask = location.state || {};
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  // New state variables to track permissions
  const [isTaskOwner, setIsTaskOwner] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");
  
  // Existing state variables...
  const [scriptName, setScriptName] = useState("");
  const [category, setCategory] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  // ...other state variables

  // Check if the current user is the owner of this task
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        // If we don't have the task data from location state, fetch it
        if (!projectTask || !projectTask._id) {
          const response = await axios.get(`${API_BASE_URL}/task/${taskId}`, {
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          });
          
          const taskData = response.data;
          
          // Check if the current user is the task owner or has proper permissions
          if (userRole === 'hunter' && taskData.status === 'In Progress' && taskData.updatedBy === userName) {
            setIsTaskOwner(true);
            setCanSubmit(true);
          } else if (userRole === 'hunter' && taskData.status === 'Unclaimed') {
            // Unclaimed task - hunter should claim it first
            navigate(`/task/${taskId}`);
            return;
          } else if (userRole === 'hunter' && taskData.status !== 'Unclaimed' && taskData.updatedBy !== userName) {
            // Task is claimed by someone else
            alert("This task is being worked on by another user");
            navigate(`/task/${taskId}`);
            return;
          } else if (userRole === 'coach' || userRole === 'admin') {
            // Coaches and admins can view but not submit reviews for tasks
            setCanSubmit(true);
          }
        } else {
          // We have task data from location state
          if (userRole === 'hunter' && projectTask.status === 'In Progress' && projectTask.updatedBy === userName) {
            setIsTaskOwner(true);
            setCanSubmit(true);
          } else if (userRole === 'hunter' && projectTask.status === 'Unclaimed') {
            // Unclaimed task - hunter should claim it first
            navigate(`/task/${taskId || projectTask._id}`);
            return;
          } else if (userRole === 'hunter' && projectTask.status !== 'Unclaimed' && projectTask.updatedBy !== userName) {
            // Task is claimed by someone else
            alert("This task is being worked on by another user");
            navigate(`/task/${taskId || projectTask._id}`);
            return;
          } else if (userRole === 'coach' || userRole === 'admin') {
            // Coaches and admins can always access
            setCanSubmit(true);
          }
        }
      } catch (error) {
        console.error("Error checking task ownership:", error);
        alert("Error loading task data. Please try again.");
        navigate('/');
      }
    };
    
    checkOwnership();
  }, [projectTask, taskId, userRole, userName, navigate]);

  // Then modify the submit handlers to only work if canSubmit is true

  // Modify handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Early return if user can't submit reviews
    if (!canSubmit) {
      alert("You don't have permission to submit reviews for this task");
      return;
    }

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

  // Modify handleFinalReportSubmit function
  const handleFinalReportSubmit = async (e) => {
    // Early return if user can't submit reports
    if (!canSubmit) {
      alert("You don't have permission to submit final reports for this task");
      return;
    }
    
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

  // Add a permissions banner at the top of the component's return statement
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

      {/* Rest of the existing UI... */}
      <div className="flex items-center justify-between mb-6">
        {/* ...existing code... */}
      </div>
      
      {/* ...rest of component... */}
    </div>
  );
};

export default SecurityTestingDashboard;