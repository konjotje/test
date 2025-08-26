
import React from 'react';
import { IconProps } from './Icons'; 

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  icon?: React.ReactElement<IconProps>; 
  labelClassName?: string; // Added labelClassName
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, error, className, containerClassName, icon, labelClassName, ...props }, ref) => {
  const baseInputClasses = `
    block w-full px-3 py-2.5 
    bg-light-surface/70 dark:bg-dark-surface/70
    rounded-neumorphic 
    text-sm font-light text-light-text-primary dark:text-dark-text-primary
    placeholder-light-text-secondary dark:placeholder-dark-text-secondary
    border border-light-shadow-dark/20 dark:border-dark-shadow-light/20
    focus:outline-none focus:ring-2 focus:ring-brand-accent
    transition-all duration-200 ease-in-out
    disabled:opacity-60 disabled:cursor-not-allowed
    ${icon ? 'pl-10' : ''}
  `;
  
  const typeSpecificStyles = (props.type === 'date' || props.type === 'time' || props.type === 'datetime-local') 
    ? 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden' 
    : '';


  return (
    <div className={`mb-4 ${containerClassName || ''}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ${labelClassName || ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.isValidElement(icon) && React.cloneElement(icon, { 
              className: `text-lg ${icon.props.className || ''}`.trim()
            })}
          </div>
        )}
        <input 
            ref={ref}
            id={id} 
            className={`${baseInputClasses} ${typeSpecificStyles} ${className || ''}`} 
            {...props} 
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-light text-light-danger dark:text-dark-danger">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";


interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string; // Added labelClassName
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, className, containerClassName, labelClassName, ...props }) => {
  const baseInputClasses = `
    block w-full px-3 py-2.5 
    bg-light-surface/70 dark:bg-dark-surface/70 
    rounded-neumorphic 
    text-sm font-light text-light-text-primary dark:text-dark-text-primary
    placeholder-light-text-secondary dark:placeholder-dark-text-secondary
    border border-light-shadow-dark/20 dark:border-dark-shadow-light/20
    focus:outline-none focus:ring-2 focus:ring-brand-accent
    transition-all duration-200 ease-in-out
    resize-none 
  `;
 return (
    <div className={`mb-4 ${containerClassName || ''}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ${labelClassName || ''}`}>
          {label}
        </label>
      )}
      <textarea id={id} className={`${baseInputClasses} ${className || ''}`} {...props} />
      {error && <p className="mt-1.5 text-xs font-light text-light-danger dark:text-dark-danger">{error}</p>}
    </div>
  );
};


export default Input;