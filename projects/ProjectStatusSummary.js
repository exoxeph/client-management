import React from "react";
import PropTypes from "prop-types";
import { PROJECT_STATUS } from "../../services/projects.service";
/**
 * Project status summary component showing counts by status
 * @param {Object} props - Component props
 * @param {Object} props.summary - Project summary counts
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 * @param {Function} props.onFilterChange - Callback when a status card is clicked
 * @param {string} props.activeFilter - Currently active filter
 */
export const ProjectStatusSummary = ({
  summary,
  darkMode = false,
  onFilterChange,
  activeFilter = "all"
}) => {
  const statusCards = [{
    id: "all",
    label: "All Projects",
    count: summary.total,
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
    count: summary.pending,
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
    count: summary.confirmed,
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
    count: summary.rejected,
    bgColor: darkMode ? "bg-red-900/30" : "bg-red-50",
    hoverBgColor: darkMode ? "hover:bg-red-900/50" : "hover:bg-red-100",
    textColor: darkMode ? "text-red-300" : "text-red-800",
    borderColor: activeFilter === PROJECT_STATUS.REJECTED ? darkMode ? "border-red-400" : "border-red-600" : darkMode ? "border-gray-700" : "border-gray-200",
    icon: <svg className={`h-5 w-5 ${darkMode ? "text-red-400" : "text-red-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
  }];
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {statusCards.map(card => <button key={card.id} onClick={() => onFilterChange(card.id)} className={`rounded-lg border p-3 transition-colors cursor-pointer ${card.bgColor} ${card.hoverBgColor} ${card.borderColor}`}>
          <div className="flex items-center mb-2">
            <div className="mr-2">{card.icon}</div>
            <span className={`text-sm font-medium ${card.textColor}`}>{card.label}</span>
          </div>
          <div className={`text-xl font-bold ${card.textColor}`}>{card.count}</div>
        </button>)}
    </div>;
};
ProjectStatusSummary.propTypes = {
  summary: PropTypes.shape({
    total: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
    confirmed: PropTypes.number.isRequired,
    rejected: PropTypes.number.isRequired,
    draft: PropTypes.number
  }).isRequired,
  darkMode: PropTypes.bool,
  onFilterChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.string
};
export default ProjectStatusSummary;