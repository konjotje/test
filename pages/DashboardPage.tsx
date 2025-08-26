
import React, { useMemo, useState } from 'react';
import { Debt, Income, Expense, User, ActivityLogItem, UpcomingPaymentItem } from '../types';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard'; 
import DebtDistributionDonutChart from '@/components/charts/DebtDistributionDonutChart'; 
import PageHeader from '@/components/ui/PageHeader';
import ProjectionChart from '@/components/charts/ProjectionChart';
import DebtStackedBarChart from '@/components/charts/DebtStackedBarChart';
import { CalendarView } from '@/components/ui/CalendarView';
import PaymentDetails from '@/components/ui/PaymentDetails';

import {
    calculateTotalPaidForDebt,
    formatCurrency,
    formatDate,
    getMonthlyAmount,
    calculateOverallDebtFreeDate,
    calculateTotalPlannedMonthlyRepayments,
    generateScheduledPaymentsForDebt,
} from '../utils/helpers';
import { CurrencyDollarIcon, CalendarDaysIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, FinishFlagIcon } from '../components/ui/Icons';


interface DashboardPageProps {
  currentUser: User | null;
  debts: Debt[];
  incomes: Income[];
  expenses: Expense[];
  activityLog: ActivityLogItem[]; // Keep for future use
}

const DashboardPage: React.FC<DashboardPageProps> = ({
    currentUser,
    debts,
    incomes,
    expenses,
}) => {
  const activeDebts = useMemo(() => debts.filter(d => !d.isPaidOff), [debts]);
  const totalPaidOverall = useMemo(() => debts.reduce((sum, d) => sum + calculateTotalPaidForDebt(d), 0), [debts]);
  const totalInitialDebtValue = useMemo(() => debts.reduce((sum, d) => sum + d.totalAmount, 0), [debts]);

  const totalMonthlyIncome = useMemo(() => incomes.reduce((sum, i) => sum + getMonthlyAmount(i.amount, i.frequency), 0), [incomes]);
  const totalMonthlyExpenses = useMemo(() => expenses.reduce((sum, e) => sum + getMonthlyAmount(e.amount, e.frequency), 0), [expenses]);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    items: UpcomingPaymentItem[];
    selectedItem: UpcomingPaymentItem | null;
  }>({
    isOpen: false,
    items: [],
    selectedItem: null,
  });


   const calendarEvents = useMemo(() => {
        // Fetch all payments for rendering all statuses (overdue, paid, upcoming)
        return debts.flatMap(debt => generateScheduledPaymentsForDebt(debt));
    }, [debts]);

  const totalMonthlyRepayments = useMemo(() => {
    return calculateTotalPlannedMonthlyRepayments(debts, new Date());
  }, [debts]);

  const repaymentCardTitle = useMemo(() => {
    const date = new Date();
    const monthName = date.toLocaleDateString('nl-NL', { month: 'long' });
    return `Aflossing ${monthName.toLowerCase()}`;
  }, []);

  const netMonthlyResult = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyRepayments;
  const overallProgressPercent = totalInitialDebtValue > 0 ? (totalPaidOverall / totalInitialDebtValue) * 100 : 0;
  
  const debtFreeDate = useMemo(() => {
      return calculateOverallDebtFreeDate(debts);
  }, [debts]);

  const debtFreeDisplayValue = useMemo(() => {
    if (activeDebts.length === 0) {
        return "Nu!";
    }
    if (!debtFreeDate) {
        return "N/A";
    }
    return formatDate(debtFreeDate, { month: 'short', year: 'numeric' });
  }, [debtFreeDate, activeDebts]);

  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleGoToToday = () => setCurrentMonth(new Date());
  
  const handleEventClick = (clickedItem: UpcomingPaymentItem) => {
    // Find all events for the day of the clicked item
    const itemsOnSameDay = calendarEvents.filter(e => e.dueDate === clickedItem.dueDate);
    if (itemsOnSameDay.length > 0) {
      setPaymentModalState({
        isOpen: true,
        items: itemsOnSameDay,
        selectedItem: clickedItem,
      });
    }
  };


  return (
    <>
    <div className="space-y-3 sm:space-y-4 font-light">
       <PageHeader 
            title={`Welkom terug, ${currentUser?.firstName}!`}
            description={"Samen naar een schuldenvrije toekomst."}
        />
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="aspect-square">
          <DebtDistributionDonutChart debts={activeDebts} />
        </div>
        <div className="aspect-square">
          <CalendarView
              currentMonth={currentMonth}
              events={calendarEvents}
              onNextMonth={handleNextMonth}
              onPrevMonth={handlePrevMonth}
              onGoToToday={handleGoToToday}
              onEventClick={handleEventClick}
              className="h-full w-full"
          />
        </div>
      </div>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"> 
          <StatCard 
            title="Schuldenvrij" 
            value={debtFreeDisplayValue} 
            icon={<FinishFlagIcon weight={300}/>} 
            formatAsCurrency={false}
          />
          <StatCard title={repaymentCardTitle} value={totalMonthlyRepayments} icon={<CalendarDaysIcon weight={300}/>} />
          <StatCard 
            title="Spaarruimte" 
            value={netMonthlyResult} 
            icon={netMonthlyResult >= 0 ? <ArrowTrendingUpIcon weight={300} /> : <ArrowTrendingDownIcon weight={300} />} 
          />
          <StatCard title="Totaal afgelost" value={totalPaidOverall} icon={<CurrencyDollarIcon weight={300}/>} />
        </div>
      </section>
      
      {totalInitialDebtValue > 0 && (
        <GlassCard className="p-2.5 sm:p-3">
          <h2 className="text-base sm:text-lg font-bold mb-2 text-light-text-primary dark:text-dark-text-primary">Totale Schuld Voortgang</h2>
          <div className="w-full h-4 sm:h-5 rounded-neumorphic bg-black/10 dark:bg-white/10 relative overflow-hidden">
              <div
                  className="absolute top-0 left-0 bottom-0 bg-brand-accent h-full rounded-neumorphic transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(0, Math.min(overallProgressPercent, 100))}%` }}
              >
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className={`text-xs font-medium ${overallProgressPercent > 50 ? 'text-white/90' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                      {overallProgressPercent.toFixed(1)}%
                  </span>
              </div>
          </div>
          <div className="flex justify-between text-xs mt-1.5 text-light-text-secondary dark:text-dark-text-secondary font-light">
              <span>{formatCurrency(totalPaidOverall)} betaald</span>
              <span>Nog: {formatCurrency(Math.max(0, totalInitialDebtValue - totalPaidOverall))}</span>
          </div>
        </GlassCard>
      )}

      <section>
         <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-1">Financiële projectie</h2>
         <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2.5 sm:mb-3 font-light">
            Een voorspelling van je schuldverloop, maandelijkse aflossingen en spaarruimte.
        </p>
        <ProjectionChart
          debts={debts}
          incomes={incomes}
          expenses={expenses}
        />
        <div className="mt-4">
          <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-1">Schuldverdeling per maand</h2>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2.5 sm:mb-3 font-light">Toont per maand de verdeling van je totale schuld.</p>
          <DebtStackedBarChart debts={debts} incomes={incomes} expenses={expenses} />
        </div>
      </section>
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

export default DashboardPage;