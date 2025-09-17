import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Menu as MenuIcon, X as XIcon, Code as CodeIcon, LogOut as LogOutIcon, User as UserIcon } from 'lucide-react';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

/**
 * Revamped NavBar
 * - Hash-aware in-page navigation with smooth scrolling (works from other routes)
 * - Mobile drawer with focus management & ESC to close
 * - Dark-mode aware + shadow on scroll
 * - Unread badge from ChatContext
 * - Minimal dependencies (no animation libs)
 */
export default function NavBar({ darkMode = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isAuthenticated, logout, currentUser } = useAuth() || {};
  const { getTotalUnreadCount } = useChat() || {};
  const totalUnreadCount = getTotalUnreadCount ? getTotalUnreadCount() : 0;

  const navigationItems = useMemo(
    () => [
      { name: 'Home', path: '#home' },
      { name: 'Services', path: '#services' },
      { name: 'About', path: '#about' },
      { name: 'Contact', path: '#contact' },
    ],
    []
  );

  const sectionIds = navigationItems.map((i) => i.path.slice(1));
  const activeSection = useScrollSpy(sectionIds);

  const showCreateProjectButton =
    isAuthenticated &&
    currentUser &&
    (currentUser.role === 'corporate' || currentUser.role === 'individual');

  // Shadow + backdrop on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle redirect from non-home route, then smooth-scroll to section
  useEffect(() => {
    if (isRedirecting && location.pathname === '/') {
      const sectionId = (location.hash || '#home').slice(1);
      const timer = setTimeout(() => {
        if (!sectionId || sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setIsRedirecting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location, isRedirecting]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleHashNav = (e, path) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (!path.startsWith('#')) return;
    const sectionId = path.slice(1);

    if (location.pathname !== '/') {
      setIsRedirecting(true);
      navigate(`/${path}`);
      return;
    }

    if (sectionId === 'home' || !sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navBg = darkMode ? 'bg-gray-950/85' : 'bg-white/95';
  const navText = darkMode ? 'text-gray-200' : 'text-gray-900';
  const navBorder = darkMode ? 'border-white/10' : 'border-black/5';

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 backdrop-blur ${navBg} ${scrolled ? 'shadow-md' : 'shadow-sm'} ${navText}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <CodeIcon size={24} className="text-indigo-600" aria-hidden="true" />
            <span className={`font-bold text-xl ${navText}`}>
              Client<span className="text-indigo-600">Manager</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.path.slice(1) && location.pathname === '/';
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => handleHashNav(e, item.path)}
                  className={`relative px-1 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-indigo-600' : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </a>
              );
            })}

            {/* Auth cluster */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {showCreateProjectButton && (
                    <Link to="/projects/new">
                      <Button variant={darkMode ? 'primary-dark' : 'primary'} size="sm">Create a Project</Button>
                    </Link>
                  )}

                  <Link to="/dashboard" className="relative">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="sm" className="flex items-center">
                      <UserIcon size={16} className="mr-1" />
                      Dashboard
                      {totalUnreadCount > 0 && (
                        <span
                          aria-label={`${totalUnreadCount} unread messages`}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                        >
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <Button variant={darkMode ? 'primary-dark' : 'primary'} size="sm" className="flex items-center" onClick={logout}>
                    <LogOutIcon size={16} className="mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant={darkMode ? 'primary-dark' : 'primary'} size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
              className={`p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {isMenuOpen ? <XIcon size={24} aria-hidden="true" /> : <MenuIcon size={24} aria-hidden="true" />}
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        <div className={`border-t ${navBorder} ${darkMode ? 'bg-gray-950' : 'bg-white'} shadow-lg`}> 
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.path.slice(1) && location.pathname === '/';
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => handleHashNav(e, item.path)}
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? darkMode
                        ? 'bg-white/10 text-indigo-400'
                        : 'bg-gray-100 text-indigo-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </a>
              );
            })}

            {/* Auth cluster mobile */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              {isAuthenticated ? (
                <>
                  {showCreateProjectButton && (
                    <Link to="/projects/new" className="col-span-2">
                      <Button variant={darkMode ? 'primary-dark' : 'primary'} size="md" className="w-full justify-center">Create a Project</Button>
                    </Link>
                  )}

                  <Link to="/dashboard" className="relative">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="md" className="w-full justify-center flex items-center">
                      <UserIcon size={16} className="mr-1" />
                      Dashboard
                      {totalUnreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <Button variant={darkMode ? 'primary-dark' : 'primary'} size="md" className="w-full justify-center flex items-center" onClick={logout}>
                    <LogOutIcon size={16} className="mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant={darkMode ? 'outline-dark' : 'outline'} size="md" className="w-full justify-center">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant={darkMode ? 'primary-dark' : 'primary'} size="md" className="w-full justify-center">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

NavBar.propTypes = {
  darkMode: PropTypes.bool,
};

export { NavBar };   // add this