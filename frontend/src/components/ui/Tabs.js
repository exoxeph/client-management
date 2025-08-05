import React from 'react';

export const Tabs = ({ tabs, activeTab, onTabChange, darkMode }) => {
  return (
    <div className="mb-6">
      <div className="flex border-b space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
              ? darkMode
                ? 'border-indigo-400 text-indigo-400'
                : 'border-indigo-600 text-indigo-600'
              : darkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};