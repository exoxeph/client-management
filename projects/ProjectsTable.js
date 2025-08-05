import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { PROJECT_STATUS, projectsService } from "../../services/projects.service";
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
  // Apply limit if specified
  const displayProjects = limit > 0 ? projects.slice(0, limit) : projects;
  // Status badge styles
  const getStatusBadgeClasses = status => {
    switch (status) {
      case PROJECT_STATUS.PENDING:
        return darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800";
      case PROJECT_STATUS.CONFIRMED:
        return darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800";
      case PROJECT_STATUS.REJECTED:
        return darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800";
      case PROJECT_STATUS.DRAFT:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
    }
  };
  // Action button based on status
  const getActionButton = project => {
    if (project.status === PROJECT_STATUS.DRAFT) {
      return <Link to={`/projects/new?draft=${project.id}`} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
          Continue Draft
        </Link>;
    }
    
    // For PENDING status (equivalent to "Submitted"), use a blue button to make it stand out
    if (project.status === PROJECT_STATUS.PENDING) {
      return <Link to={`/projects/${project.id}`} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
          View Details
        </Link>;
    }
    
    // Default action button for other statuses
    return <Link to={`/projects/${project.id}`} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
        View Details
      </Link>;
  };
  // Empty state
  if (displayProjects.length === 0) {
    return <div className={`rounded-xl border shadow-sm p-8 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <svg className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className={`mt-4 text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
          No projects found
        </h3>
        <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {projects.length === 0 ? "You haven't created any projects yet." : "No projects match your search criteria."}
        </p>
        <div className="mt-6">
          <Link to="/projects/new" className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            Create a Project
          </Link>
        </div>
      </div>;
  }
  return <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                Project
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                Type
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                Status
              </th>
              {!isCompact && <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                  Deadline
                </th>}
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                Last Updated
              </th>
              <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                Action
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {displayProjects.map(project => <tr key={project.id} className={darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {project.overview?.title || project.title || "Untitled Project"}
                      </div>
                      {!isCompact && <div className={`text-sm truncate max-w-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {project.overview?.description || project.description || ""}
                        </div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {project.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </td>
                {!isCompact && <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {projectsService.formatDate(project.timelineBudget?.endDate || project.deadline)}
                    </div>
                  </td>}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {projectsService.formatRelativeTime(project.updatedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {getActionButton(project)}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
ProjectsTable.propTypes = {
  projects: PropTypes.array.isRequired,
  darkMode: PropTypes.bool,
  isCompact: PropTypes.bool,
  limit: PropTypes.number
};
export default ProjectsTable;