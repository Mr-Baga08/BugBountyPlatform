// Create a new component for task workflow visualization
// Create a file at bug_dashboard/src/assets/Componets/Task/TaskWorkflow.jsx

import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

const TaskWorkflow = ({ status }) => {
  // Define our workflow steps
  const steps = [
    { name: 'Unclaimed', description: 'Task is available for claiming' },
    { name: 'In Progress', description: 'Hunter is working on the task' },
    { name: 'Completed', description: 'Hunter has completed the task' },
    { name: 'Reviewed', description: 'Coach has reviewed the task' },
    { name: 'Deliver', description: 'Admin approved for delivery' }
  ];
  
  // Function to determine step status
  const getStepStatus = (stepName) => {
    const statusOrder = {
      'Unclaimed': 0,
      'In Progress': 1,
      'Completed': 2,
      'Reviewed': 3,
      'Deliver': 4
    };
    
    const currentIndex = statusOrder[status] || 0;
    const stepIndex = statusOrder[stepName] || 0;
    
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-8">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Task Workflow Status</h3>
      
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step) => (
            <li key={step.name} className="md:flex-1">
              <div className="group flex flex-col border-l-4 border-transparent md:border-l-0 md:border-t-4 md:pb-4">
                <span className="flex items-start">
                  <span className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full">
                    {getStepStatus(step.name) === 'complete' ? (
                      <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                    ) : getStepStatus(step.name) === 'current' ? (
                      <Circle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Circle className="h-7 w-7 text-gray-400 dark:text-gray-600" />
                    )}
                  </span>
                  <span className="ml-3 pt-1.5">
                    <h3 className={`text-sm font-medium ${
                      getStepStatus(step.name) === 'complete' ? 'text-green-600 dark:text-green-400' : 
                      getStepStatus(step.name) === 'current' ? 'text-blue-600 dark:text-blue-400' : 
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default TaskWorkflow;