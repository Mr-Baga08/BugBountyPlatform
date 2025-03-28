// bug_dashboard/src/assets/Componets/Task/TaskClaimButton.jsx
import React, { useState, useEffect } from 'react';
import { Play, Loader, Lock } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../AdminDashboard/config';

const TaskClaimButton = ({ taskId, currentStatus, currentOwner, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(true);
  const [error, setError] = useState(null);
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // Determine if user can claim this task
    if (currentStatus !== 'Unclaimed') {
      setCanClaim(false);
    } else if (userRole !== 'hunter') {
      setCanClaim(false);
    } else {
      setCanClaim(true);
    }
  }, [currentStatus, userRole]);

  const claimTask = async () => {
    if (!userName || !userEmail) {
      alert('You must be logged in to claim a task');
      return;
    }

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Claiming task ${taskId} for user ${userName}`);
      
      // Use a more detailed payload and ensure taskId is correctly referenced
      const payload = {
        status: 'In Progress',
        updatedBy: userName,
        userEmail: userEmail,
        tks: taskId // This is needed for email notifications
      };
      
      console.log('Request payload:', payload);
      console.log('Endpoint:', `${API_BASE_URL}/task/update-status/${taskId}`);
      
      const response = await axios({
        method: 'PATCH',
        url: `${API_BASE_URL}/task/update-status/${taskId}`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      console.log('Task claim response:', response.data);
      
      if (response.data && response.data.updatedTask) {
        // Call the callback to update parent component state
        onStatusChange('In Progress');
        alert('Task claimed successfully! You can now start working on it.');
      } else {
        throw new Error('Unexpected server response format');
      }
    } catch (error) {
      console.error('Error claiming task:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(`Server error: ${error.response.data.message || error.response.statusText || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError(`Request error: ${error.message}`);
      }
      
      alert(`Failed to claim task: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show different states based on task status and user role
  if (!canClaim) {
    if (currentStatus === 'Unclaimed' && userRole !== 'hunter') {
      return (
        <div className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
          <Lock className="w-5 h-5 mr-2" />
          Only Hunters Can Claim Tasks
        </div>
      );
    }
    return null; // No button for already claimed tasks or non-hunters
  }

  if (error) {
    return (
      <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg">
        <span className="mr-2">❌</span>
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={claimTask}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader className="w-5 h-5 mr-2 animate-spin" />
          Claiming...
        </>
      ) : (
        <>
          <Play className="w-5 h-5 mr-2" />
          Claim Task
        </>
      )}
    </button>
  );
};

export default TaskClaimButton;