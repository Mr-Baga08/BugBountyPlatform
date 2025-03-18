import React, { useState ,useEffect} from 'react';
import { CheckCircle2, RotateCcw, Eye, Send } from 'lucide-react';
import { ReviewModal } from './ReviewModal';
import { useLocation, useParams } from 'react-router-dom';
import axios from "axios";
import { FeedReviewModal } from './FeedBackModal';


export function CoachView({ userRole  }) {
  const location = useLocation();
  const projectTask = location.state||{};
    const [feedback, setFeedback] = useState("");
  const [tasks, setTasks] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
  const [selectedFinalReport, setSelectedFinalReport] = useState(null);
  const {taskId} = useParams();

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        console.log(projectTask)
        const response = await axios.get(`${API_BASE_URL}/task/statusFetch/${userRole === "coach" ? "Completed" : "Reviewed"}?taskId=${taskId}`);
        console.log(response.data.tasks);
        setTasks( response.data.tasks);

      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchCompletedTasks();
  }, []);

//   const completedTasks = tasks.filter(task => 
//     userRole === 'admin' ? task.status === 'validated' : task.status === 'completed'
//   );
   const onUpdateTaskStatus = async (taskId,status)=>{

    try{
      // console.log(projectTask)
      // alert(projectTask.taskId)
        const response = await axios.patch(`API_BASE_URL + "/task/update-status/${taskId}`,
            {
                status:status,
                updatedBy:localStorage.getItem('userName'),
                userEmail:projectTask.userEmail,
                tks : projectTask.taskId
            }
        );
        console.log(taskId);
        console.log(response);
        // alert("change to ", status);
        setTasks((tasks) => tasks.filter((task) => task._id !== taskId));
        
    }
    catch{
        alert("not able to change ...");
    }
   }

   const approved = async (taskId,status,taskToDeliver)=>{

    try{
      console.log(taskId);
      // taskToDeliver.status=
        const response = await axios.post(`API_BASE_URL + "/task/deliver/${taskId}`,
            {
                status:status,
                updatedBy:"Admin",
                taskToDeliver
            }
        );
        console.log(taskId);
        console.log(response);
        alert("Delivered ");
        setTasks((tasks) => tasks.filter((task) => task._id !== taskId));
        
    }
    catch(error){
      console.log(error)
        alert("not able to delevier",error);
    }
   }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Task Reviews</h2>
      
      <div className="space-y-6">
        {tasks.map((task) => (
          <div key={task._id} className="border rounded-lg p-4">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Task ID: {task.id}</h3>
              <div className="flex items-center space-x-2">
                {userRole === 'admin' ? (
                  <button
                    onClick={() => approved(task._id, 'approved',task)}
                    className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    <Send className="w-4 h-4 mr-1" /> Approve for Delivery
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onUpdateTaskStatus(task._id, 'Reviewed')}
                      className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Validate
                    </button>
                    <button
                      onClick={() => onUpdateTaskStatus(task._id, 'In Progress')}
                      className="flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" /> Return
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {task.reviews.map((review,index) => (
                <div key={review._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    <p className="font-medium">review {index + 1}  </p>
                    {review.feedBack && (
                      <p className="text-sm text-gray-600 mt-1">Previous feedback: {task.finalReview.feedback}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedReview({ taskId: review._id, review })}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Review
                  </button>
                </div>
              ))}
              {task.finalReview && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Final Report</p>
                      <p className="text-sm text-gray-600 mt-1">Difficulty: {task.finalReview.difficulty}</p>
                      {task.finalReview.feedback && (
                        <p className="text-sm text-gray-600 mt-1">Previous feedback: {task.finalReview.feedback}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedFinalReport({ taskId: task.finalReview._id, report: task.finalReview })}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Review
                    </button>
                  </div>
                </div>
              )}
            </div>
           </div> 
        ))}
      </div>

       {selectedReview && (
        <ReviewModal
          isOpen={true}
          onClose={() => setSelectedReview(null)}
          review={[selectedReview.review]}
          id={selectedReview.taskId}
          // onSubmitReview={(feedback) => {
          //   // onSubmitReview(selectedReview.taskId, selectedReview.review.id, feedback);
          //   setSelectedReview(null);
          // }}
        />
      )}

      {selectedFinalReport && (
        <FeedReviewModal
        isOpen={true}
        onClose={() => setSelectedFinalReport(null)}
        report={selectedFinalReport.report}
          id={selectedFinalReport.taskId}
        />
      )}
    </div>
  );
}
