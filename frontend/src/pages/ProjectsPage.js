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
  // Fetch projects and summary
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, summaryData] = await Promise.all([projectsService.getAllProjects(), projectsService.getProjectsSummary()]);
        setProjects(projectsData);
        setFilteredProjects(projectsData);
        setSummary(summaryData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading]);
  

  // Filter projects based on active filter, verdict filter, and search term
  useEffect(() => {
    let result = [...projects];
    // Apply status filter
    if (activeFilter !== "all") {
      result = result.filter(project => project.status === activeFilter);
    }
    // Apply verdict filter
    if (activeVerdictFilter !== "all") {
      // Log for debugging
      console.log('Filtering by verdict:', activeVerdictFilter);
      console.log('Projects before filtering:', result.length);
      
      result = result.filter(project => {
        // Log each project's verdict for debugging
        console.log(`Project ${project._id || project.id} verdict:`, project.verdict);
        return project.verdict === activeVerdictFilter;
      });
      
      console.log('Projects after filtering:', result.length);
    }
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      result = result.filter(project => project.title.toLowerCase().includes(search) || project.description.toLowerCase().includes(search) || project.type.toLowerCase().includes(search));
    }
    setFilteredProjects(result);
  }, [activeFilter, activeVerdictFilter, searchTerm, projects]);
  // Handle status filter change
  const handleFilterChange = filter => {
    setActiveFilter(filter);
  };
  // Handle verdict filter change
  const handleVerdictFilterChange = verdict => {
    // If the same verdict filter is clicked again, reset to 'all'
    setActiveVerdictFilter(prevFilter => prevFilter === verdict ? 'all' : verdict);
  };
  // Handle search change
  const handleSearchChange = term => {
    setSearchTerm(term);
  };
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
  // Redirect to dashboard if user is admin
  if (currentUser.role === "admin") {
    return <Navigate to="/dashboard" replace />;
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
            <ProjectsTable projects={filteredProjects} darkMode={darkMode} />
          </>}
      </div>
    </DashboardLayout>;
};
ProjectsPage.propTypes = {
  darkMode: PropTypes.bool
};
export default ProjectsPage;