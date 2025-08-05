import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MailIcon, LockIcon, AlertCircleIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
export const LoginPage = ({
  darkMode
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  
  // Get returnUrl from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isAdmin: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('LoginPage - Already authenticated, redirecting to:', returnUrl);
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setLoginError('');
      
      try {
        await login(formData.email, formData.password, formData.isAdmin);
        addToast({
          title: 'Login Successful',
          description: 'You have been successfully logged in.',
          type: 'success',
        });
        // Redirect to the return URL or dashboard
        console.log('LoginPage - Login successful, redirecting to:', returnUrl);
        navigate(returnUrl);
      } catch (error) {
        console.error('Login error:', error);
        setLoginError(
          error.response?.data?.message || 
          'Login failed. Please check your credentials and try again.'
        );
        addToast({
          title: 'Login Failed',
          description: error.response?.data?.message || 'Please check your credentials and try again.',
          type: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return <div className={`w-full min-h-screen pt-24 pb-16 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md mx-auto">
        <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sign In
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Sign in to your account to continue
              </p>
              <div className="mt-4 flex items-center justify-center">
                <label className={`inline-flex items-center cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                  />
                  <span className="ml-2">Login as Admin</span>
                </label>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <MailIcon size={18} />
                  </div>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`block w-full pl-10 pr-3 py-2 border rounded-md ${errors.email ? 'form-input-error' : darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="your@email.com" />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <Link to="/forgot-password" className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <LockIcon size={18} />
                  </div>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={`block w-full pl-10 pr-3 py-2 border rounded-md ${errors.password ? 'form-input-error' : darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="••••••••" />
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>
              {loginError && (
                <div className={`p-3 rounded-md flex items-center space-x-2 ${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'}`}>
                  <AlertCircleIcon size={18} className="flex-shrink-0" />
                  <p className="text-sm">{loginError}</p>
                </div>
              )}
              <div className="pt-2">
                <Button variant={darkMode ? 'primary-dark' : 'primary'} size="lg" className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Don't have an account?{' '}
                <Link to="/register" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};