import React from 'react';
import { useState, useMemo } from 'react';
import GlassCard from './GlassCard';
import Button from './Button';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { formatDate } from '@/utils/helpers';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
  max?: string;
  min?: string;
  startView?: 'days' | 'months' | 'years';
}

const dateToYyyyMmDd = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, onClose, max, min, startView = 'days' }) => {
  const initialDate = useMemo(() => {
    if (value) {
        const d = new Date(value.replace(/-/g, '/'));
        if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [value]);

  const [displayDate, setDisplayDate] = useState(initialDate);
  const [view, setView] = useState<'days' | 'months' | 'years'>(startView);

  const selectedDateObj = useMemo(() => {
      if (!value) return null;
      const d = new Date(value.replace(/-/g, '/'));
      return isNaN(d.getTime()) ? null : d;
  }, [value]);
  
  const minDate = useMemo(() => {
      if (!min) return null;
      const d = new Date(min.replace(/-/g, '/'));
      d.setHours(0, 0, 0, 0); // Set to start of day to include the min date
      return isNaN(d.getTime()) ? null : d;
  }, [min]);

  const maxDate = useMemo(() => {
      if (!max) return null;
      const d = new Date(max.replace(/-/g, '/'));
      d.setHours(23, 59, 59, 999); // Set to end of day to include the max date
      return isNaN(d.getTime()) ? null : d;
  }, [max]);

  const yearGridStart = useMemo(() => {
    return Math.floor(displayDate.getFullYear() / 12) * 12; // A grid of 12 years for a 3x4 layout
  }, [displayDate]);

  const handlePrev = () => {
    if (view === 'days') {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (view === 'months') {
        setDisplayDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
    } else { // years
        setDisplayDate(prev => new Date(prev.getFullYear() - 12, prev.getMonth(), 1));
    }
  };

  const handleNext = () => {
    if (view === 'days') {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (view === 'months') {
        setDisplayDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
    } else { // years
        setDisplayDate(prev => new Date(prev.getFullYear() + 12, prev.getMonth(), 1));
    }
  };
  
  const handleSetToday = () => {
    const today = new Date();
    onChange(dateToYyyyMmDd(today));
    onClose();
  }

  const handleClear = () => {
      onChange('');
      onClose();
  }

  const handleDayClick = (date: Date) => {
    onChange(dateToYyyyMmDd(date));
    onClose();
  };

  const today = new Date();
  const todayDateString = dateToYyyyMmDd(today);

  const renderDays = () => {
    const firstOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const firstDayOfGrid = new Date(firstOfMonth);
    firstDayOfGrid.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const day = new Date(firstDayOfGrid);
        day.setDate(firstDayOfGrid.getDate() + i);
        days.push(day);
    }

    return (
        <div className="flex-grow flex flex-col">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
                <div key={day} className="flex items-center justify-center aspect-square">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-grow">
                {days.map((date, index) => {
                  const isOfCurrentMonth = date.getMonth() === displayDate.getMonth();
                  const dateStr = dateToYyyyMmDd(date);
                  const isToday = dateStr === todayDateString;
                  const isSelected = value === dateStr;
                  
                  const tempDate = new Date(date);
                  tempDate.setHours(12,0,0,0);
                  const isDisabled = (maxDate && tempDate > maxDate) || (minDate && tempDate < minDate);

                  let dayClasses = `
                    w-full h-full flex items-center justify-center
                    rounded-neumorphic text-sm font-light transition-all duration-200
                    border border-transparent aspect-square
                  `;

                  if (isDisabled) {
                      dayClasses += ' text-light-text-secondary/30 dark:text-dark-text-secondary/30 cursor-not-allowed';
                  } else {
                      dayClasses += ' cursor-pointer';
                      if (isOfCurrentMonth) {
                        dayClasses += ' text-light-text-primary dark:text-dark-text-primary';
                      } else {
                        dayClasses += ' text-light-text-secondary/50 dark:text-dark-text-secondary/50';
                      }

                      if (isSelected) {
                        dayClasses += ' bg-brand-accent text-white font-bold';
                      } else {
                         if (isToday) {
                            dayClasses += ' border-brand-accent/50';
                         }
                         dayClasses += ' hover:bg-black/5 dark:hover:bg-white/5';
                      }
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => !isDisabled && handleDayClick(date)}
                      className={dayClasses}
                      aria-label={!isDisabled ? `Selecteer ${formatDate(date, { day: 'numeric', month: 'long', year: 'numeric'})}` : undefined}
                      aria-disabled={isDisabled ? true : undefined}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
            </div>
        </div>
    );
  };

  const renderMonths = () => {
    const months = Array.from({ length: 12 }).map((_, i) => ({
      name: new Date(displayDate.getFullYear(), i, 1).toLocaleDateString('nl-NL', { month: 'short' }),
      monthIndex: i,
    }));
    return (
        <div className="grid grid-cols-3 grid-rows-4 gap-2 flex-grow py-2">
            {months.map(({ name, monthIndex }) => {
                const isSelected = selectedDateObj && selectedDateObj.getFullYear() === displayDate.getFullYear() && selectedDateObj.getMonth() === monthIndex;
                return (
                    <Button
                        key={name}
                        size="lg"
                        variant={isSelected ? 'secondary' : 'ghost'}
                        className="capitalize h-full text-sm"
                        onClick={() => {
                            const newDate = new Date(displayDate);
                            newDate.setMonth(monthIndex);
                            setDisplayDate(newDate);
                            setView('days');
                        }}
                    >
                        {name.replace('.','')}
                    </Button>
                );
            })}
        </div>
    );
  };
  
  const renderYears = () => {
    const years = Array.from({ length: 12 }).map((_, i) => yearGridStart + i);
    return (
        <div className="grid grid-cols-3 grid-rows-4 gap-2 flex-grow py-2">
            {years.map(year => {
                const isSelected = selectedDateObj && selectedDateObj.getFullYear() === year;
                return (
                    <Button
                        key={year}
                        size="lg"
                        variant={isSelected ? 'secondary' : 'ghost'}
                        className="h-full text-sm"
                        onClick={() => {
                            const newDate = new Date(displayDate);
                            newDate.setFullYear(year);
                            setDisplayDate(newDate);
                            setView('months');
                        }}
                    >
                        {year}
                    </Button>
                );
            })}
        </div>
    );
  };

  const getHeader = () => {
    switch(view) {
        case 'days':
            return (
                <button type="button" onClick={() => setView('months')} className="hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-md transition-colors">
                    {displayDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                </button>
            );
        case 'months':
            return (
                <button type="button" onClick={() => setView('years')} className="hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-md transition-colors">
                    {displayDate.getFullYear()}
                </button>
            );
        case 'years':
            return <span>{`${yearGridStart} - ${yearGridStart + 11}`}</span>
    }
  };

  return (
    <GlassCard 
      className="!p-3 sm:!p-4 w-[90vw] max-w-[340px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={handlePrev} aria-label="Vorige" className="!p-1.5 !rounded-full !shadow-none hover:bg-white/10 dark:hover:bg-black/10">
          <ChevronLeftIcon className="text-xl" />
        </Button>
        <div className="text-center font-bold text-sm text-light-text-primary dark:text-dark-text-primary">
            {getHeader()}
        </div>
        <Button variant="ghost" onClick={handleNext} aria-label="Volgende" className="!p-1.5 !rounded-full !shadow-none hover:bg-white/10 dark:hover:bg-black/10">
          <ChevronRightIcon className="text-xl" />
        </Button>
      </div>

      <div className="flex flex-col flex-grow min-h-[280px]">
          {view === 'days' && renderDays()}
          {view === 'months' && renderMonths()}
          {view === 'years' && renderYears()}
      </div>

      <div className="flex justify-between mt-auto pt-3 border-t border-light-shadow-light/20 dark:border-dark-shadow-dark/20">
        <Button size="sm" variant="ghost" className="!shadow-none text-xs" onClick={handleClear}>Wissen</Button>
  <Button size="sm" variant="ghost" className="!shadow-none text-xs" onClick={handleSetToday} disabled={Boolean((maxDate && today > maxDate) || (minDate && today < minDate))}>Vandaag</Button>
      </div>
    </GlassCard>
  );
};

export default DatePicker;