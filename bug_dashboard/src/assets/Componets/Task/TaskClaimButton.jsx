// bug_dashboard/src/assets/Componets/Task/TaskClaimButton.jsx
import React, { useState, useEffect } from 'react';
import { Play, Loader, Lock } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../AdminDashboard/config';

const TaskClaimButton = ({ taskId, currentStatus, currentOwner, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(true);
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  
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

    setIsLoading(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/task/update-status/${taskId}`,
        {
          status: 'In Progress',
          updatedBy: userName,
          userEmail: userEmail,
          tks: taskId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          }
        }
      );

      if (response.data) {
        // Call the callback to update parent component state
        onStatusChange('In Progress');
        alert('Task claimed successfully! You can now start working on it.');
      }
    } catch (error) {
      console.error('Error claiming task:', error);
      alert('Failed to claim task. Please try again.');
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