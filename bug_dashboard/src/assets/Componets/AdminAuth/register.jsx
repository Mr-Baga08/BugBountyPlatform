// bug_dashboard/src/assets/Componets/AdminAuth/register.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegMoon, FaSun, FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../AdminDashboard/config";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsLoading(true);

    if (!email || !password) {
      setMessage("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Sending admin registration to: ${API_BASE_URL}/admin/register`);
      const response = await axios.post(`${API_BASE_URL}/admin/register`, { email, password });

      setIsSuccess(true);
      setMessage(response.data.message || "Admin registered successfully!");
      
      // Clear form after successful registration
      setEmail("");
      setPassword("");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/admin/login");
      }, 3000);
      
    } catch (error) {
      console.error("Admin registration error:", error);
      setMessage(
        error.response?.data?.message || 
        "Registration failed. Please try again with different credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Admin Registration</h2>
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-colors duration-300"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaRegMoon className="text-gray-600 dark:text-white" />}
            </button>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Create Admin Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 transition-colors duration-300">
              Register a new administrator account
            </p>

            {/* Alert Message */}
            {message && (
              <div className={`mb-4 p-3 border rounded-md ${isSuccess 
                ? "bg-green-100 border-green-400 text-green-700" 
                : "bg-red-100 border-red-400 text-red-700"}`}
              >
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    autoComplete="new-password"
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  (isLoading || isSuccess) ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Registration Successful
                  </span>
                ) : (
                  "Register Admin"
                )}
              </button>

              <div className="flex justify-center text-sm mt-2">
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Already have an admin account?{" "}
                  <span
                    onClick={() => navigate("/admin/login")}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium transition-colors duration-300"
                  >
                    Sign in here
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

export default AdminRegister;