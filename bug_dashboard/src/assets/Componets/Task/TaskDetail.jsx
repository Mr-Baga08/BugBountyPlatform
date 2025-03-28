// bug_dashboard/src/assets/Componets/Task/TaskDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Clock, User, Globe, Eye, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import AppLayout from '../../../App/Common/Layout/AppLayout';
import API_BASE_URL from '../AdminDashboard/config';
import TaskWorkflow from './TaskWorkflow';
import TaskClaimButton from './TaskClaimButton';
import axios from 'axios';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log("Fetching task details for:", taskId);
      console.log("API URL:", `${API_BASE_URL}/task/${taskId}`);

      const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      if (!response.ok) {
        console.error("API Response Error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error Details:", errorText);
        throw new Error(`Failed to fetch task details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched Task Data:", data);
      setTask(data);
      
      // Check if current user is the owner of this task
      if (data.updatedBy === userName && data.status === 'In Progress') {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, navigate]);

  // Update task status locally without full refetch
  const handleStatusChange = (newStatus) => {
    setTask(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        status: newStatus,
        updatedBy: userName
      };
    });
    
    // Check if user is now owner (only happens when claiming a task)
    if (newStatus === 'In Progress' && userName) {
      setIsTaskOwner(true);
      
      // If the claim was successful, navigate to the tool page after a short delay
      // This ensures the user can start working immediately
      setTimeout(() => {
        navigate(`/tool/${taskId}`, { 
          state: {
            ...task,
            status: newStatus,
            updatedBy: userName
          }
        });
      }, 1500); // Short delay to allow the success message to be seen
    }
  };

  // Handle navigation to the appropriate tool page
  const handleToolPageNavigation = () => {
    if (userRole === 'hunter') {
      navigate(`/tool/${task._id}`, { state: task });
    } else if (userRole === 'coach') {
      navigate(`/coach/review/${task._id}`, { state: task });
    } else if (userRole === 'admin') {
      navigate(`/admin/review/${task._id}`, { state: task });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h2 className="text-red-800 font-medium">Error Loading Task</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h2 className="text-yellow-800 font-medium">Task Not Found</h2>
          <p className="text-yellow-600">The requested task could not be found.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tasks
        </button>
      </div>
      
      {/* Task Header with Claim button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task.projectName}
            </h1>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 text-sm font-medium rounded-full 
                ${task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                  task.status === 'Reviewed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {task.status}
              </div>
              
              <TaskClaimButton 
                taskId={task._id} 
                currentStatus={task.status} 
                currentOwner={task.updatedBy} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Task ID: {task.taskId}
          </div>
        </div>
        
        {/* Owner Banner - Shows if someone owns this task */}
        {task.status === 'In Progress' && (
          <div className={`px-6 py-2 ${isOwner ? 'bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800'}`}>
            <div className="flex items-center">
              {isOwner ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <span className="font-medium">You have claimed this task.</span> Use the Tool Page to submit your findings.
                  </p>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-blue-500 mr-2" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    This task is currently being worked on by <span className="font-medium">{task.updatedBy}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Task Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">Industry:</span>
                  </div>
                  <div className="mt-1 text-gray-900 dark:text-white">{task.industry}</div>
                </div>
                
                {task.DomainLink && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="font-medium">Domain Link:</span>
                    </div>
                    <div className="mt-1">
                      <a 
                        href={task.DomainLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {task.DomainLink}
                      </a>
                    </div>
                  </div>
                )}
                
                {task.toolLink && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">Tool Link:</span>
                    </div>
                    <div className="mt-1">
                      <a 
                        href={task.toolLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {task.toolLink}
                      </a>
                    </div>
                  </div>
                )}
                
                {task.Batch && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">Batch:</span>
                    </div>
                    <div className="mt-1 text-gray-900 dark:text-white">{task.Batch}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">Last Updated:</span>
                  </div>
                  <div className="mt-1 text-gray-900 dark:text-white">
                    {new Date(task.lastUpdated).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">Updated By:</span>
                  </div>
                  <div className="mt-1 text-gray-900 dark:text-white">{task.updatedBy}</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {/* Tool Button - shows different message based on task status and user role */}
                {userRole === 'hunter' && task.status === 'Unclaimed' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                    <AlertCircle className="inline-block w-4 h-4 mr-1" />
                    You need to claim this task before you can access the Tool Page.
                  </div>
                )}
                
                {/* If user is owner or coach/admin, show the tool button */}
                {(isOwner || userRole === 'coach' || userRole === 'admin' || 
                  (userRole === 'hunter' && task.status !== 'Unclaimed')) && (
                  <button 
                    onClick={handleToolPageNavigation}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    {userRole === 'hunter' ? 'View Tool Page' : 
                     userRole === 'coach' ? 'Review Task' : 'Admin Review'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Status Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Workflow Status</h2>
            </div>
            <div className="p-6">
              <TaskWorkflow status={task.status} />
            </div>
          </div>
          
          {/* Reviews Section (if there are any) */}
          {task.reviews && task.reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reviews</h2>
              <div className="space-y-4">
                {task.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 dark:text-white">Review #{index + 1}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.lastReview).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <p><strong>Reviewed By:</strong> {review.reviewBy}</p>
                      {review.observedBehavior && (
                        <p className="mt-2"><strong>Observed Behavior:</strong> {review.observedBehavior}</p>
                      )}
                      {review.vulnerabilities && (
                        <p className="mt-2"><strong>Vulnerabilities:</strong> {review.vulnerabilities}</p>
                      )}
                      {review.feedBack && review.feedBack !== "No reviewed" && (
                        <p className="mt-2"><strong>Feedback:</strong> {review.feedBack}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Final Report Section (if exists) */}
          {task.finalReview && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Final Report</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Summary Report
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {task.finalReview.difficulty} Difficulty
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Report by:</strong> {task.finalReview.updatedBy}</p>
                  {task.finalReview.reportSummary && (
                    <p className="mt-2"><strong>Summary:</strong> {task.finalReview.reportSummary}</p>
                  )}
                  {task.finalReview.feedBack && task.finalReview.feedBack !== "No reviewed" && (
                    <p className="mt-2"><strong>Feedback:</strong> {task.finalReview.feedBack}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskDetail;