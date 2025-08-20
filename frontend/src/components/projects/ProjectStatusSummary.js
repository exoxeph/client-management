import React from "react";
import PropTypes from "prop-types";
import { PROJECT_STATUS, PROJECT_VERDICT } from "../../services/projects.service"; // Import the constants

export const ProjectStatusSummary = ({
  summary,
  darkMode = false,
  onFilterChange,
  onVerdictFilterChange,
  activeFilter = "all",
  activeVerdictFilter = "all",
  currentUser // We expect this new prop from ProjectsPage
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'project_manager';

  const summaryWithDefaults = {
    total: summary?.total || 0,
    status: {
      pending: summary?.status?.pending || 0,
      confirmed: summary?.status?.confirmed || 0,
      rejected: summary?.status?.rejected || 0,
    },
    verdict: {
      pending: summary?.verdict?.pending || 0,
      confirmed: summary?.verdict?.confirmed || 0,
      rejected: summary?.verdict?.rejected || 0,
    },
  };
  
  // --- THIS IS THE NEW INTELLIGENT LOGIC ---
  // We define the structure for all possible cards first.

  const allProjectsCard = {
    id: "all",
    verdictValue: "all",
    label: "All Projects",
    count: summaryWithDefaults.total,
    bgColor: activeFilter === "all" && activeVerdictFilter === "all" ? (darkMode ? "bg-indigo-500" : "bg-indigo-600") : (darkMode ? "bg-gray-700" : "bg-gray-100"),
    textColor: activeFilter === "all" && activeVerdictFilter === "all" ? "text-white" : (darkMode ? "text-white" : "text-gray-900"),
    borderColor: activeFilter === "all" && activeVerdictFilter === "all" ? (darkMode ? "border-indigo-400" : "border-indigo-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
    hoverBgColor: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200",
    icon: <svg className={`h-5 w-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  };

  // Cards for the CLIENT view (filters by project status)
  const clientStatusCards = [
    {
      id: PROJECT_STATUS.PENDING,
      label: "Pending",
      count: summaryWithDefaults.status.pending,
      bgColor: darkMode ? "bg-amber-900/30" : "bg-amber-50",
      hoverBgColor: darkMode ? "hover:bg-amber-900/50" : "hover:bg-amber-100",
      textColor: darkMode ? "text-amber-300" : "text-amber-800",
      borderColor: activeFilter === PROJECT_STATUS.PENDING ? (darkMode ? "border-amber-400" : "border-amber-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
      icon: <svg className={`h-5 w-5 ${darkMode ? "text-amber-400" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      id: PROJECT_STATUS.CONFIRMED,
      label: "Confirmed",
      count: summaryWithDefaults.status.confirmed,
      bgColor: darkMode ? "bg-green-900/30" : "bg-green-50",
      hoverBgColor: darkMode ? "hover:bg-green-900/50" : "hover:bg-green-100",
      textColor: darkMode ? "text-green-300" : "text-green-800",
      borderColor: activeFilter === PROJECT_STATUS.CONFIRMED ? (darkMode ? "border-green-400" : "border-green-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
      icon: <svg className={`h-5 w-5 ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      id: PROJECT_STATUS.REJECTED,
      label: "Rejected",
      count: summaryWithDefaults.status.rejected,
      bgColor: darkMode ? "bg-red-900/30" : "bg-red-50",
      hoverBgColor: darkMode ? "hover:bg-red-900/50" : "hover:bg-red-100",
      textColor: darkMode ? "text-red-300" : "text-red-800",
      borderColor: activeFilter === PROJECT_STATUS.REJECTED ? (darkMode ? "border-red-400" : "border-red-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
      icon: <svg className={`h-5 w-5 ${darkMode ? "text-red-400" : "text-red-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  // Cards for the ADMIN view (filters by project verdict)
  const adminVerdictCards = [
    {
      id: "all",
      verdictValue: PROJECT_VERDICT.PENDING,
      label: "Pending Verdict",
      count: summaryWithDefaults.verdict.pending,
      bgColor: activeVerdictFilter === PROJECT_VERDICT.PENDING ? (darkMode ? "bg-amber-500" : "bg-amber-400") : (darkMode ? "bg-gray-700" : "bg-gray-100"),
      textColor: activeVerdictFilter === PROJECT_VERDICT.PENDING ? "text-white" : (darkMode ? "text-white" : "text-gray-900"),
      borderColor: activeVerdictFilter === PROJECT_VERDICT.PENDING ? (darkMode ? "border-amber-400" : "border-amber-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
      hoverBgColor: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200",
      icon: <svg className={`h-5 w-5 ${activeVerdictFilter === PROJECT_VERDICT.PENDING ? "text-white" : (darkMode ? "text-amber-400" : "text-amber-600")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      id: "all",
      verdictValue: PROJECT_VERDICT.CONFIRMED,
      label: "Confirmed",
      count: summaryWithDefaults.verdict.confirmed,
      bgColor: activeVerdictFilter === PROJECT_VERDICT.CONFIRMED ? (darkMode ? "bg-green-500" : "bg-green-500") : (darkMode ? "bg-gray-700" : "bg-gray-100"),
      textColor: activeVerdictFilter === PROJECT_VERDICT.CONFIRMED ? "text-white" : (darkMode ? "text-white" : "text-gray-900"),
      borderColor: activeVerdictFilter === PROJECT_VERDICT.CONFIRMED ? (darkMode ? "border-green-400" : "border-green-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
      hoverBgColor: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200",
      icon: <svg className={`h-5 w-5 ${activeVerdictFilter === PROJECT_VERDICT.CONFIRMED ? "text-white" : (darkMode ? "text-green-400" : "text-green-600")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      id: "all",
      verdictValue: PROJECT_VERDICT.REJECTED,
      label: "Rejected",
      count: summaryWithDefaults.verdict.rejected,
      bgColor: activeVerdictFilter === PROJECT_VERDICT.REJECTED ? (darkMode ? "bg-red-500" : "bg-red-500") : (darkMode ? "bg-gray-700" : "bg-gray-100"),
      textColor: activeVerdictFilter === PROJECT_VERDICT.REJECTED ? "text-white" : (darkMode ? "text-white" : "text-gray-900"),
      borderColor: activeVerdictFilter === PROJECT_VERDICT.REJECTED ? (darkMode ? "border-red-400" : "border-red-600") : (darkMode ? "border-gray-700" : "border-gray-200"),
      hoverBgColor: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200",
      icon: <svg className={`h-5 w-5 ${activeVerdictFilter === PROJECT_VERDICT.REJECTED ? "text-white" : (darkMode ? "text-red-400" : "text-red-600")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  // Conditionally choose which set of cards to display after the "All Projects" card.
  const statusCards = isAdmin 
    ? [allProjectsCard, ...adminVerdictCards] 
    : [allProjectsCard, ...clientStatusCards];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusCards.map(card => (
          <button
            key={card.label} // Using label for the key is safer here
            onClick={() => {
              onFilterChange(card.id);
              if (card.verdictValue) {
                onVerdictFilterChange(card.verdictValue);
              }
            }}
            className={`flex items-center p-4 rounded-lg border-2 transition-colors ${card.bgColor} ${card.hoverBgColor} ${card.borderColor}`}
          >
            <div className={`p-2 rounded-full mr-3 ${card.bgColor}`}>
              {card.icon}
            </div>
            <div>
              <div className={`text-sm font-medium ${card.textColor}`}>{card.label}</div>
              <div className={`text-xl font-bold mt-1 ${card.textColor}`}>{card.count}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

ProjectStatusSummary.propTypes = {
  summary: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  onFilterChange: PropTypes.func.isRequired,
  onVerdictFilterChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.string,
  activeVerdictFilter: PropTypes.string,
  currentUser: PropTypes.object // Added currentUser to the prop types
};

export default ProjectStatusSummary;