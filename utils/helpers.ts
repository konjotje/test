import { Debt, Income, Expense, Frequency, PaymentPlan, UpcomingPaymentItem, ProjectionData } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  
  const date = (typeof dateString === 'string') 
    ? new Date(dateString) 
    : dateString;

  const formattingOptionsToUse: Intl.DateTimeFormatOptions = options 
    ? { timeZone: 'UTC', ...options } // Always default to UTC for consistency
    : { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };

  return date.toLocaleDateString('nl-NL', formattingOptionsToUse);
};


export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EUR',
  };
  return new Intl.NumberFormat('nl-NL', { ...defaultOptions, ...options }).format(amount).replace(/\s/g, '');
};

// Module-level cache for generateScheduledPaymentsForDebt
const generateScheduledPaymentsForDebtCache: Map<string, UpcomingPaymentItem[]> = new Map();

export const getFrequencyLabel = (frequency: Frequency, type: 'per' | 'full' = 'per'): string => {
  const labels: Record<Frequency, { per: string; full: string }> = {
    [Frequency.MONTHLY]: { per: 'per maand', full: 'Maandelijks' },
    [Frequency.MANUAL]: { per: 'handmatig', full: 'Eenmalig' },
    [Frequency.EENMALIG]: { per: 'eenmalig', full: 'Eenmalig' },
  };
  return labels[frequency]?.[type] || frequency.toString();
};

export const generateScheduledPaymentsForDebt = (debt: Debt): UpcomingPaymentItem[] => {
  // Simple memoization to avoid recomputing schedules for the same debt state repeatedly.
  // Key based on debt id, totalAmount, paymentPlan and paidOn array. Cache is bounded.
  const cacheKey = `${debt.id}|${debt.totalAmount}|${JSON.stringify(debt.paymentPlan)}|${(debt.paidOn || []).join(',')}`;
  if (typeof generateScheduledPaymentsForDebtCache === 'undefined') {
    // Should not happen, but guard
  }
  const cache = generateScheduledPaymentsForDebtCache;
  if (cache.has(cacheKey)) {
    return (cache.get(cacheKey) || []).slice();
  }
    if (debt.isPaidOff || !debt.paymentPlan || debt.paymentPlan.amount <= 0) {
        return [];
    }

    const plan = debt.paymentPlan;
    const allPayments: UpcomingPaymentItem[] = [];
    let remainingAmount = debt.totalAmount;
    
    if (remainingAmount <= 0) return [];
    
    const [startYear, startMonth, startDay] = plan.startDate.split('-').map(Number);
    let cursorDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));

    if (isNaN(cursorDate.getTime())) return [];

    if (plan.frequency === Frequency.MANUAL) {
        const dueDate = cursorDate.toISOString().split('T')[0];
        allPayments.push({
            debtId: debt.id,
            debtCreditorName: debt.creditorName,
            paymentAmount: Math.min(plan.amount, remainingAmount),
            dueDate: dueDate,
            originalPlan: plan,
            isPaid: debt.paidOn?.includes(dueDate) ?? false,
        });
        return allPayments;
    }

    // Monthly payments
    let iterations = 0;
    const maxIterations = 12 * 100; // Safety limit: 100 years

    while (remainingAmount > 0.009 && iterations < maxIterations) {
        const amountForThisInstallment = Math.min(plan.amount, remainingAmount);
        const dueDate = cursorDate.toISOString().split('T')[0];
        
        allPayments.push({
            debtId: debt.id,
            debtCreditorName: debt.creditorName,
            paymentAmount: amountForThisInstallment,
            dueDate: dueDate,
            originalPlan: plan,
            isPaid: debt.paidOn?.includes(dueDate) ?? false,
        });
        
        remainingAmount -= amountForThisInstallment;

        const originalUTCDate = cursorDate.getUTCDate();
        cursorDate.setUTCMonth(cursorDate.getUTCMonth() + 1);
        if (cursorDate.getUTCDate() !== originalUTCDate) {
            cursorDate.setUTCDate(0); // Go to last day of previous month
        }
        iterations++;
    }

  // Store a copy in cache
  try {
    // Keep cache bounded to 500 entries
    if (cache.size > 500) {
      const firstKey = cache.keys().next().value as string;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(cacheKey, allPayments.slice());
  } catch (e) {
    // ignore caching errors
  }

  return allPayments;
};

export const calculateTotalPaidForDebt = (debt: Debt): number => {
    if (debt.isPaidOff) return debt.totalAmount;

    const allPayments = generateScheduledPaymentsForDebt(debt);
    const paidAmount = allPayments
        .filter(p => p.isPaid)
        .reduce((sum, p) => sum + p.paymentAmount, 0);

    return paidAmount;
};

export const calculateRemainingDebt = (debt: Debt): number => {
    const remaining = debt.totalAmount - calculateTotalPaidForDebt(debt);
    return Math.max(0, remaining);
};

