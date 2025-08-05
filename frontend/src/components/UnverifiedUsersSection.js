import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

// Custom scrollbar styles
const customScrollbarStyle = {
  scrollbarWidth: 'thin',
  scrollbarColor: '#9ca3af transparent',
};

// Add custom CSS for webkit scrollbars
const CustomScrollbarCSS = () => (
  <style>
    {`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #9ca3af;
        border-radius: 20px;
      }
      
      /* Firefox scrollbar */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #9ca3af transparent;
      }
    `}
  </style>
);

export const UnverifiedUsersSection = ({
  darkMode,
  unverifiedUsers,
  loading,
  error,
  handleVerify,
  handleReject,
  viewDocument,
}) => {
  // Add state for filtering and sorting
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'country'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  // Filter users based on search text
  const filteredUsers = unverifiedUsers.filter(user => {
    const companyName = user.companyName || user.profile?.companyName || '';
    const email = user.email || '';
    const country = user.country || user.profile?.headquartersAddress?.country || '';
    const searchText = filterText.toLowerCase();
    
    return (
      companyName.toLowerCase().includes(searchText) ||
      email.toLowerCase().includes(searchText) ||
      country.toLowerCase().includes(searchText)
    );
  });
  
  // Sort users based on selected criteria
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = (a.companyName || a.profile?.companyName || '').toLowerCase();
      const nameB = (b.companyName || b.profile?.companyName || '').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'country') {
      const countryA = (a.country || a.profile?.headquartersAddress?.country || '').toLowerCase();
      const countryB = (b.country || b.profile?.headquartersAddress?.country || '').toLowerCase();
      return sortOrder === 'asc' ? countryA.localeCompare(countryB) : countryB.localeCompare(countryA);
    } else {
      // Default sort by date (assuming newer registrations have higher IDs)
      return sortOrder === 'asc' ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id);
    }
  });
  
  // Toggle sort order
  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Format date from MongoDB ID (first 8 chars of ObjectId contain a timestamp)
  const formatDate = (id) => {
    if (!id || id.length < 8) return 'Unknown';
    try {
      // Extract timestamp from MongoDB ObjectId
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Unknown';
    }
  };
  return (
    <>
      <CustomScrollbarCSS />
      <div className="mt-8">
        <div className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 w-full max-w-7xl mx-auto">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full mr-4 ${
                  darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Unverified Corporate Users
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Review and process corporate account verification requests
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
                  darkMode
                    ? 'bg-blue-900/30 text-blue-300'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                <span className="mr-1.5 font-bold text-lg">{loading ? '...' : filteredUsers.length}</span> Pending
              </span>
              <Button 
                variant={darkMode ? 'outline-dark' : 'outline'} 
                size="sm"
                onClick={() => toggleSortOrder('date')}
                className="flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {sortBy === 'date' ? (sortOrder === 'desc' ? 'Newest' : 'Oldest') : 'Sort by Date'}
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 w-full max-w-7xl mx-auto">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by company, email, or country..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-indigo-500'}`}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={sortBy === 'name' ? (darkMode ? 'primary-dark' : 'primary') : (darkMode ? 'outline-dark' : 'outline')} 
                size="sm"
                onClick={() => toggleSortOrder('name')}
              >
                Company {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button 
                variant={sortBy === 'country' ? (darkMode ? 'primary-dark' : 'primary') : (darkMode ? 'outline-dark' : 'outline')} 
                size="sm"
                onClick={() => toggleSortOrder('country')}
              >
                Country {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading verification requests...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 px-4">
              {filterText ? (
                // No search results
                <>
                  <svg
                    className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Results Found
                  </h3>
                  <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No users match your search criteria. Try adjusting your filters.
                  </p>
                  <Button 
                    variant={darkMode ? 'outline-dark' : 'outline'} 
                    size="md"
                    className="mt-4"
                    onClick={() => setFilterText('')}
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                // No pending requests
                <>
                  <svg
                    className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Pending Requests
                  </h3>
                  <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    All corporate users have been verified.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div
              className="overflow-auto max-h-[70vh] w-full max-w-7xl custom-scrollbar mx-auto"
              style={customScrollbarStyle}
            >
              <div className="grid gap-8">
                {sortedUsers.map((user) => (
                  <Card
                    key={user._id}
                    className={`overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      className={`px-8 py-6 border-b ${
                        darkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      {/* Card Header Content */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <div className={`h-14 w-14 rounded-full ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center text-xl font-bold`}>
                              {user.companyName ? user.companyName.charAt(0).toUpperCase() : 'C'}
                            </div>
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user.companyName || user.profile?.companyName || 'Company Name'}
                            </h3>
                            <div className="flex items-center mt-1">
                              <svg className={`h-4 w-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {user.email}
                              </p>
                            </div>
                            <div className="flex items-center mt-1">
                              <svg className={`h-4 w-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Submitted: {formatDate(user._id)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-col items-end">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800'} flex items-center`}>
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pending Verification
                          </span>
                        </div>
                        </div>
                      </div>
                    </div>
                    {/* Card Body */}
                    <div className="p-8">
                      {/* Company Information */}
                      <div className="mb-8">
                        <h4 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <svg className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Company Information
                        </h4>
                        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                            <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Registration Number</p>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.registrationNumber || user.profile?.registrationNumber || 'N/A'}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                            <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tax ID</p>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.taxId || user.profile?.taxId || 'N/A'}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                            <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.phone || user.profile?.companyPhone || 'N/A'}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                            <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Country</p>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.country || user.profile?.headquartersAddress?.country || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Documents Section */}
                      <div className="mb-8">
                        <h4 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <svg className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Verification Documents
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center mb-3">
                              <svg className={`h-6 w-6 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Business License</p>
                            </div>
                            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Official business registration document issued by government authorities.
                            </p>
                            <Button 
                              variant={darkMode ? 'outline-dark' : 'outline'}
                              size="sm"
                              className="w-full justify-center"
                              onClick={() => viewDocument(user.businessLicense || (user.profile?.documents?.businessLicense?.filePath))}
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Business License
                            </Button>
                          </div>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center mb-3">
                              <svg className={`h-6 w-6 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tax Document</p>
                            </div>
                            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Tax registration certificate or other tax-related documentation.
                            </p>
                            <Button 
                              variant={darkMode ? 'outline-dark' : 'outline'}
                              size="sm"
                              className="w-full justify-center"
                              onClick={() => viewDocument(user.taxDocument || (user.profile?.documents?.taxDocument?.filePath))}
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Tax Document
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className={`mt-8 p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            <h4 className={`text-lg font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              <svg className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Verification Decision
                            </h4>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Please review all documents carefully before making a decision
                            </p>
                          </div>
                          <div className="flex space-x-4">
                            <Button 
                              variant="danger-dark"
                              size="md"
                              className="flex items-center"
                              onClick={() => handleReject(user._id)}
                            >
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject Application
                            </Button>
                            <Button 
                              variant="success-dark"
                              size="md"
                              className="flex items-center"
                              onClick={() => handleVerify(user._id)}
                            >
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve & Verify
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};