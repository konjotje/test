import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Input from './Input';
import DatePicker from './DatePicker';
import { IconProps } from './Icons';

interface DatePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max'> {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string;
  containerClassName?: string;
  icon?: React.ReactElement<IconProps>;
  labelClassName?: string;
  min?: string;
  max?: string;
  startView?: 'days' | 'months' | 'years';
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  id,
  icon,
  containerClassName,
  labelClassName,
  error,
  min,
  max,
  startView,
  placeholder,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDateChange = (date: string) => {
    onChange(date);
    setIsOpen(false);
  }

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return '';
    }
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const datePickerPortal = isOpen ? createPortal(
    <div 
      className="fixed inset-0 z-[110] bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)} // Click on backdrop closes
      role="dialog"
      aria-modal="true"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <DatePicker value={value} onChange={handleDateChange} onClose={() => setIsOpen(false)} min={min} max={max} startView={startView} />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`${containerClassName || 'mb-4'}`} ref={containerRef}>
      <Input
        label={label}
        id={id}
        value={formatDisplayDate(value)}
        onClick={() => setIsOpen(true)}
        onFocus={() => setIsOpen(true)}
        readOnly
        icon={icon}
        containerClassName="!mb-0"
        labelClassName={labelClassName}
        autoComplete="off"
        placeholder={placeholder || 'dd-mm-jjjj'}
        {...props}
      />
      {datePickerPortal}
      {error && <p className="mt-1.5 text-xs font-light text-light-danger dark:text-dark-danger">{error}</p>}
    </div>
  );
};

export default DatePickerInput;