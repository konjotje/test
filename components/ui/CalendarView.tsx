import React, { useState, useMemo, useRef } from 'react';
import { UpcomingPaymentItem } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';
import GlassCard from './GlassCard';
import Button from './Button';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import CalendarDayTooltip from './CalendarDayTooltip'; 

interface CalendarViewProps {
  currentMonth: Date; 
  events: UpcomingPaymentItem[];
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onGoToToday: () => void;
  onEventClick: (event: UpcomingPaymentItem) => void;
  className?: string;
}

// Helper to get YYYY-MM-DD string from a Date object, respecting local date
const dateToYyyyMmDd = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  events,
  onNextMonth,
  onPrevMonth,
  onGoToToday,
  onEventClick,
  className
}) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipTimeoutRef = useRef<number | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const calendarGridDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    
    // Find the Sunday of the first week. getDay() is 0 for Sunday.
    const firstDayOfGrid = new Date(firstOfMonth);
    firstDayOfGrid.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) { // Always render 6 weeks (42 days)
        const day = new Date(firstDayOfGrid);
        day.setDate(firstDayOfGrid.getDate() + i);
        days.push(day);
    }
    return days;
  }, [currentMonth]);
  
  // Use the same fixed date as helpers for consistent "overdue" demo state
  const todayFixed = new Date('2025-07-20T12:00:00Z');
  const todayDateString = dateToYyyyMmDd(todayFixed);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, UpcomingPaymentItem[]>();
    events.forEach(event => {
      const dateKey = event.dueDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const handleMouseEnterDay = (date: Date) => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    const dateStr = dateToYyyyMmDd(date);
    const eventsOnDay = eventsByDate.get(dateStr) || [];
    if (eventsOnDay.length > 0) {
      setHoveredDate(dateStr);
      setIsTooltipVisible(true);
    } else {
      setIsTooltipVisible(false);
      setHoveredDate(null);
    }
  };

  const handleMouseLeaveDay = () => {
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setIsTooltipVisible(false);
    }, 200); 
  };
  
  const eventsForTooltip = hoveredDate ? eventsByDate.get(hoveredDate) || [] : [];


  return (
    <GlassCard ref={calendarContainerRef} className={`flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <Button variant="ghost" onClick={onPrevMonth} aria-label="Vorige maand" className="!p-2">
          <ChevronLeftIcon className="text-xl sm:text-2xl" />
        </Button>
        <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
            </h3>
        </div>
        <Button variant="ghost" onClick={onNextMonth} aria-label="Volgende maand" className="!p-2">
          <ChevronRightIcon className="text-xl sm:text-2xl" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 sm:mb-2">
        {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
          <div key={day} className="flex items-center justify-center aspect-square">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-grow">
        {calendarGridDays.map(date => {
          const isOfCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const dateStr = dateToYyyyMmDd(date);
          const eventsOnDay = eventsByDate.get(dateStr) || [];
          const isToday = dateStr === todayDateString;
          const hasEvents = eventsOnDay.length > 0;
          const dayNumber = date.getDate();

          const dayStatus = useMemo(() => {
            if (!hasEvents) return { status: 'default' };
            const dateOfEvents = new Date(dateStr.replace(/-/g, '/'));
            const isOverdue = dateOfEvents < todayFixed && eventsOnDay.some(e => !e.isPaid);
            if (isOverdue) return { status: 'overdue' };
            const isAllPaid = eventsOnDay.every(e => e.isPaid);
            if (isAllPaid) return { status: 'paid' };
            return { status: 'upcoming' };
          }, [eventsOnDay, dateStr, hasEvents]);
          
          const totalAmountOnDay = hasEvents ? eventsOnDay.reduce((sum, e) => sum + e.paymentAmount, 0) : 0;

          let dayClasses = `
            w-full h-full flex flex-col items-center justify-center p-0.5 
            rounded-lg text-xs font-light transition-all duration-200 relative
            focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:z-10
            ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
          `;
          
          let contentColor = '';
          let isStrikethrough = false;

          switch (dayStatus.status) {
            case 'overdue':
              dayClasses += ' bg-light-danger dark:bg-dark-danger static-glow-red';
              contentColor = 'text-white';
              break;
            case 'paid':
              dayClasses += ' bg-brand-accent/30 dark:bg-brand-accent/40 opacity-80';
              contentColor = 'text-brand-accent dark:text-dark-text-primary';
              isStrikethrough = true;
              break;
            case 'upcoming':
              dayClasses += ' bg-brand-accent static-glow-blue';
              contentColor = 'text-white';
              break;
            default: // No events
              if (isToday) {
                  dayClasses += ' bg-brand-accent/10 dark:bg-brand-accent/20 ring-1 ring-brand-accent/50';
                  contentColor = 'text-brand-accent dark:text-dark-text-primary';
              } else {
                  dayClasses += ' bg-transparent';
                  if (isOfCurrentMonth) {
                      contentColor = 'text-light-text-primary dark:text-dark-text-primary';
                  } else {
                      dayClasses += ' opacity-60';
                      contentColor = 'text-light-text-secondary/60 dark:text-dark-text-secondary/60';
                  }
              }
              break;
          }
          
          if (isToday && hasEvents) {
              dayClasses += ' ring-2 ring-white/70 ring-offset-2 ring-offset-current';
          }

          return (
            <div
              key={dateStr}
              data-datestr={dateStr}
              onMouseEnter={() => handleMouseEnterDay(date)}
              onMouseLeave={handleMouseLeaveDay}
              onFocus={() => handleMouseEnterDay(date)}
              onBlur={handleMouseLeaveDay}
              onClick={hasEvents ? () => onEventClick(eventsOnDay[0]) : undefined}
              onKeyDown={hasEvents ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEventClick(eventsOnDay[0]);
                }
              } : undefined}
              role={hasEvents ? "button" : undefined}
              tabIndex={hasEvents ? 0 : -1}
              className={dayClasses}
              aria-label={`Geplande betalingen op ${formatDate(dateStr, {day: 'numeric', month: 'long'})}${hasEvents ? `, totaal ${formatCurrency(totalAmountOnDay)}` : ''}`}
            >
              {hasEvents && totalAmountOnDay > 0 ? (
                <span className={`font-medium text-sm leading-tight text-center truncate px-0.5 ${contentColor} ${isStrikethrough ? 'line-through' : ''}`}>
                    {formatCurrency(totalAmountOnDay, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              ) : (
                  <span className={`font-medium text-sm ${contentColor}`}>
                      {dayNumber}
                  </span>
              )}
            </div>
          );
        })}
      </div>
      {eventsForTooltip.length > 0 && (
        <CalendarDayTooltip
          events={eventsForTooltip}
          isVisible={isTooltipVisible}
          containerRef={calendarContainerRef as unknown as React.RefObject<HTMLElement>}
          hoveredDateStr={hoveredDate}
          onEventClick={onEventClick}
        />
      )}
    </GlassCard>
  );
};