import React from 'react';
import { CodeIcon } from 'lucide-react';

export const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Links',
      links: [
        { name: 'About', href: '#about' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Support', href: '#' }
      ]
    }
  ];
  
  return (
    <footer className={`w-full py-8 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <CodeIcon size={28} className={`mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Client<span className="text-indigo-600">Manager</span>
              </span>
            </div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              A platform for managing client projects efficiently.
            </p>
          </div>
          
          {/* Footer links */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {currentYear} ClientManager
          </p>
        </div>
      </div>
    </footer>
  );
};