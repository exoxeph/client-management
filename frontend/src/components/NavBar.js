import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { MenuIcon, XIcon, CodeIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useAuth } from '../context/AuthContext'
export const NavBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { isAuthenticated, logout, currentUser } = useAuth()
  const navigationItems = [
    { name: 'Home', path: '#home' },
    { name: 'Services', path: '#services' },
    { name: 'About', path: '#about' },
    { name: 'Contact', path: '#contact' },
  ]
  const sectionIds = navigationItems.map(item => item.path.replace('#', ''))
  const activeSection = useScrollSpy(sectionIds)

  // Check if user should see the Create Project button
  const showCreateProjectButton = isAuthenticated && currentUser && (currentUser.role === 'corporate' || currentUser.role === 'individual')

  // Effect to handle section scrolling after navigation from other pages
  useEffect(() => {
    if (isRedirecting && location.pathname === '/') {
      const sectionId = location.hash.replace('#', '')
      // Small delay to ensure the DOM is fully loaded
      const timer = setTimeout(() => {
        if (sectionId === 'home' || !sectionId) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        } else {
          const section = document.getElementById(sectionId)
          if (section) {
            section.scrollIntoView({
              behavior: 'smooth',
            })
          }
        }
        setIsRedirecting(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [location, isRedirecting])
  const handleLinkClick = (e, path) => {
    e.preventDefault()
    setIsMenuOpen(false)
    // Only handle section scrolling for paths with hash
    if (path.startsWith('#')) {
      const sectionId = path.replace('#', '')
      // If we're not on the home page, navigate there first
      if (location.pathname !== '/') {
        setIsRedirecting(true)
        navigate(`/${path}`)
      } else {
        // If home is clicked, scroll to top of the page
        if (sectionId === 'home') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        } else {
          // For other sections, scroll to the section
          const section = document.getElementById(sectionId)
          if (section) {
            section.scrollIntoView({
              behavior: 'smooth',
            })
          }
        }
      }
    }
  }
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center"
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }
            }}
          >
            <CodeIcon
              size={28}
              className="mr-2 text-indigo-600"
            />
            <span
              className="font-bold text-xl text-gray-900"
            >
              Client<span className="text-indigo-600">Manager</span>
            </span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`px-1 py-2 text-sm font-medium transition-colors duration-200 relative ${
                  activeSection === item.path.replace('#', '') && location.pathname === '/'
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
                {activeSection === item.path.replace('#', '') && location.pathname === '/' && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full transform transition-transform duration-300"
                  ></span>
                )}
              </a>
            ))}
            <div className="flex space-x-3">
              {isAuthenticated ? (
                <>
                  {showCreateProjectButton && (
                    <Link to="/projects/new">
                      <Button
                        variant="primary"
                        size="sm"
                      >
                        Create a Project
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <UserIcon size={16} className="mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center"
                    onClick={logout}
                  >
                    <LogOutIcon size={16} className="mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      variant="primary"
                      size="sm"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div
        className={`md:hidden transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } absolute top-16 left-0 right-0 bg-white shadow-lg z-30`}
        style={{
          height: isMenuOpen ? 'auto' : 0,
          overflow: 'hidden',
        }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={(e) => handleLinkClick(e, item.path)}
              className={`block px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                activeSection === item.path.replace('#', '') && location.pathname === '/'
                  ? 'bg-gray-100 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.name}
            </a>
          ))}
          <div className="pt-2 pb-1 grid grid-cols-2 gap-2">
            {isAuthenticated ? (
              <>
                {showCreateProjectButton && (
                  <Link to="/projects/new" className="col-span-2">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                    >
                      Create a Project
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center flex items-center"
                  >
                    <UserIcon size={16} className="mr-1" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center flex items-center"
                  onClick={logout}
                >
                  <LogOutIcon size={16} className="mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center"
                >
                  Login
                </Button>
                </Link>
                <Link to="/register">
                  <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                >
                  Register
                </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}