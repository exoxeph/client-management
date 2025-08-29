import React from 'react';
import PropTypes from 'prop-types';

// A small, local component for the requirement tables to reduce repetition
const RequirementsTable = ({ title, requirements, columns }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
    <div className="mt-2 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requirements?.map((req) => (
            <tr key={req.id}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700 align-top">
                  {req[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

RequirementsTable.propTypes = {
  title: PropTypes.string.isRequired,
  requirements: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    header: PropTypes.string
  })).isRequired
};

export const RequirementsDisplay = ({ requirements }) => {
  if (!requirements || !requirements.summary) {
    return <p>No requirements data to display.</p>;
  }

  const feColumns = [
    { key: 'id', header: 'ID' },
    { key: 'component', header: 'Component' },
    { key: 'task', header: 'Task' },
    { key: 'acceptanceCriteria', header: 'Acceptance Criteria' },
    { key: 'priority', header: 'Priority' },
  ];

  const beColumns = [
    { key: 'id', header: 'ID' },
    { key: 'service', header: 'Service' },
    { key: 'task', header: 'Task' },
    { key: 'acceptanceCriteria', header: 'Acceptance Criteria' },
    { key: 'priority', header: 'Priority' },
  ];
  
  const nfrColumns = [
    { key: 'id', header: 'ID' },
    { key: 'category', header: 'Category' },
    { key: 'requirement', header: 'Requirement' },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Summary</h3>
        <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded-md italic">
          {requirements.summary}
        </p>
      </div>

      {/* User Stories Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">User Stories</h3>
        <ul className="mt-2 list-disc pl-5 space-y-3 text-gray-700">
          {requirements.userStories?.map((story, index) => (
            <li key={index}>
              <strong className="font-semibold">As a</strong> {story.asA}, 
              <strong className="font-semibold"> I want to</strong> {story.iWantTo}, 
              <strong className="font-semibold"> so that</strong> {story.soThat}.
            </li>
          ))}
        </ul>
      </div>
      
      {/* Functional Requirements Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Functional Requirements</h3>
        <RequirementsTable 
          title="Frontend" 
          requirements={requirements.functionalRequirements?.frontend} 
          columns={feColumns}
        />
        <RequirementsTable 
          title="Backend" 
          requirements={requirements.functionalRequirements?.backend} 
          columns={beColumns}
        />
      </div>

      {/* Non-Functional Requirements Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Non-Functional Requirements</h3>
        <RequirementsTable 
          title=""
          requirements={requirements.nonFunctionalRequirements} 
          columns={nfrColumns}
        />
      </div>

      {/* Suggested Technologies Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Suggested Technologies</h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">Frontend</h4>
                <p className="text-sm text-gray-600">{requirements.suggestedTechnologies?.frontend?.join(', ')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">Backend</h4>
                <p className="text-sm text-gray-600">{requirements.suggestedTechnologies?.backend?.join(', ')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">Deployment</h4>
                <p className="text-sm text-gray-600">{requirements.suggestedTechnologies?.deployment?.join(', ')}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

RequirementsDisplay.propTypes = {
  requirements: PropTypes.object
};