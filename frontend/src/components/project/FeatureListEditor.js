import React, { useState } from "react";
import PropTypes from "prop-types";
/**
 * Feature list editor component
 * @param {Object} props - Component props
 * @param {Array} props.features - List of features
 * @param {Function} props.onChange - Callback when features change
 * @param {string} props.error - Error message
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 */
export const FeatureListEditor = ({
  features = [],
  onChange,
  error = "",
  darkMode = false
}) => {
  const [newFeature, setNewFeature] = useState("");
  const handleAddFeature = () => {
    if (newFeature.trim() !== "") {
      const updatedFeatures = [...features, newFeature.trim()];
      onChange(updatedFeatures);
      setNewFeature("");
    }
  };
  const handleRemoveFeature = index => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    onChange(updatedFeatures);
  };
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };
  return <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={handleKeyDown} placeholder="Add a new feature..." className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
        </div>
        <button type="button" onClick={handleAddFeature} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
          Add
        </button>
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400 mt-1">
          {error}
        </p>}
      <div className={`mt-3 p-4 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
        {features.length === 0 ? <p className={`text-sm italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            No features added yet. Add features to describe what your project needs to accomplish.
          </p> : <ul className="space-y-2">
            {features.map((feature, index) => <li key={index} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
                  {feature}
                </span>
                <button type="button" onClick={() => handleRemoveFeature(index)} className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600`}>
                  <svg className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>)}
          </ul>}
      </div>
    </div>;
};
FeatureListEditor.propTypes = {
  features: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  darkMode: PropTypes.bool
};
export default FeatureListEditor;