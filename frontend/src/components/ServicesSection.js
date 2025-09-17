import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card } from './ui/Card';
import {
  Users as UsersIcon,
  Database as DatabaseIcon,
  BarChart3 as BarChartIcon,
  MessageSquare as MessageSquareIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Bell as BellIcon,
} from 'lucide-react';

const DEFAULT_SERVICES = (darkMode) => [
  {
    key: 'clients',
    title: 'Client Management',
    description: 'Organize and manage all your client information in one centralized location.',
    Icon: UsersIcon,
    accent: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100',
    iconClass: darkMode ? 'text-indigo-400' : 'text-indigo-600',
  },
  {
    key: 'projects',
    title: 'Project Tracking',
    description: 'Monitor project progress, deadlines, and deliverables for each client.',
    Icon: ClipboardCheckIcon,
    accent: darkMode ? 'bg-purple-900/30' : 'bg-purple-100',
    iconClass: darkMode ? 'text-purple-400' : 'text-purple-600',
  },
  {
    key: 'documents',
    title: 'Document Storage',
    description: 'Securely store and share important client documents and files.',
    Icon: DatabaseIcon,
    accent: darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
    iconClass: darkMode ? 'text-blue-400' : 'text-blue-600',
  },
  {
    key: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Gain insights into client relationships and business performance.',
    Icon: BarChartIcon,
    accent: darkMode ? 'bg-teal-900/30' : 'bg-teal-100',
    iconClass: darkMode ? 'text-teal-400' : 'text-teal-600',
  },
  {
    key: 'comms',
    title: 'Communication Tools',
    description: 'Streamline client communication with integrated messaging and email.',
    Icon: MessageSquareIcon,
    accent: darkMode ? 'bg-amber-900/30' : 'bg-amber-100',
    iconClass: darkMode ? 'text-amber-400' : 'text-amber-600',
  },
  {
    key: 'notifications',
    title: 'Notification System',
    description: 'Stay on top of important deadlines and client-related events.',
    Icon: BellIcon,
    accent: darkMode ? 'bg-red-900/30' : 'bg-red-100',
    iconClass: darkMode ? 'text-red-400' : 'text-red-600',
  },
];

export const ServicesSection = memo(function ServicesSection({
  darkMode = false,
  services: servicesProp,
  title = 'Our Services',
  subtitle = 'Comprehensive tools to help you manage your clients and grow your business',
}) {
  const services = useMemo(
    () =>
      (servicesProp && servicesProp.length
        ? servicesProp
        : DEFAULT_SERVICES(darkMode)),
    [servicesProp, darkMode]
  );

  return (
    <section
      id="services"
      aria-label="Services"
      className={`w-full py-20 px-4 sm:px-6 lg:px-8 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h2>
          <p className={`text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => {
            const Icon = svc.Icon || UsersIcon;
            return (
              <Card
                key={svc.key || svc.title || idx}
                className={`group transition-all duration-300 hover:-translate-y-2 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 hover:border-indigo-500 hover:shadow-indigo-500/10 hover:shadow-lg'
                    : 'bg-white hover:shadow-xl hover:shadow-blue-100'
                } reveal-up`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="p-6">
                  <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${svc.accent}`}>
                    <Icon className={`h-10 w-10 ${svc.iconClass}`} aria-hidden="true" />
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-3 transition-colors ${
                      darkMode
                        ? 'group-hover:text-indigo-300 text-white'
                        : 'group-hover:text-indigo-600 text-gray-900'
                    }`}
                  >
                    {svc.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {svc.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Light CSS reveal animation (no external libs) */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .reveal-up { opacity: 0; transform: translateY(10px); animation: svc-rise 480ms ease-out forwards; }
        }
        @keyframes svc-rise { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
});

ServicesSection.propTypes = {
  darkMode: PropTypes.bool,
  // Optional override: array of { key, title, description, Icon, accent, iconClass }
  services: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      Icon: PropTypes.elementType,
      accent: PropTypes.string,
      iconClass: PropTypes.string,
    })
  ),
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default ServicesSection;
