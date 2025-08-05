import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { ProfileCard } from "./ProfileCard";
import { AccountInfoCard } from "./AccountInfoCard";
// Lazy load the admin-only components
const UnverifiedCorporateUsers = lazy(() => import("./UnverifiedCorporateUsers"));
const PendingVerdictProjectsCard = lazy(() => import("./PendingVerdictProjectsCard"));
/**
 * Admin dashboard component
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
const AdminDashboard = ({
  darkMode = false
}) => {
  return <div className="space-y-8">
      <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Admin Dashboard
      </h1>
      {/* Top row with profile and account info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCard darkMode={darkMode} />
        <AccountInfoCard darkMode={darkMode} />
      </div>

      {/* Pending Verdict Projects section */}
      <div className="mb-8">
        <Suspense fallback={<div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>}>
          <PendingVerdictProjectsCard darkMode={darkMode} />
        </Suspense>
      </div>
      {/* Admin-only section */}
      <div>
        <Suspense fallback={<div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>}>
          <UnverifiedCorporateUsers darkMode={darkMode} />
        </Suspense>
      </div>
    </div>;
};
AdminDashboard.propTypes = {
  darkMode: PropTypes.bool
};

export default AdminDashboard;