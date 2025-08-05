import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    // Light mode variants
    'primary': 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    'secondary': 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    'outline': 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    'ghost': 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    'danger': 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    'success': 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    
    // Dark mode variants
    'primary-dark': 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-400',
    'secondary-dark': 'bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-400',
    'outline-dark': 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-indigo-400',
    'ghost-dark': 'bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-400',
    'danger-dark': 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-400',
    'success-dark': 'bg-green-600 text-white hover:bg-green-500 focus:ring-green-400',
  };
  
  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabled ? disabledClasses : '',
    className
  ].join(' ');
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};