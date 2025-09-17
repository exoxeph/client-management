import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import {
  ArrowRightIcon,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HeroSection = memo(function HeroSection({ darkMode = false }) {
  const { isAuthenticated } = useAuth() || {};

  const baseBg = darkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900';
  const gradientBg = darkMode
    ? 'bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),rgba(0,0,0,0))]'
    : 'bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.12),rgba(255,255,255,0))]';

  return (
    <section
      id="home"
      aria-label="Hero: Client Management Platform"
      className={`relative w-full overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${baseBg}`}
      data-testid="hero-section"
    >
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${gradientBg}`} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Simplify Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-fuchsia-500">
                Client Management
              </span>
            </h1>

            <p className={`text-lg md:text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              An all-in-one workspace to organize clients, projects, and communications—
              with zero setup friction.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" aria-label="Create your account">
                    <Button variant={darkMode ? 'primary-dark' : 'primary'} size="lg" className="group">
                      Get Started
                      <ArrowRightIcon size={18} className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Button>
                  </Link>

                  <Link to="/login" aria-label="Sign in to your account">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" aria-label="Go to dashboard">
                    <Button variant={darkMode ? 'primary-dark' : 'primary'} size="lg" className="group">
                      Go to Dashboard
                      <LayoutDashboard size={18} className="ml-2 opacity-90" aria-hidden="true" />
                    </Button>
                  </Link>

                  {/* Changed button */}
                  <Link to="/projects" aria-label="Go to projects">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="lg" className="group">
                      Go to Projects
                      <LayoutDashboard size={18} className="ml-2 opacity-90" aria-hidden="true" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Value props */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3" role="list">
              <FeaturePill icon={ShieldCheck} label="ISO-grade security" dark={darkMode} />
              <FeaturePill icon={MessageSquare} label="Unified comms" dark={darkMode} />
              <FeaturePill icon={LayoutDashboard} label="Projects & CRM in one" dark={darkMode} />
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex-1"
          >
            <div className={`relative w-full rounded-2xl shadow-2xl ring-1 ${darkMode ? 'ring-white/10 bg-gray-900' : 'ring-black/5 bg-white'}`}>
              <div className={`flex items-center gap-2 px-4 py-2 border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`} aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs opacity-60">client-dashboard.jsx</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
                alt="Preview of the Client Management dashboard UI"
                loading="lazy"
                className="w-full h-auto rounded-b-2xl"
              />

              <div className="absolute -bottom-6 -right-6 hidden md:block">
                <div className={`rounded-xl shadow-xl p-4 backdrop-blur ${darkMode ? 'bg-white/5 ring-white/10' : 'bg-white/70 ring-black/5'} ring-1`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New client message</p>
                      <p className="text-xs opacity-70">“Can we move kickoff to Tuesday?”</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

HeroSection.propTypes = {
  darkMode: PropTypes.bool,
};

function FeaturePill({ icon: Icon, label, dark }) {
  return (
    <div
      role="listitem"
      className={`flex items-center justify-center sm:justify-start gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ${
        dark ? 'bg-white/5 text-gray-200 ring-white/10' : 'bg-gray-50 text-gray-700 ring-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

FeaturePill.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  dark: PropTypes.bool,
};

export default HeroSection;
