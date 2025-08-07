import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { projectsService } from "../services/projects.service";

/**
 * Project Review Page component
 * @param {Object} props - Component props
 */
export const ProjectReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState({
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  // Fetch project data and check for existing review
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        console.log('No project ID provided');
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      console.log('Fetching project with ID:', id);

      try {
        setLoading(true);
        const projectData = await projectsService.getProjectById(id);
        console.log('Project data received:', projectData);

        if (!projectData) {
          console.log('Project not found');
          setError("Project not found");
          return;
        }

        // Check if project verdict is confirmed
        if (projectData.verdict !== "confirmed") {
          console.log('Project verdict is not confirmed:', projectData.verdict);
          setError("Only confirmed projects can be reviewed");
          return;
        }

        console.log('Setting project data:', projectData);
        console.log('Project overview:', projectData.overview);
        console.log('Project title:', projectData.overview?.title);
        console.log('Project type:', projectData.overview?.type);
        console.log('Project description:', projectData.overview?.description);
        setProject(projectData);
        
        // Check if the current user has already reviewed this project
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) {
          console.log('No user found in localStorage or missing user ID');
          return;
        }
        
        // Convert user ID to string for consistent comparison
        const userId = user._id.toString();
        console.log('Current user ID:', userId);
        
        // First check if reviews are in the project data
        if (projectData.reviews && Array.isArray(projectData.reviews) && projectData.reviews.length > 0) {
          console.log('Project has reviews array with', projectData.reviews.length, 'reviews');
          
          // Find review by comparing string representations of user IDs
          const userReview = projectData.reviews.find(review => {
            // Skip reviews with missing userId
            if (!review || !review.userId) {
              console.log('Found review with missing userId, skipping');
              return false;
            }
            
            // Ensure review.userId is a string for comparison
            const reviewUserId = review.userId.toString();
            const isMatch = reviewUserId === userId;
            
            if (isMatch) {
              console.log('Found matching review with userId:', reviewUserId);
            }
            
            return isMatch;
          });
          
          if (userReview) {
            console.log('Found existing review in project data:', userReview);
            setExistingReview(userReview);
            setReview({
              rating: userReview.rating,
              comment: userReview.comment
            });
            return; // Exit early since we found the review
          }
        }
        
        // Fallback to the API method if no review found in project data
        console.log('No review found in project data, checking via API');
        try {
          const userReview = await projectsService.getUserReview(id);
          if (userReview) {
            console.log('Found existing review via API:', userReview);
            setExistingReview(userReview);
            setReview({
              rating: userReview.rating,
              comment: userReview.comment
            });
          } else {
            console.log('No existing review found via API');
          }
        } catch (reviewErr) {
          console.error('Error fetching user review:', reviewErr);
          // Don't set the main error state, just log the review error
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.response?.data?.message || "Failed to load project. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProject();
    } else {
      console.log('User not authenticated');
    }
  }, [id, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!review.comment.trim()) {
      setError("Please provide a review comment");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Use the submitReview method from projectsService
      const submittedReview = await projectsService.submitReview(id, review);
      
      // Get the current user ID from localStorage
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      
      // Set the existing review with the submitted data
      const reviewData = {
        ...submittedReview.review, // Access the review object from the response
        userId: userId,
        createdAt: new Date().toISOString()
      };
      
      setExistingReview(reviewData);

      // Update the project with the new review
      if (project && project.reviews) {
        // Add the new review to the project's reviews array
        const updatedProject = {
          ...project,
          reviews: [...project.reviews, reviewData]
        };
        setProject(updatedProject);
      }

      setSubmitSuccess(true);
      // Redirect after successful submission with reviewed flag
      setTimeout(() => {
        navigate(`/projects?reviewed=true`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
      // Improved error handling to extract the specific error message
      let errorMessage = "Failed to submit review. Please try again.";
      
      if (err.response) {
        // Extract the error message from the response data
        if (err.response.data) {
          errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        }
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
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
              We couldn't load the project review page.
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

  // Show success message
  if (submitSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6 rounded-xl shadow-sm border bg-white border-gray-200">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="text-xl font-medium mb-2 text-gray-900">
              Review Submitted Successfully!
            </h3>
            <p className="mb-6 text-gray-500">
              Thank you for your feedback. You will be redirected shortly.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Log project state before rendering
  console.log('Rendering with project state:', project);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Review Project
            </h1>
            <button
              onClick={() => navigate("/projects")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Back to Projects
            </button>
          </div>
          <p className="mt-2 text-gray-500">
            Provide your feedback for the completed project.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white shadow-md">
          {/* Project Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Project Information
            </h2>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Title</p>
                  <p className="text-gray-800">{project?.overview?.title || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Type</p>
                  <p className="text-gray-800">{project?.overview?.type || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-800">{project?.overview?.description || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          {existingReview ? (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Your Review
              </h2>
              
              {/* Rating Display */}
              <div className="mb-6">
                <p className="block text-sm font-medium mb-2 text-gray-700">
                  Your Rating
                </p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-8 h-8 ${star <= review.rating ? "text-yellow-500" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {review.rating} out of 5
                  </span>
                </div>
              </div>

              {/* Comment Display */}
              <div className="mb-6">
                <p className="block text-sm font-medium mb-2 text-gray-700">
                  Your Comments
                </p>
                <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                  {review.comment}
                </div>
              </div>
              
              {/* Submitted Date */}
              {existingReview.createdAt && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    Submitted on: {new Date(existingReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {/* Back Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/projects")}
                  className="px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Back to Projects
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Your Review
              </h2>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star })}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= review.rating ? "text-yellow-500" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {review.rating} out of 5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium mb-2 text-gray-700">
                  Review Comments
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="5"
                  value={review.comment}
                  onChange={handleInputChange}
                  placeholder="Share your experience with this project..."
                  className="w-full px-3 py-2 border rounded-lg bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-3 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

ProjectReviewPage.propTypes = {};