/**
 * Identifies scheduled payments that are past their due date but have not been marked as paid.
 * This is a notification function and does not affect core financial calculations.
 * It uses a fixed "today" date for consistent behavior within the demo data's context.
 * @param debts - The array of all user debts.
 * @returns An array of `UpcomingPaymentItem` objects that are overdue.
 */
export const getOverduePayments = (debts: Debt[]): UpcomingPaymentItem[] => {
    // NOTE: Using a fixed date to ensure the demo data context is consistent.
    // In a real app, this would be new Date().
    const today = new Date('2025-07-20T12:00:00Z'); 

    const allGeneratedPayments = debts.flatMap(debt => {
        if (debt.isPaidOff) return [];
        return generateScheduledPaymentsForDebt(debt);
    });

    const overduePayments = allGeneratedPayments.filter(p => {
        // Use replace for better Safari compatibility with date parsing.
        const dueDate = new Date(p.dueDate.replace(/-/g, '/'));
        return !p.isPaid && dueDate < today;
    });

    // Sort by due date, oldest first, to prioritize the most overdue payments.
    overduePayments.sort((a, b) => new Date(a.dueDate.replace(/-/g, '/')).getTime() - new Date(b.dueDate.replace(/-/g, '/')).getTime());
    
    return overduePayments;
};


export const getUpcomingPayments = (
  debts: Debt[],
  viewStartDate: Date,
  viewEndDate: Date
): UpcomingPaymentItem[] => {
  let upcoming: UpcomingPaymentItem[] = [];
  const normalizedViewStart = new Date(Date.UTC(viewStartDate.getFullYear(), viewStartDate.getMonth(), viewStartDate.getDate()));
  const normalizedViewEnd = new Date(Date.UTC(viewEndDate.getFullYear(), viewEndDate.getMonth(), viewEndDate.getDate(), 23, 59, 59, 999));

  for (const debt of debts) {
    if (debt.isPaidOff) continue;
    
    const allDebtPayments = generateScheduledPaymentsForDebt(debt);
    const futurePayments = allDebtPayments.filter(p => {
        const paymentDate = new Date(p.dueDate);
        return paymentDate >= normalizedViewStart && paymentDate <= normalizedViewEnd;
    });
    upcoming = upcoming.concat(futurePayments);
  }

  upcoming.sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.debtCreditorName.localeCompare(b.debtCreditorName);
  });

  return upcoming;
};

export const calculateExpectedPayoffDate = (debt: Debt): string => {
  if (debt.isPaidOff) return 'Afbetaald';

  const allPayments = generateScheduledPaymentsForDebt(debt);
  if (allPayments.length === 0) {
      const remaining = debt.totalAmount - calculateTotalPaidForDebt(debt);
      if (remaining <= 0.009) return 'Afbetaald';
      return 'N.v.t. (Geen plan)';
  }

  const lastPayment = allPayments[allPayments.length - 1];
  return formatDate(lastPayment.dueDate);
};

export const calculateOverallDebtFreeDate = (debts: Debt[]): Date | null => {
    const activeDebts = debts.filter(d => !d.isPaidOff);
    if (activeDebts.length === 0) {
        return new Date(); // Already debt free
    }

    const allLastPaymentDates = activeDebts.map(debt => {
        const payments = generateScheduledPaymentsForDebt(debt);
        if (payments.length === 0) return null;
        return new Date(payments[payments.length - 1].dueDate);
    }).filter((d): d is Date => d !== null);

    if (allLastPaymentDates.length === 0) {
        return null;
    }

    const lastPaymentDate = new Date(Math.max(...allLastPaymentDates.map(d => d.getTime())));

    // Advance to the first day of the *next* month for the "debt-free" date
    lastPaymentDate.setUTCMonth(lastPaymentDate.getUTCMonth() + 1);
    lastPaymentDate.setUTCDate(1);

    return lastPaymentDate;
};


export const getMonthlyAmount = (amount: number, frequency: Frequency): number => {
  switch (frequency) {
    case Frequency.MONTHLY:
      return amount;
    case Frequency.EENMALIG:
    default:
      return 0; 
  }
};

export const calculateTotalPlannedMonthlyRepayments = (debts: Debt[], date: Date): number => {
    let total = 0;
    const targetMonth = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;

    for (const debt of debts) {
        if (debt.isPaidOff) continue;
        const payments = generateScheduledPaymentsForDebt(debt);
        for (const payment of payments) {
            if (payment.dueDate.startsWith(targetMonth)) {
                total += payment.paymentAmount;
            }
        }
    }
    return total;
};

