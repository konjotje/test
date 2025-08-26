

import React, { useState, useRef, useEffect, useMemo } from 'react';
import GlassCard from './GlassCard';
import { ChevronDownIcon, IconProps } from './Icons';
import Input from './Input';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  containerClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactElement<IconProps>;
  isSearchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecteer een optie',
  id,
  name,
  containerClassName = '',
  labelClassName = '',
  disabled = false,
  required = false,
  icon,
  isSearchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => options.find(option => option.value === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchTerm) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, isSearchable]);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      setSearchTerm('');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, isSearchable]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${containerClassName}`} ref={selectRef}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ${labelClassName}`}>
          {label}
        </label>
      )}
      <input type="hidden" name={name} value={value} required={required} />
      
      <GlassCard
        as="button"
        type="button"
        id={id}
        pressed
        interactive={!disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full !p-0 flex items-center justify-between text-left ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center flex-grow min-w-0">
            {icon && (
              <span className="pl-3 flex items-center shrink-0">
                {React.cloneElement(icon, { className: 'text-lg text-brand-accent' })}
              </span>
            )}
            <span className={`py-2.5 text-sm font-light text-light-text-primary dark:text-dark-text-primary truncate ${icon ? 'pl-2 pr-3' : 'px-3'}`}>
              {selectedOption?.label || placeholder}
            </span>
        </div>
        <ChevronDownIcon 
          className={`text-xl mr-2.5 transform transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true" 
        />
      </GlassCard>

      {isOpen && (
        <GlassCard
          as="div"
          className="absolute top-full mt-1.5 w-full z-50 !p-0 flex flex-col"
        >
          {isSearchable && (
            <div className="p-1.5 border-b border-light-shadow-dark/10 dark:border-dark-shadow-light/10" onClick={(e) => e.stopPropagation()}>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Zoeken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="!mb-0"
                className="!py-2"
                autoComplete="off"
              />
            </div>
          )}
          <ul
            role="listbox"
            aria-activedescendant={selectedOption ? `option-${selectedOption.value}` : undefined}
            className="max-h-60 overflow-y-auto p-1.5"
          >
            {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                    <li
                    key={option.value}
                    id={`option-${option.value}`}
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => handleSelect(option.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelect(option.value);
                        }
                    }}
                    className={`
                        px-3 py-2 text-sm font-light rounded-neumorphic cursor-pointer 
                        transition-colors duration-150 ease-in-out
                        focus:outline-none focus:bg-brand-accent/20
                        ${value === option.value
                        ? 'bg-brand-accent text-white font-medium'
                        : 'text-light-text-primary dark:text-dark-text-primary hover:bg-brand-accent/10 dark:hover:bg-brand-accent/20'
                        }
                    `}
                    tabIndex={0}
                    >
                    {option.label}
                    </li>
                ))
            ) : (
                <li className="px-3 py-2 text-sm text-center text-light-text-secondary dark:text-dark-text-secondary">
                    Geen resultaten
                </li>
            )}
          </ul>
        </GlassCard>
      )}
    </div>
  );
};

export default Select;