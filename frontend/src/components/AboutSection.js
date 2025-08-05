import React from 'react';
import { Users2Icon, ShieldIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';

export const AboutSection = ({ darkMode }) => {
  return (
    <section id="about" className={`w-full py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 order-2 lg:order-1">
            <div className="max-w-2xl">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                About ClientManager
              </h2>
              <p className={`mb-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We're on a mission to simplify client management for businesses of all sizes.
              </p>
              <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Founded in 2023, ClientManager has been helping businesses of all sizes streamline their client management processes. Our platform provides a centralized hub for tracking client information, project progress, and communication.
              </p>
              <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Our mission is to simplify client management so you can focus on what matters most - growing your business and delivering exceptional service to your clients.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[{
                title: 'Client-Centric',
                description: 'We put your clients at the center of everything we do',
                icon: <Users2Icon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
              }, {
                title: 'Secure',
                description: 'Enterprise-grade security for your sensitive client data',
                icon: <ShieldIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
              }, {
                title: 'Efficient',
                description: 'Save time with our streamlined workflows',
                icon: <ClockIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
              }, {
                title: 'Reliable',
                description: '99.9% uptime and dedicated support',
                icon: <CheckCircleIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
              }].map((feature, index) => <div key={index} className="flex items-start">
                    <div className="mt-1 mr-4">{feature.icon}</div>
                    <div>
                      <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h4>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {feature.description}
                      </p>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 lg:order-2 mb-8 lg:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Team working together" 
              className="w-full h-auto rounded-lg shadow-lg" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};