import React from 'react';
import { ContactForm } from './ui/ContactForm';
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from 'lucide-react';

export const ContactSection = ({ darkMode }) => {
  const contactInfo = [
    {
      icon: <MapPinIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />,
      title: 'Our Location',
      details: '123 Business Avenue, Tech District, CA 94107'
    },
    {
      icon: <PhoneIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />,
      title: 'Phone Number',
      details: '+1 (555) 123-4567'
    },
    {
      icon: <MailIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />,
      title: 'Email Address',
      details: 'contact@clientmanager.com'
    },
    {
      icon: <ClockIcon size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />,
      title: 'Working Hours',
      details: 'Monday - Friday: 9AM - 5PM'
    }
  ];

  return (
    <section id="contact" className={`w-full py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Get In Touch
          </h2>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Have questions about our services? Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 order-2 lg:order-1">
            <ContactForm darkMode={darkMode} />
          </div>
          
          <div className="flex-1 order-1 lg:order-2">
            <div className={`p-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md h-full`}>
              <h3 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Information
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-4">{item.icon}</div>
                    <div>
                      <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Follow Us
                </h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <span className="sr-only">facebook</span>
                    <FacebookIcon size={20} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <span className="sr-only">twitter</span>
                    <TwitterIcon size={20} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <span className="sr-only">instagram</span>
                    <InstagramIcon size={20} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <span className="sr-only">linkedin</span>
                    <LinkedinIcon size={20} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};