import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { FeatureListEditor } from "../components/project/FeatureListEditor";
import { MilestonesEditor } from "../components/project/MilestonesEditor";
import SummaryPanel from "../components/project/SummaryPanel";
import { projectsService, PROJECT_TYPES, PROJECT_STATUS } from "../services/projects.service";
import { useToast } from "../components/ui/Toast";
// Added for draft functionality

// uploadProjectFiles function has been removed

/**
 * Project creation page component without pagination
 * @param {Object} props - Component props
 */
export const ProjectCreatePage = ({
}) => {
  const {
    currentUser,
    isAuthenticated,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  const { addToast } = useToast();
  
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Project form data - flattened structure
  const [projectData, setProjectData] = useState({
    // Project Basics
    title: "",
    type: "",
    description: "",
    businessGoal: "",
    // Requirements
    features: [],
    userRoles: "",
    integrations: "",
    nonFunctionalRequirements: "",
    acceptanceCriteria: "",
    successMetrics: "",
    // Technical Details
    platforms: "",
    techStack: "",
    hostingPreference: "",
    securityRequirements: [],
    dataClassification: "",
    // Timeline & Budget
    startDate: "",
    endDate: "",
    budgetRange: "",
    paymentModel: "",
    milestones: [],
    // Documentation
    files: [],
    repoUrls: "",
    ndaRequired: false,
    primaryContact: "",
    communicationPreference: "",
    termsAccepted: false
  });

  // Validate all form data
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Project Basics
    if (!projectData.title) {
      errors.title = "Project title is required";
      isValid = false;
    }
    if (!projectData.type) {
      errors.type = "Project type is required";
      isValid = false;
    }
    if (!projectData.description) {
      errors.description = "Project description is required";
      isValid = false;
    }
    if (!projectData.businessGoal) {
      errors.businessGoal = "Business goal is required";
      isValid = false;
    }
    
    // Requirements
    if (!projectData.features || projectData.features.length === 0) {
      errors.features = "At least one feature is required";
      isValid = false;
    }
    
    // Technical Details
    if (!projectData.platforms || (Array.isArray(projectData.platforms) ? projectData.platforms.length === 0 : !projectData.platforms.trim())) {
      errors.platforms = "Target platforms are required";
      isValid = false;
    }
    
    // Timeline & Budget
    if (!projectData.startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    }
    // Validate end date
    if (projectData.startDate && projectData.endDate) {
      const start = new Date(projectData.startDate);
      const end = new Date(projectData.endDate);
      if (end <= start) {
        errors.endDate = "End date must be after start date";
        isValid = false;
      }
    }
    if (!projectData.budgetRange) {
      errors.budgetRange = "Budget range is required";
      isValid = false;
    }
    if (!projectData.paymentModel) {
      errors.paymentModel = "Payment model is required";
      isValid = false;
    }
    
    // Documentation & Contact
    if (!projectData.primaryContact.trim()) {
      errors.primaryContact = "Primary contact is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(projectData.primaryContact)) {
      errors.primaryContact = "Please enter a valid email address";
      isValid = false;
    }
    if (!projectData.communicationPreference) {
      errors.communicationPreference = "Communication preference is required";
      isValid = false;
    }
    if (!projectData.termsAccepted) {
      errors.termsAccepted = "You must accept the terms to submit";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle input change
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setProjectData({
      ...projectData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Load draft project if draftId is present
  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const loadDraft = async () => {
      if (draftId) {
        try {
          console.log('Loading draft with ID:', draftId);
          if (isMounted) setLoading(true);
          const draftProject = await projectsService.getProjectById(draftId);
          console.log('Draft project data received:', draftProject);
          
          // Only proceed if the component is still mounted
          if (!isMounted) return;
          
          if (draftProject && draftProject.status === PROJECT_STATUS.DRAFT) {
            console.log('Valid draft project found, populating form data');
            // Populate form with draft data - properly map nested structure to flat structure
            setProjectData({
              // Project Basics - from overview
              title: draftProject.overview?.title || draftProject.title || '',
              type: draftProject.overview?.type || draftProject.type || '',
              description: draftProject.overview?.description || draftProject.description || '',
              businessGoal: draftProject.overview?.goal || draftProject.businessGoal || '',
              
              // Requirements - from scope
              features: draftProject.scope?.features || draftProject.features || [],
              userRoles: draftProject.scope?.userRoles || draftProject.userRoles || [],
              integrations: draftProject.scope?.integrations || draftProject.integrations || [],
              nonFunctionalRequirements: draftProject.scope?.nfr || draftProject.nonFunctionalRequirements || '',
              acceptanceCriteria: draftProject.scope?.acceptanceCriteria || draftProject.acceptanceCriteria || '',
              successMetrics: draftProject.scope?.successMetrics || draftProject.successMetrics || '',
              
              // Technical Details - from technical
              platforms: draftProject.technical?.platforms ? 
                (Array.isArray(draftProject.technical.platforms) ? 
                  draftProject.technical.platforms.join(', ') : 
                  draftProject.technical.platforms) : 
                (Array.isArray(draftProject.platforms) ? 
                  draftProject.platforms.join(', ') : 
                  draftProject.platforms || ''),
              techStack: draftProject.technical?.stack ? 
                (Array.isArray(draftProject.technical.stack) ? 
                  draftProject.technical.stack.join(', ') : 
                  draftProject.technical.stack) : 
                (Array.isArray(draftProject.techStack) ? 
                  draftProject.techStack.join(', ') : 
                  draftProject.techStack || ''),
              hostingPreference: draftProject.technical?.hosting || draftProject.hostingPreference || '',
              securityRequirements: draftProject.technical?.security ? 
                (typeof draftProject.technical.security === 'string' ? 
                  draftProject.technical.security.split(',').map(s => s.trim()).filter(s => s) : 
                  draftProject.technical.security) : 
                draftProject.securityRequirements || [],
              dataClassification: draftProject.technical?.dataClass || draftProject.dataClassification || '',
              
              // Timeline & Budget - from timelineBudget
              startDate: draftProject.timelineBudget?.startDate || draftProject.startDate || '',
              endDate: draftProject.timelineBudget?.endDate || draftProject.endDate || '',
              budgetRange: draftProject.timelineBudget?.budgetRange || draftProject.budgetRange || '',
              paymentModel: draftProject.timelineBudget?.paymentModel || draftProject.paymentModel || '',
              milestones: draftProject.timelineBudget?.milestones || draftProject.milestones || [],
              
              // Documentation & Legal
              files: draftProject.attachments || draftProject.files || [],
              repoUrls: draftProject.repos?.map(repo => repo.url).join(', ') || draftProject.repoUrls || '',
              ndaRequired: draftProject.legal?.ndaRequired ?? draftProject.ndaRequired ?? false,
              
              // Contact Information - from contacts
              primaryContact: draftProject.contacts?.email || draftProject.primaryContact || '',
              communicationPreference: draftProject.contacts?.commsPreference || draftProject.communicationPreference || '',
              
              termsAccepted: false // Always require re-accepting terms
            });
            
            // Only show toast if component is still mounted
            if (isMounted) {
              // Use setTimeout to delay the toast slightly
              setTimeout(() => {
                if (isMounted) {
                  addToast({
                    type: 'success',
                    title: 'Draft Loaded',
                    message: 'Your draft project has been loaded. Continue editing and submit when ready.'
                  });
                }
              }, 500);
            }
          } else {
            console.log('Draft not found or not in draft status:', draftProject);
            if (isMounted) {
              addToast({
                type: 'error',
                title: 'Error Loading Draft',
                message: 'The draft could not be found or is no longer available.'
              });
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          if (isMounted) {
            addToast({
              type: 'error',
              title: 'Error Loading Draft',
              message: 'Failed to load your draft. Please try again.'
            });
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    
    // Only load draft if draftId exists
    if (draftId) {
      loadDraft();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      console.log('Component unmounted, cleanup performed');
    };
  }, [draftId]); // Removed addToast from dependencies to prevent infinite loop



  // Handle saving draft
  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);

      const payload = {
        title: projectData.title,
        type: projectData.type,
        description: projectData.description,
        businessGoal: projectData.businessGoal,
        features: projectData.features,
        userRoles: projectData.userRoles,
        integrations: projectData.integrations,
        nonFunctionalRequirements: projectData.nonFunctionalRequirements,
        acceptanceCriteria: projectData.acceptanceCriteria,
        successMetrics: projectData.successMetrics,
        platforms: projectData.platforms,
        techStack: projectData.techStack,
        hostingPreference: projectData.hostingPreference,
        securityRequirements: projectData.securityRequirements,
        dataClassification: projectData.dataClassification,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        budgetRange: projectData.budgetRange,
        paymentModel: projectData.paymentModel,
        milestones: projectData.milestones,
        repoUrls: projectData.repoUrls,
        ndaRequired: projectData.ndaRequired,
        primaryContact: projectData.primaryContact,
        communicationPreference: projectData.communicationPreference,
        status: PROJECT_STATUS.DRAFT,
      };

      // New draft
      if (!draftId) {
        const res = await projectsService.createDraft(payload);
        const newDraftId = res.project?._id;
        // Update URL with draft ID
        navigate(`/projects/create?draft=${newDraftId}`, { replace: true });
        addToast({
          type: 'success',
          title: 'Draft Saved',
          message: 'Your draft has been saved successfully.'
        });
      }
      // Updating existing draft
      else {
        await projectsService.updateDraft(draftId, payload);
        addToast({
          type: 'success',
          title: 'Draft Updated',
          message: 'Your draft has been updated successfully.'
        });
      }

    } catch (error) {
      console.error("Error saving draft:", error);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save your draft. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      // Scroll to the first error
      const firstError = document.querySelector(".text-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('Submitting project form...');
      
      const payload = {
        title: projectData.title,
        type: projectData.type,
        description: projectData.description,
        businessGoal: projectData.businessGoal,
        features: projectData.features,
        userRoles: projectData.userRoles,
        integrations: projectData.integrations,
        nonFunctionalRequirements: projectData.nonFunctionalRequirements,
        acceptanceCriteria: projectData.acceptanceCriteria,
        successMetrics: projectData.successMetrics,
        platforms: projectData.platforms,
        techStack: projectData.techStack,
        hostingPreference: projectData.hostingPreference,
        securityRequirements: projectData.securityRequirements,
        dataClassification: projectData.dataClassification,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        budgetRange: projectData.budgetRange,
        paymentModel: projectData.paymentModel,
        milestones: projectData.milestones,
        repoUrls: projectData.repoUrls,
        ndaRequired: projectData.ndaRequired,
        primaryContact: projectData.primaryContact,
        communicationPreference: projectData.communicationPreference
      };
      
      let projectId = draftId;
      
      if (!projectId) {
        // Create a draft project first if we don't have a draft ID
        console.log('Creating new draft before submission');
        const response = await projectsService.createDraft(payload);
        projectId = response?.id || response?._id;
        console.log('Created new draft with ID:', projectId);
      } else {
        // Update the existing draft
        console.log('Updating existing draft before submission:', projectId);
        await projectsService.updateDraft(projectId, payload);
      }
      
      if (projectId) {
        // Submit the project using the ID
        console.log('Submitting project with ID:', projectId);
        await projectsService.submitProject(projectId);
        console.log('Project submitted successfully');
        
        addToast({
          type: 'success',
          title: 'Project Submitted',
          message: 'Your project has been submitted successfully.'
        });
        
        // Navigate to the project detail page
        navigate(`/projects/${projectId}`);
      } else {
        console.error('No project ID returned after creating draft');
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit your project. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if currentUser is admin
  if (currentUser.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to projects page if currentUser doesn't have the right role to create projects
  if (currentUser.role !== "corporate" && currentUser.role !== "individual") {
    return <Navigate to="/projects" replace />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create a New Project
          </h1>
          <p className="mt-2 text-gray-500">
            Fill out the form below to submit your project request. We'll review it and get back to you shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Basics */}
          <div className="rounded-xl shadow-sm border p-6 bg-white border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Project Basics
            </h2>
            <div className="space-y-6">
              {/* Project Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={projectData.title} 
                  onChange={handleChange} 
                  placeholder="Enter a descriptive title for your project" 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.title ? "border-red-500" : ""}`} 
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.title}</p>
                )}
              </div>
              
              {/* Project Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-700">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <select 
                  id="type" 
                  name="type" 
                  value={projectData.type} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.type ? "border-red-500" : ""}`}
                >
                  <option value="">Select a project type</option>
                  {Object.values(PROJECT_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formErrors.type && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.type}</p>
                )}
              </div>
              
              {/* Project Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={projectData.description} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Provide a brief overview of your project" 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.description ? "border-red-500" : ""}`}
                ></textarea>
                {formErrors.description && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.description}</p>
                )}
              </div>
              
              {/* Business Goal */}
              <div>
                <label htmlFor="businessGoal" className="block text-sm font-medium mb-1 text-gray-700">
                  Business Goal / Problem Statement <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="businessGoal" 
                  name="businessGoal" 
                  value={projectData.businessGoal} 
                  onChange={handleChange} 
                  rows={4} 
                  placeholder="What business problem are you trying to solve? What are your goals for this project?" 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.businessGoal ? "border-red-500" : ""}`}
                ></textarea>
                {formErrors.businessGoal && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.businessGoal}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Requirements */}
          <div className="rounded-xl shadow-sm border p-6 bg-white border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Project Requirements
            </h2>
            <div className="space-y-6">
              {/* Key Features */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Key Features <span className="text-red-500">*</span>
                </label>
                <FeatureListEditor 
                  features={projectData.features} 
                  onChange={features => setProjectData({
                    ...projectData,
                    features
                  })} 
                  darkMode={false} 
                />
                {formErrors.features && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.features}</p>
                )}
              </div>
              
              {/* User Roles */}
              <div>
                <label htmlFor="userRoles" className="block text-sm font-medium mb-1 text-gray-700">
                  User Roles
                </label>
                <textarea 
                  id="userRoles" 
                  name="userRoles" 
                  value={projectData.userRoles} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Describe the different types of users who will interact with your application" 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              
              {/* Integrations */}
              <div>
                <label htmlFor="integrations" className="block text-sm font-medium mb-1 text-gray-700">
                  Integrations
                </label>
                <textarea 
                  id="integrations" 
                  name="integrations" 
                  value={projectData.integrations} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="List any third-party services or APIs that need to be integrated" 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              
              {/* Non-functional Requirements */}
              <div>
                <label htmlFor="nonFunctionalRequirements" className="block text-sm font-medium mb-1 text-gray-700">
                  Non-functional Requirements
                </label>
                <textarea 
                  id="nonFunctionalRequirements" 
                  name="nonFunctionalRequirements" 
                  value={projectData.nonFunctionalRequirements} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Performance, scalability, reliability requirements" 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              
              {/* Acceptance Criteria */}
              <div>
                <label htmlFor="acceptanceCriteria" className="block text-sm font-medium mb-1 text-gray-700">
                  Acceptance Criteria
                </label>
                <textarea 
                  id="acceptanceCriteria" 
                  name="acceptanceCriteria" 
                  value={projectData.acceptanceCriteria} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="What criteria must be met for the project to be considered successful?" 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              
              {/* Success Metrics */}
              <div>
                <label htmlFor="successMetrics" className="block text-sm font-medium mb-1 text-gray-700">
                  Success Metrics
                </label>
                <textarea 
                  id="successMetrics" 
                  name="successMetrics" 
                  value={projectData.successMetrics} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="How will you measure the success of this project?" 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="rounded-xl shadow-sm border p-6 bg-white border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
                Technical Details
              </h2>
            <div className="space-y-6">
              {/* Target Platforms */}
              <div>
                <label htmlFor="platforms" className="block text-sm font-medium mb-1 text-gray-700">
                  Target Platforms <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="platforms" 
                  name="platforms" 
                  value={projectData.platforms} 
                  onChange={handleChange} 
                  placeholder="Web, iOS, Android, Desktop, etc." 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.platforms ? "border-red-500" : ""}`}
                />
                {formErrors.platforms && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.platforms}</p>
                )}
              </div>
              
              {/* Preferred Tech Stack */}
              <div>
                <label htmlFor="techStack" className="block text-sm font-medium mb-1 text-gray-700">
                  Preferred Tech Stack
                </label>
                <input 
                  type="text" 
                  id="techStack" 
                  name="techStack" 
                  value={projectData.techStack} 
                  onChange={handleChange} 
                  placeholder="React, Node.js, MongoDB, etc." 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Hosting/Cloud Preference */}
              <div>
                <label htmlFor="hostingPreference" className="block text-sm font-medium mb-1 text-gray-700">
                  Hosting/Cloud Preference
                </label>
                <select 
                  id="hostingPreference" 
                  name="hostingPreference" 
                  value={projectData.hostingPreference} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select hosting preference</option>
                  <option value="AWS">Amazon Web Services (AWS)</option>
                  <option value="Azure">Microsoft Azure</option>
                  <option value="GCP">Google Cloud Platform (GCP)</option>
                  <option value="DigitalOcean">DigitalOcean</option>
                  <option value="Heroku">Heroku</option>
                  <option value="Netlify">Netlify</option>
                  <option value="Vercel">Vercel</option>
                  <option value="On-premise">On-premise</option>
                  <option value="No preference">No preference</option>
                </select>
              </div>
              
              {/* Security Requirements */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Security/Compliance Requirements
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    "Authentication",
                    "Authorization",
                    "Data Encryption",
                    "GDPR Compliance",
                    "HIPAA Compliance",
                    "PCI DSS Compliance",
                    "SOC 2 Compliance"
                  ].map(req => (
                    <div key={req} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`security-${req}`}
                        checked={projectData.securityRequirements.includes(req)}
                        onChange={() => {
                          const updatedReqs = projectData.securityRequirements.includes(req)
                            ? projectData.securityRequirements.filter(r => r !== req)
                            : [...projectData.securityRequirements, req];
                          setProjectData({
                            ...projectData,
                            securityRequirements: updatedReqs
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`security-${req}`} className="ml-2 text-sm text-gray-700">
                        {req}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Data Classification */}
              <div>
                <label htmlFor="dataClassification" className="block text-sm font-medium mb-1 text-gray-700">
                  Data Classification
                </label>
                <select 
                  id="dataClassification" 
                  name="dataClassification" 
                  value={projectData.dataClassification} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select data classification</option>
                  <option value="Public">Public</option>
                  <option value="Internal">Internal</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline & Budget */}
          <div className="rounded-xl shadow-sm border p-6 bg-white border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Timeline & Budget
            </h2>
            <div className="space-y-6">
              {/* Start & End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium mb-1 text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    id="startDate" 
                    name="startDate" 
                    value={projectData.startDate} 
                    onChange={handleChange} 
                    min={new Date().toISOString().split("T")[0]} 
                    className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.startDate ? "border-red-500" : ""}`}
                  />
                  {formErrors.startDate && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.startDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-1 text-gray-700">
                    End Date
                  </label>
                  <input 
                    type="date" 
                    id="endDate" 
                    name="endDate" 
                    value={projectData.endDate} 
                    onChange={handleChange} 
                    min={projectData.startDate || new Date().toISOString().split("T")[0]} 
                    className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.endDate ? "border-red-500" : ""}`}
                  />
                  {formErrors.endDate && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.endDate}</p>
                  )}
                </div>
              </div>
              
              {/* Budget Range */}
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium mb-1 text-gray-700">
                  Budget Range <span className="text-red-500">*</span>
                </label>
                <select 
                  id="budgetRange" 
                  name="budgetRange" 
                  value={projectData.budgetRange} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.budgetRange ? "border-red-500" : ""}`}
                >
                  <option value="">Select budget range</option>
                  <option value="< $5,000">Less than $5,000</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                  <option value="> $250,000">More than $250,000</option>
                </select>
                {formErrors.budgetRange && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.budgetRange}</p>
                )}
              </div>
              
              {/* Payment Model */}
              <div>
                <label htmlFor="paymentModel" className="block text-sm font-medium mb-1 text-gray-700">
                  Payment Model <span className="text-red-500">*</span>
                </label>
                <select 
                  id="paymentModel" 
                  name="paymentModel" 
                  value={projectData.paymentModel} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.paymentModel ? "border-red-500" : ""}`}
                >
                  <option value="">Select payment model</option>
                  <option value="Fixed Price">Fixed Price</option>
                  <option value="Time & Materials">Time & Materials</option>
                  <option value="Milestone-based">Milestone-based</option>
                </select>
                {formErrors.paymentModel && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.paymentModel}</p>
                )}
              </div>
              
              {/* Milestones */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Project Milestones
                </label>
                <MilestonesEditor 
                  milestones={projectData.milestones} 
                  onChange={milestones => setProjectData({
                    ...projectData,
                    milestones
                  })} 
                  darkMode={false}
                />
              </div>
            </div>
          </div>

          {/* Documentation & Contact */}
          <div className="rounded-xl shadow-sm border p-6 bg-white border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Documentation & Contact
            </h2>
            <div className="space-y-6">

              
              {/* Repository URLs */}
              <div>
                <label htmlFor="repoUrls" className="block text-sm font-medium mb-1 text-gray-700">
                  Repository URLs
                </label>
                <input 
                  type="text" 
                  id="repoUrls" 
                  name="repoUrls" 
                  value={projectData.repoUrls} 
                  onChange={handleChange} 
                  placeholder="GitHub, GitLab, or Bitbucket repository URLs" 
                  className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* NDA Required */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input 
                    id="ndaRequired" 
                    name="ndaRequired" 
                    type="checkbox" 
                    checked={projectData.ndaRequired} 
                    onChange={handleChange} 
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="ndaRequired" className="text-sm text-gray-700">
                    NDA Required
                  </label>
                  <p className="text-xs text-gray-500">
                    Check this if you require a Non-Disclosure Agreement before sharing project details.
                  </p>
                </div>
              </div>
              
              {/* Primary Contact */}
              <div>
                <label htmlFor="primaryContact" className="block text-sm font-medium mb-1 text-gray-700">
                  Primary Contact Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="primaryContact" 
                  name="primaryContact" 
                  value={projectData.primaryContact} 
                  onChange={handleChange} 
                  placeholder="Enter your email address" 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.primaryContact ? "border-red-500" : ""}`}
                />
                {formErrors.primaryContact && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.primaryContact}</p>
                )}
              </div>
              
              {/* Communication Preference */}
              <div>
                <label htmlFor="communicationPreference" className="block text-sm font-medium mb-1 text-gray-700">
                  Communication Preference <span className="text-red-500">*</span>
                </label>
                <select 
                  id="communicationPreference" 
                  name="communicationPreference" 
                  value={projectData.communicationPreference} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.communicationPreference ? "border-red-500" : ""}`}
                >
                  <option value="">Select communication preference</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Video Call">Video Call</option>
                  <option value="In-person Meeting">In-person Meeting</option>
                  <option value="Slack/Teams">Slack/Teams</option>
                </select>
                {formErrors.communicationPreference && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.communicationPreference}</p>
                )}
              </div>
              
              {/* Project Summary */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  Project Summary
                </h3>
                <SummaryPanel projectData={projectData} darkMode={false} />
              </div>
              
              {/* Terms & Conditions */}
              <div className="flex items-start mt-6">
                <div className="flex items-center h-5">
                  <input 
                    id="termsAccepted" 
                    name="termsAccepted" 
                    type="checkbox" 
                    checked={projectData.termsAccepted} 
                    onChange={handleChange} 
                    className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${formErrors.termsAccepted ? "border-red-500" : ""}`}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                    I agree to the terms and conditions
                  </label>
                  <p className="text-xs text-gray-500">
                    By checking this box, you agree to our <a href="#" className="text-indigo-500 hover:text-indigo-400">Terms of Service</a> and <a href="#" className="text-indigo-500 hover:text-indigo-400">Privacy Policy</a>.
                  </p>
                  {formErrors.termsAccepted && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{formErrors.termsAccepted}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button 
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting || loading} 
              className={`px-6 py-3 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 ${(submitting || loading) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>
            <button 
              type="submit" 
              disabled={submitting || loading} 
              className={`px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 ${(submitting || loading) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Submitting..." : "Submit Project"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

ProjectCreatePage.propTypes = {};

export default ProjectCreatePage;