import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import dashboardService from '../../services/dashboardService';
import { toast } from 'react-toastify';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // State for filtering and sorting
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Custom scrollbar styles
  const customScrollbarStyle = useMemo(() => ({
    scrollbarWidth: 'thin',
    scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#CBD5E0 #EDF2F7',
  }), [darkMode]);

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

  // Fetch unverified users with debounced search
  const fetchUnverifiedUsers = useCallback(async () => {
    try {
      console.log('Starting to fetch unverified users');
      setLoading(true);
      
      // Track performance
      const startTime = performance.now();
      
      // Prepare query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortOrder === 'asc' ? 'oldest' : 'newest'
      };
      
      // Add search query if filter text exists
      if (filterText.trim()) {
        params.q = filterText.trim();
      }
      
      // Make API call
      const data = await dashboardService.getUnverifiedCorporates(params);
      
      // Track performance
      const endTime = performance.now();
      console.log(`Unverified users fetch completed in ${endTime - startTime}ms`);
      
      // Update state with response data
      setUnverifiedUsers(data.users || []);
      setPagination({
        page: data.page || 1,
        limit: pagination.limit,
        total: data.total || 0,
        pages: data.pages || 0
      });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch unverified users:", err);
      setError("Failed to load unverified users. Please try again later.");
      toast.error("Failed to load unverified users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortOrder, filterText]);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    // Track component mount performance
    const mountTime = performance.now();
    console.log('UnverifiedCorporateUsers component mounting');
    
    fetchUnverifiedUsers();
    
    // Add a test function to the window object for debugging
    window.testRejectUser = async (userId) => {
      console.log('Testing reject user function with ID:', userId);
      try {
        const result = await dashboardService.rejectCorporate(userId, { reason: 'Test rejection' });
        console.log('Test rejection result:', result);
        return result;
      } catch (error) {
        console.error('Test rejection failed:', error);
        throw error;
      }
    };
    
    // Cleanup function
    return () => {
      console.log(`UnverifiedCorporateUsers component was mounted for ${performance.now() - mountTime}ms`);
      // Clean up the test function when component unmounts
      delete window.testRejectUser;
    };
  }, [fetchUnverifiedUsers, refreshTrigger]);

  // Apply client-side sorting
  const sortedUsers = useMemo(() => {
    return [...unverifiedUsers].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (a.companyName || '').toLowerCase();
        const nameB = (b.companyName || '').toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (sortBy === 'country') {
        const countryA = (a.country || '').toLowerCase();
        const countryB = (b.country || '').toLowerCase();
        return sortOrder === 'asc' ? countryA.localeCompare(countryB) : countryB.localeCompare(countryA);
      } else { // date
        // Extract timestamp from MongoDB ObjectId or use createdAt
        const dateA = a.submittedAt ? new Date(a.submittedAt) : 
                     (a._id ? new Date(parseInt(a._id.substring(0, 8), 16) * 1000) : new Date(0));
        const dateB = b.submittedAt ? new Date(b.submittedAt) : 
                     (b._id ? new Date(parseInt(b._id.substring(0, 8), 16) * 1000) : new Date(0));
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [unverifiedUsers, sortBy, sortOrder]);

  // Toggle sort order
  const toggleSortOrder = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  // Format date from MongoDB ObjectId or ISO string
  const formatDate = useCallback((user) => {
    try {
      // First try to use submittedAt if available
      if (user.submittedAt) {
        return new Date(user.submittedAt).toLocaleDateString();
      }
      // Fall back to ObjectId timestamp
      if (user._id) {
        const timestamp = parseInt(user._id.substring(0, 8), 16) * 1000;
        return new Date(timestamp).toLocaleDateString();
      }
      return "Unknown";
    } catch (e) {
      return "Unknown";
    }
  }, []);
  
  /**
   * Handle verification
   * @param {string} userId - ID of the user to verify
   */
  const handleVerify = useCallback(async (userId) => {
    try {
      setLoading(true);
      await dashboardService.approveCorporate(userId);
      // Remove the verified user from the list
      setUnverifiedUsers(prev => prev.filter(user => user._id !== userId));
      toast.success("Corporate user approved successfully");
      // Refresh the list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to verify user:", err);
      setError("Failed to verify user. Please try again later.");
      toast.error("Failed to verify user");
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Handle rejection
   * @param {string} userId - ID of the user to reject
   */
  const handleReject = useCallback(async (userId) => {
    if (!userId) {
      toast.error("Cannot reject user: Invalid user ID");
      return;
    }
    
    try {
      if (!window.confirm("Are you sure you want to reject this corporate user? This action cannot be undone.")) {
        return;
      }
      
      setLoading(true);
      
      await dashboardService.rejectCorporate(userId, { reason: 'Rejected by admin' });
      
      // Remove the rejected user from the list
      setUnverifiedUsers(prev => prev.filter(user => user._id !== userId));
      
      toast.success("Corporate user rejected successfully");
      // Refresh the list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError("Failed to reject user. Please try again later.");
      toast.error("Failed to reject user");
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * View document
   * @param {string} documentUrl - URL of the document to view
   * @param {boolean} hasMongoData - Whether MongoDB data is available
   */
  const viewDocument = useCallback((documentUrl, hasMongoData) => {
    // Add more detailed debugging
    console.log('==================== DEBUG START ====================');
    console.log('viewDocument called with:', { documentUrl, hasMongoData });
    console.log('User agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    console.log('==================== DEBUG END ====================');
    
    if (!documentUrl) {
      console.log('Document URL is missing');
      toast.warning("Document not available");
      return;
    }
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    console.log('Auth token exists:', !!token);
    
    // Show loading indicator
    toast.info("Loading document...", { autoClose: 2000 });
    
    // Standardize the API URL
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace(/\/api$/, ''); // Remove /api if present to get the server base URL
    console.log('API Base URL:', apiBaseUrl);
    console.log('Base URL:', baseUrl);
    console.log('Environment variables:', process.env);
    
    let fetchUrl;
    
    console.log('==================== URL CONSTRUCTION DEBUG ====================');
    console.log('Document URL type:', typeof documentUrl);
    console.log('Document URL length:', documentUrl?.length);
    console.log('Document URL first 10 chars:', documentUrl?.substring(0, 10));
    console.log('hasMongoData:', hasMongoData);
    
    // If hasMongoData is true, construct MongoDB API URL
    if (hasMongoData) {
      console.log('Using MongoDB data path');
      // Extract corporate ID from the current URL
      const urlParts = window.location.pathname.split('/');
      const corporateId = urlParts[urlParts.length - 1];
      console.log('Extracted corporateId from URL:', corporateId);
      
      // Determine if it's a business license or tax document
      const isBusinessLicense = documentUrl.toLowerCase().includes('business') || 
                               documentUrl.toLowerCase().includes('license');
      
      // Construct the API endpoint
      const endpoint = isBusinessLicense ? 
        `/api/documents/business-license/${corporateId}` : 
        `/api/documents/tax-document/${corporateId}`;
      
      fetchUrl = `${baseUrl}${endpoint}`;
      console.log('MongoDB API endpoint constructed:', fetchUrl);
    }
    // Handle API endpoints
    else if (documentUrl.startsWith('/api/')) {
      fetchUrl = `${baseUrl}${documentUrl}`;
      console.log('API endpoint URL detected:', fetchUrl);
    }
    // Handle relative paths
    else if (documentUrl.startsWith('/')) {
      fetchUrl = `${baseUrl}${documentUrl}`;
      console.log('Relative path detected:', fetchUrl);
    }
    // Handle full URLs
    else if (documentUrl.startsWith('http')) {
      fetchUrl = documentUrl;
      console.log('Full URL detected:', fetchUrl);
    }
    // Handle file paths with backslashes (Windows style)
    else if (documentUrl.includes('\\uploads')) {
      console.log('Windows path with uploads detected');
      // Extract the path after 'uploads'
      const uploadsIndex = documentUrl.indexOf('uploads');
      if (uploadsIndex !== -1) {
        const pathAfterUploads = documentUrl.substring(uploadsIndex);
        // Replace backslashes with forward slashes for URL
        const normalizedPath = pathAfterUploads.replace(/\\/g, '/');
        fetchUrl = `${baseUrl}/${normalizedPath}`;
        console.log('Normalized path:', normalizedPath);
        console.log('Final fetchUrl:', fetchUrl);
      } else {
        console.log('Invalid document path format');
        toast.error('Invalid document path format');
        return;
      }
    }
    // Handle other file paths
    else {
      console.log('Other file path detected');
      // Extract filename and determine document type
      const pathParts = documentUrl.split(/[\/\\]/);
      const fileName = pathParts[pathParts.length - 1];
      console.log('Extracted filename:', fileName);
      
      const isBusinessLicense = documentUrl.toLowerCase().includes('business') || 
                               documentUrl.toLowerCase().includes('license');
      const subDir = isBusinessLicense ? 'business-licenses' : 'tax-documents';
      console.log('Document type:', isBusinessLicense ? 'Business License' : 'Tax Document');
      
      fetchUrl = `${baseUrl}/uploads/${subDir}/${fileName}`;
      console.log('Final fetchUrl for other path:', fetchUrl);
    }
    console.log('==================== END URL CONSTRUCTION DEBUG ====================');
    
    console.log('Final fetch URL:', fetchUrl);
    
    // Set up fetch options with authorization
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add cache control to prevent caching issues
      cache: 'no-store'
    };
    
    console.log('==================== FETCH DEBUG ====================');
    console.log('Fetch options:', { 
      method: fetchOptions.method, 
      headers: fetchOptions.headers, 
      cache: fetchOptions.cache 
    });
    
    // Add a timestamp to the URL to prevent caching
    const timestampedUrl = fetchUrl + (fetchUrl.includes('?') ? '&' : '?') + '_t=' + new Date().getTime();
    console.log('Timestamped URL to prevent caching:', timestampedUrl);
    
    // Fetch the document
    console.log('Starting fetch request...');
    
    // Use a try-catch block to catch any synchronous errors
    try {
      fetch(timestampedUrl, fetchOptions)
        .then(response => {
          console.log('Fetch response received:', { 
            status: response.status, 
            ok: response.ok,
            statusText: response.statusText,
            headers: [...response.headers.entries()].reduce((obj, [key, value]) => {
              obj[key] = value;
              return obj;
            }, {})
          });
          
          if (!response.ok) {
            // Check specific error codes
            if (response.status === 401) {
              console.log('Authentication error (401)');
              throw new Error('Authentication error. Please log in again.');
            } else if (response.status === 403) {
              console.log('Permission error (403)');
              throw new Error('You do not have permission to view this document.');
            } else if (response.status === 404) {
              console.log('Document not found (404)');
              throw new Error('Document not found. It may have been deleted or moved.');
            }
            console.log(`Error fetching document: ${response.status}`);
            throw new Error(`Error fetching document: ${response.status}`);
          }
          
          console.log('Response is OK, getting blob...');
          return response.blob();
        })
        .then(blob => {
          console.log('Blob received:', { size: blob.size, type: blob.type });
          // Create a blob URL
          const url = window.URL.createObjectURL(blob);
          console.log('Blob URL created');
          
          // Create a hidden link and trigger download
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer'; // Security best practice
          
          // Open the document in a new tab
          console.log('Opening document in new tab...');
          window.open(url, '_blank');
          
          // Clean up the blob URL after a delay to ensure it's loaded in the new tab
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            console.log('Blob URL revoked');
          }, 5000);
          
          toast.success("Document loaded successfully");
        })
        .catch(error => {
          console.error('Fetch promise error:', error);
          toast.error(error.message || 'Error viewing document. Please try again.');
        });
    } catch (error) {
      console.error('Synchronous fetch error:', error);
      toast.error('Error initiating document fetch. Please try again.');
    }
    
    console.log('==================== END FETCH DEBUG ====================');
  }, []);
  
  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  }, [pagination.pages]);
  
  // Render pagination controls
  const renderPagination = () => {
    if (pagination.pages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)} 
          disabled={pagination.page === 1}
          className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500 hover:text-white'}`}
        >
          Previous
        </button>
        
        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
          // Show pages around current page
          let pageNum;
          if (pagination.pages <= 5) {
            pageNum = i + 1;
          } else if (pagination.page <= 3) {
            pageNum = i + 1;
          } else if (pagination.page >= pagination.pages - 2) {
            pageNum = pagination.pages - 4 + i;
          } else {
            pageNum = pagination.page - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded-md ${pagination.page === pageNum ? 
                (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : 
                (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button 
          onClick={() => handlePageChange(pagination.page + 1)} 
          disabled={pagination.page === pagination.pages}
          className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} ${pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500 hover:text-white'}`}
        >
          Next
        </button>
      </div>
    );
  }
  
  // Render user card
  const renderUserCard = (user) => { return (
    <div key={user._id} className={`overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
                {user.companyName || 'Company Name'}
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
                Submitted: {formatDate(user)}
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
                {user.registrationNumber || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tax ID
              </p>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.taxId || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Phone
              </p>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Country
              </p>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.country || 'N/A'}
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
                user.docs?.businessLicenseUrl,
                user.docs?.hasMongoData
              )} 
              className={`flex items-center p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              disabled={!user.docs?.businessLicenseUrl || loading}
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
                user.docs?.taxDocUrl,
                user.docs?.hasMongoData
              )} 
              className={`flex items-center p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              disabled={!user.docs?.taxDocUrl || loading}
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
              <button 
                onClick={() => handleReject(user._id)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center mr-2"
                disabled={loading}
                id={`reject-btn-${user._id}`}
                type="button"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Application
              </button>
              <button 
                onClick={() => handleVerify(user._id)} 
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center"
                disabled={loading}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

  /* Main component return statement */
  return (
    <>
      <CustomScrollbarCSS />
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Unverified Corporate Users</h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Review and verify corporate user registrations
            </p>
          </div>
          {/* Search and Filter */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by company name or email..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          )}
          {/* User List */}
          {!loading && sortedUsers.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No unverified corporate users found
            </div>
          )}
          {!loading && sortedUsers.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {sortedUsers.map(user => renderUserCard(user))}
            </div>
          )}
          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </>
  );
}

UnverifiedCorporateUsers.propTypes = {
  darkMode: PropTypes.bool
};

export default UnverifiedCorporateUsers;