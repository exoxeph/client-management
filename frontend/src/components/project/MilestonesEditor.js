import React, { useState } from "react";
import PropTypes from "prop-types";
/**
 * Milestones editor component
 * @param {Object} props - Component props
 * @param {Array} props.milestones - List of milestones
 * @param {Function} props.onChange - Callback when milestones change
 * @param {string} props.error - Error message
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const MilestonesEditor = ({
  milestones = [],
  onChange,
  error = "",
  darkMode = false
}) => {
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    deadline: "",
    payment: ""
  });
  const handleAddMilestone = () => {
    if (newMilestone.title.trim() !== "" && newMilestone.deadline) {
      const updatedMilestones = [...milestones, {
        ...newMilestone,
        id: Date.now()
      }];
      onChange(updatedMilestones);
      setNewMilestone({
        title: "",
        description: "",
        deadline: "",
        payment: ""
      });
    }
  };
  const handleRemoveMilestone = id => {
    const updatedMilestones = milestones.filter(m => m.id !== id);
    onChange(updatedMilestones);
  };
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setNewMilestone(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Add Milestone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="milestone-title" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Title
            </label>
            <input id="milestone-title" name="title" type="text" value={newMilestone.title} onChange={handleInputChange} placeholder="e.g., Design Approval" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
          </div>
          <div>
            <label htmlFor="milestone-deadline" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Deadline
            </label>
            <input id="milestone-deadline" name="deadline" type="date" value={newMilestone.deadline} onChange={handleInputChange} className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
          </div>
          <div>
            <label htmlFor="milestone-payment" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Payment (optional)
            </label>
            <input id="milestone-payment" name="payment" type="text" value={newMilestone.payment} onChange={handleInputChange} placeholder="e.g., 25% of total" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="milestone-description" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Description (optional)
            </label>
            <textarea id="milestone-description" name="description" value={newMilestone.description} onChange={handleInputChange} rows={2} placeholder="What needs to be accomplished in this milestone..." className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-indigo-500`}></textarea>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleAddMilestone} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            Add Milestone
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400 mt-1">
          {error}
        </p>}
      {milestones.length > 0 && <div className={`mt-6 rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`px-4 py-3 border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
              Project Milestones
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {milestones.map(milestone => <div key={milestone.id} className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {milestone.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-3">
                      <span className={`inline-flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(milestone.deadline).toLocaleDateString()}
                      </span>
                      {milestone.payment && <span className={`inline-flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {milestone.payment}
                        </span>}
                    </div>
                    {milestone.description && <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {milestone.description}
                      </p>}
                  </div>
                  <button type="button" onClick={() => handleRemoveMilestone(milestone.id)} className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700`}>
                    <svg className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>)}
          </div>
        </div>}
    </div>;
};
MilestonesEditor.propTypes = {
  milestones: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  darkMode: PropTypes.bool
};
export default MilestonesEditor;