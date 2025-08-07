import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ProjectStatusSummary } from "./ProjectStatusSummary";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectsTable } from "./ProjectsTable";
import { projectsService } from "../../services/projects.service";
/**
 * Projects panel component for dashboard
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const ProjectsPanel = ({
  darkMode = false
}) => {
  const { currentUser } = useAuth();
  // Create project permission check removed as per user request
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
    fetchData();
  }, []);
  // Filter projects based on active filter, verdict filter, and search term
  useEffect(() => {
    let result = [...projects];
    
    console.log('All projects before filtering:', projects);
    console.log('Active filter:', activeFilter);
    console.log('Active verdict filter:', activeVerdictFilter);
    
    // Debug: Check for projects with 'submitted' or 'under_review' status
    const pendingProjects = projects.filter(p => p.status === 'submitted' || p.status === 'under_review');
    console.log('Projects with submitted/under_review status:', pendingProjects);
    
    // Apply status filter
    if (activeFilter !== "all") {
      // For 'pending' filter, check for 'submitted' or 'under_review' status
      if (activeFilter === 'pending') {
        result = result.filter(project => project.status === 'submitted' || project.status === 'under_review');
      } else {
        result = result.filter(project => project.status === activeFilter);
      }
      console.log(`After status filter (${activeFilter}):`, result);
    }
    
    // Apply verdict filter
    if (activeVerdictFilter !== "all") {
      result = result.filter(project => project.verdict === activeVerdictFilter);
      console.log(`After verdict filter (${activeVerdictFilter}):`, result);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
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
      console.log(`After search filter (${searchTerm}):`, result);
    }
    
    console.log('Final filtered projects:', result);
    setFilteredProjects(result);
  }, [activeFilter, activeVerdictFilter, searchTerm, projects]);
  // Handle filter change
  const handleFilterChange = filter => {
    setActiveFilter(filter);
  };

  // Handle verdict filter change
  const handleVerdictFilterChange = verdict => {
    setActiveVerdictFilter(verdict);
  };
  // Handle search change
  const handleSearchChange = term => {
    setSearchTerm(term);
  };
  if (loading) {
    return <div className={`rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-6`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>;
  }
  return <div className={`rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-6`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full mr-4 ${darkMode ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
            <svg className={`h-7 w-7 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              My Projects
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Manage and track your project requests
            </p>
          </div>
        </div>
        {canCreateProject && (
          <Link to="/projects/new" className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            Create a Project
          </Link>
        )}
      </div>
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
      <ProjectsTable projects={filteredProjects} darkMode={darkMode} isCompact={true} limit={5} />
      <div className="mt-6 text-right">
        <Link to="/projects" className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
          View all projects
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>;
};
ProjectsPanel.propTypes = {
  darkMode: PropTypes.bool
};
export default ProjectsPanel;