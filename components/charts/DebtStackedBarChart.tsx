import React, { useMemo, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { Debt, Income, Expense } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { formatCurrency, generateScheduledPaymentsForDebt, generateProjectionData, generateMonochromaticColors, BRAND_PRIMARY_COLOR } from '@/utils/helpers';
import { useTheme } from '@/contexts/ThemeContext';
import CustomScrollbar from '@/components/ui/CustomScrollbar'; // Importeer de nieuwe component

type DebtStackedBarChartProps = {
  debts: Debt[];
  incomes?: Income[];
  expenses?: Expense[];
};

const CustomLegendCard = ({ items }: { items: { name: string; color: string }[] }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
    {items.map((item, index) => (
      <Button key={`item-${index}`} variant="secondary" size="sm" className="flex items-center gap-2 px-3 py-1">
        <div className="w-2.5 h-2.5 shadow-inner rounded-sm" style={{ backgroundColor: item.color }} />
        <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">{item.name}</span>
      </Button>
    ))}
  </div>
);

const DebtStackedBarChart: React.FC<DebtStackedBarChartProps> = ({ debts, incomes = [], expenses = [] }) => {
  const { theme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const CustomTooltipContent: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const monthLabel = payload[0]?.payload?.monthLabelFull || '';
      const entries = payload
        .filter((p: any) => p && typeof p.value === 'number' && p.value !== 0)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      const total = entries.reduce((s: number, p: any) => s + (p.value || 0), 0);

      return (
        <GlassCard className="!p-3 !rounded-neumorphic text-sm min-w-[220px]">
          <div className="flex items-center">
            <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{monthLabel}</p>
          </div>
          <ul className="mt-3 space-y-2">
            {entries.map((p: any) => (
              <li key={p.dataKey || p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-sm shadow-inner" style={{ background: p.color || p.fill || '#000' }} />
                  <span className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)' }}>{p.name}</span>
                </div>
                <div className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)' }}>{formatCurrency(p.value)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}>Totaal</span>
              <span className="text-sm font-bold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)' }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </GlassCard>
      );
    }
    return null;
  };

  const activeDebts = useMemo(() => debts.filter(d => !d.isPaidOff && (d.totalAmount ?? 0) > 0), [debts]);
  const projection = useMemo(() => generateProjectionData(debts, incomes, expenses), [debts, incomes, expenses]);
  const allMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    if (projection.length > 0) projection.forEach(p => keys.add(p.month));
    else activeDebts.forEach(d => generateScheduledPaymentsForDebt(d).forEach(p => keys.add(p.dueDate.substring(0, 7))));
    return Array.from(keys).sort();
  }, [projection, activeDebts]);

  const data = useMemo(() => {
    if (activeDebts.length === 0 || allMonthKeys.length === 0) return [];
    let cumulativePaid: Record<string, number> = {};
    activeDebts.forEach(d => cumulativePaid[d.id] = 0);
    const debtPaymentsByMonth: Record<string, Record<string, number>> = {};
    activeDebts.forEach(debt => {
      debtPaymentsByMonth[debt.id] = {};
      generateScheduledPaymentsForDebt(debt).forEach(p => {
        const monthKey = p.dueDate.substring(0, 7);
        debtPaymentsByMonth[debt.id][monthKey] = (debtPaymentsByMonth[debt.id][monthKey] || 0) + p.paymentAmount;
      });
    });
    return allMonthKeys.map(monthKey => {
      const row: any = { month: monthKey };
      const [yy, mm] = monthKey.split('-').map(Number);
      const date = new Date(yy, mm - 1, 1);
      row.monthLabel = date.toLocaleString('nl-NL', { month: 'short' });
      row.monthLabelFull = date.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });
      activeDebts.forEach(debt => {
        const value = Math.max(0, (debt.totalAmount ?? 0) - cumulativePaid[debt.id]);
        row[debt.id] = value;
        cumulativePaid[debt.id] += (debtPaymentsByMonth[debt.id][monthKey] || 0);
      });
      row.total = activeDebts.reduce((s, d) => s + (row[d.id] || 0), 0);
      return row;
    });
  }, [activeDebts, allMonthKeys]);
  
  const visibleDebts = useMemo(() => activeDebts.filter(d => data.some(row => (row[d.id] || 0) > 0.01)), [activeDebts, data]);
  
  const colors = useMemo(() => {
    const generatedColors = generateMonochromaticColors(BRAND_PRIMARY_COLOR, Math.max(1, visibleDebts.length));
    return generatedColors.reverse();
  }, [visibleDebts.length]);

  const legendItems = useMemo(() => visibleDebts.map((debt, index) => ({ name: debt.creditorName, color: colors[index % colors.length] })), [visibleDebts, colors]);
  
  if (data.length === 0 || visibleDebts.length === 0) {
    return ( <GlassCard className="p-3"><p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Geen data om de grafiek te tonen.</p></GlassCard> );
  }

  const BAR_WIDTH = 75; 
  const CHART_WIDTH = allMonthKeys.length * BAR_WIDTH;

  const renderCustomXAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    const month = payload.value;
    const isJanuary = month.toLowerCase().startsWith('jan');
    let year = null;
    if (isJanuary && data[index] && data[index].month) {
      const [yy] = data[index].month.split('-');
      year = yy;
    }
    return (
      <g>
        <text x={x} y={y + 12} textAnchor="middle" fontSize="12" fill={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}>{month}</text>
        {isJanuary && year && (
          <text x={x} y={y + 28} textAnchor="middle" fontSize="11" fontWeight="bold" fill={theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}>{year}</text>
        )}
      </g>
    );
  };

  const hideScrollbarStyles = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <GlassCard className="w-full h-full p-4 pt-4 pb-2 flex flex-col">
        <CustomLegendCard items={legendItems} />
        <div
          ref={scrollContainerRef}
          className="no-scrollbar"
          style={{
            height: '350px',
            overflowX: 'auto',
            overflowY: 'visible',
            width: '100%',
          }}
        >
          <ResponsiveContainer width={CHART_WIDTH} height="100%">
            {/* AANGEPAST: De bottom margin is verhoogd om het jaartal ruimte te geven */}
            <BarChart data={data} margin={{ top: 10, right: 5, left: 5, bottom: 10 }}>
              <XAxis
                dataKey="monthLabel"
                axisLine={false}
                tickLine={false}
                interval={0}
                dy={0}
                tick={renderCustomXAxisTick}
              />
              <YAxis hide={true} />
              {visibleDebts.map((debt, idx) => {
                const isTopMost = idx === visibleDebts.length - 1;
                return (
                  <Bar
                    key={debt.id}
                    dataKey={debt.id}
                    stackId="a"
                    name={debt.creditorName}
                    fill={colors[idx % colors.length]}
                    barSize={Math.max(12, Math.round(BAR_WIDTH * 0.65))}
                  >
                    {isTopMost && (
                      <LabelList
                        dataKey="total"
                        position="top"
                        formatter={(value: number) => `€${Math.round(value).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`}
                        style={{ fontSize: 11, fontWeight: 700, pointerEvents: 'none', fill: theme === 'dark' ? 'rgba(255,255,255,0.85)' : '#000' }}
                        offset={10}
                      />
                    )}
                  </Bar>
                );
              })}
              <Tooltip
                content={<CustomTooltipContent />}
                wrapperStyle={{ zIndex: 9999, pointerEvents: 'auto' }}
                contentStyle={{ background: 'transparent', boxShadow: 'none', padding: 0 }}
                cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CustomScrollbar scrollableRef={scrollContainerRef} />
      </GlassCard>
    </>
  );
};

export default DebtStackedBarChart;