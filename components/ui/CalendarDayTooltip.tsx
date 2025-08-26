import React, { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from './GlassCard';
import { UpcomingPaymentItem } from '@/types';
import { formatCurrency } from '@/utils/helpers';

interface CalendarDayTooltipProps {
  events: UpcomingPaymentItem[];
  isVisible: boolean;
  containerRef: React.RefObject<HTMLElement>;
  hoveredDateStr: string | null;
  onEventClick: (event: UpcomingPaymentItem) => void;
}

const CalendarDayTooltip: React.FC<CalendarDayTooltipProps> = ({ events, isVisible, containerRef, hoveredDateStr, onEventClick }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
    transform: 'scale(0.95) translateY(10px)',
    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
    pointerEvents: 'none',
    zIndex: 150,
  });

  useLayoutEffect(() => {
    const reposition = () => {
      if (!isVisible || !hoveredDateStr || !containerRef.current || !tooltipRef.current) return;
      
      const targetElement = containerRef.current.querySelector(`[data-datestr="${hoveredDateStr}"]`);
      if (!targetElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let top = targetRect.top - tooltipRect.height - 10;
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      // Boundary checks
      if (top < 10) {
        top = targetRect.bottom + 10;
      }
      if (left < 10) {
        left = 10;
      }
      if (left + tooltipRect.width > windowWidth - 10) {
        left = windowWidth - tooltipRect.width - 10;
      }
      if (top + tooltipRect.height > windowHeight - 10) {
        top = windowHeight - tooltipRect.height - 10;
      }

      setStyle(prevStyle => ({
        ...prevStyle,
        left: `${left}px`,
        top: `${top}px`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }));
    };

    reposition(); // Initial positioning

    if (isVisible) {
        setStyle(prevStyle => ({ ...prevStyle, opacity: 1, transform: 'scale(1) translateY(0)' }));
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
    } else {
        setStyle(prevStyle => ({ ...prevStyle, opacity: 0, transform: 'scale(0.95) translateY(10px)' }));
    }

    return () => {
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
    };

  }, [isVisible, hoveredDateStr, containerRef, events]);

  if (events.length === 0) return null;

  return createPortal(
    <GlassCard
      ref={tooltipRef}
      className="!p-0 !rounded-neumorphic max-w-xs"
      style={style}
      transparencyLevel="high"
    >
      <div className="space-y-1">
        {events.map((event, index) => (
          <div
            key={`${event.debtId}-${event.dueDate}`}
            onClick={() => onEventClick(event)}
            className={`
              p-2 rounded-neumorphic transition-colors duration-150 cursor-pointer
              hover:bg-black/5 dark:hover:bg-white/10
              ${index > 0 ? 'border-t border-light-shadow-light/20 dark:border-dark-shadow-dark/20' : ''}
            `}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onEventClick(event)}}
          >
            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
              {event.debtCreditorName}
            </p>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Bedrag: {formatCurrency(event.paymentAmount)}
            </p>
             <p className={`text-xs font-medium ${event.isPaid ? 'text-light-success' : 'text-light-text-secondary'} dark:${event.isPaid ? 'text-dark-success' : 'text-dark-text-secondary'}`}>
              Status: {event.isPaid ? 'Betaald' : 'Openstaand'}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>,
    document.body
  );
};

export default CalendarDayTooltip;