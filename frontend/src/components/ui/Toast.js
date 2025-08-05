import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, XIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';

export const Toast = ({ 
  message, 
  title,
  description,
  type = 'success', // success, error, info
  duration = 5000, // milliseconds
  onClose,
  darkMode = false,
  position = 'top-right' // top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Match animation duration
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);
  
  // Determine animation class based on position
  const getAnimationClass = () => {
    if (isExiting) {
      return 'animate-fade-out-up';
    }
    
    if (position.includes('right')) {
      return 'animate-slide-in-right';
    } else if (position.includes('left')) {
      return 'animate-slide-in-left';
    } else {
      return 'animate-fade-in-down';
    }
  };

  // handleClose is now defined above with useCallback

  if (!isVisible) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4'
  };

  // Icon and color based on type
  const typeConfig = {
    success: {
      icon: <CheckCircleIcon size={20} />,
      bgClass: darkMode ? 'bg-green-800' : 'bg-green-100',
      textClass: darkMode ? 'text-green-200' : 'text-green-800',
      iconClass: darkMode ? 'text-green-200' : 'text-green-500'
    },
    error: {
      icon: <AlertCircleIcon size={20} />,
      bgClass: darkMode ? 'bg-red-800' : 'bg-red-100',
      textClass: darkMode ? 'text-red-200' : 'text-red-800',
      iconClass: darkMode ? 'text-red-200' : 'text-red-500'
    },
    info: {
      icon: <InfoIcon size={20} />,
      bgClass: darkMode ? 'bg-blue-800' : 'bg-blue-100',
      textClass: darkMode ? 'text-blue-200' : 'text-blue-800',
      iconClass: darkMode ? 'text-blue-200' : 'text-blue-500'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${getAnimationClass()}`}>
      <div className={`${config.bgClass} rounded-lg shadow-xl p-4 max-w-md flex items-start space-x-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`${config.iconClass} mt-0.5 flex-shrink-0`}>
          {config.icon}
        </div>
        <div className={`flex-1 ${config.textClass}`}>
          {title && <p className="text-sm font-bold mb-0.5">{title}</p>}
          <p className="text-sm">{message || description}</p>
        </div>
        <button 
          onClick={handleClose}
          className={`${config.iconClass} hover:opacity-75 transition-opacity flex-shrink-0 -mt-1 -mr-1`}
          aria-label="Close notification"
        >
          <XIcon size={16} />
        </button>
      </div>
    </div>
  );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts = [], darkMode = false }) => {
  if (!toasts.length) return null;
  
  return (
    <div className="fixed top-0 right-0 p-4 z-50 space-y-4">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} darkMode={darkMode} />
      ))}
    </div>
  );
};

// Toast Context for global management
export const createToastContext = () => {
  const ToastContext = React.createContext(null);

  const ToastProvider = ({ children, darkMode = false }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
      const id = Date.now();
      // Limit the number of toasts to 5 to prevent overwhelming the UI
      setToasts(prev => {
        const newToasts = [...prev, { ...toast, id }];
        return newToasts.slice(-5); // Keep only the 5 most recent toasts
      });
      return id;
    };

    const removeToast = (id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
      <ToastContext.Provider value={{ addToast, removeToast }}>
        {children}
        <div className="fixed top-0 right-0 p-4 z-50 space-y-4 max-w-md w-full pointer-events-none">
          {toasts.map((toast, index) => (
            <div 
              key={toast.id} 
              className="transform transition-all duration-300 ease-in-out pointer-events-auto"
              style={{
                zIndex: 9999 - index, // Ensure newer toasts appear on top
                opacity: 1 - (index * 0.1) // Slight opacity decrease for older toasts
              }}
            >
              <Toast 
                {...toast} 
                darkMode={darkMode}
                onClose={() => removeToast(toast.id)}
                position="top-right"
                duration={toast.duration || 5000}
              />
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    );
  };

  const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
  };

  return { ToastProvider, useToast };
};

// Create and export the context
const { ToastProvider, useToast } = createToastContext();
export { ToastProvider, useToast };