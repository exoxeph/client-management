import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { ArrowRightIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HeroSection = ({ darkMode }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated } = useAuth();

  return (
    <section id="home" className={`w-full pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Simplify Your <span className="text-indigo-600">Client Management</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              The all-in-one platform to manage your clients, projects, and communications efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <Button variant={darkMode ? 'primary-dark' : 'primary'} size="lg" className="group">
                      Get Started
                      <ArrowRightIcon size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex-1">
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Client Management Dashboard" className="w-full h-auto rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};