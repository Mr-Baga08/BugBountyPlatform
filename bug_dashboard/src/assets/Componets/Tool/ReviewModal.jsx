import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';


export function ReviewModal({ isOpen, onClose, review,id, onSubmitReview }) {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    try{
      const response = await axios.patch(`API_BASE_URL + "/taskReview/addFeedBack/${id}`,
        {
            "feedBack":feedback
        });
        alert("added the review successfully");
        
    }catch(error){
      console.log(error);
      alert("not able to submit");
    }
  };

  const handleFeedBack = ()=>{

  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Review Submission</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
          {Array.isArray(review) &&
            review.map((review) => (
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
  </div>
              
            ))}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Review Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Provide your feedback..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  // onClick={handleFeedBack}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
