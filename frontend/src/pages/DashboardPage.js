import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
// Import role-specific dashboards
import AdminDashboard from '../components/dashboard/AdminDashboard';
import CorporateDashboard from '../components/dashboard/CorporateDashboard';
import IndividualDashboard from '../components/dashboard/IndividualDashboard';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const DashboardPage = ({ darkMode = false }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  
  // Debug user information
  useEffect(() => {
    console.log('Current User:', currentUser);
    console.log('User Role:', currentUser?.role);
    console.log('Is Authenticated:', isAuthenticated);
    
    // Check localStorage directly
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('User from localStorage:', JSON.parse(storedUser));
    } else {
      console.log('No user found in localStorage');
    }
  }, [currentUser, isAuthenticated]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case "admin":
        return <AdminDashboard darkMode={darkMode} />;
      case "corporate":
        return <CorporateDashboard darkMode={darkMode} />;
      case "individual":
        return <IndividualDashboard darkMode={darkMode} />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage;