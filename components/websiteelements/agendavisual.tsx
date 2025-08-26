import React from 'react';

/**
 * Agendavisual - visual-only calendar used for marketing/homepage demo.
 * Self-contained and styled to match the app's calendar card look.
 */
const Agendavisual: React.FC = () => {
  // sample month and events (static for the visual)
  const monthLabel = new Date(2025, 8, 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }); // september 2025
  const todayFixed = new Date('2025-07-20T12:00:00Z');

  const year = 2025;
  const month = 8; // September (0-based index)
  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfGrid = new Date(firstOfMonth);
  firstDayOfGrid.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const days = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(firstDayOfGrid);
    d.setDate(firstDayOfGrid.getDate() + i);
    return {
      date: d,
      dateStr: formatDateToString(d),
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month
    };
  });

  // Demo events keyed by YYYY-MM-DD string
  const eventsByDate: Record<string, { paymentAmount: number; isPaid?: boolean }[]> = {
    '2025-09-08': [{ paymentAmount: 128, isPaid: true }],
    '2025-09-15': [{ paymentAmount: 300, isPaid: false }],
    '2025-09-18': [{ paymentAmount: 35, isPaid: false }],
    '2025-09-30': [{ paymentAmount: 128, isPaid: false }]
  };

  function formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const formatCurrency = (n: number, options?: Intl.NumberFormatOptions) => {
    const defaultOptions = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    return `€${n.toLocaleString('nl-NL', options || defaultOptions)}`;
  };

  return (
  <div className="w-full sm:max-w-lg aspect-square transform transition-all duration-300 ease-in-out rounded-neumorphic-lg p-3 sm:p-4 bg-white/40 border border-light-shadow-light/20 shadow-xl flex flex-col min-h-0" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <button className="p-2 rounded-full text-light-text-secondary hover:bg-black/5 dark:text-dark-text-secondary dark:hover:bg-white/5"> 
          <span className="material-symbols-rounded text-xl sm:text-2xl text-brand-accent">chevron_left</span>
        </button>
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{monthLabel}</h3>
        </div>
        <button className="p-2 rounded-full text-light-text-secondary hover:bg-black/5 dark:text-dark-text-secondary dark:hover:bg-white/5">
          <span className="material-symbols-rounded text-xl sm:text-2xl text-brand-accent">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 sm:mb-2">
        {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
          <div key={day} className="flex items-center justify-center aspect-square">{day}</div>
        ))}
      </div>

  <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-grow min-h-0">
        {days.map(({ date, dateStr, day, isCurrentMonth }) => {
          const eventsOnDay = eventsByDate[dateStr] || [];
          const isToday = dateStr === '2025-07-20';
          const hasEvents = eventsOnDay.length > 0;
          const totalAmount = hasEvents ? eventsOnDay.reduce((sum, e) => sum + e.paymentAmount, 0) : 0;

          const dayStatus = (() => {
            if (!hasEvents) return 'default';
            const dateOfEvents = new Date(dateStr.replace(/-/g, '/'));
            const isOverdue = dateOfEvents < todayFixed && eventsOnDay.some(e => !e.isPaid);
            if (isOverdue) return 'overdue';
            const isAllPaid = eventsOnDay.every(e => e.isPaid);
            if (isAllPaid) return 'paid';
            return 'upcoming';
          })();

          let dayClasses = `
            w-full h-full flex flex-col items-center justify-center p-0.5 
            rounded-lg text-xs font-light transition-all duration-200 relative
            focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:z-10
            ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
          `;
          
          let contentColor = '';
          let isStrikethrough = false;

          switch (dayStatus) {
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
            default:
              if (isToday) {
                dayClasses += ' bg-brand-accent/10 dark:bg-brand-accent/20 ring-1 ring-brand-accent/50';
                contentColor = 'text-brand-accent dark:text-dark-text-primary';
              } else {
                dayClasses += ' bg-transparent';
                contentColor = isCurrentMonth 
                  ? 'text-light-text-primary dark:text-dark-text-primary'
                  : 'text-light-text-secondary/60 dark:text-dark-text-secondary/60';
              }
          }

          if (isToday && hasEvents) {
            dayClasses += ' ring-2 ring-white/70 ring-offset-2 ring-offset-current';
          }

          return (
            <div
              key={dateStr}
              className={`aspect-square ${dayClasses}`}
              role={hasEvents ? "button" : undefined}
              tabIndex={hasEvents ? 0 : -1}
            >
              {hasEvents && totalAmount > 0 ? (
                <span className={`font-medium text-sm leading-tight text-center truncate px-0.5 ${contentColor} ${isStrikethrough ? 'line-through' : ''}`}>
                  {formatCurrency(totalAmount)}
                </span>
              ) : (
                <span className={`font-medium text-sm ${contentColor}`}>
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Agendavisual;
