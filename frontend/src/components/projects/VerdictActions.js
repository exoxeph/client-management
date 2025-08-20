import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Helper function to determine badge color
const getVerdictBadgeClasses = (verdict, darkMode = false) => {
    switch (verdict) {
      case 'pending':
        return darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800";
      case 'confirmed':
        return darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800";
      case 'rejected':
        return darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800";
      case 'none':
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
    }
};


export const VerdictActions = ({ project, onVerdictChange, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (verdict) => {
        onVerdictChange(project._id, verdict); 
        setIsOpen(false);
    };

    // The logic to decide when to show the actions dropdown:
    // Only show it if the verdict is 'pending' AND it's the admin's turn to act.
    if (project.verdict !== 'pending' || (project.status !== 'submitted' && project.status !== 'client-counter')) {
        // --- THIS IS THE NEW PART ---
        // If no action is required, display the verdict as a styled text badge.
        const verdict = project.verdict || 'none';
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getVerdictBadgeClasses(verdict, darkMode)}`}>
                {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
            </span>
        );
    }

    // If an action IS required, render the dropdown button.
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-1.5 text-xs font-medium bg-gray-200 rounded-md hover:bg-gray-300">
                Actions ▼
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleAction('confirmed'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Accept</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleAction('rejected'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Reject</a>
                    <Link to={`/projects/edit/${project._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Counter</Link>
                </div>
            )}
        </div>
    );
};