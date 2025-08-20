import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { projectsService, PROJECT_STATUS, PROJECT_VERDICT } from "../../services/projects.service";

/**
 * PendingVerdictProjectsCard component displaying projects with pending verdict for admin approval
 * @param {Object} props - Component props
 * @param {boolean} [props.darkMode=false] - Whether to use dark mode styling
 */
const PendingVerdictProjectsCard = ({
  darkMode = false
}) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Define fetchPendingProjects before using it in useEffect
  const fetchPendingProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Fetch ALL projects that are visible to the admin
      const allAdminProjects = await projectsService.getAllProjects(true);
      
      // 2. (For Debugging) Log the raw data to the console to see what we're working with
      console.log("DATA RECEIVED FOR PENDING CARD:", allAdminProjects);

      // 3. Apply a safe filter to find only the projects needing a verdict
      const pendingProjects = allAdminProjects.filter(project => {
        // Safety Check: Ensure project and project.status exist before trying to read them
        if (!project || !project.status || !project.verdict) {
          return false;
        }
        // The actual filter logic
        return project.verdict === 'pending' && 
         (project.status === 'submitted' || project.status === 'client-counter');
      }); 
      
      if (Array.isArray(pendingProjects)) {
        setProjects(pendingProjects);
        setError(null);
      } else {
        console.error("Invalid response format for pending projects:", pendingProjects);
        setError("Received invalid data format. Please try again later.");
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch pending verdict projects:", err);
      setError("Failed to load pending verdict projects. " + (err.message || "Please try again later."));
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingProjects();
  }, [fetchPendingProjects]);
  

    /**
   * Handles the admin's decision to accept or reject a project.
   */
  const handleVerdict = async (projectId, verdict) => {
    try {
      // We no longer need setIsLoading here as the item just disappears
      await projectsService.updateProject(projectId, { verdict });
      
      setToast({
        show: true,
        message: `Project ${verdict} successfully`,
        type: "success"
      });
      setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);

      // Refresh the list by filtering out the project that was just actioned
      setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));

    } catch (err) {
      console.error(`Failed to set verdict to ${verdict}`, err);
      setToast({
        show: true,
        message: `Failed to ${verdict} project. Please try again.`,
        type: "error"
      });
      setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    }
  };


  /**
   * Format timestamp to relative time (e.g., "5 minutes ago")
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted relative time
   */
  const formatRelativeTime = timestamp => {
    return projectsService.formatRelativeTime(timestamp);
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
      default:
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>;
    }
  };

  /**
   * Update project verdict
   * @param {string} projectId - Project ID
   * @param {string} verdict - New verdict (CONFIRMED or REJECTED)
   */
  const updateProjectVerdict = async (projectId, verdict) => {
    try {
      setIsLoading(true);
      
      // Call the service function to update project verdict
      await projectsService.updateProjectVerdict(projectId, verdict);
      
      // Update local state to remove the project from the list
      setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));
      
      // Show success toast
      setToast({
        show: true,
        message: `Project ${verdict === PROJECT_VERDICT.CONFIRMED ? 'confirmed' : 'rejected'} successfully`,
        type: "success"
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
      
    } catch (err) {
      console.error(`Failed to ${verdict.toLowerCase()} project:`, err);
      
      // Show error toast
      setToast({
        show: true,
        message: `Failed to ${verdict.toLowerCase()} project. Please try again.`,
        type: "error"
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${toast.type === "success" ? (darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800')}`}>
          {toast.message}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Pending Verdict Projects
        </h2>
        <Link to="/projects" className={`text-sm px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-indigo-400 hover:bg-gray-700' : 'text-indigo-600 hover:bg-gray-100'}`}>
          View All Projects
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-500'}`}>
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Pending Verdict Projects</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Projects awaiting your verdict will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project._id} className={`block p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${getStatusColorClass(project.status)}`}>
                  {getProjectStatusIcon(project.status)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {project.overview.title || "Untitled Project"}
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {project.overview?.type || 'No type'} • {project.status && typeof project.status === 'string' ? 
                      (project.status.charAt(0).toUpperCase() + project.status.toLowerCase().slice(1)) : 'Unknown'}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Submitted {formatRelativeTime(project.updatedAt)}
                  </p>
                      
                  <div className="mt-4 flex space-x-2">
                    <Link to={`/projects/${project._id}`} className={`text-xs px-3 py-1 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                      View Details
                    </Link>
                    {/* Accept Button */}
                    <button 
                      onClick={() => handleVerdict(project._id, 'confirmed')}
                      className={`text-xs px-3 py-1 rounded-lg transition-colors ${darkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      Accept
                    </button>
                    {/* Reject Button */}
                    <button 
                      onClick={() => handleVerdict(project._id, 'rejected')}
                      className={`text-xs px-3 py-1 rounded-lg transition-colors ${darkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                    >
                      Reject
                    </button>
                    {/* Counter Button */}
                    <Link to={`/projects/edit/${project._id}`}>
                      <button className={`text-xs px-3 py-1 rounded-lg transition-colors ${darkMode ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}>
                        Counter
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

PendingVerdictProjectsCard.propTypes = {
  darkMode: PropTypes.bool
};

export default PendingVerdictProjectsCard;