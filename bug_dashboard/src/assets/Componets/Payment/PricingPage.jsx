// bug_dashboard/src/assets/Componets/Payment/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Users, Building, Shield, X, ChevronDown, ChevronUp, Info } from 'lucide-react';

const PricingPage = ({ navigate }) => {
  const [showFaq, setShowFaq] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');
  const [userCount, setUserCount] = useState(20);
  const [basePrice, setBasePrice] = useState(99); // Store the monthly base price
  const [totalPrice, setTotalPrice] = useState(99); // This will be the displayed price based on active tab
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    // Calculate the base monthly price based on user count
    let monthlyPrice = 99; // Base price for first 20 users
    
    if (userCount > 20) {
      const additionalGroups = Math.ceil((userCount - 20) / 20);
      monthlyPrice += additionalGroups * 25;
    }
    
    setBasePrice(monthlyPrice);
    
    // Now calculate the final price based on billing interval
    if (activeTab === 'yearly') {
      // Apply 20% discount for yearly pricing
      setTotalPrice(Math.round(monthlyPrice * 0.8));
    } else {
      setTotalPrice(monthlyPrice);
    }
  }, [userCount, activeTab]);

  const handleUserCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 20) {
      setUserCount(value);
    }
  };
  
  // Calculate the yearly total (for the small text showing annual savings)
  const getYearlyTotal = () => {
    return (totalPrice * 12).toFixed(0);
  };

  const handlePlanSelect = (planType) => {
    navigate('/payment', { state: { 
      planType, 
      userCount, 
      price: totalPrice,
      interval: activeTab
    }});
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const FAQs = [
    {
      question: "What's included in the subscription?",
      answer: "Your subscription includes access to our full bug hunting platform with task management, user role management (admin, coach, hunter), and all security testing features. You'll also receive regular updates and basic support."
    },
    {
      question: "How does the user count work?",
      answer: "Your subscription allows for a set number of user accounts across all roles (admin, coach, and security hunter). You can allocate these accounts as needed for your organization. Additional users beyond your plan limit will require an upgrade."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade your plan at any time to accommodate more users. Your billing will be prorated to reflect the change."
    },
    {
      question: "What happens after the free trial?",
      answer: "After your 5-day free trial, you'll be automatically subscribed to the plan you selected during signup. You can cancel anytime before the trial ends if you don't wish to continue."
    }
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Enterprise-Grade Bug Hunting Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Scale your security testing team with our all-in-one platform. Start with a free 5-day trial.
        </p>
        
        {/* Pricing Toggle */}
        <div className="flex justify-center mt-10 mb-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'yearly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly <span className="text-green-600 dark:text-green-400 ml-1">Save 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.01]">
          <div className="bg-blue-600 px-6 py-12 text-white text-center">
            <h2 className="text-3xl font-bold">Enterprise Plan</h2>
            <p className="mt-4 text-blue-100">Customized for your team size</p>
            
            <div className="mt-6 flex justify-center items-baseline">
              <span className="text-5xl font-extrabold">${totalPrice}</span>
              <span className="ml-1 text-xl text-blue-200">/{activeTab === 'monthly' ? 'month' : 'year'}</span>
            </div>
            
            <p className="mt-2 text-sm text-blue-200">
              {activeTab === 'yearly' ? `$${getYearlyTotal()} billed annually (20% off)` : ''}
            </p>
          </div>

          <div className="p-6">
            {/* User Count Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Users
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="20"
                  step="1"
                  value={userCount}
                  onChange={handleUserCountChange}
                  className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4 inline mr-1" />
                  {userCount <= 20 ? 'Base tier (up to 20 users)' : `${Math.floor((userCount - 1) / 20) + 1} tiers of 20 users each`}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Price: $99 for first 20 users + $25 for each additional 20 users
                {activeTab === 'yearly' && " (20% discount applied for yearly billing)"}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">What's included:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    5-day free trial with full access
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>{userCount}</strong> user accounts (Admin, Coach, Hunter roles)
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Unlimited tasks and security testing projects
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Comprehensive dashboard and reporting
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Resource library and knowledge base access
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Email notifications and task management
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Leaderboard and performance tracking
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 space-y-4">
              <button
                onClick={() => handlePlanSelect('trial')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
              >
                <Shield className="h-5 w-5 mr-2" />
                Start 5-Day Free Trial
              </button>
              <button
                onClick={() => handlePlanSelect('subscribe')}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-8 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Subscribe Now (Skip Trial)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Contact */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Need a custom plan?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Contact our team for special requirements, custom deployments, or high-volume discounts.
            </p>
          </div>
          <button 
            onClick={() => navigate('/contact')}
            className="px-6 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-300 flex items-center"
          >
            <Building className="h-5 w-5 mr-2" />
            Contact Sales
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to know about our pricing and platform.</p>
        </div>

        <div className="space-y-4">
          {FAQs.map((faq, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center justify-between"
                onClick={() => setShowFaq(showFaq === index ? false : index)}
              >
                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                {showFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              {showFaq === index && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Astraeus Next Gen<span className="font-thin"> BugHuntPlatform</span></span>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Secure. Test. Report.</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Astraeus Next Gen. All rights reserved.
              </p>
              <div className="mt-2 flex items-center justify-center md:justify-end space-x-4 text-sm">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;