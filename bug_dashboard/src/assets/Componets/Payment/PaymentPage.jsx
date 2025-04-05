// bug_dashboard/src/assets/Componets/Payment/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, CreditCard, Check, AlertCircle, Loader } from 'lucide-react';
import RazorpayService from '../../../services/RazorpayService';
import API_BASE_URL from '../AdminDashboard/config';

const PaymentPage = ({ navigate, location }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  
  // Get plan details from location state
  const planDetails = location?.state || { 
    planType: 'trial',
    selectedPlan: 'small',
    userCount: 3,
    price: 299,
    interval: 'monthly'
  };
  
  // Calculate price details for display
  const priceInfo = RazorpayService.calculatePrice(
    planDetails.selectedPlan || 'small', 
    planDetails.userCount, 
    planDetails.interval
  );
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Load Razorpay script when component mounts
    RazorpayService.loadScript();
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Validate the form
  const validateForm = () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Valid email is required');
      return false;
    }
    if (!phone.trim() || !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
      setError('Valid phone number is required');
      return false;
    }
    return true;
  };

  // Handle free trial signup
  const handleTrialSignup = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Request trial setup from the backend
      const trialData = {
        companyName,
        email,
        phone,
        selectedPlan: planDetails.selectedPlan,
        userCount: planDetails.userCount
      };
      
      const response = await RazorpayService.setupTrial(trialData);
      
      setIsSuccess(true);
      
      // Redirect to dashboard/setup after a delay
      setTimeout(() => {
        navigate('/setup', { 
          state: { 
            trialCreated: true,
            companyId: response.companyId,
            companyName,
            email,
            selectedPlan: planDetails.selectedPlan,
            userCount: planDetails.userCount,
            trialEndDate: response.trialEndDate
          } 
        });
      }, 2000);
    } catch (err) {
      console.error('Error creating trial:', err);
      setError(err.message || 'An error occurred while creating your trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription payment
  const handleSubscriptionPayment = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare customer data
      const customerData = {
        companyName,
        email,
        phone,
        selectedPlan: planDetails.selectedPlan,
        userCount: planDetails.userCount,
        interval: planDetails.interval
      };
      
      // Step 1: Create subscription order via backend
      const orderData = await RazorpayService.createSubscriptionOrder(customerData);
      
      // Step 2: Open Razorpay payment modal
      await RazorpayService.openPaymentModal(
        orderData,
        customerData,
        // Success callback
        async (paymentData) => {
          try {
            // Step 3: Verify payment with backend
            const verifyResponse = await RazorpayService.verifyPayment(paymentData, customerData);
            
            setIsSuccess(true);
            
            // Redirect to setup page after successful payment
            setTimeout(() => {
              navigate('/setup', { 
                state: { 
                  subscriptionActive: true,
                  companyId: verifyResponse.subscription.companyId,
                  companyName,
                  email,
                  selectedPlan: planDetails.selectedPlan,
                  userCount: planDetails.userCount
                } 
              });
            }, 2000);
          } catch (verifyError) {
            setError(verifyError.message || 'Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
        // Error callback
        (errorMessage) => {
          setError(errorMessage || 'Payment process was interrupted. Please try again.');
          setIsLoading(false);
        }
      );
      
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (planDetails.planType === 'trial') {
      handleTrialSignup();
    } else {
      handleSubscriptionPayment();
    }
  };

  // Format price display with commas for thousands
  const formatPrice = (price) => {
    return price.toLocaleString('en-US');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Pricing
            </button>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {planDetails.planType === 'trial' ? 'Start Your Free Trial' : 'Complete Your Subscription'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {planDetails.planType === 'trial' 
              ? 'Enter your details to begin your 5-day free trial' 
              : 'Enter your details to complete your subscription'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Form Section (3 columns on md+) */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {planDetails.planType === 'trial' 
                      ? 'Your free trial is ready!' 
                      : 'Your subscription is active!'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {planDetails.planType === 'trial'
                      ? 'We\'re redirecting you to set up your account...'
                      : 'We\'re redirecting you to set up your account...'}
                  </p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}
                  
                  {/* Company Details */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company/Organization Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="contact@example.com"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      We'll send important account information to this email
                    </p>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="+1 (123) 456-7890"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center ${
                      planDetails.planType === 'trial'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : planDetails.planType === 'trial' ? (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Start Free Trial
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </button>
                  
                  {/* Terms & Conditions */}
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    By proceeding, you agree to our{' '}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
          
          {/* Summary Section (2 columns on md+) */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {/* Plan Name */}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {planDetails.selectedPlan?.charAt(0).toUpperCase() + planDetails.selectedPlan?.slice(1)} Plan
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {planDetails.userCount} Users
                  </span>
                </div>
                
                {/* Billing Cycle */}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Billing Cycle</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {planDetails.interval}
                  </span>
                </div>
                
                {/* User Price Breakdown */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Base Price ({priceInfo.includedUsers} users)
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${planDetails.interval === 'yearly' 
                        ? formatPrice(priceInfo.basePrice * 12 * 0.8)
                        : formatPrice(priceInfo.basePrice)}/{planDetails.interval === 'yearly' ? 'yr' : 'mo'}
                    </span>
                  </div>
                  
                  {priceInfo.additionalUsers > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Additional Users ({priceInfo.additionalUsers})
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ${planDetails.interval === 'yearly' 
                          ? formatPrice(priceInfo.additionalCost * 12 * 0.8)
                          : formatPrice(priceInfo.additionalCost)}/{planDetails.interval === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    </div>
                  )}
                  
                  {planDetails.interval === 'yearly' && (
                    <div className="flex justify-between text-sm mt-2 text-green-600 dark:text-green-400">
                      <span>Annual Discount (20%)</span>
                      <span>-${formatPrice(priceInfo.yearlySavings)}</span>
                    </div>
                  )}
                </div>
                
                {/* Total */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      ${planDetails.interval === 'yearly' 
                        ? formatPrice(priceInfo.yearlyPrice)
                        : formatPrice(priceInfo.monthlyPrice)}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        /{planDetails.interval === 'yearly' ? 'year' : 'month'}
                      </span>
                    </span>
                  </div>
                  
                  {planDetails.interval === 'yearly' && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400 text-right">
                      (Equivalent to ${formatPrice(priceInfo.effectiveMonthlyPrice)}/month)
                    </p>
                  )}
                </div>
                
                {/* Trial Note */}
                {planDetails.planType === 'trial' && (
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Your 5-day free trial includes:</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        Full access to all features
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        {planDetails.userCount} user accounts
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        No credit card required
                      </li>
                    </ul>
                  </div>
                )}
                
                {/* Payment Info */}
                {planDetails.planType !== 'trial' && (
                  <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Secure payment processing by Razorpay
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;