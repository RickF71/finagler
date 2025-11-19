import React from 'react';

/**
 * Alert component - info/warning/error messages
 */
export const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-50 text-blue-900 border-blue-200',
    destructive: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '' }) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};

export default Alert;
