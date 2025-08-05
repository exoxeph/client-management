import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
// useAuth import removed as it's no longer needed
import { PROJECT_STATUS, PROJECT_VERDICT, projectsService } from "../../services/projects.service";

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
 */
export const ProjectsTable = ({
  projects,
  darkMode = false,
  isCompact = false,
  limit = 0
}) => {
  // State to track which projects have been reviewed by the current user
  const [reviewedProjects, setReviewedProjects] = useState({});
  
  // State for the title modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  
  // Apply limit if specified
  const displayProjects = limit > 0 ? projects.slice(0, limit) : projects;
  
  // Check which projects have been reviewed by the current user
  useEffect(() => {
    const checkReviewedProjects = async () => {
      const reviewedStatus = {};
      
      for (const project of displayProjects) {
        if (project.verdict === PROJECT_VERDICT.CONFIRMED) {
          try {
            const userReview = await projectsService.getUserReview(project._id);
            reviewedStatus[project._id] = !!userReview;
          } catch (error) {
            console.error(`Error checking review status for project ${project._id}:`, error);
            reviewedStatus[project._id] = false;
          }
        }
      }
      
      setReviewedProjects(reviewedStatus);
    };
    
    checkReviewedProjects();
  }, [displayProjects]);
  
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
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Verdict
                </th>
                {!isCompact && (
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Deadline
                  </th>
                )}
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Last Updated
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Action
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Review
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {displayProjects.map((project, index) => (
                <tr key={`project-${project._id || index}`} className={darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-mono ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {project._id || "N/A"}
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
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getVerdictBadgeClasses(project.verdict)}`}>
                      {project.verdict ? project.verdict.charAt(0).toUpperCase() + project.verdict.slice(1) : 'None'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end">
                      {project.status === PROJECT_STATUS.DRAFT && (
                        <Link 
                          to={`/projects/new?draft=${project._id}`} 
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                        >
                          Continue draft
                        </Link>
                      )}
                      {(project.status === PROJECT_STATUS.PENDING || project.status === 'submitted' || project.status === 'under_review') && (
                        <Link 
                          to={`/projects/${project._id}`} 
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                        >
                          View Details
                        </Link>
                      )}
                      {(project.status === PROJECT_STATUS.CONFIRMED || project.status === PROJECT_STATUS.REJECTED || project.status === 'approved' || project.status === 'rejected') && (
                        <Link 
                          to={`/projects/${project._id}`} 
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-white"}`}
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end">
                      {project.verdict === PROJECT_VERDICT.CONFIRMED ? (
                        <Link 
                          to={`/projects/${project._id}/review`} 
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                        >
                          {reviewedProjects[project._id] ? "See Review" : "Give Review"}
                        </Link>
                      ) : (
                        <button 
                          disabled
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"} cursor-not-allowed`}
                        >
                          Give Review
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
  limit: PropTypes.number
};

export default ProjectsTable;