import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
// useAuth import removed as it's no longer needed
import { PROJECT_STATUS, PROJECT_VERDICT, projectsService } from "../../services/projects.service";
import { VerdictActions } from './VerdictActions'; 
import { ClientVerdictActions } from './ClientVerdictActions';

// Modal component for displaying full project title
const ProjectTitleModal = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Title</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-2">
          <p className="text-gray-700 dark:text-gray-300">{title || "No title available"}</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

ProjectTitleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string
};

/**
 * Projects table component
 * @param {Object} props - Component props
 * @param {Array} props.projects - List of projects
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 * @param {boolean} props.isCompact - Whether to show compact view (for dashboard)
 * @param {number} props.limit - Maximum number of projects to show
 * @param {Function} props.onVerdictUpdate - Optional callback when verdict is updated
 */
export const ProjectsTable = ({
  projects,
  darkMode = false,
  isCompact = false,
  limit,
  onVerdictChange,
  currentUser
}) => {
  // Get location object for navigation tracking
  const location = useLocation();
  // Check if we're in admin mode by looking at the URL
  const isAdmin = currentUser?.role === 'admin'
  
  // State for tracking verdict updates
  const [updatingVerdicts, setUpdatingVerdicts] = useState({});
  // State to track which projects have been reviewed by the current user
  const [reviewedProjects, setReviewedProjects] = useState({});
  // State to trigger review check when a review is submitted
  const [reviewCheckTrigger, setReviewCheckTrigger] = useState(0);
  
  // State for the title modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  
  // State for filtered projects
  const [displayProjects, setDisplayProjects] = useState([]);
  
  // Apply limit if specified
  useEffect(() => {
    setDisplayProjects(limit > 0 ? projects.slice(0, limit) : projects);
    // Log reviews in first project
    console.log("💡 Reviews in first project:", projects[0]?.reviews);
  }, [projects, limit]);
  
  // State for notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  
  // Check which projects have been reviewed by the current user
    useEffect(() => {
    const checkReviewedProjects = async () => {
      const reviewedStatus = {};
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        setReviewedProjects({});
        return;
      }
      const userId = user._id.toString();
      
      for (const project of displayProjects) {
        if (project.verdict === 'confirmed') {
          let hasReviewed = false;
          
          if (isAdmin) {
            // --- THIS IS THE NEW, CORRECTED CHECK ---
            // We simply check if the `adminReview` object exists and has the `adminId` key.
            // This is robust and directly checks the data we receive.
            if (project.adminReview && project.adminReview.adminId) {
              hasReviewed = true;
            }
          } else {
            // The client logic remains the same and is correct.
            if (project.reviews && project.reviews.some(review => review.userId?.toString() === userId)) {
              hasReviewed = true;
            }
          }
          // Default to false if no review is found
          reviewedStatus[project._id] = hasReviewed;
        }
      }
      setReviewedProjects(reviewedStatus);
    };
    
    checkReviewedProjects();
  }, [displayProjects, isAdmin]); // Correct dependencies
  
  // Check for the reviewed flag in the URL and trigger a review check
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reviewed') === 'true') {
      console.log('Review flag detected in URL, triggering review check');
      setReviewCheckTrigger(prev => prev + 1);
    }
  }, [location.search]);
  
  // Status badge styles
  const getStatusBadgeClasses = status => {
    switch (status) {
      case PROJECT_STATUS.PENDING:
      case 'submitted':
      case 'under_review':
        return darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800";
      case PROJECT_STATUS.CONFIRMED:
      case 'approved':
        return darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800";
      case PROJECT_STATUS.REJECTED:
      case 'rejected':
        return darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800";
      case PROJECT_STATUS.DRAFT:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
    }
  };
  
  // Verdict badge styles
  const getVerdictBadgeClasses = verdict => {
    switch (verdict) {
      case PROJECT_VERDICT.PENDING:
        return darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800";
      case PROJECT_VERDICT.CONFIRMED:
        return darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800";
      case PROJECT_VERDICT.REJECTED:
        return darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800";
      case PROJECT_VERDICT.NONE:
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
    }
  };
  
  // Action button functionality completely removed as per user request
  useEffect(() => {
  console.log('displayProjects with reviews:', displayProjects);
  }, [displayProjects]);

  // Empty state
  if (displayProjects.length === 0) {
    return (
      <div className={`rounded-xl border shadow-sm p-8 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <svg className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className={`mt-4 text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
          No projects found
        </h3>
        <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {projects.length === 0 ? "You haven't created any projects yet." : "No projects match your search criteria."}
        </p>
        {/* Create Project button removed as per user request */}
      </div>
    );
  }
  
  return (
    <div>
      {/* Title Modal */}
      <ProjectTitleModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={selectedTitle} 
      />
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-md z-50 ${notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
          {notification.message}
        </div>
      )}
      
      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                
<thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Project ID
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Project Title
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Status
                </th>
                {!isCompact && (
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Deadline
                  </th>
                )}
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Last Updated
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Action
                </th>
               <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Verdict
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Review
                </th>
              </tr>
            </thead>

  
            <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {displayProjects.map((project, index) => (
                <tr key={`project-${project._id || index}`} className={darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}>
                      
                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                      PID:{project.projectId || "N/A"}
                                    </div>
                                    <div 
                      className={`text-xs font-mono mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      title={project._id || "N/A"} // Hover tooltip for the full ID
                    >
                      Object ID: ...{project._id?.slice(-5) || "N/A"}
                    </div>
                                  </td>

  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => {
                        setSelectedTitle(project.overview?.title || project.title || "No title available");
                        setModalOpen(true);
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} w-20 text-center`}
                    >
                      Click
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(project.status || 'draft')}`}>
                      {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Draft'}
                    </span>
                  </td>
                  {!isCompact && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {projectsService.formatDate(project.timelineBudget?.endDate || project.deadline)}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {projectsService.formatRelativeTime(project.updatedAt)}
                    </div>
                  </td>
                                  {/* === BLOCK 1: "ACTION" COLUMN (View Details) === */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {project.status === 'draft' ? (
                    <Link to={`/projects/new?draft=${project._id}`} className="text-indigo-600 hover:text-indigo-900">
                      Continue Draft
                    </Link>
                  ) : (
                    <Link to={`/projects/${project._id}`} className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </Link>
                  )}
                </td>

                {/* === BLOCK 2: "VERDICT" COLUMN (Visible to ALL, logic changes by role) === */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end">
                    {isAdmin ? (
                      // ADMIN'S VIEW: Always show the admin actions dropdown.
                      // The component itself will decide whether to show a badge or the button.
                      <VerdictActions 
                        project={project} 
                        onVerdictChange={onVerdictChange}
                        darkMode={darkMode}
                      />
                    ) : (
                      // CLIENT'S VIEW: Conditionally show the client actions dropdown.
                      <>
                        {project.status === 'admin-counter' ? (
                          // If admin has countered, show the client dropdown.
                          <ClientVerdictActions 
                            project={project} 
                            onVerdictChange={onVerdictChange} 
                          />
                        ) : (
                          // Otherwise, just display the current verdict as a text badge.
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getVerdictBadgeClasses(project.verdict || 'none')}`}>
                            {project.verdict ? project.verdict.charAt(0).toUpperCase() + project.verdict.slice(1) : 'None'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                
                {/* === FINAL "REVIEW" COLUMN (Works for Admins and Clients) === */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end">
                    {project.verdict === 'confirmed' ? (
                      // If the project is confirmed, we render the link for EVERYONE.
                      <Link 
                        // The destination of the link correctly changes based on role.
                        to={isAdmin ? `/projects/${project._id}/admin-review` : `/projects/${project._id}/review`} 
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                      >
                        {/* The text of the link correctly changes based on the reviewedProjects state. */}
                        {reviewedProjects[project._id] ? "See Review" : "Give Review"}
                      </Link>
                    ) : (
                      // If the project is not confirmed, EVERYONE sees a disabled button.
                      <button 
                        disabled
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"} cursor-not-allowed`}
                      >
                        Review
                      </button>
                    )}
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

ProjectsTable.propTypes = {
  projects: PropTypes.array.isRequired,
  darkMode: PropTypes.bool,
  isCompact: PropTypes.bool,
  limit: PropTypes.number,
  onVerdictUpdate: PropTypes.func
};

export default ProjectsTable;