export const generateProjectionData = (
  debts: Debt[],
  incomes: Income[],
  expenses: Expense[]
): ProjectionData[] => {
    const allDebts = debts.filter(d => !d.isPaidOff);
    if (allDebts.length === 0) return [];

    const timelineEndDate = calculateOverallDebtFreeDate(allDebts);
    if (!timelineEndDate) return [];

    const today = new Date();
    
    const projectedPaymentsByMonth = new Map<string, number>();
    for (const debt of allDebts) {
        const payments = generateScheduledPaymentsForDebt(debt);
        payments.forEach(p => {
            const monthKey = p.dueDate.substring(0, 7); // YYYY-MM
            projectedPaymentsByMonth.set(monthKey, (projectedPaymentsByMonth.get(monthKey) || 0) + p.paymentAmount);
        });
    }

    const data: ProjectionData[] = [];
    let outstandingDebt = allDebts.reduce((sum, d) => sum + d.totalAmount, 0);

    const earliestStartDate = allDebts.length > 0
        ? new Date(Math.min(...allDebts.map(d => new Date(d.startDate.replace(/-/g, '/')).getTime())))
        : new Date();

    if (isNaN(earliestStartDate.getTime())) return []; 
    
    let cursor = new Date(Date.UTC(earliestStartDate.getFullYear(), earliestStartDate.getMonth(), 1));

    const paymentsBeforeChart = Array.from(projectedPaymentsByMonth.entries())
        .filter(([monthKey, _]) => monthKey < cursor.toISOString().substring(0, 7))
        .reduce((sum, [_, amount]) => sum + amount, 0);
    outstandingDebt -= paymentsBeforeChart;

    let accumulatedSavings = 0;
    const monthlyIncome = incomes.reduce((sum, i) => i.frequency === Frequency.MONTHLY ? sum + i.amount : sum, 0);
    const monthlyExpenses = expenses.reduce((sum, e) => e.frequency === Frequency.MONTHLY ? sum + e.amount : sum, 0);
    const monthlyNetFlow = monthlyIncome - monthlyExpenses;

    let iterations = 0;
    const maxIterations = 12 * 100; // 100 years

    while (cursor <= timelineEndDate && iterations < maxIterations && outstandingDebt > 0) {
        const monthKey = cursor.toISOString().substring(0, 7);
        const repaymentForMonth = projectedPaymentsByMonth.get(monthKey) || 0;
        
        // Before pushing data, capture the state at the beginning of the month
        data.push({
            month: monthKey,
            year: cursor.getUTCFullYear().toString(),
            monthLabel: new Intl.DateTimeFormat('nl-NL', { month: 'short' }).format(cursor).replace('.', ''),
            openstaandeSchuld: Math.max(0, outstandingDebt),
            aflossing: repaymentForMonth,
            spaarruimte: monthlyNetFlow - repaymentForMonth,
            spaargeld: Math.max(0, accumulatedSavings)
        });
        
        // Now update the state for the next month
        outstandingDebt -= repaymentForMonth;
        accumulatedSavings += (monthlyNetFlow - repaymentForMonth);
        
        const originalUTCDate = cursor.getUTCDate();
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        if (cursor.getUTCDate() !== originalUTCDate) cursor.setUTCDate(0);
        iterations++;
    }

    // Add final month where debt is 0
    if (data.length > 0 && outstandingDebt <= 0) {
       data.push({
            month: cursor.toISOString().substring(0, 7),
            year: cursor.getUTCFullYear().toString(),
            monthLabel: new Intl.DateTimeFormat('nl-NL', { month: 'short' }).format(cursor).replace('.', ''),
            openstaandeSchuld: 0,
            aflossing: 0,
            spaarruimte: monthlyNetFlow,
            spaargeld: Math.max(0, accumulatedSavings)
        });
    }

    return data;
};

export const BRAND_PRIMARY_COLOR = '#141ff5';

export const generateMonochromaticColors = (baseColor: string, count: number): string[] => {
  if (count <= 0) return [];
  if (count === 1) return [baseColor];

  const colors: string[] = [baseColor];
  let R = parseInt(baseColor.substring(1, 3), 16);
  let G = parseInt(baseColor.substring(3, 5), 16);
  let B = parseInt(baseColor.substring(5, 7), 16);

  const numTints = Math.min(Math.ceil((count - 1) / 2), 3);
  for (let i = 1; i <= numTints; i++) {
    const factor = (i / (numTints + 1)) * 0.7;
    const tR = Math.min(255, Math.floor(R + (255 - R) * factor));
    const tG = Math.min(255, Math.floor(G + (255 - G) * factor));
    const tB = Math.min(255, Math.floor(B + (255 - B) * factor));
    colors.push(`#${tR.toString(16).padStart(2, '0')}${tG.toString(16).padStart(2, '0')}${tB.toString(16).padStart(2, '0')}`);
  }

  const numShades = count - 1 - numTints;
  for (let i = 1; i <= numShades; i++) {
    const factor = (i / (numShades + 1)) * 0.6;
    const sR = Math.max(0, Math.floor(R * (1 - factor)));
    const sG = Math.max(0, Math.floor(G * (1 - factor)));
    const sB = Math.max(0, Math.floor(B * (1 - factor)));
    colors.push(`#${sR.toString(16).padStart(2, '0')}${sG.toString(16).padStart(2, '0')}${sB.toString(16).padStart(2, '0')}`);
  }
  
  return Array.from(new Set(colors)).slice(0, count);
};