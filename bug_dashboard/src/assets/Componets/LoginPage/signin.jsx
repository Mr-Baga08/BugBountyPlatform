import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegMoon, FaSun } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../AdminDashboard/config";

const Signin = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (!email || !password) {
      setMessage("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      // First try regular user login
      console.log("Attempting user login");
      const userLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, { 
        email, 
        password 
      });
      
      console.log("User login successful:", userLoginResponse.data);
      handleSuccessfulLogin(userLoginResponse);
    } catch (userError) {
      console.log("Regular user login failed, trying admin login...", userError);
      
      try {
        // If user login fails, try admin login
        console.log("Attempting admin login");
        const adminLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, { 
          email, 
          password 
        });
        
        console.log("Admin login successful:", adminLoginResponse.data);
        handleSuccessfulLogin(adminLoginResponse);
      } catch (adminError) {
        console.error("Admin login failed:", adminError);
        
        // Both login attempts failed
        const errorMessage = adminError.response?.data?.message || 
                           userError.response?.data?.message || 
                           "Login failed. Please check your credentials.";
        
        setMessage(errorMessage);
        setIsLoading(false);
      }
    }
  };

  // Handle successful login response
  const handleSuccessfulLogin = (response) => {
    const data = response.data;
    
    // Store auth token
    localStorage.setItem("token", data.token);
    
    // Determine user role and store it
    const role = data.admin ? "admin" : (data.user ? data.user.role : null);
    localStorage.setItem("userRole", role);
    
    // Store user info
    if (data.user) {
      localStorage.setItem("userName", data.user.username || "User");
      localStorage.setItem("userEmail", data.user.email);
    } else if (data.admin) {
      localStorage.setItem("userName", "Admin");
      localStorage.setItem("userEmail", data.admin.email);
    }
    
    // Set the role in the app state
    setUserRole(role);
    
    // Navigate to the appropriate dashboard
    if (role === "hunter") {
      navigate("/hunter");
    } else if (role === "coach") {
      navigate("/coach");
    } else if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      setMessage("Unknown role. Please contact support.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Astraeus Next Gen<span className="font-thin"> BugHuntPlatform</span></h2>
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-colors duration-300"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <FaSun className="text-yellow-400" />
              ) : (
                <FaRegMoon className="text-gray-600 dark:text-white" />
              )}
            </button>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Welcome back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 transition-colors duration-300">
              Sign in to continue to your dashboard
            </p>

            {/* Error Message */}
            {message && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="flex justify-center text-sm mt-2">
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Don't have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium transition-colors duration-300"
                  >
                    Register here
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
