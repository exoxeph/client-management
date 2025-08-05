import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
/**
 * Account information card component
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
export const AccountInfoCard = ({
  darkMode = false
}) => {
  const {
    currentUser: user
  } = useAuth();
  if (!user) {
    return null;
  }
  return <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
      <h2 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Account Information
      </h2>
      <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Email Address
            </p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Account Type
            </p>
            <p className="font-medium capitalize">{user.role} Account</p>
          </div>
        </div>
        <div className="pt-4 border-t border-dashed flex justify-end">
          <button className={`text-sm px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            Update Account
          </button>
        </div>
      </div>
    </div>;
};
AccountInfoCard.propTypes = {
  darkMode: PropTypes.bool
};