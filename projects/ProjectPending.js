import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { projectsService, PROJECT_STATUS } from "../../services/projects.service";
import { ProjectDetailModal } from "./ProjectDetailModal";
/**
 * ProjectPending component for displaying all pending projects
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const ProjectPending = ({
  darkMode = false
}) => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch pending projects
  useEffect(() => {
    const fetchPendingProjects = async () => {
      try {
        setLoading(true);
        const allProjects = await projectsService.getAllProjects();
        const pending = allProjects.filter(project => project.status === PROJECT_STATUS.PENDING);
        setPendingProjects(pending);
      } catch (err) {
        console.error("Error fetching pending projects:", err);
        setError("Failed to load pending projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingProjects();
  }, []);
  // Handle view details
  const handleViewDetails = project => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  if (loading) {
    return <div className={`rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-6`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full mr-4 ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
            <svg className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Pending Projects
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Review projects awaiting approval
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>;
  }
  if (error) {
    return <div className={`rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-6`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full mr-4 ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
            <svg className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Pending Projects
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Review projects awaiting approval
            </p>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-500"}`}>
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      </div>;
  }
  return <div className={`rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-6`}>
      <div className="flex items-center mb-6">
        <div className={`p-3 rounded-full mr-4 ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
          <svg className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className={`text-xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Pending Projects
          </h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Review projects awaiting approval
          </p>
        </div>
      </div>
      {pendingProjects.length === 0 ? <div className={`p-8 rounded-lg text-center ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
          <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            No Pending Projects
          </h3>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            All projects have been reviewed. Check back later for new submissions.
          </p>
        </div> : <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Project
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Owner
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Type
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Submitted
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Status
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                {pendingProjects.map(project => <tr key={project.id} className={darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {project.title}
                      </div>
                      <div className={`text-sm truncate max-w-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {project.description.length > 60 ? `${project.description.substring(0, 60)}...` : project.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {project.owner.name}
                      </div>
                      <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {project.owner.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {project.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {projectsService.formatDate(project.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full bg-amber-900/30 text-amber-300`}>
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleViewDetails(project)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                        View Details
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {pendingProjects.map(project => <div key={project.id} className={`p-4 rounded-lg border ${darkMode ? "bg-gray-750 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {project.title}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full bg-amber-900/30 text-amber-300`}>
                    Pending
                  </span>
                </div>
                <div className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <div className={`text-xs uppercase font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Owner
                    </div>
                    <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {project.owner.name}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs uppercase font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Type
                    </div>
                    <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {project.type}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs uppercase font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Submitted
                    </div>
                    <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {projectsService.formatDate(project.createdAt)}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleViewDetails(project)} className={`w-full px-3 py-2 text-sm font-medium rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                  View Details
                </button>
              </div>)}
          </div>
        </>}
      {/* Project Detail Modal */}
      {isModalOpen && selectedProject && <ProjectDetailModal project={selectedProject} isOpen={isModalOpen} onClose={handleCloseModal} darkMode={darkMode} />}
    </div>;
};
ProjectPending.propTypes = {
  darkMode: PropTypes.bool
};
export default ProjectPending;