// bug_dashboard/src/assets/Componets/Payment/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Users, Building, Shield, X, ChevronDown, ChevronUp, Info } from 'lucide-react';

const PricingPage = ({ navigate }) => {
  const [showFaq, setShowFaq] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('small'); // small, medium, enterprise
  const [userCount, setUserCount] = useState(3);
  const [totalPrice, setTotalPrice] = useState(299); // This will be the displayed price
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    // Calculate price based on plan and additional users
    let basePrice = 0;
    let basePlanUsers = 0;
    let additionalUserCost = 69;

    // Set base plan details
    if (selectedPlan === 'small') {
      basePrice = 299;
      basePlanUsers = 3;
    } else if (selectedPlan === 'medium') {
      basePrice = 499;
      basePlanUsers = 5;
    } else if (selectedPlan === 'large') {
      basePrice = 799;
      basePlanUsers = 10;
    }

    // Calculate additional users cost
    const additionalUsers = Math.max(0, userCount - basePlanUsers);
    const additionalCost = additionalUsers * additionalUserCost;
    
    // Calculate final price (monthly)
    let monthlyPrice = basePrice + additionalCost;
    
    // Set the appropriate price based on billing interval
    if (activeTab === 'yearly') {
      // Apply 20% discount for yearly pricing and multiply by 12
      const yearlyPrice = Math.round(monthlyPrice * 0.8 * 12);
      setTotalPrice(yearlyPrice);
    } else {
      setTotalPrice(monthlyPrice);
    }
  }, [userCount, selectedPlan, activeTab]);

  const handleUserCountChange = (e) => {
    let minUsers = 3;
    if (selectedPlan === 'medium') minUsers = 5;
    if (selectedPlan === 'large') minUsers = 10;

    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minUsers) {
      setUserCount(value);
    }
  };
  
  // Calculate the monthly equivalent for yearly display
  const getMonthlyEquivalent = () => {
    if (activeTab === 'yearly') {
      return (totalPrice / 12).toFixed(0);
    }
    return totalPrice;
  };

  const handlePlanSelect = (planType) => {
    navigate('/payment', { state: { 
      planType, 
      selectedPlan,
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

  // Handle plan tier selection
  const handlePlanTierChange = (plan) => {
    setSelectedPlan(plan);
    
    // Set minimum users based on plan
    if (plan === 'small' && userCount < 3) {
      setUserCount(3);
    } else if (plan === 'medium' && userCount < 5) {
      setUserCount(5);
    } else if (plan === 'large' && userCount < 10) {
      setUserCount(10);
    }
  };

  const FAQs = [
    {
      question: "What's included in the subscription?",
      answer: "Your subscription includes access to our full bug hunting platform with task management, user role management (admin, coach, hunter), and all security testing features. You'll also receive regular updates and basic support."
    },
    {
      question: "How many admin accounts do I get?",
      answer: "The Small and Medium plans include one admin account. The Large plan includes two admin accounts. For more admin accounts, please contact us for an Enterprise plan."
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

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Small Plan */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg ${
            selectedPlan === 'small' ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          }`}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Small Team</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">For small security teams</p>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${activeTab === 'yearly' ? '2,870' : '299'}</span>
                <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">/{activeTab === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'yearly' ? 'Billed annually (20% savings)' : 'Billed monthly'}
              </p>
              {activeTab === 'yearly' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Equivalent to $239/mo</p>
              )}
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>3 users</strong> included
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>1 admin</strong> account
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    $69 per additional user
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    All core features
                  </span>
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanTierChange('small')}
                className={`mt-6 w-full py-2 px-4 rounded-lg font-medium ${
                  selectedPlan === 'small'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors duration-300`}
              >
                {selectedPlan === 'small' ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
          
          {/* Medium Plan */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg ${
            selectedPlan === 'medium' ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          }`}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Medium Team</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">For growing security teams</p>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${activeTab === 'yearly' ? '4,790' : '499'}</span>
                <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">/{activeTab === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'yearly' ? 'Billed annually (20% savings)' : 'Billed monthly'}
              </p>
              {activeTab === 'yearly' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Equivalent to $399/mo</p>
              )}
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>5 users</strong> included
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>1 admin</strong> account
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    $69 per additional user
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Premium reporting features
                  </span>
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanTierChange('medium')}
                className={`mt-6 w-full py-2 px-4 rounded-lg font-medium ${
                  selectedPlan === 'medium'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors duration-300`}
              >
                {selectedPlan === 'medium' ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
          
          {/* Large Plan */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg ${
            selectedPlan === 'large' ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          }`}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Large Team</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">For established security teams</p>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${activeTab === 'yearly' ? '7,670' : '799'}</span>
                <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">/{activeTab === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'yearly' ? 'Billed annually (20% savings)' : 'Billed monthly'}
              </p>
              {activeTab === 'yearly' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Equivalent to $639/mo</p>
              )}
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>10 users</strong> included
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>2 admin</strong> accounts
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    $69 per additional user
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Advanced security analytics
                  </span>
                </li>
              </ul>
              
              <button
                onClick={() => handlePlanTierChange('large')}
                className={`mt-6 w-full py-2 px-4 rounded-lg font-medium ${
                  selectedPlan === 'large'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors duration-300`}
              >
                {selectedPlan === 'large' ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customize User Count */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customize Your Plan</h2>
          
          {/* User Count Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Users
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min={selectedPlan === 'small' ? 3 : selectedPlan === 'medium' ? 5 : 10}
                step="1"
                value={userCount}
                onChange={handleUserCountChange}
                className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                <Users className="h-4 w-4 inline mr-1" />
                {selectedPlan === 'small' 
                  ? `${Math.max(0, userCount - 3)} additional users (base plan: 3 users)`
                  : selectedPlan === 'medium'
                    ? `${Math.max(0, userCount - 5)} additional users (base plan: 5 users)`
                    : `${Math.max(0, userCount - 10)} additional users (base plan: 10 users)`
                }
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'monthly' ? (
                <>
                  Base price: ${selectedPlan === 'small' ? '299' : selectedPlan === 'medium' ? '499' : '799'}/month + 
                  ${Math.max(0, userCount - (selectedPlan === 'small' ? 3 : selectedPlan === 'medium' ? 5 : 10)) * 69}/month for additional users
                </>
              ) : (
                <>
                  Base price: ${(selectedPlan === 'small' ? 299 : selectedPlan === 'medium' ? 499 : 799) * 12 * 0.8}/year + 
                  ${Math.max(0, userCount - (selectedPlan === 'small' ? 3 : selectedPlan === 'medium' ? 5 : 10)) * 69 * 12 * 0.8}/year for additional users
                  {" (20% discount applied for yearly billing)"}
                </>
              )}
            </p>
          </div>
          
          {/* Total Price */}
          <div className="bg-gray-50 dark:bg-gray-700/70 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Price:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${totalPrice}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/{activeTab === 'monthly' ? 'month' : 'year'}</span>
                {activeTab === 'yearly' && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    20% discount applied
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="mt-8 space-y-4">
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

      {/* Enterprise Contact */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Need an Enterprise plan?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Contact our team for custom deployment, high-volume needs, or more admin accounts.
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