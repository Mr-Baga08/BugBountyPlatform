import React, { useState, useEffect } from 'react';
import { Link, PlusCircle, FileText, Video, ExternalLink, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../AdminDashboard/config';

const AdminResourceManager = () => {
  // State for resources
  const [textDocs, setTextDocs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('text');
  
  // State for new resource forms
  const [newTextDoc, setNewTextDoc] = useState({ title: '', content: '' });
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });
  
  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Fetch existing resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const [textResponse, videoResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/texts`),
          axios.get(`${API_BASE_URL}/videos`)
        ]);
        
        setTextDocs(textResponse.data);
        setVideos(videoResponse.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
        showAlert('error', 'Failed to load resources. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
  // Helper function to show alerts
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };
  
  // Handle form input changes
  const handleTextDocChange = (e) => {
    const { name, value } = e.target;
    setNewTextDoc(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setNewVideo(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submissions
  const handleTextDocSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTextDoc.title || !newTextDoc.content) {
      showAlert('error', 'Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/texts/add`, newTextDoc, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        }
      });
      
      setTextDocs(prev => [...prev, response.data]);
      setNewTextDoc({ title: '', content: '' });
      showAlert('success', 'Documentation added successfully!');
    } catch (error) {
      console.error('Error adding documentation:', error);
      showAlert('error', 'Failed to add documentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    
    if (!newVideo.title || !newVideo.url) {
      showAlert('error', 'Please fill in all fields');
      return;
    }
    
    // Simple URL validation
    if (!newVideo.url.startsWith('http')) {
      showAlert('error', 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/videos/add`, newVideo, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        }
      });
      
      setVideos(prev => [...prev, response.data]);
      setNewVideo({ title: '', url: '' });
      showAlert('success', 'Video link added successfully!');
    } catch (error) {
      console.error('Error adding video link:', error);
      showAlert('error', 'Failed to add video link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resource deletion
  const handleDeleteTextDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this documentation?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/texts/${id}`, {
        headers: { 'Authorization': localStorage.getItem('token') }
      });
      
      setTextDocs(prev => prev.filter(doc => doc._id !== id));
      showAlert('success', 'Documentation deleted successfully!');
    } catch (error) {
      console.error('Error deleting documentation:', error);
      showAlert('error', 'Failed to delete documentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video link?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/videos/${id}`, {
        headers: { 'Authorization': localStorage.getItem('token') }
      });
      
      setVideos(prev => prev.filter(video => video._id !== id));
      showAlert('success', 'Video link deleted successfully!');
    } catch (error) {
      console.error('Error deleting video link:', error);
      showAlert('error', 'Failed to delete video link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resource Management</h1>
        
        {/* Alert Message */}
        {alert.show && (
          <div className={`mb-4 p-4 rounded-md ${
            alert.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
          }`}>
            <div className="flex items-center">
              {alert.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{alert.message}</span>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'text'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('text')}
          >
            <FileText className="h-4 w-4 inline-block mr-1" />
            Documentation
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'video'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('video')}
          >
            <Video className="h-4 w-4 inline-block mr-1" />
            Video Links
          </button>
        </div>
        
        {/* Content based on active tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Add New Resource */}
          <div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New {activeTab === 'text' ? 'Documentation' : 'Video Link'}
              </h2>
              
              {activeTab === 'text' ? (
                <form onSubmit={handleTextDocSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newTextDoc.title}
                      onChange={handleTextDocChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="E.g., SQL Injection Prevention Guide"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      name="content"
                      value={newTextDoc.content}
                      onChange={handleTextDocChange}
                      rows={8}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="Enter detailed documentation content here..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Documentation
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVideoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newVideo.title}
                      onChange={handleVideoChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="E.g., XSS Testing Tutorial"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={newVideo.url}
                      onChange={handleVideoChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="https://example.com/video"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Video Link
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          
          {/* Right Column: Existing Resources */}
          <div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Existing {activeTab === 'text' ? 'Documentation' : 'Video Links'}
              </h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading resources...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {activeTab === 'text' ? (
                    textDocs.length > 0 ? (
                      textDocs.map((doc) => (
                        <div key={doc._id} className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                {doc.content.substring(0, 100)}...
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Added: {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteTextDoc(doc._id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete documentation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                        No documentation available. Add your first document.
                      </p>
                    )
                  ) : (
                    videos.length > 0 ? (
                      videos.map((video) => (
                        <div key={video._id} className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{video.title}</h3>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center mt-1"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {video.url.length > 40 ? `${video.url.substring(0, 40)}...` : video.url}
                              </a>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Added: {new Date(video.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteVideo(video._id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete video link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                        No video links available. Add your first video link.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResourceManager;