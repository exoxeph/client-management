import React from 'react';
import { Card } from './ui/Card';
import { UsersIcon, DatabaseIcon, BarChartIcon, MessageSquareIcon, ClipboardCheckIcon, BellIcon } from 'lucide-react';
export const ServicesSection = ({
  darkMode
}) => {
  const services = [{
    title: 'Client Management',
    description: 'Organize and manage all your client information in one centralized location.',
    icon: <UsersIcon className={`h-10 w-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />,
    accent: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'
  }, {
    title: 'Project Tracking',
    description: 'Monitor project progress, deadlines, and deliverables for each client.',
    icon: <ClipboardCheckIcon className={`h-10 w-10 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />,
    accent: darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
  }, {
    title: 'Document Storage',
    description: 'Securely store and share important client documents and files.',
    icon: <DatabaseIcon className={`h-10 w-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
    accent: darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
  }, {
    title: 'Analytics Dashboard',
    description: 'Gain insights into client relationships and business performance.',
    icon: <BarChartIcon className={`h-10 w-10 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />,
    accent: darkMode ? 'bg-teal-900/30' : 'bg-teal-100'
  }, {
    title: 'Communication Tools',
    description: 'Streamline client communication with integrated messaging and email.',
    icon: <MessageSquareIcon className={`h-10 w-10 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />,
    accent: darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
  }, {
    title: 'Notification System',
    description: 'Stay on top of important deadlines and client-related events.',
    icon: <BellIcon className={`h-10 w-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />,
    accent: darkMode ? 'bg-red-900/30' : 'bg-red-100'
  }];
  return <section id="services" className={`w-full py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Services
          </h2>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive tools to help you manage your clients and grow your business
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => <Card key={index} className={`group transition-all duration-300 hover:-translate-y-2 ${darkMode ? 'bg-gray-700 border-gray-600 hover:border-indigo-500 hover:shadow-indigo-500/10 hover:shadow-lg' : 'bg-white hover:shadow-xl hover:shadow-blue-100'}`}>
              <div className="p-6">
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${service.accent}`}>
                  {service.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 group-hover:${darkMode ? 'text-indigo-300' : 'text-indigo-600'} transition-colors`}>
                  {service.title}
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {service.description}
                </p>
              </div>
            </Card>)}
        </div>
      </div>
    </section>;
};