// AdminReviewComponent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, RotateCcw, Eye, Download, FileText, X, Send } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../Componets/AdminDashboard/config';
import AppLayout from '../../App/Common/Layout/AppLayout';
import emailjs from 'emailjs-com';

const AdminReviewComponent = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isCoachFeedback, setIsCoachFeedback] = useState(false);

  useEffect(() => {
    // Verify admin role
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/login');
      return;
    }

    fetchTaskDetails();
  }, [taskId, navigate]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch task details
      const taskResponse = await axios.get(`${API_BASE_URL}/task/${taskId}`, {
        headers: {
          'Authorization': token
        }
      });
      
      setTask(taskResponse.data);
      
      // Fetch reviews
      if (taskResponse.data.reviews && taskResponse.data.reviews.length > 0) {
        const reviewsResponse = await axios.get(`${API_BASE_URL}/taskReview/allreview/${taskId}`, {
          headers: {
            'Authorization': token
          }
        });
        
        setReviews(reviewsResponse.data.allTask || []);
      }
      
      // Fetch final report if available
      if (taskResponse.data.finalReview) {
        const reportResponse = await axios.get(`${API_BASE_URL}/finalReport/${taskId}`, {
          headers: {
            'Authorization': token
          }
        });
        
        setFinalReport(reportResponse.data);
      }
      
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(err.message || 'Error fetching task details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/taskReview/file/${fileId}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file-${fileId}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleOpenFeedbackModal = (review, isCoach = false) => {
    setSelectedReview(review);
    setFeedbackContent('');
    setIsCoachFeedback(isCoach);
    setShowFeedbackModal(true);
  };

  const handleOpenFinalReportFeedback = (isCoach = false) => {
    setSelectedReview(null);
    setFeedbackContent('');
    setIsCoachFeedback(isCoach);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedReview || !feedbackContent.trim()) {
      alert('Please enter feedback content');
      return;
    }

    try {
      // Admin feedback is stored in a different field than coach feedback
      // We'd need to modify the backend to support this, but for now we'll use the same endpoint
      await axios.patch(`${API_BASE_URL}/taskReview/addFeedBack/${selectedReview._id}`, {
        feedBack: `[ADMIN FEEDBACK] ${feedbackContent}${selectedReview.feedBack && selectedReview.feedBack !== "No reviewed" ? '\n\n[COACH FEEDBACK] ' + selectedReview.feedBack : ''}`
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      // Send email notification to coach and hunter about feedback
      try {
        // Get email addresses
        const hunterEmail = task.userEmail;
        
        // Get coach email (this would require backend changes to store which coach reviewed the task)
        // For now we'll just notify the hunter
        
        if (hunterEmail) {
          // EmailJS parameters
          const templateParams = {
            to_name: 'Hunter',
            from_name: 'Admin',
            message: `Admin feedback has been provided for your review on task ${task.taskId}`,
            task_id: task.taskId,
            status: 'Admin Feedback Provided',
            reply_to: 'noreply@bughuntplatform.com'
          };
          
          await emailjs.send(
            'service_afpqudj',
            'template_duudxl1',
            templateParams,
            'sNAmtd-Gt3OneaeG0'
          );
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue execution even if email fails
      }
      
      alert('Feedback submitted successfully');
      setShowFeedbackModal(false);
      // Refresh task details
      fetchTaskDetails();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };
  
  const handleFinalReportFeedback = async () => {
    if (!finalReport || !feedbackContent.trim()) {
      alert('Please enter feedback content');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/finalReport/finalreviewFeedback/${finalReport._id}`, {
        feedBack: `[ADMIN FEEDBACK] ${feedbackContent}${finalReport.feedBack && finalReport.feedBack !== "No reviewed" ? '\n\n[COACH FEEDBACK] ' + finalReport.feedBack : ''}`
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      // Send email notification
      try {
        const templateParams = {
          to_name: 'Hunter',
          from_name: 'Admin',
          message: `Admin feedback has been provided for your final report on task ${task.taskId}`,
          task_id: task.taskId,
          status: 'Final Report Admin Feedback',
          reply_to: 'noreply@bughuntplatform.com'
        };
        
        await emailjs.send(
          'service_afpqudj',
          'template_duudxl1',
          templateParams,
          'sNAmtd-Gt3OneaeG0'
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
      
      alert('Feedback on final report submitted successfully');
      setShowFeedbackModal(false);
      // Refresh task details
      fetchTaskDetails();
    } catch (error) {
      console.error('Error submitting final report feedback:', error);
      alert('Failed to submit final report feedback');
    }
  };
  
  const handleSendBackToCoach = async () => {
    try {
      // Update task status to "Completed" to send it back to coach review
      await axios.patch(`${API_BASE_URL}/task/update-status/${taskId}`, {
        status: 'Completed',
        updatedBy: 'Admin',
        userEmail: task.userEmail || '',
        tks: task.taskId
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      // Send email notification to coach
      try {
        // In a real scenario, you'd have the coach's email stored
        // For demo, we'll use the hunter email with a note it's for the coach
        const emailToCoach = process.env.ADMIN_EMAIL || 'stealtho.baga@gmail.com';
        
        const templateParams = {
          to_name: 'Coach',
          from_name: 'Admin',
          message: `Task ${task.taskId} has been returned for further review. Please check admin feedback.`,
          task_id: task.taskId,
          status: 'Returned for Coach Review',
          reply_to: 'noreply@bughuntplatform.com'
        };
        
        await emailjs.send(
          'service_afpqudj',
          'template_6zz78vq',
          templateParams,
          'sNAmtd-Gt3OneaeG0'
        );
      } catch (emailError) {
        console.error('Failed to send email notification to coach:', emailError);
      }
      
      alert('Task has been sent back to coach for further review');
      navigate('/admin-dashboard'); // Navigate back to admin dashboard
    } catch (error) {
      console.error('Error sending task back to coach:', error);
      alert('Failed to send task back to coach');
    }
  };
  
  const handleApproveForDelivery = async () => {
    try {
      // Deliver task
      await axios.post(`${API_BASE_URL}/task/deliver/${taskId}`, {
        status: 'Deliver',
        updatedBy: 'Admin',
        taskToDeliver: task
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      // Send confirmation emails
      try {
        // Email to hunter
        const hunterEmail = task.userEmail;
        
        if (hunterEmail) {
          const templateParams = {
            to_name: 'Hunter',
            from_name: 'Admin',
            message: `Congratulations! Task ${task.taskId} has been approved for delivery.`,
            task_id: task.taskId,
            status: 'Approved for Delivery',
            reply_to: 'noreply@bughuntplatform.com'
          };
          
          await emailjs.send(
            'service_afpqudj',
            'template_duudxl1',
            templateParams,
            'sNAmtd-Gt3OneaeG0'
          );
        }
        
        // Email to admin (for confirmation)
        const adminEmail = process.env.ADMIN_EMAIL || 'stealtho.baga@gmail.com';
        
        const adminTemplateParams = {
          to_name: 'Admin',
          from_name: 'Bug Hunt Platform',
          message: `Task ${task.taskId} has been approved for delivery and finalized.`,
          task_id: task.taskId,
          status: 'Task Delivered',
          summary: finalReport ? finalReport.reportSummary : 'No summary available',
          difficulty: finalReport ? finalReport.difficulty : 'Not specified',
          reply_to: 'noreply@bughuntplatform.com'
        };
        
        await emailjs.send(
          'service_afpqudj',
          'template_6zz78vq',
          adminTemplateParams,
          'sNAmtd-Gt3OneaeG0'
        );
      } catch (emailError) {
        console.error('Failed to send delivery confirmation emails:', emailError);
      }
      
      alert('Task has been approved for delivery!');
      navigate('/admin-dashboard'); // Navigate back to admin dashboard
    } catch (error) {
      console.error('Error approving task for delivery:', error);
      alert('Failed to approve task for delivery');
    }
  };
  
  // Feedback modal component
  const FeedbackModal = () => {
    if (!showFeedbackModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isCoachFeedback ? 'View Coach Feedback' : 'Provide Admin Feedback'}
              </h2>
              <button 
                onClick={() => setShowFeedbackModal(false)} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedReview && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Review Details</h3>
                  <p><strong>Reviewed By:</strong> {selectedReview.reviewBy}</p>
                  <p><strong>Observed Behavior:</strong> {selectedReview.observedBehavior}</p>
                  <p><strong>Vulnerabilities:</strong> {selectedReview.vulnerabilities}</p>
                  
                  {selectedReview.feedBack && selectedReview.feedBack !== "No reviewed" && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Coach Feedback</h4>
                      <p className="text-blue-700 dark:text-blue-400">{selectedReview.feedBack}</p>
                    </div>
                  )}
                </div>
              )}
              
              {!selectedReview && finalReport && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Final Report Details</h3>
                  <p><strong>Report Summary:</strong> {finalReport.reportSummary}</p>
                  <p><strong>Difficulty:</strong> {finalReport.difficulty}</p>
                  <p><strong>Updated By:</strong> {finalReport.updatedBy}</p>
                  
                  {finalReport.feedBack && finalReport.feedBack !== "No reviewed" && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Coach Feedback</h4>
                      <p className="text-blue-700 dark:text-blue-400">{finalReport.feedBack}</p>
                    </div>
                  )}
                </div>
              )}
              
              {!isCoachFeedback && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Feedback
                  </label>
                  <textarea
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    rows={6}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Provide detailed feedback..."
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Close
                </button>
                
                {!isCoachFeedback && (
                  <button
                    type="button"
                    onClick={selectedReview ? handleSubmitFeedback : handleFinalReportFeedback}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render loading, error or content
  if (loading) {
    return (
      <AppLayout title="Admin Review">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout title="Admin Review">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </AppLayout>
    );
  }
  
  if (!task) {
    return (
      <AppLayout title="Admin Review">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
          <h2 className="text-yellow-800 dark:text-yellow-400 font-medium">Task Not Found</h2>
          <p className="text-yellow-600 dark:text-yellow-300">The requested task could not be found.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </AppLayout>
    );
  }
  
  // Main render with task data
  return (
    <AppLayout title={`Admin Review: ${task.taskId}`}>
      {/* Feedback Modal */}
      <FeedbackModal />
      
      {/* Back Navigation */}
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
      </div>
      
      {/* Task Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task.projectName}
            </h1>
            <div className={`px-3 py-1 text-sm font-medium rounded-full 
              ${task.status === 'Reviewed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              {task.status}
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Task ID: {task.taskId} | Industry: {task.industry}
          </div>
          {task.DomainLink && (
            <div className="mt-1 text-sm">
              <a 
                href={task.DomainLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <Eye className="h-3 w-3 mr-1" /> {task.DomainLink}
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Reviews</h2>
        </div>
        
        <div className="p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No reviews available for this task.
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Review by {review.reviewBy}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.lastReview).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observed Behavior</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        {review.observedBehavior}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vulnerabilities</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        {review.vulnerabilities}
                      </p>
                    </div>
                  </div>
                  
                  {/* Files & Actions */}
                  <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
                    <div className="flex flex-wrap gap-2">
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
                    
                    <div className="flex gap-2">
                      {review.feedBack && review.feedBack !== "No reviewed" && (
                        <button
                          onClick={() => handleOpenFeedbackModal(review, true)}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View Coach Feedback
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleOpenFeedbackModal(review, false)}
                        className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FileText className="h-3 w-3 mr-1" /> 
                        Add Admin Feedback
                      </button>
                    </div>
                  </div>
                  
                  {/* Previous Admin Feedback - In a real implementation, admin feedback would be stored separately */}
                  {review.feedBack && review.feedBack.includes("[ADMIN FEEDBACK]") && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Feedback</h4>
                      <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-2 rounded">
                        {review.feedBack.split('[ADMIN FEEDBACK]')[1].split('[COACH FEEDBACK]')[0]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Final Report Section */}
      {finalReport && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Final Report</h2>
              <span className={`px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>
                {finalReport.difficulty} Difficulty
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                {finalReport.reportSummary}
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Updated by {finalReport.updatedBy} on {new Date(finalReport.lastUpdated).toLocaleString()}
              </div>
              
              <div className="flex gap-2">
                {finalReport.feedBack && finalReport.feedBack !== "No reviewed" && (
                  <button
                    onClick={() => handleOpenFinalReportFeedback(true)}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Coach Feedback
                  </button>
                )}
                
                <button
                  onClick={() => handleOpenFinalReportFeedback(false)}
                  className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <FileText className="h-3 w-3 mr-1" /> 
                  Add Admin Feedback
                </button>
              </div>
            </div>
            
            {/* Previous Admin Feedback */}
            {finalReport.feedBack && finalReport.feedBack.includes("[ADMIN FEEDBACK]") && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Feedback</h4>
                <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-2 rounded">
                  {finalReport.feedBack.split('[ADMIN FEEDBACK]')[1].split('[COACH FEEDBACK]')[0]}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Actions</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleSendBackToCoach}
              className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5 mr-2" /> Send Back to Coach
            </button>
            
            <button
              onClick={handleApproveForDelivery}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="h-5 w-5 mr-2" /> Approve for Delivery
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminReviewComponent;// AdminReviewComponent.jsx
