import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
/**
 * Profile card component displaying user information
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
export const ProfileCard = ({
  darkMode = false
}) => {
  const {
    currentUser: user,
    logout
  } = useAuth();
  if (!user) {
    return null;
  }
  return <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="flex-shrink-0">
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover" /> : <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
              {user.name?.charAt(0) || 'U'}
            </div>}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.name || 'User'}
          </h2>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${user.role === 'admin' ? darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800' : user.role === 'corporate' ? darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800' : darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} Account
          </div>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your account settings and preferences
          </p>
          <button onClick={logout} className={`text-sm px-4 py-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            Sign Out
          </button>
        </div>
      </div>
    </div>;
};
ProfileCard.propTypes = {
  darkMode: PropTypes.bool
};