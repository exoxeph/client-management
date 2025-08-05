import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dashboardService from '../../services/dashboardService';

/**
 * UnverifiedCorporateUsers Component
 * Displays a list of unverified corporate users for admin review
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 */
const UnverifiedCorporateUsers = ({ darkMode }) => {
  // State for unverified users data
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering and sorting
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Custom scrollbar styles
  const customScrollbarStyle = {
    scrollbarWidth: 'thin',
    scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#CBD5E0 #EDF2F7',
  };

  // CSS for custom scrollbar
  const CustomScrollbarCSS = () => (
    <style jsx="true">{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: ${darkMode ? '#1F2937' : '#EDF2F7'};
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: ${darkMode ? '#4B5563' : '#CBD5E0'};
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${darkMode ? '#6B7280' : '#A0AEC0'};
      }
    `}</style>
  );

  // Fetch unverified users on component mount
  useEffect(() => {
    const fetchUnverifiedUsers = async () => {
      try {
        console.log('Starting to fetch unverified users');
        setLoading(true);
        const data = await dashboardService.getUnverifiedCorporates();
        console.log('Received unverified users data:', data);
        setUnverifiedUsers(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch unverified users:", err);
        setError("Failed to load unverified users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnverifiedUsers();
  }, []);

  // Filter users based on search text
  const filteredUsers = unverifiedUsers.filter(user => {
    const searchText = filterText.toLowerCase();
    const companyName = (user.companyName || user.profile?.companyName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const country = (user.country || user.profile?.headquartersAddress?.country || '').toLowerCase();
    
    return companyName.includes(searchText) || 
           email.includes(searchText) || 
           country.includes(searchText);
  });

  // Sort users based on sort criteria
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = (a.companyName || a.profile?.companyName || '').toLowerCase();
      const nameB = (b.companyName || b.profile?.companyName || '').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'country') {
      const countryA = (a.country || a.profile?.headquartersAddress?.country || '').toLowerCase();
      const countryB = (b.country || b.profile?.headquartersAddress?.country || '').toLowerCase();
      return sortOrder === 'asc' ? countryA.localeCompare(countryB) : countryB.localeCompare(countryA);
    } else { // date
      // Extract timestamp from MongoDB ObjectId
      const timestampA = a._id ? parseInt(a._id.substring(0, 8), 16) * 1000 : 0;
      const timestampB = b._id ? parseInt(b._id.substring(0, 8), 16) * 1000 : 0;
      return sortOrder === 'asc' ? timestampA - timestampB : timestampB - timestampA;
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

  // Format date from MongoDB ObjectId
  const formatDate = (id) => {
    try {
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return "Unknown";
    }
  };
  /**
   * Handle verification
   * @param {string} userId - ID of the user to verify
   */
  const handleVerify = async userId => {
    try {
      await dashboardService.approveCorporate(userId);
      // Remove the verified user from the list
      setUnverifiedUsers(unverifiedUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Failed to verify user:", err);
      setError("Failed to verify user. Please try again later.");
    }
  };
  /**
   * Handle rejection
   * @param {string} userId - ID of the user to reject
   */
  const handleReject = async userId => {
    try {
      await dashboardService.rejectCorporate(userId, { reason: 'Rejected by admin' });
      // Remove the rejected user from the list
      setUnverifiedUsers(unverifiedUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Failed to reject user:", err);
      setError("Failed to reject user. Please try again later.");
    }
  };
  /**
   * View document
   * @param {string} documentUrl - URL of the document to view
   * @param {string} mongoUrl - MongoDB URL for the document
   * @param {boolean} hasMongoData - Whether MongoDB data is available
   */
  const viewDocument = (documentUrl, mongoUrl, hasMongoData) => {
    // Prefer MongoDB URL if available
    if (hasMongoData && mongoUrl) {
      window.open(`http://localhost:5000${mongoUrl}`, '_blank');
      return;
    }
    
    if (documentUrl) {
      // Check if the URL is a relative path
      if (documentUrl.startsWith('/')) {
        // It's a relative path, prepend the backend URL
        window.open(`http://localhost:5000${documentUrl}`, '_blank');
      } else if (!documentUrl.startsWith('http')) {
        // For file paths, extract just the filename and use the appropriate subdirectory
        const pathParts = documentUrl.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        // Determine if it's a business license or tax document based on the path
        const isBusinessLicense = documentUrl.includes('business-licenses') || documentUrl.includes('businessLicense');
        const subDir = isBusinessLicense ? 'business-licenses' : 'tax-documents';
        // Construct a proper URL path
        const properUrl = `/uploads/${subDir}/${fileName}`;
        window.open(`http://localhost:5000${properUrl}`, '_blank');
      } else {
        // It's already a full URL
        window.open(documentUrl, '_blank');
      }
    } else {
      alert("Document not available");
    }
  };
  return <div className="w-full">
      <CustomScrollbarCSS />
      <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Unverified Corporate Users
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Review and process corporate account verification requests
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
              <span className="mr-1.5 font-bold text-lg">
                {loading ? '...' : unverifiedUsers.length}
              </span>{' '}
              Pending
            </span>
            <button onClick={() => toggleSortOrder('date')} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {sortBy === 'date' ? sortOrder === 'desc' ? 'Newest' : 'Oldest' : 'Sort by Date'}
            </button>
          </div>
        </div>
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="Search by company, email, or country..." value={filterText} onChange={e => setFilterText(e.target.value)} className={`pl-10 pr-4 py-2 w-full rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-indigo-500'}`} />
          </div>
          <div className="flex space-x-2">
            <button className={`px-4 py-2 text-sm rounded-lg transition-colors ${sortBy === 'name' ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white' : darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`} onClick={() => toggleSortOrder('name')}>
              Company {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button className={`px-4 py-2 text-sm rounded-lg transition-colors ${sortBy === 'country' ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white' : darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`} onClick={() => toggleSortOrder('country')}>
              Country{' '}
              {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
        {/* Error Alert */}
        {error && <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-500'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>}
        {loading ? <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading verification requests...
            </p>
          </div> : unverifiedUsers.length === 0 ? <div className="text-center py-16 px-4">
            {filterText ?
        // No search results
        <>
                <svg className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Results Found
                </h3>
                <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No users match your search criteria. Try adjusting your filters.
                </p>
                <button className={`mt-4 px-4 py-2 text-sm rounded-lg transition-colors ${darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`} onClick={() => setFilterText('')}>
                  Clear Search
                </button>
              </> :
        // No pending requests
        <>
                <svg className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Pending Requests
                </h3>
                <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  All corporate users have been verified.
                </p>
              </>}
          </div> : <div className="overflow-auto max-h-[70vh] custom-scrollbar" style={customScrollbarStyle}>
            <div className="space-y-6">
              {sortedUsers.map(user => <div key={user._id} className={`overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  {/* Card Header */}
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <div className={`h-12 w-12 rounded-full ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center text-xl font-bold`}>
                            {user.companyName ? user.companyName.charAt(0).toUpperCase() : 'C'}
                          </div>
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800'} flex items-center`}>
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pending Verification
                          </span>
                          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Submitted: {formatDate(user._id)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className="p-6">
                    {/* Company Information */}
                    <div className="mb-6">
                      <h4 className={`text-sm font-bold mb-3 flex items-center uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Company Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Registration Number
                          </p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.registrationNumber || user.profile?.registrationNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Tax ID
                          </p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.taxId || user.profile?.taxId || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Phone
                          </p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.phone || user.profile?.companyPhone || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Country
                          </p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.country || user.profile?.headquartersAddress?.country || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Documents Section */}
                    <div className="mb-6">
                      <h4 className={`text-sm font-bold mb-3 flex items-center uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Verification Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => viewDocument(
                            user.docs?.businessLicenseUrl || user.businessLicense || user.profile?.documents?.businessLicense?.filePath,
                            user.docs?.businessLicenseMongoUrl,
                            user.docs?.hasMongoData
                          )} 
                          className={`flex items-center p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                        >
                          <svg className={`h-5 w-5 mr-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="text-left">
                            <p className="font-medium">Business License</p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              View business registration document
                              {user.docs?.hasMongoData && <span className="ml-1 text-xs text-green-500">(MongoDB)</span>}
                            </p>
                          </div>
                        </button>
                        <button 
                          onClick={() => viewDocument(
                            user.docs?.taxDocUrl || user.taxDocument || user.profile?.documents?.taxDocument?.filePath,
                            user.docs?.taxDocMongoUrl,
                            user.docs?.hasMongoData
                          )} 
                          className={`flex items-center p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                        >
                          <svg className={`h-5 w-5 mr-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="text-left">
                            <p className="font-medium">Tax Document</p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              View tax registration certificate
                              {user.docs?.hasMongoData && <span className="ml-1 text-xs text-green-500">(MongoDB)</span>}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className={`mt-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <h4 className={`text-base font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verification Decision
                          </h4>
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Please review all documents before making a decision
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button onClick={() => handleReject(user._id)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject Application
                          </button>
                          <button onClick={() => handleVerify(user._id)} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve & Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}
      </div>
    </div>;
};

UnverifiedCorporateUsers.propTypes = {
  darkMode: PropTypes.bool
};

export default UnverifiedCorporateUsers;