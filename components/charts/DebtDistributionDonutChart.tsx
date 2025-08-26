import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';
import { Debt } from '@/types';
import { formatCurrency, BRAND_PRIMARY_COLOR, generateMonochromaticColors, calculateTotalPaidForDebt } from '@/utils/helpers';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/contexts/ThemeContext';
import { InformationCircleIcon } from '@/components/ui/Icons';

interface DebtDistributionDonutChartProps {
  debts: Debt[];
}

interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <GlassCard className="!p-2 !py-1.5 !rounded-neumorphic">
        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{data.name}</p>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Bedrag: {formatCurrency(data.value)}
        </p>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Percentage: {data.percentage.toFixed(1)}%
        </p>
      </GlassCard>
    );
  }
  return null;
};


const DebtDistributionDonutChart: React.FC<DebtDistributionDonutChartProps> = ({
  debts,
}) => {
  const { theme } = useTheme();
  const axisTextColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const amountTextColor = theme === 'dark' ? '#e5e7eb' : '#374151';

  const { chartData, totalOutstanding } = useMemo(() => {
    const activeDebts = debts.filter(d => !d.isPaidOff);
    const creditorMap: Map<string, number> = new Map();

    activeDebts.forEach(debt => {
      const totalPaid = calculateTotalPaidForDebt(debt);
      const outstanding = debt.totalAmount - totalPaid;
      if (outstanding > 0) {
        creditorMap.set(debt.creditorName, (creditorMap.get(debt.creditorName) || 0) + outstanding);
      }
    });

    const total = Array.from(creditorMap.values()).reduce((sum, val) => sum + val, 0);

    const data = Array.from(creditorMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    })).sort((a,b) => b.value - a.value); 

    return { chartData: data, totalOutstanding: total };
  }, [debts]);

  const chartColors = useMemo(() => generateMonochromaticColors(BRAND_PRIMARY_COLOR, chartData.length || 1), [chartData.length]);

  if (chartData.length === 0) {
    return (
      <GlassCard className="w-full h-full flex flex-col p-2.5 sm:p-3">
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <InformationCircleIcon className="text-3xl sm:text-4xl text-brand-accent mb-2 opacity-80" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary px-4 text-sm sm:text-base font-light">
                Geen actieve schulden om te visualiseren.
            </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full h-full flex flex-col p-2.5 sm:p-3">
      <ResponsiveContainer width="100%" height="100%" className="flex-grow" style={{ outline: 'none' }}>
        <PieChart>
          <defs>
            <filter id="neumorphic-shadow-pie-light-debt" x="-50%" y="-50%" width="200%" height="200%">
                <feOffset dx="-3.5" dy="-3.5" in="SourceAlpha" result="offsetTL_L"/>
                <feGaussianBlur in="offsetTL_L" stdDeviation="3.5" result="blurTL_L"/>
                <feFlood flood-color="#ffffff" result="colorTL_L"/> 
                <feComposite in="colorTL_L" in2="blurTL_L" operator="in" result="shadowTL_L"/>
                <feOffset dx="3.5" dy="3.5" in="SourceAlpha" result="offsetDR_L"/>
                <feGaussianBlur in="offsetDR_L" stdDeviation="3.5" result="blurDR_L"/>
                <feFlood flood-color="#d1d9e6" result="colorDR_L"/> 
                <feComposite in="colorDR_L" in2="blurDR_L" operator="in" result="shadowDR_L"/>
                <feOffset dx="2" dy="2" in="SourceAlpha" result="inner_offset_D_L"/>
                <feGaussianBlur stdDeviation="2" in="inner_offset_D_L" result="inner_blur_D_L"/>
                <feComposite operator="out" in="SourceAlpha" in2="inner_blur_D_L" result="inverse_inner_D_L"/>
                <feFlood flood-color="#d1d9e6" flood-opacity="0.85" result="inner_color_D_L"/> 
                <feComposite operator="in" in="inner_color_D_L" in2="inverse_inner_D_L" result="inner_shadow_D_L"/>
                <feMerge>
                    <feMergeNode in="shadowTL_L"/>
                    <feMergeNode in="shadowDR_L"/>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="inner_shadow_D_L"/>
                </feMerge>
            </filter>
            <filter id="neumorphic-shadow-pie-dark-debt" x="-50%" y="-50%" width="200%" height="200%">
                <feOffset dx="-3.5" dy="-3.5" in="SourceAlpha" result="offsetTL_D"/>
                <feGaussianBlur in="offsetTL_D" stdDeviation="3.5" result="blurTL_D"/>
                <feFlood flood-color="#353a46" result="colorTL_D"/>
                <feComposite in="colorTL_D" in2="blurTL_D" operator="in" result="shadowTL_D"/>
                <feOffset dx="3.5" dy="3.5" in="SourceAlpha" result="offsetDR_D"/>
                <feGaussianBlur in="offsetDR_D" stdDeviation="3.5" result="blurDR_D"/>
                <feFlood flood-color="#23272f" result="colorDR_D"/>
                <feComposite in="colorDR_D" in2="blurDR_D" operator="in" result="shadowDR_D"/>
                <feOffset dx="2" dy="2" in="SourceAlpha" result="inner_offset_D_D"/>
                <feGaussianBlur stdDeviation="2" in="inner_offset_D_D" result="inner_blur_D_D"/>
                <feComposite operator="out" in="SourceAlpha" in2="inner_blur_D_D" result="inverse_inner_D_D"/>
                <feFlood flood-color="#23272f" flood-opacity="0.85" result="inner_color_D_D"/>
                <feComposite operator="in" in="inner_color_D_D" in2="inverse_inner_D_D" result="inner_shadow_D_D"/>
                <feMerge>
                    <feMergeNode in="shadowTL_D"/>
                    <feMergeNode in="shadowDR_D"/>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="inner_shadow_D_D"/>
                </feMerge>
            </filter>
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            fill="#8884d8"
            paddingAngle={chartData.length > 1 ? 5 : 0}
            dataKey="value"
            nameKey="name"
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
                stroke={theme === 'dark' ? '#2c3038' : '#eef2f9'}
                strokeWidth={2}
                style={{ outline: 'none', cursor: 'pointer' }}
                filter={theme === 'dark' ? "url(#neumorphic-shadow-pie-dark-debt)" : "url(#neumorphic-shadow-pie-light-debt)"}
              />
            ))}
             <Label
                content={(props: any) => {
                  const viewBox = props?.viewBox as { cx?: number; cy?: number; innerRadius?: number } | undefined;
                  if (viewBox && typeof viewBox.cx === 'number' && typeof viewBox.cy === 'number' && typeof viewBox.innerRadius === 'number') {
                      const { cx, cy, innerRadius } = viewBox;
                      
                      const amountText = formatCurrency(totalOutstanding);
                      const labelText = "Openstaand";
                      
                      const amountFontSize = Math.max(8, innerRadius / 4.5);
                      const labelFontSize = Math.max(6, amountFontSize * 0.6); // Increased size
                      const gap = 10; // Increased vertical gap further

                      // Position amount text exactly in the center
                      const amountY = cy;
                      // Position label text above the amount text, with its baseline at the bottom
                      const labelY = cy - (amountFontSize / 2) - gap;


                      return (
                          <g>
                              {/* Label: "Openstaande Schuld" */}
                              <text 
                                x={cx} 
                                y={labelY} 
                                fill={axisTextColor} 
                                textAnchor="middle" 
                                dominantBaseline="text-bottom"
                                style={{ fontSize: `${labelFontSize}px`, fontWeight: 300 }}
                              >
                                  {labelText}
                              </text>

                              {/* Amount - centered */}
                              <text 
                                x={cx} y={amountY} 
                                fill={amountTextColor} 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                style={{ fontSize: `${amountFontSize}px`, fontWeight: 700 }}
                              >
                                  {amountText}
                              </text>
                          </g>
                      );
                  }
                  return null;
                }}
                position="center"
              />
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }}/>
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default DebtDistributionDonutChart;