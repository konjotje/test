import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';
import { formatCurrency, BRAND_PRIMARY_COLOR, generateMonochromaticColors } from '@/utils/helpers';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/contexts/ThemeContext';
import { InformationCircleIcon } from '@/components/ui/Icons';

interface MonthlyFlowDonutChartProps {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  totalMonthlyRepayments: number;
  netMonthlySavings: number; // New prop for Spaarruimte
}

interface ChartData {
  name: string; // User-facing name e.g., "Spaarruimte"
  value: number;
  color: string;
  labelForCenter: string; // Label to show in center when this segment is active e.g., "Spaarruimte"
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
      </GlassCard>
    );
  }
  return null;
};

const MonthlyFlowDonutChart: React.FC<MonthlyFlowDonutChartProps> = ({
  totalMonthlyIncome,
  totalMonthlyExpenses,
  totalMonthlyRepayments,
  netMonthlySavings,
}) => {
  const { theme } = useTheme();
  const axisTextColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const defaultAmountTextColor = theme === 'dark' ? '#e5e7eb' : '#374151';

  const flowChartColors = useMemo(() => generateMonochromaticColors(BRAND_PRIMARY_COLOR, 3), []);
  
  const savingsColor = flowChartColors[0] || BRAND_PRIMARY_COLOR; 
  const repaymentColor = flowChartColors[1] || '#4d5bff'; 
  const expenseColor = flowChartColors[2] || '#0a16d1'; 

  const chartData: ChartData[] = useMemo(() => {
    const data: ChartData[] = [];
    // Order: Spaarruimte, Aflossingen, Uitgaven for consistent color assignment if some are zero
    if (netMonthlySavings > 0) data.push({ name: 'Spaarruimte', value: netMonthlySavings, color: savingsColor, labelForCenter: "Spaarruimte" });
    if (totalMonthlyRepayments > 0) data.push({ name: 'Aflossingen', value: totalMonthlyRepayments, color: repaymentColor, labelForCenter: "Totale Aflossingen" });
    if (totalMonthlyExpenses > 0) data.push({ name: 'Uitgaven', value: totalMonthlyExpenses, color: expenseColor, labelForCenter: "Totale Uitgaven" });
    
    // Re-assign colors based on consistent order to ensure correct color mapping
    // This assumes specific colors for specific categories if they exist.
    const colorsToAssign = generateMonochromaticColors(BRAND_PRIMARY_COLOR, data.length || 1);
    
    data.forEach((item) => {
        if(item.name === 'Spaarruimte') item.color = colorsToAssign[0]; // Spaarruimte always primary if present
        else if(item.name === 'Aflossingen') item.color = data.length > 1 ? colorsToAssign[1] : colorsToAssign[0];
        else if(item.name === 'Uitgaven') item.color = data.length > 2 ? colorsToAssign[2] : (data.length > 1 ? colorsToAssign[1] : colorsToAssign[0]);
    });
     // Ensure specific colors always apply if the item exists
    const spaarruimteItem = data.find(d => d.name === 'Spaarruimte');
    if (spaarruimteItem) spaarruimteItem.color = savingsColor;

    const aflossingenItem = data.find(d => d.name === 'Aflossingen');
    if (aflossingenItem) aflossingenItem.color = repaymentColor;
    
    const uitgavenItem = data.find(d => d.name === 'Uitgaven');
    if (uitgavenItem) uitgavenItem.color = expenseColor;


    return data;
  }, [netMonthlySavings, totalMonthlyExpenses, totalMonthlyRepayments, savingsColor, expenseColor, repaymentColor]);


  const [activeDisplay, setActiveDisplay] = useState<{ label: string; value: number; color: string; isDefault: boolean }>(() => ({
    label: "Totaal Inkomen",
    value: totalMonthlyIncome,
    color: defaultAmountTextColor,
    isDefault: true,
  }));
  
  useEffect(() => {
    // Reset to default when totalMonthlyIncome changes significantly (e.g. on initial data load)
     setActiveDisplay({
        label: "Totaal Inkomen",
        value: totalMonthlyIncome,
        color: defaultAmountTextColor,
        isDefault: true,
    });
  }, [totalMonthlyIncome, defaultAmountTextColor]);


  const handlePieClick = (dataItem: ChartData | null): void => { // Allow null to reset
    if (dataItem && dataItem.labelForCenter && dataItem.value !== undefined && dataItem.color) {
      setActiveDisplay({
        label: dataItem.labelForCenter,
        value: dataItem.value,
        color: dataItem.color,
        isDefault: false,
      });
    } else { // Reset to default if clicked outside or on center
       setActiveDisplay({
        label: "Totaal Inkomen",
        value: totalMonthlyIncome,
        color: defaultAmountTextColor,
        isDefault: true,
      });
    }
  };
  
  if (chartData.length === 0 && totalMonthlyIncome === 0) {
    return (
      <GlassCard className="w-full h-full flex flex-col p-3 sm:p-4">
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <InformationCircleIcon className="text-3xl sm:text-4xl text-brand-accent mb-2 opacity-80" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary px-4 text-sm sm:text-base font-light">
                Voeg inkomsten toe om de geldstroom te zien.
            </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full h-full flex flex-col p-3 sm:p-4">
      <ResponsiveContainer width="100%" height="100%" className="flex-grow" style={{ outline: 'none' }}>
          <PieChart onClick={() => handlePieClick(null)}> {/* Click on chart background resets */}
          <defs>
            {/* Same SVG filter definitions as DebtDistributionDonutChart */}
            <filter id="neumorphic-shadow-pie-light" x="-50%" y="-50%" width="200%" height="200%">
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
            <filter id="neumorphic-shadow-pie-dark" x="-50%" y="-50%" width="200%" height="200%">
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
            paddingAngle={chartData.length > 1 ? 5 : 0}
            dataKey="value"
            nameKey="name"
            labelLine={false}
            onClick={(data: any) => handlePieClick(data as ChartData)}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.color}
                stroke={theme === 'dark' ? '#2c3038' : '#eef2f9'}
                strokeWidth={2}
                style={{ outline: 'none', cursor: 'pointer' }}
                filter={theme === 'dark' ? "url(#neumorphic-shadow-pie-dark)" : "url(#neumorphic-shadow-pie-light)"}
              />
            ))}
            <Label
              content={(props: any) => {
                const viewBox = props?.viewBox as { cx?: number; cy?: number; innerRadius?: number } | undefined;
                if (viewBox && typeof viewBox.cx === 'number' && typeof viewBox.cy === 'number' && typeof viewBox.innerRadius === 'number') {
                  const { cx, cy, innerRadius } = viewBox;
                  
                  const labelTextColor = axisTextColor;
                  const amountTextColor = activeDisplay.isDefault ? defaultAmountTextColor : activeDisplay.color;
                  const amountText = formatCurrency(activeDisplay.value);
                  const labelText = activeDisplay.label;
                  
                  const amountFontSize = Math.max(8, innerRadius / 4.5);
                  const labelFontSize = Math.max(6, amountFontSize * 0.6); // Increased size
                  const gap = 10; // Increased vertical gap further

                  // Position amount text exactly in the center
                  const amountY = cy;
                  // Position label text above the amount text, with its baseline at the bottom
                  const labelY = cy - (amountFontSize / 2) - gap;

                  return (
                      <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePieClick(null); }}>
                           <text 
                              x={cx} 
                              y={labelY} 
                              fill={labelTextColor} 
                              textAnchor="middle" 
                              dominantBaseline="text-bottom"
                              style={{ fontSize: `${labelFontSize}px`, fontWeight: 300 }}
                            >
                                {labelText}
                            </text>
                            
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default MonthlyFlowDonutChart;
