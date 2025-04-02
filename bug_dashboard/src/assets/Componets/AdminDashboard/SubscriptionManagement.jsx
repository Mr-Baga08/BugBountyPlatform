// bug_dashboard/src/assets/Componets/AdminDashboard/SubscriptionManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, CreditCard, Shield, AlertTriangle, CheckCircle, 
  X, Loader, RefreshCw, PlusCircle, MinusCircle 
} from 'lucide-react';
import RazorpayService from '../../../services/RazorpayService';
import API_BASE_URL from './config';

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
        
        // Get company ID from local storage - this would be set during login
        const companyId = localStorage.getItem('companyId');
        
        if (!companyId) {
          // If no company ID, fetch user profile to get it
          const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          });
          
          if (!userResponse.ok) {
            throw new Error('Failed to fetch user profile');
          }
          
          const userData = await userResponse.json();
          
          if (!userData.companyId) {
            throw new Error('No company ID associated with user');
          }
          
          // Store for future use
          localStorage.setItem('companyId', userData.companyId);
          
          // Fetch subscription details using the company ID
          const subscriptionData = await RazorpayService.getCompanyUsage(userData.companyId);
          handleSubscriptionData(subscriptionData);
        } else {
          // Fetch subscription details using the stored company ID
          const subscriptionData = await RazorpayService.getCompanyUsage(companyId);
          handleSubscriptionData(subscriptionData);
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    const handleSubscriptionData = (data) => {
      setSubscription(data);
      
      // Set user count from subscription or company data
      if (data.subscription?.userCount) {
        setUserCount(data.subscription.userCount);
        setNewUserCount(data.subscription.userCount);
      } else if (data.company?.userCount) {
        setUserCount(data.company.userCount);
        setNewUserCount(data.company.userCount);
      }
      
      // Set active users count
      setActiveUsers(data.usage?.activeUsers || 0);
    };
    
    fetchSubscriptionData();
  }, []);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining in trial or billing period
  const calculateDaysRemaining = () => {
    if (!subscription) return 0;
    
    if (subscription.company?.isTrial) {
      const trialEnd = new Date(subscription.company.trialEndDate);
      const now = new Date();
      return Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    } else if (subscription.subscription) {
      const periodEnd = new Date(subscription.subscription.nextBillingDate);
      const now = new Date();
      return Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)));
    }
    
    return 0;
  };
  
  // Handle updating user count
  const handleUpdateUserCount = async () => {
    try {
      if (newUserCount < 20) {
        setError('Minimum user count is 20');
        return;
      }
      
      setIsUpdating(true);
      setError(null);
      
      const companyId = localStorage.getItem('companyId');
      if (!companyId) {
        throw new Error('No company ID found');
      }
      
      // Call API to update user count
      const response = await RazorpayService.updateUserCount(companyId, newUserCount);
      
      // Update local state
      setUserCount(response.subscription.userCount);
      
      // Refresh subscription data
      const updatedData = await RazorpayService.getCompanyUsage(companyId);
      setSubscription(updatedData);
      
      setShowUserCountModal(false);
      
    } catch (err) {
      console.error('Error updating user count:', err);
      setError(err.message || 'Failed to update user count. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle cancellation
  const handleCancelSubscription = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const companyId = localStorage.getItem('companyId');
      if (!companyId) {
        throw new Error('No company ID found');
      }
      
      // Call API to cancel subscription
      await fetch(`${API_BASE_URL}/payments/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ companyId })
      });
      
      // Refresh subscription data
      const updatedData = await RazorpayService.getCompanyUsage(companyId);
      setSubscription(updatedData);
      
      setShowConfirmCancel(false);
      
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle resuming a canceled subscription
  const handleResumeSubscription = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const companyId = localStorage.getItem('companyId');
      if (!companyId) {
        throw new Error('No company ID found');
      }
      
      // Call API to resume subscription
      await fetch(`${API_BASE_URL}/payments/resume-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ companyId })
      });
      
      // Refresh subscription data
      const updatedData = await RazorpayService.getCompanyUsage(companyId);
      setSubscription(updatedData);
      
    } catch (err) {
      console.error('Error resuming subscription:', err);
      setError(err.message || 'Failed to resume subscription. Please try again.');
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
                {subscription?.subscription?.interval === 'yearly' ? ' (with 20% annual discount applied)' : ''}
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
            subscription?.company?.isTrial 
              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
              : (subscription?.subscription?.status === 'active')
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : (subscription?.subscription?.status === 'cancelled')
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
          }`}>
            <div className="flex items-start">
              <div className={`p-3 rounded-full mr-4 ${
                subscription?.company?.isTrial 
                  ? 'bg-purple-100 dark:bg-purple-900/40' 
                  : (subscription?.subscription?.status === 'active')
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : (subscription?.subscription?.status === 'cancelled')
                      ? 'bg-amber-100 dark:bg-amber-900/40'
                      : 'bg-gray-100 dark:bg-gray-600'
              }`}>
                {subscription?.company?.isTrial ? (
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                ) : (subscription?.subscription?.status === 'active') ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (subscription?.subscription?.status === 'cancelled') ? (
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                ) : (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {subscription?.company?.isTrial ? 'Free Trial' :
                   (subscription?.subscription?.status === 'active') ? 'Active Subscription' :
                   (subscription?.subscription?.status === 'cancelled') ? 'Subscription Ending' :
                   (subscription?.subscription?.status === 'halted') ? 'Payment Issue' :
                   'Inactive'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {subscription?.company?.isTrial ? (
                    <>Your free trial ends on <strong>{formatDate(subscription.company.trialEndDate)}</strong>. 
                    <strong> {calculateDaysRemaining()} days</strong> remaining.</>
                  ) : (subscription?.subscription?.status === 'active') ? (
                    <>Your subscription is active and will renew on <strong>{formatDate(subscription.subscription.nextBillingDate)}</strong>.</>
                  ) : (subscription?.subscription?.status === 'cancelled') ? (
                    <>Your subscription will end on <strong>{formatDate(subscription.subscription.nextBillingDate)}</strong>. 
                    <strong> {calculateDaysRemaining()} days</strong> remaining.</>
                  ) : (subscription?.subscription?.status === 'halted') ? (
                    <>There's an issue with your payment method. Please update your payment details.</>
                  ) : (
                    <>You don't have an active subscription.</>
                  )}
                </p>
              </div>
              <div>
                {subscription?.company?.isTrial && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade Now
                  </button>
                )}
                {(subscription?.subscription?.status === 'cancelled') && (
                  <button
                    onClick={handleResumeSubscription}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resume Subscription
                  </button>
                )}
                {(!subscription?.company?.isTrial && !subscription?.subscription) && (
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
        {(subscription?.company?.isTrial || subscription?.subscription) && (
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
                      {subscription?.company?.isTrial ? 'Free Trial' : 'Enterprise Plan'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">User Limit</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {subscription?.company?.isTrial ? `${userCount} users during trial` : `${userCount} users`}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Active Users</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeUsers} / {userCount}
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        activeUsers / userCount > 0.8 
                          ? 'bg-amber-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (activeUsers / userCount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {(subscription?.subscription?.status === 'active') && (
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
                {subscription?.subscription && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Plan Cost</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${RazorpayService.calculatePrice(userCount, subscription.subscription.interval).monthlyPrice}/month
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Billing Period</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {subscription.subscription.interval}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Next Billing Date</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription.subscription.nextBillingDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Credit Card **** {subscription.subscription.lastFourDigits || '1234'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {subscription?.company?.isTrial && (
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
                        {formatDate(subscription.company.trialEndDate)}
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
                
                {(subscription?.subscription?.status === 'active') && (
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
                
                {subscription?.company?.isTrial && (
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