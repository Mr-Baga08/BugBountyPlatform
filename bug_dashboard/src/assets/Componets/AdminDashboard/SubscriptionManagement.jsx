// bug_dashboard/src/assets/Componets/AdminDashboard/SubscriptionManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CreditCard, Shield, AlertTriangle, CheckCircle, X, Loader, RefreshCw, PlusCircle, MinusCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from './config';
import { getSubscriptionDetails, updateSubscriptionQuantity, cancelSubscription } from '../../../utils/stripe';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showUserCountModal, setShowUserCountModal] = useState(false);
  const [newUserCount, setNewUserCount] = useState(0);
  
  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch subscription details from backend
        const subscriptionData = await getSubscriptionDetails();
        setSubscription(subscriptionData);
        
        // Set user count from subscription or default value
        if (subscriptionData.quantity) {
          setUserCount(subscriptionData.quantity);
          setNewUserCount(subscriptionData.quantity);
        }
        
        // Fetch active user count
        const usersResponse = await axios.get(`${API_BASE_URL}/users/count`, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        
        setActiveUsers(usersResponse.data.count || 0);
        
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, []);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining in trial or billing period
  const calculateDaysRemaining = () => {
    if (!subscription) return 0;
    
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      return Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    } else {
      const periodEnd = new Date(subscription.current_period_end);
      const now = new Date();
      return Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)));
    }
  };
  
  // Handle updating user count
  const handleUpdateUserCount = async () => {
    try {
      if (newUserCount < 20) {
        alert('Minimum user count is 20');
        return;
      }
      
      setIsUpdating(true);
      setError(null);
      
      await updateSubscriptionQuantity(newUserCount);
      
      // Refresh subscription data
      const subscriptionData = await getSubscriptionDetails();
      setSubscription(subscriptionData);
      setUserCount(subscriptionData.quantity);
      
      setShowUserCountModal(false);
      
    } catch (err) {
      console.error('Error updating user count:', err);
      setError('Failed to update user count. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle cancellation
  const handleCancelSubscription = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      await cancelSubscription();
      
      // Refresh subscription data
      const subscriptionData = await getSubscriptionDetails();
      setSubscription(subscriptionData);
      
      setShowConfirmCancel(false);
      
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Modal for updating user count
  const UserCountModal = () => {
    if (!showUserCountModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update User Count</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Users
              </label>
              <div className="flex items-center">
                <button 
                  onClick={() => setNewUserCount(prev => Math.max(20, prev - 20))}
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-l-md text-gray-700 dark:text-gray-300"
                >
                  <MinusCircle className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  min="20"
                  step="1"
                  value={newUserCount}
                  onChange={(e) => setNewUserCount(parseInt(e.target.value) || 20)}
                  className="p-2 border-t border-b border-gray-300 dark:border-gray-600 text-center w-20 text-gray-900 dark:text-white dark:bg-gray-700"
                />
                <button 
                  onClick={() => setNewUserCount(prev => prev + 20)}
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-r-md text-gray-700 dark:text-gray-300"
                >
                  <PlusCircle className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You will be billed ${newUserCount <= 20 ? 99 : 99 + (Math.ceil((newUserCount - 20) / 20) * 25)} per month
              </p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserCountModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUserCount}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdating ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : 'Update Subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Modal for confirming cancellation
  const CancelConfirmationModal = () => {
    if (!showConfirmCancel) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Cancellation</h3>
            
            <div className="mb-6">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                No, Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdating ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : 'Yes, Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading subscription information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Modal components */}
      <UserCountModal />
      <CancelConfirmationModal />
      
      <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subscription Management</h2>
      </div>
      
      {error && (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button 
            onClick={() => navigate(0)} 
            className="mt-2 text-sm text-red-700 hover:text-red-900 flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh page
          </button>
        </div>
      )}
      
      <div className="p-6">
        {/* Subscription Status Card */}
        <div className="mb-8">
          <div className={`rounded-lg p-6 ${
            subscription?.status === 'trial' 
              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
              : subscription?.status === 'active' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : subscription?.status === 'canceling'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
          }`}>
            <div className="flex items-start">
              <div className={`p-3 rounded-full mr-4 ${
                subscription?.status === 'trial' 
                  ? 'bg-purple-100 dark:bg-purple-900/40' 
                  : subscription?.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : subscription?.status === 'canceling'
                      ? 'bg-amber-100 dark:bg-amber-900/40'
                      : 'bg-gray-100 dark:bg-gray-600'
              }`}>
                {subscription?.status === 'trial' ? (
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                ) : subscription?.status === 'active' ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : subscription?.status === 'canceling' ? (
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                ) : (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {subscription?.status === 'trial' ? 'Free Trial' :
                   subscription?.status === 'active' ? 'Active Subscription' :
                   subscription?.status === 'canceling' ? 'Subscription Ending' :
                   subscription?.status === 'past_due' ? 'Payment Past Due' :
                   'Inactive'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {subscription?.status === 'trial' ? (
                    <>Your free trial ends on <strong>{formatDate(subscription.trial_end)}</strong>. 
                    <strong> {calculateDaysRemaining()} days</strong> remaining.</>
                  ) : subscription?.status === 'active' ? (
                    <>Your subscription is active and will renew on <strong>{formatDate(subscription.current_period_end)}</strong>.</>
                  ) : subscription?.status === 'canceling' ? (
                    <>Your subscription will end on <strong>{formatDate(subscription.current_period_end)}</strong>. 
                    <strong> {calculateDaysRemaining()} days</strong> remaining.</>
                  ) : subscription?.status === 'past_due' ? (
                    <>Your payment is past due. Please update your payment method.</>
                  ) : (
                    <>You don't have an active subscription.</>
                  )}
                </p>
              </div>
              <div>
                {subscription?.status === 'trial' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade Now
                  </button>
                )}
                {subscription?.status === 'canceling' && (
                  <button
                    onClick={handleResumeSubscription}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resume Subscription
                  </button>
                )}
                {subscription?.status === 'inactive' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Details */}
        {(subscription?.status === 'active' || subscription?.status === 'canceling' || subscription?.status === 'trial') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User Information */}
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Management</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Plan</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {subscription?.status === 'trial' ? 'Free Trial' : 'Standard Plan'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">User Limit</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {subscription?.status === 'trial' ? 'Unlimited during trial' : `${userCount} users`}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Active Users</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeUsers} / {subscription?.status === 'trial' ? '∞' : userCount}
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        subscription?.status === 'trial' 
                          ? 'bg-purple-500' 
                          : activeUsers / userCount > 0.8 
                            ? 'bg-amber-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: subscription?.status === 'trial' ? '100%' : `${Math.min(100, (activeUsers / userCount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {subscription?.status === 'active' && (
                  <button
                    onClick={() => {
                      setNewUserCount(userCount);
                      setShowUserCountModal(true);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Update User Count
                  </button>
                )}
              </div>
            </div>
            
            {/* Billing Information */}
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Information</h3>
              </div>
              
              <div className="space-y-4">
                {subscription?.status !== 'trial' && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Plan Cost</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${userCount <= 20 ? 99 : 99 + (Math.ceil((userCount - 20) / 20) * 25)}/month
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Billing Period</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Monthly
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Current Period</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription?.current_period_start)} - {formatDate(subscription?.current_period_end)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Next Invoice</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription?.current_period_end)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {subscription?.status === 'trial' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Free Trial</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        5 days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Trial Ends</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription?.trial_end)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {calculateDaysRemaining()} days
                      </span>
                    </div>
                  </div>
                )}
                
                {(subscription?.status === 'active') && (
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
                
                {subscription?.status === 'trial' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subscribe Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* More Actions Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">More Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin-dashboard/manage-users')}
              className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
            >
              <Users className="h-5 w-5 text-blue-500 mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Manage Users</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add, remove, or update user accounts</p>
            </button>
            
            <button
              onClick={() => navigate('/admin-dashboard/billing-history')}
              className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
            >
              <CreditCard className="h-5 w-5 text-blue-500 mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Billing History</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">View past invoices and payment history</p>
            </button>
            
            <button
              onClick={() => navigate('/admin-dashboard/company-settings')}
              className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
            >
              <Calendar className="h-5 w-5 text-blue-500 mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Company Settings</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update company information and preferences</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;