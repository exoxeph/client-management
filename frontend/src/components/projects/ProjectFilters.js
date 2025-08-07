import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
// Define verdict constants
const VERDICT_ALL = 'all';
const VERDICT_PENDING = 'pending';
const VERDICT_CONFIRMED = 'confirmed';
const VERDICT_REJECTED = 'rejected';
/**
 * Project filters component with status tabs and search
 * @param {Object} props - Component props
 * @param {string} props.activeFilter - Currently active filter
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search term changes
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 * @param {string} props.activeVerdictFilter - Currently active verdict filter
 * @param {Function} props.onVerdictFilterChange - Callback when verdict filter changes
 */
export const ProjectFilters = ({
  activeFilter = "all",
  onFilterChange,
  searchTerm = "",
  onSearchChange,
  darkMode = false,
  activeVerdictFilter = "all",
  onVerdictFilterChange
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "admin";
  
  // Verdict filter buttons
  // For admin users, show All and Pending buttons
  // For individual and corporate users, show all verdict filter buttons
  const verdictFilters = isAdmin
    ? [
        { id: VERDICT_ALL, label: "All" },
        { id: VERDICT_PENDING, label: "Pending" }
      ]
    : [
        { id: VERDICT_ALL, label: "All" },
        { id: VERDICT_PENDING, label: "Pending" },
        { id: VERDICT_CONFIRMED, label: "Confirmed" },
        { id: VERDICT_REJECTED, label: "Rejected" }
      ];

  return <div className="flex flex-col space-y-4">
      {/* Verdict filter buttons - simple, no animations */}
      <div className="flex flex-wrap gap-2">
        {verdictFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onVerdictFilterChange(filter.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${activeVerdictFilter === filter.id
                ? (darkMode ? "bg-gray-600 text-white" : "bg-gray-500 text-white")
                : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700")}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Enhanced search input with robust form prevention */}
          <form 
            onSubmit={(e) => {
              e.preventDefault(); // Prevent form submission
              e.stopPropagation(); // Stop event propagation
              return false; // Extra safety measure
            }}
          >
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm} 
              onChange={e => {
                // Get the input value
                const value = e.target.value;
                
                // Update the local input value immediately for responsive UI
                // But debounce the actual search to avoid excessive API calls
                
                // Clear any existing timeout to implement debouncing
                if (window.searchTimeout) {
                  clearTimeout(window.searchTimeout);
                }
                
                // Set a new timeout to delay the search
                window.searchTimeout = setTimeout(() => {
                  console.log('Debounced search triggered with:', value);
                  onSearchChange(value);
                }, 300); // 300ms debounce
              }}
              onKeyDown={e => {
                // Handle Enter key press - trigger search immediately
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission
                  e.stopPropagation(); // Stop event propagation
                  
                  // Clear any existing timeout
                  if (window.searchTimeout) {
                    clearTimeout(window.searchTimeout);
                  }
                  
                  // Immediately apply the search
                  console.log('Enter key pressed, triggering immediate search with:', e.target.value);
                  onSearchChange(e.target.value);
                  return false; // Extra safety measure
                }
              }}
              className={`block w-full pl-10 pr-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-800 text-gray-300 focus:border-indigo-500" : "border-gray-300 bg-white text-gray-900 focus:border-indigo-500"} rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            />
          </form>
        </div>
      </div>
    </div>;
};
ProjectFilters.propTypes = {
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  activeVerdictFilter: PropTypes.string,
  onVerdictFilterChange: PropTypes.func
};
export default ProjectFilters;