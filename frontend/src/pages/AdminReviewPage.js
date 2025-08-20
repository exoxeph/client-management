import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsService } from '../services/projects.service';
import { useToast } from '../components/ui/Toast';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PropTypes from 'prop-types';

// --- ADD THIS LOCAL COMPONENT DEFINITION ---
const RatingSlider = ({ label, name, value, onChange }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} <span className="font-bold text-indigo-600">({value})</span>
      </label>
      <div className="mt-2">
        <input
          type="range"
          id={name}
          name={name}
          min="1"
          max="5"
          step="1" // This makes the slider snap to whole numbers
          value={value}
          onChange={onChange}
          // Custom styling for a modern look
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-indigo-600"
        />
        {/* Visual tick marks and labels for clear feedback */}
        <div className="flex justify-between w-full mt-1 text-xs text-gray-500">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
};

RatingSlider.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
};
// --- END OF LOCAL COMPONENT DEFINITION ---

const RatingDisplay = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 font-semibold">{value} / 5</dd>
  </div>
);
RatingDisplay.propTypes = { label: PropTypes.string, value: PropTypes.number };

export const AdminReviewPage = () => {
    // --- 1. HOOKS AND STATE ---
    const { id: projectId } = useParams(); // Get project ID from URL
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [formData, setFormData] = useState({
        professionalism: 3,
        communication: 3,
        clarityOfRequirements: 3,
        comment: ''
    });

    // --- 2. DATA FETCHING ---
    // Fetch project details on load to display its title
    
    useEffect(() => {
        const fetchProjectAndReview = async () => {
            try {
                const projectData = await projectsService.getProjectById(projectId);
                if (projectData) {
                    setProject(projectData);
                    
                    // --- THIS IS THE NEW LOGIC ---
                    // Check if an admin review already exists on the project object
                    if (projectData.adminReview && projectData.adminReview.adminId) {
                        // If it exists, switch to view mode and populate the form with the saved data
                        setIsViewMode(true);
                        setFormData(projectData.adminReview);
                    }
                    // If it doesn't exist, the page will remain in "edit mode" by default.
                    
                } else {
                    addToast({ type: 'error', title: 'Error', message: 'Project not found.' });
                    navigate('/projects');
                }
            } catch (error) {
                console.error("Failed to fetch project", error);
                addToast({ type: 'error', title: 'Error', message: 'Could not load project data.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjectAndReview();
    }, [projectId, navigate, addToast]);


    // --- 3. EVENT HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await projectsService.submitAdminReview(projectId, formData);
            addToast({ type: 'success', title: 'Review Submitted', message: 'Your internal review has been saved.' });
            navigate(`/projects`); // Navigate back to the projects list
        } catch (error) {
            console.error("Failed to submit admin review", error);
            const message = error.response?.data?.message || 'An unexpected error occurred.';
            addToast({ type: 'error', title: 'Submission Failed', message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 4. RENDER LOGIC ---
    if (isLoading) {
        return <DashboardLayout><div>Loading project details...</div></DashboardLayout>;
    }
    
    if (!project) {
        return <DashboardLayout><div>Project could not be loaded.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {isViewMode ? (
                    // --- THIS IS THE NEW READ-ONLY VIEW ---
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internal Client Review (Submitted)</h1>
                        <p className="mt-2 text-gray-600">
                            Project: <span className="font-semibold">{project.overview?.title || 'Untitled'}</span>
                        </p>
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                                <RatingDisplay label="Professionalism" value={formData.professionalism} />
                                <RatingDisplay label="Communication" value={formData.communication} />
                                <RatingDisplay label="Clarity of Requirements" value={formData.clarityOfRequirements} />
                            </dl>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                                <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{formData.comment || "No comment provided."}</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => navigate(-1)} className="py-2 px-4 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Back
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- THIS IS YOUR EXISTING EDITABLE FORM VIEW ---
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internal Review of Client</h1>
                        <p className="mt-2 text-gray-600">
                            Project: <span className="font-semibold">{project.overview?.title || 'Untitled'}</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">This review is for internal purposes only and will not be visible to the client.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <RatingSlider label="Client Professionalism" name="professionalism" value={formData.professionalism} onChange={handleChange} />
                            <RatingSlider label="Communication" name="communication" value={formData.communication} onChange={handleChange} />
                            <RatingSlider label="Clarity of Requirements" name="clarityOfRequirements" value={formData.clarityOfRequirements} onChange={handleChange} />
                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Internal Comments</label>
                                <textarea id="comment" name="comment" rows="4" value={formData.comment} onChange={handleChange} placeholder="Add any internal notes..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit Admin Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
    };