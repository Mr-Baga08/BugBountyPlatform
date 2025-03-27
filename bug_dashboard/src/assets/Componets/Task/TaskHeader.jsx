// bug_dashboard/src/assets/Componets/Task/TaskHeader.jsx
import React from 'react';
import { ChevronLeft, Eye, FileText, ExternalLink, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskHeader = ({ task, viewMode, onViewModeChange }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  if (!task) return null;
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Unclaimed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "Reviewed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    }
  };
  
  const getNavigationLink = () => {
    // Go back to the task detail page
    return `/task/${task._id}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
      {/* Task Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(getNavigationLink())}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {task.projectName}
              </h1>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Task ID: {task.taskId} | Industry: {task.industry}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status}
            </div>
            
            {/* View Mode Selector (only for coach/admin) */}
            {(userRole === 'coach' || userRole === 'admin') && onViewModeChange && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <button
                  onClick={() => onViewModeChange('hunter')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'hunter' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 inline-block mr-1" />
                  Hunter View
                </button>
                <button
                  onClick={() => onViewModeChange('reviewer')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'reviewer' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 inline-block mr-1" />
                  Reviewer View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Links Bar */}
      <div className="bg-white dark:bg-gray-800 px-6 py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-4 items-center">
          {task.DomainLink && (
            <a 
              href={task.DomainLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Target Domain
            </a>
          )}
          
          {task.toolLink && (
            <a 
              href={task.toolLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <FileText className="w-4 h-4 mr-1" />
              View Tool Documentation
            </a>
          )}
          
          <button
            onClick={() => navigate(getNavigationLink())}
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Task Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;