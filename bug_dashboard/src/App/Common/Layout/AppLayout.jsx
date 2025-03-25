import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun, LogOut, Trophy, Home, Settings, User, Menu, X } from "lucide-react";

const AppLayout = ({ children, title, showLeaderboard = true }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case "hunter":
        return "/hunter";
      case "coach":
        return "/coach";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={getDashboardLink()} className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Astraeus Next Gen<span className="font-thin"> BugHuntPlatform</span></span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to={getDashboardLink()}
                  className="border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-300"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                {showLeaderboard && (
                  <Link
                    to="/leaderboard"
                    className="border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-300"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    Leaderboard
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {title && <h1 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h1>}
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">{userName}</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to={getDashboardLink()}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
              >
                <Home className="h-5 w-5 mr-2 inline" />
                Dashboard
              </Link>
              {showLeaderboard && (
                <Link
                  to="/leaderboard"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                >
                  <Trophy className="h-5 w-5 mr-2 inline" />
                  Leaderboard
                </Link>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 pb-3">
                <div className="flex items-center px-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-base font-medium text-gray-800 dark:text-white">{userName}</div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-300"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="h-5 w-5 mr-2 text-yellow-400" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-300"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;