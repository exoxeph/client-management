import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { ProjectStatusSummary } from "../components/projects/ProjectStatusSummary";

import { ProjectsTable } from "../components/projects/ProjectsTable";
import { projectsService } from "../services/projects.service";

export const ProjectsPage = ({ darkMode = false }) => {
  // --- All hooks must be inside the component function ---
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [summary, setSummary] = useState({ /* initial summary state */ });
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeVerdictFilter, setActiveVerdictFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // --- All functions must also be inside the component ---

  // Master function to fetch all data, wrapped in useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const projectsResponse = await projectsService.getProjects();
      setProjects(projectsResponse.items);
    } catch (error) {
      console.error("Error fetching projects:", error);
      addToast({ type: 'error', title: 'Error', message: 'Could not load project data.' });
    } finally {
      setLoading(false);
    }
  }, [addToast]); // Add addToast as a dependency


    useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      fetchData();
    }
  }, [isAuthenticated, isAuthLoading, fetchData]); // Dependencies ensure it runs when auth is ready

  
  // --- NEW EFFECT TO CALCULATE SUMMARY COUNTS CLIENT-SIDE ---
  useEffect(() => {
    const newSummary = projects.reduce((acc, project) => {
      // Increment total
      acc.total += 1;

      // Increment status counts
      if (project.status === 'submitted' || project.status === 'under_review') {
        acc.status.pending += 1;
      } else if (project.status === 'approved') { // Assuming 'approved' is the confirmed status
        acc.status.confirmed += 1;
      } else if (project.status === 'rejected') {
        acc.status.rejected += 1;
      }
      
      // Increment verdict counts
      if (project.verdict) {
        acc.verdict[project.verdict] = (acc.verdict[project.verdict] || 0) + 1;
      }

      return acc;
    }, {
      total: 0,
      status: { pending: 0, confirmed: 0, rejected: 0 },
      verdict: { none: 0, pending: 0, confirmed: 0, rejected: 0 }
    });

    setSummary(newSummary);
  }, [projects]); // This runs whenever the main project list is updated

  // useEffect for client-side filtering
   useEffect(() => {
    let result = [...projects];

    // Status filter (mostly for clients)
    if (activeFilter !== "all") {
      if (activeFilter === 'pending') {
        result = result.filter(p => p.status === 'submitted' || p.status === 'under_review');
      } else if (activeFilter === 'confirmed') {
        result = result.filter(p => p.status === 'approved');
      } else if (activeFilter === 'rejected') {
        result = result.filter(p => p.status === 'rejected');
      }
    }

    // Verdict filter (mostly for admins)
    if (activeVerdictFilter !== "all") {
      result = result.filter(p => p.verdict === activeVerdictFilter);
    }

    // Search filter (for everyone)
    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(project => (project.overview?.title || '').toLowerCase().includes(search));
    }
    
    setFilteredProjects(result);
  }, [activeFilter, activeVerdictFilter, searchTerm, projects]);

  // Handler functions for filters
  const handleFilterChange = (filter) => setActiveFilter(filter);
  const handleVerdictFilterChange = (verdict) => setActiveVerdictFilter(verdict);
  const handleSearchChange = (term) => setSearchTerm(term);

  // Master handler for updating verdicts
  const handleVerdictChange = async (projectId, verdict) => {
    try {
      setLoading(true);
      await projectsService.updateProject(projectId, { verdict });
      addToast({ type: 'success', title: 'Verdict Updated', message: `Project has been successfully ${verdict}.` });
      await fetchData(); // Refresh all data
    } catch (error) {
      console.error("Failed to update verdict:", error);
      addToast({ type: 'error', title: 'Update Failed', message: 'There was a problem updating the verdict.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Render logic ---

  if (isAuthLoading) {
    return <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const canCreateProject = currentUser.role === 'corporate' || currentUser.role === 'individual';

  return (
    <DashboardLayout darkMode={darkMode}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Projects</h1>
          {canCreateProject && (
            <Link to="/projects/new" className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
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
          currentUser={currentUser}
        />

        {/* --- ADD THIS NEW SEARCH BAR SECTION --- */}
        <div className="mt-4">
          <input 
            type="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects by title..."
            className={`w-full max-w-xs px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
          />
        </div>
        {/* --- END OF NEW SECTION --- */}

        <div className="mt-6"> {/* Added a wrapper div for margin */}
          <ProjectsTable 
            projects={filteredProjects} 
            darkMode={darkMode}
            currentUser={currentUser}
            onVerdictChange={handleVerdictChange}
            isLoading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

ProjectsPage.propTypes = {
  darkMode: PropTypes.bool
};

export default ProjectsPage;