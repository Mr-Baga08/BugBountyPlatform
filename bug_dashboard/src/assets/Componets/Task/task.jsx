// Create a new file: bug_dashboard/src/assets/Componets/Task/TaskDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Clock, User } from 'lucide-react';
import AppLayout from '../../../App/Common/Layout/AppLayout';
import API_BASE_URL from '../AdminDashboard/config';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // First try to fetch from statusFetch endpoint which we know exists
        const response = await fetch(`${API_BASE_URL}/task/statusFetch/All?taskId=${taskId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch task details');
        }

        const data = await response.json();
        if (data.tasks && data.tasks.length > 0) {
          setTask(data.tasks[0]);
        } else {
          throw new Error('Task not found');
        }
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, navigate]);

  if (loading) {
    return (
      <AppLayout title="Task Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Task Details">
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
      <AppLayout title="Task Details">
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
    <AppLayout title={`Task: ${task.taskId}`}>
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tasks
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Task Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task.projectName}
            </h1>
            <div className={`px-3 py-1 text-sm font-medium rounded-full 
              ${task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                task.status === 'Reviewed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              {task.status}
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Task ID: {task.taskId}
          </div>
        </div>
        
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
              <div className="mt-6 space-x-4">
                <button 
                  onClick={() => navigate(`/tool/${task._id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  View Tool Page
                </button>
              </div>
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