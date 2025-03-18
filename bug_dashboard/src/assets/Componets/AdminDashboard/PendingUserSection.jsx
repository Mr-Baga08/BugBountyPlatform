import React, { useState } from 'react';
import { Check, X, Users, UserCheck, Search, Filter, ChevronDown } from 'lucide-react';

export default function PendingUserSection({ pendingUsers, loading, approveUser, rejectUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  
  // Filter pending users by search query and role
  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
      {/* Header & Search */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pending User Approvals</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Approve or reject new user registration requests
            </p>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 md:w-1/2">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <Filter className="w-4 h-4" />
                {filterRole === "all" ? "All Roles" : 
                  filterRole === "coach" ? "Team Lead" : "Security Hunter"}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFilterExpanded ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isFilterExpanded && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilterRole("all");
                        setIsFilterExpanded(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        filterRole === "all" 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition-colors duration-300`}
                    >
                      All Roles
                    </button>
                    <button
                      onClick={() => {
                        setFilterRole("coach");
                        setIsFilterExpanded(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        filterRole === "coach" 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition-colors duration-300`}
                    >
                      Team Lead (Coach)
                    </button>
                    <button
                      onClick={() => {
                        setFilterRole("hunter");
                        setIsFilterExpanded(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        filterRole === "hunter" 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition-colors duration-300`}
                    >
                      Security Hunter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pending users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          {pendingUsers.length === 0 ? (
            <>
              <div className="mb-4">
                <UserCheck className="h-12 w-12 mx-auto text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending approvals</h3>
              <p className="text-gray-600 dark:text-gray-400">All user requests have been processed.</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <Users className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching users</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "coach" 
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" 
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                    }`}>
                      {user.role === "coach" ? "Team Lead" : "Security Hunter"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveUser(user._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectUser(user._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination or Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredUsers.length} of {pendingUsers.length} pending users
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}