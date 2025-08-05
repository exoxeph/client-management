import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Dashboard layout component with navigation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */
const DashboardLayout = ({
  children
}) => {
  const {
    logout
  } = useAuth();
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Client<span className="text-indigo-600">Manager</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${location.pathname === '/dashboard' ? 'bg-indigo-600 text-white focus:ring-indigo-500' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500'}`}>
                Dashboard
              </Link>
              <button onClick={logout} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default DashboardLayout;