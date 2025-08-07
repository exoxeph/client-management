import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { ProjectStatusSummary } from "../components/projects/ProjectStatusSummary";
import { ProjectFilters } from "../components/projects/ProjectFilters";
import { ProjectsTable } from "../components/projects/ProjectsTable";
import { projectsService } from "../services/projects.service";
/**
 * Projects page component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const ProjectsPage = ({
  darkMode = false
}) => {
  const {
    currentUser,
    isAuthenticated,
    isLoading
  } = useAuth();
  // Get URL parameters for filtering - moved to the top to avoid ReferenceError
  const [urlParams, setUrlParams] = useState(new URLSearchParams(window.location.search));
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    draft: 0,
    verdict: {
      none: 0,
      pending: 0,
      confirmed: 0,
      rejected: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeVerdictFilter, setActiveVerdictFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch projects and summary - only when URL params change, not searchTerm
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const isFromAdminDashboard = urlParams.get('admin') === 'true';
        const urlVerdict = urlParams.get('verdict');
        const urlSearchTerm = urlParams.get('q');

        console.log('Fetching data with params:', { isFromAdminDashboard, urlVerdict, urlSearchTerm });

        // If URL has a search term, update our local state
        if (urlSearchTerm) {
          setSearchTerm(urlSearchTerm);
        }

        const [projectsData, summaryData] = await Promise.all([
          // Only pass URL search term to API, not local searchTerm
          projectsService.getAllProjects(isFromAdminDashboard, urlVerdict, urlSearchTerm),
          projectsService.getProjectsSummary(isFromAdminDashboard)
        ]);
        console.log('Fetched projects:', projectsData);

        setProjects(projectsData);
        setFilteredProjects(projectsData);
        setSummary(summaryData);
        
        // If URL has verdict parameter, update the active verdict filter
        if (urlVerdict) {
          setActiveVerdictFilter(urlVerdict);
        } else {
          setActiveVerdictFilter('all');
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, urlParams]); // Removed searchTerm dependency
  

  // Update URL params when location changes
  useEffect(() => {
    // Create a function to handle location changes
    const handleLocationChange = () => {
      setUrlParams(new URLSearchParams(window.location.search));
    };
    
    // Add event listener for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    // Initial call to set params
    handleLocationChange();
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
  
  // Filter projects based on active filter, verdict filter, and search term - rebuilt from scratch
  useEffect(() => {
    // Check URL parameters for admin=true and verdict
    const isFromAdminDashboard = urlParams.get('admin') === 'true';
    const urlVerdict = urlParams.get('verdict');

    // If URL has verdict parameter, use it instead of the active verdict filter
    // This ensures URL parameters take precedence over UI state
    if (urlVerdict && isFromAdminDashboard) {
      console.log('Using verdict from URL:', urlVerdict);
      setActiveVerdictFilter(urlVerdict);
    } else if (isFromAdminDashboard && !urlVerdict) {
      // If admin view but no verdict parameter, ensure we're showing 'all'
      setActiveVerdictFilter('all');
    }
    
    console.log('--------- Filtering Projects ---------');
    console.log('Total projects:', projects.length);
    console.log('Active filter:', activeFilter);
    console.log('Active verdict filter:', activeVerdictFilter);
    console.log('Search term:', searchTerm);
    console.log('Is admin dashboard view:', isFromAdminDashboard);
    
    // Start with a copy of all projects
    let result = [...projects];
    
    // Apply status filter
    if (activeFilter !== "all") {
      result = result.filter(project => {
        // Handle undefined status with a fallback to 'draft'
        const status = project.status || 'draft';
        return status === activeFilter;
      });
      console.log('After status filtering:', result.length, 'projects');
    }
    
    // Apply verdict filter
    if (activeVerdictFilter !== "all") {
      console.log('Filtering by verdict:', activeVerdictFilter);
      
      result = result.filter(project => {
        // Handle undefined verdict with a fallback to 'none'
        const verdict = project.verdict || 'none';
        return verdict === activeVerdictFilter;
      });
      
      console.log('After verdict filtering:', result.length, 'projects');
    }
    
    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(project => {
        // Safely access nested properties with fallbacks
        const title = (project.overview?.title || project.title || '').toLowerCase();
        const description = (project.overview?.description || project.description || '').toLowerCase();
        const type = (project.overview?.type || project.type || '').toLowerCase();
        const projectId = (project.projectId || project._id || '').toString().toLowerCase();
        
        // Check if any of the fields contain the search term
        return title.includes(search) || 
               description.includes(search) || 
               type.includes(search) || 
               projectId.includes(search);
      });
      console.log('After search filtering:', result.length, 'projects');
    }
    
    console.log('Final filtered projects:', result.length);
    setFilteredProjects(result);
  }, [activeFilter, activeVerdictFilter, searchTerm, projects, urlParams]);
  // Handle status filter change
  const handleFilterChange = filter => {
    setActiveFilter(filter);
  };
  // Handle verdict filter change
  const handleVerdictFilterChange = verdict => {
    // For admin users, update URL when changing verdict filters
    if (currentUser && currentUser.role === 'admin') {
      const newUrl = new URL(window.location);
      
      if (verdict === 'all') {
        // If selecting 'All', remove the verdict parameter
        newUrl.searchParams.delete('verdict');
        setActiveVerdictFilter('all');
      } else if (verdict === 'pending') {
        // If selecting 'Pending', set the verdict parameter to pending
        newUrl.searchParams.set('verdict', 'pending');
        setActiveVerdictFilter('pending');
      }
      
      // Update the URL without reloading the page
      window.history.pushState({}, '', newUrl);
      // Update the URL params state
      setUrlParams(new URLSearchParams(newUrl.search));
    } else if (currentUser && (currentUser.role === 'individual' || currentUser.role === 'corporate')) {
      // For individual and corporate users, directly set the filter to the selected verdict
      // This creates a simple filter that just shows the selected verdict type
      setActiveVerdictFilter(verdict);
    } else {
      // For other users, maintain the toggle behavior
      setActiveVerdictFilter(prevFilter => prevFilter === verdict ? 'all' : verdict);
    }
  };
  // Handle search change - client-side filtering only
  const handleSearchChange = term => {
    console.log('Search term changed:', term);
    
    // Only update the search term state - no URL changes
    setSearchTerm(term);
    
    // No URL manipulation or API calls - filtering happens in the useEffect
  };
  
  
  // Removed automatic setting of verdict filter to 'pending' for admin users
  // as per user request
  
  // Show loading state
  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>;
  }
  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user can create projects
  const canCreateProject = currentUser.role === 'corporate' || currentUser.role === 'individual';

  return <DashboardLayout darkMode={darkMode}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Projects
          </h1>
          {canCreateProject && (
            <Link to="/projects/new" className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
              Create a Project
            </Link>
          )}
        </div>
        {loading ? <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div> : <>
            <ProjectStatusSummary 
              summary={summary} 
              darkMode={darkMode} 
              onFilterChange={handleFilterChange} 
              onVerdictFilterChange={handleVerdictFilterChange}
              activeFilter={activeFilter} 
              activeVerdictFilter={activeVerdictFilter}
            />
            <ProjectFilters 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
              searchTerm={searchTerm} 
              onSearchChange={handleSearchChange} 
              darkMode={darkMode} 
              activeVerdictFilter={activeVerdictFilter}
              onVerdictFilterChange={handleVerdictFilterChange}
            />
            <ProjectsTable 
              projects={filteredProjects} 
              darkMode={darkMode} 
              onVerdictUpdate={(projectId, verdict) => {
                // Refresh projects and summary after verdict update
                const fetchData = async () => {
                  try {
                    setLoading(true);
                    const isFromAdminDashboard = urlParams.get('admin') === 'true';
                    const urlVerdict = urlParams.get('verdict');

                    console.log('Refreshing data after verdict update:', { isFromAdminDashboard, urlVerdict });

                    const [projectsData, summaryData] = await Promise.all([
                      projectsService.getAllProjects(isFromAdminDashboard),
                      projectsService.getProjectsSummary(isFromAdminDashboard)
                    ]);
                    
                    setProjects(projectsData);
                    setFilteredProjects(projectsData);
                    setSummary(summaryData);
                  } catch (error) {
                    console.error("Error refreshing projects after verdict update:", error);
                  } finally {
                    setLoading(false);
                  }
                };
                fetchData();
              }}
            />
          </>}
      </div>
    </DashboardLayout>;
};
ProjectsPage.propTypes = {
  darkMode: PropTypes.bool
};
export default ProjectsPage;