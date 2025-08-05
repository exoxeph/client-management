import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};