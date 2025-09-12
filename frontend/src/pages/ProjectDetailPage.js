import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { projectsService } from "../services/projects.service";
import { useToast } from "../components/ui/Toast";
import { RequirementsDisplay } from '../components/projects/RequirementsDisplay';
import axios from 'axios';
import { marked } from 'marked'; // Make sure to 'npm install marked' or 'yarn add marked'

const SERVER_ROOT_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

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
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isSyncingCodebase, setIsSyncingCodebase] = useState(false);
  const [codebaseQuestion, setCodebaseQuestion] = useState('');
  const [codebaseAnswer, setCodebaseAnswer] = useState('');
  const [isAskingCodebase, setIsAskingCodebase] = useState(false);
  const [codebaseError, setCodebaseError] = useState('');
  const [isIngestingToPinecone, setIsIngestingToPinecone] = useState(false); // RENAMED state for Pinecone ingestion loading

  

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
        if (projectData.codebase?.repoUrl) {
          setRepoUrl(projectData.codebase.repoUrl);
        }
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

   const handleDownloadContract = async () => {
    try {
      // 1. Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      // 2. Make an authenticated request using axios
      const response = await axios({
        url: `${SERVER_ROOT_URL}/api/projects/${project._id}/download-contract`,
        method: 'GET',
        responseType: 'blob', // <-- This is the crucial part for file downloads
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 3. Create a temporary link to trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Use the filename from the project data or a default
      const fileName = project.contract?.fileName || `contract-${project.projectId}.pdf`;
      link.setAttribute('download', fileName); 
      document.body.appendChild(link);
      link.click();
      
      // Clean up the temporary link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to download contract:", error);
      addToast({ type: 'error', title: 'Download Failed', message: 'Could not download the contract.' });
    }
  };

  const handleGenerateContract = async () => {
    setIsGeneratingContract(true);
    try {
      const response = await projectsService.generateContract(project._id);
      // Update the local project state with the new contract data
      setProject(prevProject => ({
        ...prevProject,
        contract: response.contract
      }));
      addToast({ 
        type: 'success', 
        title: 'Contract Generated Successfully',
        message: 'The PDF contract has been generated and is ready for download.'
      });
    } catch (error) {
      console.error('Contract generation error:', error);
      addToast({ 
        type: 'error', 
        title: 'Contract Generation Failed',
        message: error.response?.data?.message || 'Failed to generate contract. Please try again.'
      });
    } finally {
      setIsGeneratingContract(false);
    }
  };
      
// --- NEW HANDLERS FOR CODEBASE INTEGRATION ---

  const handleSyncCodebase = async () => {
    console.log("[Sync Button] Clicked 'Sync Codebase'.");
    setCodebaseError('');
    setIsSyncingCodebase(true);
    console.log("[Sync Button] isSyncingCodebase set to TRUE.");
    try {
      // Step 1: Initiate the sync (backend returns current pending state)
      const initResponse = await projectsService.syncCodebase(project._id, repoUrl);
      setProject(prevProject => ({
          ...prevProject,
          codebase: initResponse.project.codebase // Update to pending state
      }));
      addToast({ type: 'success', title: 'Codebase Sync Initiated', message: initResponse.message });
      console.log("[Sync Button] Sync API call successful. Backend initiated background task.");

      // Step 2: Poll for status updates (simple polling mechanism)
      // This will check the project status periodically until it's no longer 'pending' or 'syncing_weaviate'
      let currentProjectStatus = initResponse.project.codebase.status;
      let attempts = 0;
      const maxAttempts = 30; // Check for up to 30 * 2 seconds = 1 minute
      const pollInterval = 2000; // Poll every 2 seconds

      console.log("[Sync Button] Starting to poll for status updates...");

      while (currentProjectStatus === 'pending' && attempts < maxAttempts) { // Only poll while 'pending'
        await new Promise(resolve => setTimeout(resolve, pollInterval)); // Wait
        const updatedProjectData = await projectsService.getProjectById(project._id); // Re-fetch full project
        
        if (updatedProjectData && updatedProjectData.codebase) {
          if (updatedProjectData.codebase.status !== currentProjectStatus) {
            console.log(`[Sync Button] Status updated from ${currentProjectStatus} to ${updatedProjectData.codebase.status}. Full codebase:`, updatedProjectData.codebase); // <<< NEW LOG
            setProject(updatedProjectData); // Update frontend state with the NEW complete object
            currentProjectStatus = updatedProjectData.codebase.status; // Update local status tracker
            
            // If status is no longer 'pending', break loop early
            if (currentProjectStatus !== 'pending') {
                break;
            }
          }
        }
        attempts++;
      }
      
      // After the loop, ensure the project state is the latest
      const finalUpdatedProject = await projectsService.getProjectById(project._id);
      if (finalUpdatedProject) {
        setProject(finalUpdatedProject); // One final update after polling
        console.log("[Sync Button] Final project state after polling updated:", finalUpdatedProject.codebase);
        currentProjectStatus = finalUpdatedProject.codebase.status;
      }

      if (currentProjectStatus === 'digest_created' || currentProjectStatus === 'completed') {
        addToast({ type: 'success', title: 'Codebase Sync Complete', message: `Status: ${currentProjectStatus}` });
      } else if (currentProjectStatus === 'failed') {
        addToast({ type: 'error', title: 'Codebase Sync Failed', message: `Status: ${currentProjectStatus}. Check backend logs.` });
      } else {
        addToast({ type: 'warning', title: 'Codebase Sync Timed Out', message: 'Status is still pending. Check backend logs.' });
      }

    } catch (error) {
      console.error('Codebase sync error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sync codebase. Check backend logs.';
      setCodebaseError(errorMessage);
      addToast({ type: 'error', title: 'Codebase Sync Failed', message: errorMessage });
      setProject(prevProject => ({
        ...prevProject,
        codebase: {
          ...prevProject.codebase,
          status: 'failed',
          lastProcessedAt: new Date().toISOString()
        }
      }));
      console.log("[Sync Button] Sync API call failed (outer catch).");
    } finally {
      setIsSyncingCodebase(false);
      console.log("[Sync Button] isSyncingCodebase set to FALSE (from finally block).");
    }
  };
  
    const handleIngestToPinecone = async () => { // RENAMED
    console.log("[Ingest Button] Clicked 'Ingest to Vector DB'.");
    setCodebaseError('');
    setIsIngestingToPinecone(true); // NEW state
    console.log("[Ingest Button] isIngestingToPinecone set to TRUE.");
    try {
      const updatedProjectResponse = await projectsService.ingestToPinecone(project._id); // NEW SERVICE CALL
      setProject(prevProject => ({
          ...prevProject,
          codebase: updatedProjectResponse.project.codebase
      }));
      addToast({ type: 'success', title: 'Vector DB Ingestion Started', message: 'Generating local embeddings and syncing to Pinecone.' }); // LOGS UPDATED
      console.log("[Ingest Button] Ingestion API call successful.");
    } catch (error) {
      console.error('Pinecone ingestion error:', error); // LOG UPDATED
      const errorMessage = error.response?.data?.message || error.message || 'Failed to ingest to Pinecone.'; // MESSAGE UPDATED
      setCodebaseError(errorMessage);
      addToast({ type: 'error', title: 'Vector DB Ingestion Failed', message: errorMessage }); // LOG UPDATED
      setProject(prevProject => ({
        ...prevProject,
        codebase: {
          ...prevProject.codebase,
          status: 'failed',
          lastProcessedAt: new Date().toISOString()
        }
      }));
      console.log("[Ingest Button] Ingestion API call failed.");
    } finally {
      setIsIngestingToPinecone(false); // NEW state
      console.log("[Ingest Button] isIngestingToPinecone set to FALSE (from finally block).");
    }
  };

    const handleAskCodebase = async () => {
    console.log("[Ask Button] Clicked 'Get Answer'.");
    setCodebaseError('');
    setCodebaseAnswer('');
    setIsAskingCodebase(true);
    console.log("[Ask Button] isAskingCodebase set to TRUE.");
    try {
      // --- CRITICAL FIX: Call the correctly named service function ---
      const response = await projectsService.askCodebasePinecone(project._id, codebaseQuestion); // <<< CORRECTED
      // --- END CRITICAL FIX ---
      setCodebaseAnswer(marked.parse(response.answer));
      addToast({ type: 'success', title: 'Answer Retrieved' });
      console.log("[Ask Button] Query API call successful.");
    } catch (error) {
      console.error('Ask codebase error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to get answer from codebase.';
      setCodebaseError(errorMessage);
      addToast({ type: 'error', title: 'Query Failed', message: errorMessage });
      console.log("[Ask Button] Query API call failed.");
    } finally {
      setIsAskingCodebase(false);
      console.log("[Ask Button] isAskingCodebase set to FALSE (from finally block).");
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

  // --- NEW: DEBUGGING CODEBASE RAG SECTION (TEMPORARY - REMOVE LATER) ---
  console.log("--- DEBUGGING CODEBASE RAG SECTION ---");
  console.log("project?.codebase?.status:", project?.codebase?.status);
  console.log("project?.codebase?.jsonDigestFilePath:", project?.codebase?.jsonDigestFilePath);
  console.log("project?.codebase?.weaviateClass:", project?.codebase?.weaviateClass);
  console.log("isIngestingToPinecone state:", isIngestingToPinecone);
  console.log("isSyncingCodebase state:", isSyncingCodebase);
  console.log("Condition for 'Ingest to Vector DB' button (!jsonDigestFilePath):",
    !project?.codebase?.jsonDigestFilePath);
  console.log("Calculated 'Ingest' button disabled state:",
    isIngestingToPinecone || isSyncingCodebase || !project?.codebase?.jsonDigestFilePath);
  console.log("Condition for 'Ask a Question' (status === 'completed' && weaviateClass exists):",
    project?.codebase?.status === 'completed' && !!project?.codebase?.weaviateClass);
  console.log("------------------------------------");
  // --- END DEBUGGING CODEBASE RAG SECTION ---

  
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
  // ... right before the final return statement
  console.log("--- DEBUGGING PROJECT DETAIL PAGE ---");
  console.log("Current User Role:", currentUser?.role);
  console.log("Project Object:", project);
  console.log("Project ID for Link:", project?._id);
  console.log("------------------------------------");

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

          {/* Contract Management */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Contract Management
            </h2>
            
            {/* Admin View */}
            {currentUser && currentUser.role === 'admin' && (
              <div className="space-y-4">
                {!project?.contract?.status || project.contract.status === 'none' ? (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="mb-4 text-sm text-blue-800">
                      No contract has been generated for this project yet.
                    </p>
                    <button
                      onClick={handleGenerateContract}
                      disabled={isGeneratingContract}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isGeneratingContract ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Contract...
                        </>
                      ) : (
                        '📄 Generate Contract'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Contract Status: <span className="capitalize">{project.contract.status}</span>
                        </p>
                        {project.contract.generatedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Generated on: {new Date(project.contract.generatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
  onClick={handleDownloadContract}
  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 flex items-center"
>
  {/* You can add a download icon here if you like */}
  Download Contract
</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Client View */}
            {currentUser && (currentUser.role === 'corporate' || currentUser.role === 'individual') && (
              <div>
                {project?.contract?.status && project.contract.status !== 'none' ? (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-green-800 mb-2">Contract Ready</h3>
                      <p className="text-sm text-green-600 mb-4">
                        Your project contract is ready for download.
                      </p>
                          
                      <button
                        onClick={handleDownloadContract}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Download Contract
                      </button>

  
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-yellow-800 mb-2">Contract In Preparation</h3>
                      <p className="text-sm text-yellow-600">
                        The contract is being prepared. You will be notified when it's ready for download.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
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
          
          {/* === END OF AI REQUIREMENTS SECTION === */}

          {/* === NEW: CODEBASE ANALYSIS SECTION (Admin Only) === */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="mb-10 p-6 rounded-lg bg-gray-50 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Codebase Analysis (RAG System)
              </h2>

              <div className="mb-4">
                <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  id="repoUrl"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isSyncingCodebase}
                />
              </div>

                            <div className="flex flex-wrap gap-4 mb-4"> {/* Use flex-wrap and gap for buttons */}
                <button
                  onClick={handleSyncCodebase}
                  disabled={isSyncingCodebase || isIngestingToPinecone || !repoUrl.trim()}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSyncingCodebase ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing Codebase...
                    </>
                  ) : (
                    '🔗 Sync Codebase'
                  )}
                </button>

                                {/* Ingest to Vector DB button */}
                {project?.codebase?.status === 'digest_created' && (
                  <button
                    onClick={handleIngestToPinecone} // NEW handler
                    disabled={isIngestingToPinecone || isSyncingCodebase || !project?.codebase?.jsonDigestFilePath} // NEW state
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isIngestingToPinecone ? ( // NEW state
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ingesting to Pinecone...
                      </>
                    ) : (
                      '📤 Ingest to Pinecone' // NEW text
                    )}
                  </button>
                )}
              </div>

              {codebaseError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {codebaseError}</span>
                </div>
              )}

                            {project?.codebase?.status && (
                <div className="mb-6 p-3 rounded-md bg-gray-100 text-sm text-gray-700">
                                    <p><strong>Ingestion Status:</strong> <span className={`font-semibold ${
                    project.codebase.status === 'completed' ? 'text-green-600' :
                    project.codebase.status === 'failed' ? 'text-red-600' :
                    project.codebase.status === 'digest_created' ? 'text-blue-600' :
                    project.codebase.status === 'syncing_pinecone' ? 'text-indigo-600' : // NEW color
                    'text-yellow-600'
                  }`}>{project.codebase.status}</span></p>
                  {project.codebase.lastProcessedAt && <p><strong>Last Processed:</strong> {new Date(project.codebase.lastProcessedAt).toLocaleString()}</p>}
                  {project.codebase.pineconeIndexName && <p><strong>Pinecone Index:</strong> {project.codebase.pineconeIndexName}</p>} {/* LABEL UPDATED */}
                </div>
              )}

                            {/* Ask a Question section (only if codebase ingestion to Weaviate is completed) */}
              {project?.codebase?.status === 'completed' && project?.codebase?.pineconeIndexName && ( // NEW condition
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Ask a Question about the Codebase</h3>
                  <div className="mb-4">
                    <textarea
                      id="codebaseQuestion"
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="e.g., What are the main components of the authentication system?"
                      value={codebaseQuestion}
                      onChange={(e) => setCodebaseQuestion(e.target.value)}
                      disabled={isAskingCodebase}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <button
                      onClick={handleAskCodebase}
                      disabled={isAskingCodebase || !codebaseQuestion.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isAskingCodebase ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting Answer...
                        </>
                      ) : (
                        '💬 Get Answer'
                      )}
                    </button>
                  </div>
                  {codebaseAnswer && (
                    <div className="mt-4 p-4 rounded-md bg-white border border-gray-300 shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">AI's Answer:</h4>
                      {/* Render markdown output as HTML */}
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: codebaseAnswer }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* === END OF CODEBASE ANALYSIS SECTION === */}
        </div> {/* This closes the mt-6 p-6 rounded-lg bg-white shadow-md div */}

        {/* Back to Projects Button (moved here) */}
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