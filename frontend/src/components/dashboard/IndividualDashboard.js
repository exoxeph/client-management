import React from "react";
import PropTypes from "prop-types";
import { ProfileCard } from "./ProfileCard";
import { AccountInfoCard } from "./AccountInfoCard";
import { RecentProjectsCard } from "./RecentProjectsCard";
/**
 * Individual dashboard component
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
const IndividualDashboard = ({
  darkMode = false
}) => {
  return <div className="space-y-8">
      <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Individual Dashboard
      </h1>
      {/* Top row with profile and account info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCard darkMode={darkMode} />
        <AccountInfoCard darkMode={darkMode} />
      </div>
      {/* Recent Projects section */}
      <div>
        <RecentProjectsCard darkMode={darkMode} />
      </div>
    </div>;
};
IndividualDashboard.propTypes = {
  darkMode: PropTypes.bool
};

export default IndividualDashboard;