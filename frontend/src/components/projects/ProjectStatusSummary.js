import React from "react";
import PropTypes from "prop-types";
// PROJECT_STATUS import removed as it's no longer needed
/**
 * Project status summary component showing counts by status
 * @param {Object} props - Component props
 * @param {Object} props.summary - Project summary counts
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 * @param {Function} props.onFilterChange - Callback when a status card is clicked
 * @param {Function} props.onVerdictFilterChange - Callback when a verdict value is clicked
 * @param {string} props.activeFilter - Currently active filter
 * @param {string} props.activeVerdictFilter - Currently active verdict filter
 */
export const ProjectStatusSummary = ({
  summary,
  darkMode = false,
  onFilterChange,
  onVerdictFilterChange,
  activeFilter = "all",
  activeVerdictFilter = "all"
}) => {
  // Process summary data to ensure it has the expected structure
  const summaryWithDefaults = {
    total: summary?.total || 0,
    pending: summary?.status?.pending || 0,
    confirmed: summary?.status?.confirmed || 0,
    rejected: summary?.status?.rejected || 0,
    draft: summary?.draft || 0,
    verdict: {
      none: summary?.verdict?.none || 0,
      pending: summary?.verdict?.pending || 0,
      confirmed: summary?.verdict?.confirmed || 0,
      rejected: summary?.verdict?.rejected || 0
    }
  };

  // For debugging
  console.log('Summary data:', summary);
  console.log('Processed summary data:', summaryWithDefaults);
  console.log('Active filter:', activeFilter);
  console.log('Active verdict filter:', activeVerdictFilter);
  
  /* const statusCards = [{
    id: "all",
    label: "All Projects",
    count: summaryWithDefaults.total,
    bgColor: darkMode ? "bg-gray-700" : "bg-gray-100",
    hoverBgColor: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200",
    textColor: darkMode ? "text-white" : "text-gray-900",
    borderColor: activeFilter === "all" ? darkMode ? "border-indigo-400" : "border-indigo-600" : darkMode ? "border-gray-700" : "border-gray-200",
    icon: <svg className={`h-5 w-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
  }, {
    id: PROJECT_STATUS.PENDING,
    label: "Pending",
    count: summaryWithDefaults.pending,
    verdictCount: summaryWithDefaults.verdict.pending,
    verdictValue: VERDICT_PENDING, // Using the constant to avoid unused import warning
    bgColor: darkMode ? "bg-amber-900/30" : "bg-amber-50",
    hoverBgColor: darkMode ? "hover:bg-amber-900/50" : "hover:bg-amber-100",
    textColor: darkMode ? "text-amber-300" : "text-amber-800",
    borderColor: activeFilter === PROJECT_STATUS.PENDING ? darkMode ? "border-amber-400" : "border-amber-600" : darkMode ? "border-gray-700" : "border-gray-200",
    icon: <svg className={`h-5 w-5 ${darkMode ? "text-amber-400" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
  }, {
    id: PROJECT_STATUS.CONFIRMED,
    label: "Confirmed",
    count: summaryWithDefaults.confirmed,
    verdictCount: summaryWithDefaults.verdict.confirmed,
    verdictValue: VERDICT_CONFIRMED, // Using the constant to avoid unused import warning
    bgColor: darkMode ? "bg-green-900/30" : "bg-green-50",
    hoverBgColor: darkMode ? "hover:bg-green-900/50" : "hover:bg-green-100",
    textColor: darkMode ? "text-green-300" : "text-green-800",
    borderColor: activeFilter === PROJECT_STATUS.CONFIRMED ? darkMode ? "border-green-400" : "border-green-600" : darkMode ? "border-gray-700" : "border-gray-200",
    icon: <svg className={`h-5 w-5 ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
  }, {
    id: PROJECT_STATUS.REJECTED,
    label: "Rejected",
    count: summaryWithDefaults.rejected,
    verdictCount: summaryWithDefaults.verdict.rejected,
    verdictValue: VERDICT_REJECTED, // Using the constant to avoid unused import warning
    bgColor: darkMode ? "bg-red-900/30" : "bg-red-50",
    hoverBgColor: darkMode ? "hover:bg-red-900/50" : "hover:bg-red-100",
    textColor: darkMode ? "text-red-300" : "text-red-800",
    borderColor: activeFilter === PROJECT_STATUS.REJECTED ? darkMode ? "border-red-400" : "border-red-600" : darkMode ? "border-gray-700" : "border-gray-200",
    icon: <svg className={`h-5 w-5 ${darkMode ? "text-red-400" : "text-red-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
  }]; */
  // No verdict filters or buttons as per user request

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Status card buttons removed as per user request */}
      </div>
    </div>
  );
};
ProjectStatusSummary.propTypes = {
  summary: PropTypes.shape({
    total: PropTypes.number.isRequired,
    status: PropTypes.shape({
      pending: PropTypes.number,
      confirmed: PropTypes.number,
      rejected: PropTypes.number
    }),
    draft: PropTypes.number,
    verdict: PropTypes.shape({
      none: PropTypes.number,
      pending: PropTypes.number,
      confirmed: PropTypes.number,
      rejected: PropTypes.number
    })
  }).isRequired,
  darkMode: PropTypes.bool,
  onFilterChange: PropTypes.func.isRequired,
  onVerdictFilterChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.string,
  activeVerdictFilter: PropTypes.string
};
export default ProjectStatusSummary;