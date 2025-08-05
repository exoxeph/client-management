import React from "react";
import PropTypes from "prop-types";

/**
 * Project summary panel component that shows all sections at once
 * @param {Object} props - Component props
 * @param {Object} props.projectData - Project data to summarize
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
// Helper to ensure backward compatibility with flat projectData
const normalizeProjectData = (data) => {
  if (!data) return null;
  return {
    overview: {
      title: data.overview?.title || data.title,
      description: data.overview?.description || data.description,
      type: data.overview?.type || data.type,
      businessGoal: data.overview?.businessGoal || data.businessGoal,
    },
    scope: {
      features: data.scope?.features || data.features,
      userRoles: data.scope?.userRoles || data.userRoles,
      integrations: data.scope?.integrations || data.integrations,
      nonFunctionalRequirements: data.scope?.nonFunctionalRequirements || data.nonFunctionalRequirements,
      acceptanceCriteria: data.scope?.acceptanceCriteria || data.acceptanceCriteria,
      successMetrics: data.scope?.successMetrics || data.successMetrics,
    },
    technical: {
      platforms: data.technical?.platforms || data.platforms,
      techStack: data.technical?.techStack || data.techStack,
      hostingPreference: data.technical?.hostingPreference || data.hostingPreference,
      securityRequirements: data.technical?.securityRequirements || data.securityRequirements,
      dataClassification: data.technical?.dataClassification || data.dataClassification,
    },
    timelineBudget: {
      startDate: data.timelineBudget?.startDate || data.startDate,
      endDate: data.timelineBudget?.endDate || data.endDate,
      budgetRange: data.timelineBudget?.budgetRange || data.budgetRange,
      paymentModel: data.timelineBudget?.paymentModel || data.paymentModel,
      milestones: data.timelineBudget?.milestones || data.milestones,
    },
    contacts: {
      primaryContact: data.contacts?.primaryContact || data.primaryContact || data.name,
      communicationPreference: data.contacts?.communicationPreference || data.communicationPreference || data.commsPreference,
      repoUrls: data.contacts?.repoUrls || data.repoUrls,
      ndaRequired: data.contacts?.ndaRequired ?? data.ndaRequired,
    },
    attachments: {
      files: data.attachments?.files || data.files,
    },
    ...data // preserve any other properties
  };
};

const SummaryPanel = ({
  projectData,
  darkMode = false
}) => {
  // Normalize project data for backward compatibility
  const normalizedData = normalizeProjectData(projectData);
  
  // Add defensive check for projectData
  if (!normalizedData) return <p className={darkMode ? "text-white" : "text-gray-900"}>Loading project data...</p>;

  const renderSection = (title, content) => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return null;
    }
    return <div className="mb-4">
        <h3 className={`text-sm font-medium uppercase tracking-wider mb-2 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          {title}
        </h3>
        {Array.isArray(content) ? <ul className="list-disc pl-5 space-y-1">
            {content.map((item, index) => <li key={index} className={darkMode ? "text-gray-300" : "text-gray-700"}>
                {typeof item === "object" ? item.title : item}
              </li>)}
          </ul> : <p className={darkMode ? "text-white" : "text-gray-900"}>
            {content}
          </p>}
      </div>;
  };

  // Project title and basic info - shown on all steps
  const renderProjectHeader = () => (
    <div className="space-y-4">
      <div>
        <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          {normalizedData.overview.title || "Untitled Project"}
        </h3>
        <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          {normalizedData.overview.description || "No description provided."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-800"}`}>
          {normalizedData.overview.type || "No type selected"}
        </span>
        {normalizedData.timelineBudget.startDate && 
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
            Start: {new Date(normalizedData.timelineBudget.startDate).toLocaleDateString()}
          </span>}
        {normalizedData.timelineBudget.endDate && 
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"}`}>
            End: {new Date(normalizedData.timelineBudget.endDate).toLocaleDateString()}
          </span>}
        {normalizedData.timelineBudget.budgetRange && 
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
            Budget: {normalizedData.timelineBudget.budgetRange}
          </span>}
      </div>
    </div>
  );

  // Project Basics
  const renderProjectBasics = () => (
    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4`}>
      <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        Project Basics
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {renderSection("Project Type", normalizedData.overview.type)}
        {renderSection("Business Goal", normalizedData.overview.businessGoal)}
        {renderSection("Description", normalizedData.overview.description)}
      </div>
    </div>
  );

  // Requirements
  const renderRequirements = () => (
    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4 mt-4`}>
      <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        Requirements
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderSection("Key Features", normalizedData.scope.features)}
          {renderSection("User Roles", normalizedData.scope.userRoles)}
          {renderSection("Integrations", normalizedData.scope.integrations)}
        </div>
        <div>
          {renderSection("Non-Functional Requirements", normalizedData.scope.nonFunctionalRequirements)}
          {renderSection("Acceptance Criteria", normalizedData.scope.acceptanceCriteria)}
          {renderSection("Success Metrics", normalizedData.scope.successMetrics)}
        </div>
      </div>
    </div>
  );

  // Technical Details
  const renderTechnicalDetails = () => (
    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4 mt-4`}>
      <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        Technical Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderSection("Target Platforms", normalizedData.technical.platforms)}
          {renderSection("Preferred Technologies", normalizedData.technical.techStack)}
        </div>
        <div>
          {renderSection("Hosting Preference", normalizedData.technical.hostingPreference)}
          {renderSection("Security Requirements", normalizedData.technical.securityRequirements)}
          {renderSection("Data Classification", normalizedData.technical.dataClassification)}
        </div>
      </div>
    </div>
  );

  // Timeline & Budget
  const renderTimelineBudget = () => (
    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4 mt-4`}>
      <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        Timeline & Budget
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderSection("Start Date", 
            normalizedData.timelineBudget.startDate ? 
            new Date(normalizedData.timelineBudget.startDate).toLocaleDateString() : null)}
          {renderSection("End Date", 
            normalizedData.timelineBudget.endDate ? 
            new Date(normalizedData.timelineBudget.endDate).toLocaleDateString() : null)}
        </div>
        <div>
          {renderSection("Budget Range", normalizedData.timelineBudget.budgetRange)}
          {renderSection("Payment Model", normalizedData.timelineBudget.paymentModel)}
        </div>
      </div>
      
      {normalizedData.timelineBudget.milestones && 
       normalizedData.timelineBudget.milestones.length > 0 && (
        <div className="mt-4">
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
            Milestones
          </h3>
          <div className="space-y-3">
            {normalizedData.timelineBudget.milestones.map((milestone, index) => (
              <div key={index} className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className="flex justify-between">
                  <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {milestone.title}
                  </h4>
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {new Date(milestone.deadline).toLocaleDateString()}
                  </span>
                </div>
                {milestone.description && (
                  <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {milestone.description}
                  </p>
                )}
                {milestone.payment && (
                  <p className={`mt-1 text-sm font-medium ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>
                    Payment: {milestone.payment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Documentation
  const renderDocumentation = () => (
    <div>
      <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4 mt-4`}>
        <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Primary Contact
            </p>
            <p className={darkMode ? "text-white" : "text-gray-900"}>
              {normalizedData.contacts.primaryContact || "Not specified"}
            </p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Communication Preference
            </p>
            <p className={darkMode ? "text-white" : "text-gray-900"}>
              {normalizedData.contacts.communicationPreference || "Not specified"}
            </p>
          </div>
        </div>
        
        {renderSection("Repository URLs", normalizedData.contacts.repoUrls)}
        {renderSection("NDA Required", normalizedData.contacts.ndaRequired ? "Yes" : "No")}
      </div>
      
      <div className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-indigo-900/20 border border-indigo-800" : "bg-indigo-50 border border-indigo-100"}`}>
        <p className={`text-sm ${darkMode ? "text-indigo-300" : "text-indigo-700"}`}>
          By submitting this project request, you agree to our terms of service and privacy policy.
          We'll review your request and get back to you within 2 business days.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Project Summary
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {renderProjectHeader()}
        {renderProjectBasics()}
        {renderRequirements()}
        {renderTechnicalDetails()}
        {renderTimelineBudget()}
        {renderDocumentation()}
      </div>
    </div>
  );
};

SummaryPanel.propTypes = {
  projectData: PropTypes.object.isRequired,
  darkMode: PropTypes.bool
};

export default SummaryPanel;