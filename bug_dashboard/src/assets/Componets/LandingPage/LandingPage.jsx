import React, { useState, useEffect } from 'react';
import { FaRegMoon, FaSun, FaArrowRight, FaShieldAlt, FaBug, FaChartLine } from 'react-icons/fa';

const LandingPage = ({ navigate }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Astraeus Next Gen<span className="font-thin"> BugHuntPlatform</span></span>
          </div>
          <div className="flex items-center space-x-6">
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300"
              onClick={toggleDarkMode}
            >
              {darkMode ? ( 
                <FaSun className="text-yellow-400 w-5 h-5" />
              ) : (
                <FaRegMoon className="text-gray-800 w-5 h-5" />
              )}
            </button>
            <button 
              onClick={() => navigate('/signin')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300 hover:translate-x-1"
            >
              Get Started
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Enhance Your Security Testing Workflow
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              A powerful platform for security professionals to document, track, and collaborate on security testing tasks.
            </p>
            <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300 hover:translate-x-1"
            >
              Get Started
              <FaArrowRight className="ml-2" />
            </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-500 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative h-64 md:h-96 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-lg transition-all duration-300">
            {/* This would be a hero image or illustration - using a color block for now */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaShieldAlt className="w-24 h-24 text-white opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Key Features</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Tools designed to enhance your security testing workflow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaBug className="w-8 h-8 text-blue-600" />,
                title: "Vulnerability Tracking",
                description: "Document and track vulnerabilities across your projects with detailed reporting."
              },
              {
                icon: <FaShieldAlt className="w-8 h-8 text-blue-600" />,
                title: "Comprehensive Testing",
                description: "Access a library of testing scripts and tools to conduct thorough security assessments."
              },
              {
                icon: <FaChartLine className="w-8 h-8 text-blue-600" />,
                title: "Team Performance",
                description: "Track team performance and progress with intuitive dashboards and leaderboards."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to enhance your security testing?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join our platform today and start managing your security testing workflow more efficiently.
          </p>
          <button 
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
          >
            Get Started Now
          </button>
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
            <div className="flex flex-col md:flex-row md:space-x-12 space-y-4 md:space-y-0">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Features</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Documentation</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">About</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()}  Next Gen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;