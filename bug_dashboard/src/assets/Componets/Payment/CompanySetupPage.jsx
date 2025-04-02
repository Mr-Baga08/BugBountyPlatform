// bug_dashboard/src/assets/Componets/Payment/CompanySetupPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserPlus, User, UserCheck, Shield, Info, Check, Clock } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../AdminDashboard/config';

const CompanySetupPage = ({ navigate, location }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [companyData, setCompanyData] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  const [error, setError] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Company info form state
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Invite users form state
  const [inviteEmails, setInviteEmails] = useState('');
  const [selectedRole, setSelectedRole] = useState('hunter');
  
  // Get plan details from location state
  const setupDetails = location?.state || { 
    trialCreated: true,
    companyId: 'demo-company-id',
    userCount: 20
  };
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Load company data
    const fetchCompanyData = async () => {
      try {
        // In a real implementation, we would fetch from API
        // const response = await axios.get(`${API_BASE_URL}/payments/company-usage/${setupDetails.companyId}`);
        // setCompanyData(response.data);
        
        // Simulated data for demo
        setCompanyData({
          company: {
            id: setupDetails.companyId,
            name: setupDetails.companyName || 'Your Company',
            email: setupDetails.email || 'admin@company.com',
            isTrial: setupDetails.trialCreated || false,
            trialEndDate: setupDetails.trialCreated ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) : null
          },
          subscription: setupDetails.trialCreated ? null : {
            id: 'sub-123',
            billingCycle: 'monthly',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          usage: {
            maxUsers: setupDetails.userCount || 20,
            activeUsers: 1, // Admin account
            availableSlots: (setupDetails.userCount || 20) - 1
          }
        });
        
        // Pre-fill email from state if available
        if (setupDetails.email) {
          setAdminEmail(setupDetails.email);
        }
        
        // Pre-fill company name if available
        if (setupDetails.companyName) {
          setCompanyName(setupDetails.companyName);
        }
        
      } catch (err) {
        console.error('Error loading company data:', err);
        setError('Failed to load company information. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [darkMode, setupDetails]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Handle account setup form submission
  const handleAccountSetup = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    
    if (!adminName.trim()) {
      setError('Admin name is required');
      return;
    }
    
    if (!adminEmail.trim() || !/^\S+@\S+\.\S+$/.test(adminEmail)) {
      setError('Valid email is required');
      return;
    }
    
    if (adminPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would send to API
      // await axios.post(`${API_BASE_URL}/setup/complete-account`, {
      //   companyId: setupDetails.companyId,
      //   companyName,
      //   adminName,
      //   adminEmail,
      //   adminPassword
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to next tab
      setActiveTab('invite');
    } catch (err) {
      console.error('Error completing account setup:', err);
      setError('Failed to complete account setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user invitations
  const handleInviteUsers = async (e) => {
    e.preventDefault();
    
    if (!inviteEmails.trim()) {
      setError('Please enter at least one email address');
      return;
    }
    
    // Parse emails (comma or newline separated)
    const emails = inviteEmails
      .split(/[\s,]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (!emails.length) {
      setError('Please enter valid email addresses');
      return;
    }
    
    // Validate email format
    const invalidEmails = emails.filter(email => !/^\S+@\S+\.\S+$/.test(email));
    if (invalidEmails.length) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }
    
    // Check if inviting too many users
    if (emails.length > companyData.usage.availableSlots) {
      setError(`You can only invite ${companyData.usage.availableSlots} more users with your current plan`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would send to API
      // await axios.post(`${API_BASE_URL}/setup/invite-users`, {
      //   companyId: setupDetails.companyId,
      //   emails,
      //   role: selectedRole
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success
      setSetupComplete(true);
    } catch (err) {
      console.error('Error inviting users:', err);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle completion and redirect to dashboard
  const goToDashboard = () => {
    // In a real app, we would save the auth state
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("userName", adminName || "Admin");
    localStorage.setItem("userEmail", adminEmail);
    
    // Redirect to admin dashboard
    navigate('/admin-dashboard');
  };

  // If still loading
  if (isLoading && !companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Success page after setup is complete
  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Setup Complete!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Your Bug Hunt Platform account is ready to use. Your team members will receive email invitations to join.
            </p>
            
            <button
              onClick={goToDashboard}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Astraeus Next Gen<span className="font-thin"> BugHuntPlatform</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300"
              onClick={toggleDarkMode}
            >
              {darkMode ? ( 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-yellow-400 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-800 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Set Up Your Bug Hunt Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Complete a few quick steps to get your security testing team up and running
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Account Summary */}
          {companyData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-blue-100 dark:border-blue-800">
              <div className="flex items-center text-blue-800 dark:text-blue-300">
                <Info className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {companyData.company.isTrial ? (
                    <>
                      <span className="font-bold">Free Trial: </span>
                      Your 5-day trial includes {companyData.usage.maxUsers} users
                      {companyData.company.trialEndDate && (
                        <span className="ml-1">
                          (ends {new Date(companyData.company.trialEndDate).toLocaleDateString()})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Enterprise Plan: </span>
                      {companyData.usage.maxUsers} users, {companyData.subscription?.billingCycle || 'monthly'} billing
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Setup Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                className={`px-6 py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('account')}
              >
                <User className="h-4 w-4 mr-2" />
                Account Setup
              </button>
              <button
                className={`px-6 py-4 text-center border-b-2 font-medium text-sm flex items-center justify-center ${
                  activeTab === 'invite'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('invite')}
                disabled={activeTab === 'account'} // Only enabled after account setup
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Members
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Setup Form */}
            {activeTab === 'account' && (
              <form onSubmit={handleAccountSetup} className="space-y-6">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company/Organization Name
                  </label>
                  <input
                    type="text"
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="admin-name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="admin-email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="admin-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    <Shield className="h-4 w-4 inline-block mr-1" />
                    <span className="font-medium">Admin Account</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You'll have full control of your Bug Hunt Platform, including user management, resource creation, and task assignment.
                  </p>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Continue to Invite Team Members'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Invite Team Members Form */}
            {activeTab === 'invite' && (
              <form onSubmit={handleInviteUsers} className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    You can add up to {companyData?.usage?.availableSlots || 19} more users with your current plan.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Invite by Email
                  </label>
                  <textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter email addresses (comma or line separated)&#10;example1@company.com&#10;example2@company.com"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Separate multiple emails with commas or line breaks
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedRole === 'hunter'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20'
                      }`}
                      onClick={() => setSelectedRole('hunter')}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          selectedRole === 'hunter' ? 'bg-blue-500' : 'border border-gray-400'
                        }`}>
                          {selectedRole === 'hunter' && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Security Hunter</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 ml-6">
                        Can work on assigned tasks and submit security findings
                      </p>
                    </div>
                    
                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedRole === 'coach'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20'
                      }`}
                      onClick={() => setSelectedRole('coach')}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          selectedRole === 'coach' ? 'bg-blue-500' : 'border border-gray-400'
                        }`}>
                          {selectedRole === 'coach' && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Team Lead (Coach)</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 ml-6">
                        Can review work, provide feedback, and manage tasks
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 inline-block mr-1" />
                    Team members will receive an email invitation with instructions to set up their account.
                  </p>
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-300 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Send Invitations & Complete Setup'
                    )}
                  </button>
                </div>
                
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={goToDashboard}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Skip for now and go to dashboard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySetupPage;