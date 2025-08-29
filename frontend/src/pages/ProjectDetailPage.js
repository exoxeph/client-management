import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { projectsService } from "../services/projects.service";
import { useToast } from "../components/ui/Toast";
import { RequirementsDisplay } from '../components/projects/RequirementsDisplay';

// Field components for displaying project data
const Field = ({ label, value }) => (
  <div className="mb-4">
    <div className="text-sm font-medium mb-1 text-gray-500">{label}</div>
    <div className="text-gray-800">{value || "Not specified"}</div>
  </div>
);

const ArrayField = ({ label, values }) => (
  <div className="mb-4">
    <div className="text-sm font-medium mb-1 text-gray-500">{label}</div>
    {values && values.length > 0 ? (
      <ul className="list-disc pl-5 text-gray-800">
        {values.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-800">None specified</div>
    )}
  </div>
);



const MilestoneField = ({ milestones }) => (
  <div className="mb-4">
    <div className="text-sm font-medium mb-1 text-gray-500">Milestones</div>
    {milestones && milestones.length > 0 ? (
      <div className="space-y-4 text-gray-800">
        {milestones.map((milestone, index) => (
          <div key={index} className="p-3 rounded-lg bg-gray-50">
            <div className="font-medium">{milestone.title}</div>
            <div className="text-sm text-gray-600">
              {milestone.description}
            </div>
            <div className="text-sm mt-2 text-gray-500">
              Due: {milestone.deadline}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-gray-800">No milestones specified</div>
    )}
  </div>
);

/**
 * Project detail page component that displays all project fields in a single view
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */

// Add print-specific styles
const printStyles = `
  @media print {
    body {
      background-color: white !important;
      color: black !important;
    }
    .max-w-4xl {
      max-width: 100% !important;
    }
    button, .print-hide {
      display: none !important;
    }
    .rounded-lg {
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    .bg-gray-800, .bg-white {
      background-color: white !important;
      color: black !important;
      box-shadow: none !important;
    }
    h1, h2, h3, h4, p, div, span {
      color: black !important;
    }
    .text-gray-400, .text-gray-500 {
      color: #666 !important;
    }
    .text-white, .text-gray-900 {
      color: black !important;
    }
    .bg-gray-50, .bg-gray-800 {
      background-color: #f9f9f9 !important;
    }
    .divide-gray-700, .divide-gray-200 {
      border-color: #eee !important;
    }
    /* Add page breaks */
    .mb-10 {
      page-break-after: always;
    }
    /* Ensure headers stay with their content */
    h2 {
      page-break-after: avoid;
    }
    /* Avoid breaking inside milestone boxes */
    .space-y-4 > div {
      page-break-inside: avoid;
    }
    /* Add page numbers */
    @page {
      margin: 1cm;
    }
    html {
      font-size: 11pt;
    }
  }
`;

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Gets the user object
  const { isAuthenticated, isLoading } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const [isTokenizing, setIsTokenizing] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        console.log('No project ID provided');
        setError("No project ID provided");
        setLoading(false);
        return;
      }
      
      // Ensure the ID is a valid MongoDB ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      console.log('Is valid MongoDB ObjectId?', isValidObjectId);
      
      if (!isValidObjectId) {
        console.log('Invalid MongoDB ObjectId format');
        setError("Invalid project ID format");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching project with ID:', id);
        
        // Force a small delay to ensure the component is fully mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The id from the URL will be compared with the _id in MongoDB
        // The getProjectById function in the backend will handle this comparison
        const projectData = await projectsService.getProjectById(id);
        console.log('Project data received:', projectData);
        
        if (!projectData) {
          console.log('Project not found');
          setError("Project not found");
          return;
        }
        
        // Ensure we have a valid project object with required fields
        if (!projectData._id && projectData.id) {
          projectData._id = projectData.id;
        }
        
        // Additional debugging to verify MongoDB _id matches URL id
        console.log('MongoDB _id:', projectData._id);
        console.log('URL id:', id);
        console.log('Do they match?', projectData._id === id || projectData._id.toString() === id.toString());
        
        console.log('Setting project state with data:', projectData);
        console.log('Project attachments:', projectData.attachments);
        setProject(projectData);
        console.log('Project state set successfully');
      } catch (err) {
        console.error("Error fetching project:", err);
        console.error("Error response:", err.response);
        
        // Handle specific error cases
        if (err.response) {
          if (err.response.status === 403) {
            console.log('403 Forbidden error - Not redirecting');
            setError("You do not have permission to view this project");
          } else if (err.response.status === 404) {
            setError("Project not found");
          } else {
            setError(err.response.data?.message || "Failed to load project. Please try again.");
          }
        } else {
          setError(err.message || "Failed to load project. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  const handleTokenizeClick = async () => {
    setIsTokenizing(true);
    try {
        const updatedProject = await projectsService.tokenizeProject(project._id);
        setProject(updatedProject); // Refresh the page with the new data
        addToast({ type: 'success', title: 'Tokenization Complete' });
    } catch (error) {
        addToast({ type: 'error', title: 'Tokenization Failed' });
    } finally {
        setIsTokenizing(false);
    }
  };

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6 rounded-xl shadow-sm border bg-white border-gray-200">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-medium mb-2 text-gray-900">
              {error}
            </h3>
            <p className="mb-6 text-gray-500">
              We couldn't find the project you're looking for.
            </p>
            <button
              onClick={() => navigate("/projects")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to login if not authenticated and not in loading state
  if (!isAuthenticated && !isLoading && !loading) {
    console.log('ProjectDetailPage - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render project not found or error message
  if ((!project && !loading) || error) {
    console.log('Project not found or error occurred, but staying on the page');
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6 rounded-xl shadow-sm border bg-white border-gray-200">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-medium mb-2 text-gray-900">
              {error || "Project Not Found"}
            </h3>
            <p className="mb-6 text-gray-500">
              {error ? 
                (error.includes("permission") ? 
                  "You don't have permission to view this project." : 
                  "The project you're looking for couldn't be loaded.") : 
                "We couldn't find the project you're looking for."}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/projects")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Back to Projects
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{ __html: printStyles + `
        @media print {
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}} />
      <div className="print-only p-4 border-b border-gray-300 mb-8">
        <h1 className="text-2xl font-bold text-center">{project?.title || 'Project Details'}</h1>
        <p className="text-center text-gray-500 mt-2">Printed on {new Date().toLocaleDateString()}</p>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Project Details
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/projects")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Back to Projects
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center bg-green-600 hover:bg-green-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-500">
            View the details of your submitted project.
          </p>
        </div>
        <div className="mb-6 p-4 rounded-lg print-hide bg-indigo-50 border border-indigo-100">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-indigo-700">
              This project has been submitted and cannot be edited. Contact support if you need to make changes.
            </span>
          </div>
        </div>

        <div className="mt-6 p-6 rounded-lg bg-white shadow-md">
          {/* Project Basics */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Project Basics
            </h2>
            <Field label="Project Title" value={project?.overview?.title} />
            <Field label="Project Type" value={project?.overview?.type} />
            <Field label="Project Description" value={project?.overview?.description} />
            <Field label="Business Goal" value={project?.overview?.goal} />
          </div>

          {/* Requirements */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Requirements
            </h2>
            <ArrayField label="Features" values={project?.scope?.features} />
            <ArrayField label="User Roles" values={project?.scope?.userRoles} />
            <ArrayField label="Integrations" values={project?.scope?.integrations} />
            <Field
              label="Non-Functional Requirements"
              value={project?.scope?.nfr}
            />
            <Field
              label="Acceptance Criteria"
              value={project?.scope?.acceptanceCriteria}
            />
            <Field label="Success Metrics" value={project?.scope?.successMetrics} />
          </div>

          {/* Technical Details */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Technical Details
            </h2>
            <ArrayField label="Platforms" values={project?.technical?.platforms} />
            <ArrayField label="Tech Stack" values={project?.technical?.stack} />
            <Field
              label="Hosting Preference"
              value={project?.technical?.hosting}
            />
            <Field
              label="Security Requirements"
              value={project?.technical?.security}
            />
            <Field
              label="Data Classification"
              value={project?.technical?.dataClass}
            />
          </div>

          {/* Timeline & Budget */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Timeline & Budget
            </h2>
            <Field label="Start Date" value={project?.timelineBudget?.startDate ? new Date(project.timelineBudget.startDate).toLocaleDateString() : ''} />
            <Field label="End Date" value={project?.timelineBudget?.endDate ? new Date(project.timelineBudget.endDate).toLocaleDateString() : ''} />
            <Field label="Budget Range" value={project?.timelineBudget?.budgetRange} />
            <Field label="Payment Model" value={project?.timelineBudget?.paymentModel} />
            <MilestoneField milestones={project?.timelineBudget?.milestones} />
          </div>

          {/* Documentation & Contact */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Documentation & Contact
            </h2>
            {project.repos && project.repos.length > 0 && (
              <Field label="Repository URL" value={project.repos[0]?.url} />
            )}
            <Field
              label="NDA Required"
              value={project?.legal?.ndaRequired ? "Yes" : "No"}
            />
            <Field
              label="Primary Contact Email"
              value={project?.contacts?.email}
            />
            <Field
              label="Communication Preference"
              value={project?.contacts?.commsPreference}
            />
          </div>
          {/* === AI REQUIREMENTS SECTION (Admin Only) === */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                AI-Generated Project Requirements
              </h2>
              
              {!project.requirements || !project.requirements.summary ? (
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <p className="mb-4 text-sm text-gray-600">No requirements have been generated yet.</p>
                  <button
                    onClick={handleTokenizeClick}
                    disabled={isTokenizing}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isTokenizing ? 'Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
              ) : (               
                  <div className="mt-4">
                  <RequirementsDisplay requirements={project.requirements} />
                  </div>
              )}
            </div>
          )}
          {/* === END OF SECTION === */}
        </div>
        {/* Back to Projects Button */}
        <div className="mt-8 flex justify-center print-hide">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
      <div className="print-only p-4 border-t border-gray-300 mt-8">
        <p className="text-center text-gray-500">
          © {new Date().getFullYear()} - Confidential Project Information
        </p>
      </div>
    </DashboardLayout>
  );
};

ProjectDetailPage.propTypes = {};

export default ProjectDetailPage;