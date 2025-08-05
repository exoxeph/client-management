import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import dashboardService from "../../services/dashboardService";
/**
 * Activity card component displaying recent user activities
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
export const ActivityCard = ({
  darkMode = false
}) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getRecentActivity();
        setActivities(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError("Failed to load recent activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);
  /**
   * Format timestamp to relative time (e.g., "5 minutes ago")
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted relative time
   */
  const formatRelativeTime = timestamp => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  };
  /**
   * Get icon based on activity type
   * @param {string} type - Activity type
   * @returns {JSX.Element} Icon element
   */
  const getActivityIcon = type => {
    switch (type) {
      case 'login':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>;
      case 'update':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>;
      case 'document':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>;
      case 'approval':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>;
      case 'rejection':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>;
      default:
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>;
    }
  };
  return <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h2>
        <button className={`text-sm px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-indigo-400 hover:bg-gray-700' : 'text-indigo-600 hover:bg-gray-100'}`}>
          View All Activity
        </button>
      </div>
      {isLoading ? <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div> : error ? <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-500'}`}>
          {error}
        </div> : activities.length === 0 ? <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Recent Activity</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your recent activity will appear here.</p>
        </div> : <div className="space-y-4">
          {activities.map(activity => <div key={activity.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${activity.type === 'login' ? darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600' : activity.type === 'update' ? darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-600' : activity.type === 'document' ? darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600' : activity.type === 'approval' ? darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-600' : darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600'}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activity.title}
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activity.description}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
};
ActivityCard.propTypes = {
  darkMode: PropTypes.bool
};