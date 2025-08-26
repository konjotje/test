import React from 'react';

interface SpinnerProps {
  size?: string;
  color?: string;
  className?: string;  // Added className prop
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'h-6 w-6', 
  color = 'border-brand-accent',
  className = '' 
}) => {
  return (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color} ${className}`}></div>
  );
};

export default Spinner;