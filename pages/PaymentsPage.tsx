import React, { useMemo, useState } from 'react';
import { Debt, UpcomingPaymentItem } from '@/types';
import Button from '@/components/ui/Button';
import { InformationCircleIcon, CheckCircleIcon, WarningIcon, CalendarDaysIcon } from '@/components/ui/Icons';
import { formatCurrency, generateScheduledPaymentsForDebt, getOverduePayments } from '@/utils/helpers';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import PaymentDetails from '@/components/ui/PaymentDetails';

// De PaymentCard wordt teruggezet naar de correcte versie die de uitlijning fixt.
const PaymentCard: React.FC<{
    item: UpcomingPaymentItem;
    isHistory: boolean;
    isOverdue?: boolean;
    onLogPayment: (item: UpcomingPaymentItem) => void;
    onShowDetails: (item: UpcomingPaymentItem) => void;
}> = ({ item, isHistory, isOverdue = false, onLogPayment, onShowDetails }) => {
    const dayOfMonth = parseInt(item.dueDate.split('-')[2], 10);
    
    let dateBlockColor = 'bg-brand-accent';
    if (isHistory) {
        // De kleur voor de geschiedenisitems
        dateBlockColor = 'bg-slate-300 dark:bg-slate-600';
    } else if (isOverdue) {
        dateBlockColor = 'bg-light-danger dark:bg-dark-danger';
    }

    const handleLogPaymentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLogPayment(item);
    };

    const glowClass = isOverdue ? 'animate-glowing-pulse-red' : '';

    return (
        <GlassCard 
            onClick={() => onShowDetails(item)}
            interactive={true}
            className={`!p-0 flex overflow-hidden transition-all duration-300 ${isHistory ? 'opacity-70' : 'hover:shadow-xl dark:hover:shadow-2xl'} ${glowClass}`}
            pressed={isHistory}
        >
            <div className={`flex-shrink-0 w-16 flex flex-col items-center justify-center text-white p-2 text-center ${dateBlockColor}`}>
                <span className="text-2xl font-bold leading-none">{dayOfMonth}</span>
            </div>
            
            <div className="grid grid-cols-[1fr_40px] items-center gap-3 p-3 flex-grow">
                {/* Kolom 1: Tekst (flexibel en wordt afgekapt) */}
                <div className="min-w-0">
                    <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary truncate">{item.debtCreditorName}</h4>
                    <p className={`text-lg font-bold ${isHistory ? 'text-light-text-secondary dark:text-dark-text-secondary' : isOverdue ? 'text-light-danger dark:text-dark-danger' : 'text-brand-accent'}`}>{formatCurrency(item.paymentAmount)}</p>
                </div>

                {/* Kolom 2: Knop (vaste breedte van 40px voor uitlijning) */}
                <div className="w-10 h-10 flex items-center justify-center">
                    {!isHistory && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-10 w-10 !p-0 flex items-center justify-center" 
                            onClick={handleLogPaymentClick}
                            aria-label={`Markeer betaling voor ${item.debtCreditorName} als betaald`}
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

interface PaymentsPageProps {
  debts: Debt[];
  logScheduledPayment: (paymentItem: UpcomingPaymentItem) => Promise<void>;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ debts, logScheduledPayment }) => {
  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    items: UpcomingPaymentItem[];
    selectedItem: UpcomingPaymentItem | null;
  }>({ isOpen: false, items: [], selectedItem: null });

  const handleShowDetails = (item: UpcomingPaymentItem) => {
    setPaymentModalState({
      isOpen: true,
      items: [item], // Pass as a single-item array
      selectedItem: item,
    });
  };

  const allPayments = useMemo(() => {
    return debts
        .flatMap(debt => generateScheduledPaymentsForDebt(debt));
  }, [debts]);

  const overduePayments = useMemo(() => getOverduePayments(debts), [debts]);

  const upcomingPayments = useMemo(() => {
    const today = new Date('2025-07-20T12:00:00Z');
    return allPayments.filter(p => !p.isPaid && new Date(p.dueDate.replace(/-/g, '/')) >= today);
  }, [allPayments]);

  const paymentHistory = useMemo(() => {
    return allPayments.filter(p => p.isPaid);
  }, [allPayments]);
  
  const groupPaymentsByMonth = (payments: UpcomingPaymentItem[]) => {
    const grouped = new Map<string, UpcomingPaymentItem[]>();
    payments.forEach(p => {
        const monthKey = p.dueDate.substring(0, 7); // YYYY-MM
        if (!grouped.has(monthKey)) {
            grouped.set(monthKey, []);
        }
        grouped.get(monthKey)!.push(p);
    });
    return Array.from(grouped.entries());
  };

  const overduePaymentsByMonth = useMemo(() => {
    return groupPaymentsByMonth(overduePayments).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  }, [overduePayments]);

  const upcomingPaymentsByMonth = useMemo(() => {
    return groupPaymentsByMonth(upcomingPayments).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  }, [upcomingPayments]);

  const paymentHistoryByMonth = useMemo(() => {
    return groupPaymentsByMonth(paymentHistory).sort(([keyA], [keyB]) => keyB.localeCompare(keyA));
  }, [paymentHistory]);


  return (
    <>
      <div className="space-y-6 sm:space-y-8 font-light">
        <PageHeader
          title="Betalingen"
          description="Keur je betalingen goed en houd je geschiedenis bij."
        />
        
        {/* Openstaande Betalingen */}
        {overduePaymentsByMonth.length > 0 && (
            <section aria-labelledby="overdue-payments-heading">
              <h2 id="overdue-payments-heading" className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                  Openstaande Betalingen
              </h2>
              <div className="space-y-4 sm:space-y-6">
                  {overduePaymentsByMonth.map(([monthKey, paymentsInMonth]) => {
                      const monthDate = new Date(`${monthKey}-02T00:00:00Z`);
                      const monthName = monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
                      const monthTotal = paymentsInMonth.reduce((sum, p) => sum + p.paymentAmount, 0);
                      
                      const handleApproveMonth = () => {
                          paymentsInMonth.forEach(p => logScheduledPayment(p));
                      };

                      return (
                          <GlassCard key={monthKey} className="!p-4">
                              <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-4 min-w-0">
                                      <CalendarDaysIcon className="text-5xl text-brand-accent flex-shrink-0" />
                                      <div className="min-w-0">
                                          <h3 className="font-bold text-xl text-light-text-primary dark:text-dark-text-primary capitalize truncate">{monthName}</h3>
                                          <p className="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">Totaal: {formatCurrency(monthTotal)}</p>
                                      </div>
                                  </div>
                                  {/* ======================= HIER IS DE FIX VOOR DE MAAND-KNOP ======================= */}
                                  <Button 
                                      size="sm" 
                                      variant="secondary"
                                      className="flex-shrink-0 ml-2"
                                      onClick={handleApproveMonth} 
                                      aria-label={`Markeer alle betalingen voor ${monthName} als afbetaald`}
                                  >
                                      <CheckCircleIcon className="mr-1.5" />
                                      Afbetaald
                                  </Button>
                              </div>
                              <div className="mt-3 pt-3 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20 space-y-3">
                                  {paymentsInMonth
                                    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                    .map(item => (
                                      <PaymentCard 
                                          key={item.dueDate + item.debtId} 
                                          item={item}
                                          isHistory={false}
                                          isOverdue={true}
                                          onLogPayment={logScheduledPayment} 
                                          onShowDetails={handleShowDetails}
                                      />
                                    ))}
                              </div>
                          </GlassCard>
                      );
                  })}
              </div>
            </section>
        )}

        {/* Aankomende Betalingen & Geschiedenis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          <section aria-labelledby="upcoming-payments-heading">
              <h2 id="upcoming-payments-heading" className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Aankomende Betalingen</h2>
              {upcomingPayments.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                      {upcomingPaymentsByMonth.map(([monthKey, paymentsInMonth]) => {
                          const monthDate = new Date(`${monthKey}-02T00:00:00Z`);
                          const monthName = monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
                          const monthTotal = paymentsInMonth.reduce((sum, p) => sum + p.paymentAmount, 0);

                          const handleApproveMonth = () => {
                              paymentsInMonth.forEach(p => logScheduledPayment(p));
                          };

                          return (
                              <GlassCard key={monthKey} className="!p-4">
                                  <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-4 min-w-0">
                                          <CalendarDaysIcon className="text-5xl text-brand-accent flex-shrink-0" />
                                          <div className="min-w-0">
                                              <h3 className="font-bold text-xl text-light-text-primary dark:text-dark-text-primary capitalize truncate">{monthName}</h3>
                                              <p className="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">Totaal: {formatCurrency(monthTotal)}</p>
                                          </div>
                                      </div>
                                      {/* ======================= HIER IS DE FIX VOOR DE MAAND-KNOP ======================= */}
                                      <Button 
                                          size="sm" 
                                          variant="secondary"
                                          className="flex-shrink-0 ml-2"
                                          onClick={handleApproveMonth} 
                                          aria-label={`Markeer alle betalingen voor ${monthName} als afbetaald`}
                                      >
                                          <CheckCircleIcon className="mr-1.5" />
                                          Afbetaald
                                      </Button>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20 space-y-3">
                                      {paymentsInMonth
                                        .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                        .map(item => (
                                          <PaymentCard 
                                              key={item.dueDate + item.debtId} 
                                              item={item}
                                              isHistory={false}
                                              onLogPayment={logScheduledPayment}
                                              onShowDetails={handleShowDetails}
                                          />
                                        ))}
                                  </div>
                              </GlassCard>
                          )
                      })}
                  </div>
              ) : (
                  <GlassCard className="text-center py-10 sm:py-12">
                      <CheckCircleIcon className="text-3xl sm:text-4xl mx-auto text-light-success dark:text-dark-success opacity-80 mb-2" />
                      <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base font-light">
                          Geen aankomende betalingen.
                      </p>
                      <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 font-light">
                          Alle geplande betalingen zijn goedgekeurd!
                      </p>
                  </GlassCard>
              )}
          </section>

          <section aria-labelledby="payment-history-heading">
              <h2 id="payment-history-heading" className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Betalingsgeschiedenis</h2>
              {paymentHistory.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6">
                          {paymentHistoryByMonth.map(([monthKey, paymentsInMonth]) => {
                              const monthDate = new Date(`${monthKey}-02T00:00:00Z`);
                              const monthName = monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
                              const monthTotal = paymentsInMonth.reduce((sum, p) => sum + p.paymentAmount, 0);

                               return (
                                      <GlassCard key={monthKey} className="!p-4">
                                          <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-4 min-w-0">
                                                  <CalendarDaysIcon className="text-5xl text-light-success dark:text-dark-success opacity-80 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                      <h3 className="font-bold text-xl text-light-text-primary dark:text-dark-text-primary capitalize truncate">{monthName}</h3>
                                                      <p className="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">Totaal Betaald: {formatCurrency(monthTotal)}</p>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="mt-3 pt-3 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20 space-y-3">
                                              {paymentsInMonth
                                                .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                                .map(item => (
                                                  <PaymentCard 
                                                      key={item.dueDate + item.debtId} 
                                                      item={item}
                                                      isHistory={true}
                                                      onLogPayment={() => {}} 
                                                      onShowDetails={handleShowDetails}
                                                  />
                                                ))}
                                          </div>
                                      </GlassCard>
                               )
                          })}
                      </div>
              ) : (
                  <GlassCard className="text-center py-10 sm:py-12">
                      <InformationCircleIcon className="text-3xl sm:text-4xl mx-auto text-brand-accent opacity-70 mb-2" />
                      <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base font-light">
                          Geen betalingen in de geschiedenis.
                      </p>
                       <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 font-light">
                          Keur een betaling goed om deze hier te zien.
                       </p>
                  </GlassCard>
              )}
          </section>
        </div>
      </div>
      <PaymentDetails
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState({ isOpen: false, items: [], selectedItem: null })}
        items={paymentModalState.items}
        selectedItem={paymentModalState.selectedItem}
        allDebts={debts}
      />
    </>
  );
};