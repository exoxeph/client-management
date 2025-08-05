import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { projectsService, PROJECT_STATUS, PROJECT_VERDICT } from "../../services/projects.service";

/**
 * Recent Projects card component displaying user's recent projects
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
export const RecentProjectsCard = ({
  darkMode = false
}) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Fetch all projects and take the most recent ones
        const data = await projectsService.getAllProjects();
        // Sort by update date (newest first) and take the first 5
        const sortedProjects = data
          .filter(project => {
            // Ensure projects have valid updatedAt date
            if (!project.updatedAt) return false;
            const date = new Date(project.updatedAt);
            return !isNaN(date.getTime()); // Filter out invalid dates
          })
          .sort((a, b) => {
            // Sort by updatedAt date (newest first)
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        setProjects(sortedProjects);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load recent projects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  /**
   * Format timestamp to relative time (e.g., "5 minutes ago")
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted relative time
   */
  const formatRelativeTime = timestamp => {
    return projectsService.formatRelativeTime(timestamp);
  };

  /**
   * Get icon based on project status
   * @param {string} status - Project status
   * @returns {JSX.Element} Icon element
   */
  const getProjectStatusIcon = status => {
    // Normalize status to handle case issues
    const normalizedStatus = status && typeof status === 'string' ? status.toLowerCase() : '';
    
    // Handle both string values and PROJECT_STATUS constants
    switch (normalizedStatus) {
      case PROJECT_STATUS.PENDING.toLowerCase():
      case 'submitted':
      case 'under_review':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>;
      case PROJECT_STATUS.CONFIRMED.toLowerCase():
      case 'approved':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>;
      case PROJECT_STATUS.REJECTED.toLowerCase():
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>;
      case PROJECT_STATUS.DRAFT.toLowerCase():
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>;
      default:
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>;
    }
  };

  /**
   * Get status color class based on project status
   * @param {string} status - Project status
   * @returns {string} CSS class for status color
   */
  const getStatusColorClass = status => {
    // Normalize status to handle case issues
    const normalizedStatus = status && typeof status === 'string' ? status.toLowerCase() : '';
    
    switch (normalizedStatus) {
      case PROJECT_STATUS.PENDING.toLowerCase():
      case 'submitted':
      case 'under_review':
        return darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      case PROJECT_STATUS.CONFIRMED.toLowerCase():
      case 'approved':
        return darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      case PROJECT_STATUS.REJECTED.toLowerCase():
        return darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      case PROJECT_STATUS.DRAFT.toLowerCase():
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };
  
  /**
   * Get verdict color class based on project verdict
   * @param {string} verdict - Project verdict
   * @returns {string} CSS class for verdict color
   */
  const getVerdictColorClass = verdict => {
    // Normalize verdict to handle case issues
    const normalizedVerdict = verdict && typeof verdict === 'string' ? verdict.toLowerCase() : '';
    
    switch (normalizedVerdict) {
      case PROJECT_VERDICT.PENDING.toLowerCase():
        return darkMode ? 'text-blue-300' : 'text-blue-600';
      case PROJECT_VERDICT.CONFIRMED.toLowerCase():
        return darkMode ? 'text-green-300' : 'text-green-600';
      case PROJECT_VERDICT.REJECTED.toLowerCase():
        return darkMode ? 'text-red-300' : 'text-red-600';
      case PROJECT_VERDICT.NONE.toLowerCase():
      default:
        return darkMode ? 'text-gray-400' : 'text-gray-500';
    }
  };

  return <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Recent Projects
        </h2>
        <Link to="/projects" className={`text-sm px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-indigo-400 hover:bg-gray-700' : 'text-indigo-600 hover:bg-gray-100'}`}>
          View All Projects
        </Link>
      </div>
      {isLoading ? <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div> : error ? <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-500'}`}>
          {error}
        </div> : projects.length === 0 ? <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Recent Projects</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your recent projects will appear here.</p>
          <Link to="/projects/new" className={`mt-4 inline-block px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            Create a Project
          </Link>
        </div> : <div className="space-y-4">
          {projects.map(project => <Link key={project._id} to={project.status === PROJECT_STATUS.DRAFT ? `/projects/new?draft=${project._id}` : `/projects/${project._id}`} className={`block p-4 rounded-lg ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${getStatusColorClass(project.status)}`}>
                  {getProjectStatusIcon(project.status)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {project.title || "Untitled Project"}
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {project.type || 'No type'} • {project.status && typeof project.status === 'string' ? 
                      (project.status.charAt(0).toUpperCase() + project.status.toLowerCase().slice(1)) : 'Unknown'}
                    {project.verdict && project.verdict !== PROJECT_VERDICT.NONE && (
                      <span className={`ml-1 ${getVerdictColorClass(project.verdict)}`}>
                        • Verdict: {project.verdict.charAt(0).toUpperCase() + project.verdict.slice(1)}
                      </span>
                    )}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatRelativeTime(project.updatedAt)}
                  </p>
                </div>
              </div>
            </Link>)}
        </div>}
    </div>;
};

RecentProjectsCard.propTypes = {
  darkMode: PropTypes.bool
};