import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ClientVerdictActions = ({ project, onVerdictChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (verdict) => {
        onVerdictChange(project._id, verdict);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
            >
                Action Required ▼
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                    <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); handleAction('confirmed'); }} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Accept Offer
                    </a>
                    <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); handleAction('rejected'); }} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Reject Offer
                    </a>
                    <Link 
                        to={`/projects/edit/${project._id}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Re-Counter
                    </Link>
                </div>
            )}
        </div>
    );
};