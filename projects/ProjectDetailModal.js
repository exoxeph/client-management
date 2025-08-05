import React from "react";
import PropTypes from "prop-types";
import { projectsService } from "../../services/projects.service";
/**
 * Project Detail Modal component
 * @param {Object} props - Component props
 * @param {Object} props.project - Project data to display
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const ProjectDetailModal = ({
  project,
  isOpen,
  onClose,
  darkMode = false
}) => {
  if (!isOpen) return null;
  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  // Format array to string
  const formatArray = arr => {
    if (!arr || arr.length === 0) return "None";
    return arr.join(", ");
  };
  // Section component for organization
  const Section = ({
    title,
    children
  }) => <div className="mb-6">
      <h3 className={`text-lg font-bold mb-3 pb-2 border-b ${darkMode ? "text-white border-gray-700" : "text-gray-900 border-gray-200"}`}>
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>;
  // Field component for consistent display
  const Field = ({
    label,
    value,
    fullWidth = false
  }) => <div className={fullWidth ? "col-span-2" : ""}>
      <div className={`text-xs uppercase font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </div>
      <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        {value || "—"}
      </div>
    </div>;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`relative max-w-4xl w-full rounded-xl shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"} p-6 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
          {/* Close button */}
          <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full ${darkMode ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Header */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {project.title}
            </h2>
            <div className="flex flex-wrap items-center mt-2 gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-800"}`}>
                {project.type}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
                Pending Review
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                Submitted: {projectsService.formatDate(project.createdAt)}
              </span>
            </div>
          </div>
          {/* Content */}
          <div className="space-y-8">
            {/* Overview Section */}
            <Section title="Project Overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Description" value={project.description} fullWidth={true} />
                <Field label="Business Goal" value={project.businessGoal} fullWidth={true} />
              </div>
            </Section>
            {/* Requirements Section */}
            <Section title="Project Requirements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Features" value={formatArray(project.features)} fullWidth={true} />
                <Field label="User Roles" value={project.userRoles} />
                <Field label="Integrations" value={project.integrations} />
                <Field label="Non-functional Requirements" value={project.nonFunctionalRequirements} fullWidth={true} />
                <Field label="Acceptance Criteria" value={project.acceptanceCriteria} fullWidth={true} />
                <Field label="Success Metrics" value={project.successMetrics} fullWidth={true} />
              </div>
            </Section>
            {/* Technical Details Section */}
            <Section title="Technical Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Target Platforms" value={project.platforms} />
                <Field label="Preferred Tech Stack" value={project.techStack} />
                <Field label="Hosting Preference" value={project.hostingPreference} />
                <Field label="Security Requirements" value={formatArray(project.securityRequirements)} />
                <Field label="Data Classification" value={project.dataClassification} />
              </div>
            </Section>
            {/* Timeline & Budget Section */}
            <Section title="Timeline & Budget">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Start Date" value={projectsService.formatDate(project.startDate)} />
                <Field label="End Date" value={projectsService.formatDate(project.endDate)} />
                <Field label="Budget Range" value={project.budgetRange} />
                <Field label="Payment Model" value={project.paymentModel} />
              </div>
              {/* Milestones */}
              {project.milestones && project.milestones.length > 0 && <div className="mt-4">
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Milestones
                  </h4>
                  <div className="space-y-2">
                    {project.milestones.map((milestone, index) => <div key={index} className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <div className="flex justify-between">
                          <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {milestone.title}
                          </span>
                          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {projectsService.formatDate(milestone.deadline)}
                          </span>
                        </div>
                        {milestone.description && <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {milestone.description}
                          </p>}
                        {milestone.payment && <p className={`mt-1 text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            Payment: {milestone.payment}
                          </p>}
                      </div>)}
                  </div>
                </div>}
            </Section>
            {/* Documentation & Contact Section */}
            <Section title="Documentation & Contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Primary Contact" value={project.primaryContact} />
                <Field label="Communication Preference" value={project.communicationPreference} />
                <Field label="Repository URLs" value={project.repoUrls} fullWidth={true} />
                <Field label="NDA Required" value={project.ndaRequired ? "Yes" : "No"} />
              </div>
              {/* Files */}
              {project.files && project.files.length > 0 && <div className="mt-4">
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Attached Files
                  </h4>
                  <ul className="space-y-2">
                    {project.files.map((file, index) => <li key={index} className={`flex items-center p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </li>)}
                  </ul>
                </div>}
            </Section>
          </div>
          {/* Footer Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
              Close
            </button>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
              Approve Project
            </button>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
              Reject Project
            </button>
          </div>
        </div>
      </div>
    </div>;
};
ProjectDetailModal.propTypes = {
  project: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool
};
export default ProjectDetailModal;