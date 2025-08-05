import React from "react";
import PropTypes from "prop-types";
import { PROJECT_STATUS } from "../../services/projects.service";
/**
 * Project filters component with status tabs and search
 * @param {Object} props - Component props
 * @param {string} props.activeFilter - Currently active filter
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search term changes
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const ProjectFilters = ({
  activeFilter = "all",
  onFilterChange,
  searchTerm = "",
  onSearchChange,
  darkMode = false
}) => {
  const filters = [{
    id: "all",
    label: "All Projects"
  }, {
    id: PROJECT_STATUS.PENDING,
    label: "Pending"
  }, {
    id: PROJECT_STATUS.CONFIRMED,
    label: "Confirmed"
  }, {
    id: PROJECT_STATUS.REJECTED,
    label: "Rejected"
  }];
  return <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => <button key={filter.id} onClick={() => onFilterChange(filter.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter.id ? darkMode ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white" : darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`} aria-current={activeFilter === filter.id ? "page" : undefined}>
            {filter.label}
          </button>)}
      </div>
      <div className="relative w-full sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input type="text" placeholder="Search projects..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className={`pl-10 pr-4 py-2 w-full rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 ${darkMode ? "focus:ring-indigo-500" : "focus:ring-indigo-500"}`} />
      </div>
    </div>;
};
ProjectFilters.propTypes = {
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool
};
export default ProjectFilters;