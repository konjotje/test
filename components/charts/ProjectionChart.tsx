import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, ReferenceLine } from 'recharts';
import { Debt, Income, Expense } from '@/types';
// Gebruik de ProjectionData interface uit '@/types'
import type { ProjectionData } from '@/types';
import { formatCurrency, generateProjectionData, BRAND_PRIMARY_COLOR, generateMonochromaticColors } from '@/utils/helpers';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/contexts/ThemeContext';
import { InformationCircleIcon } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

// --- Interfaces ---
interface ProjectionChartProps {
  debts: Debt[];
  incomes: Income[];
  expenses: Expense[];
}

type ViewMode = '1year' | 'total';

// --- Helper Functies & Componenten ---

const getLuminance = (hex: string): number => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    if (cleanHex.length !== 6) return 0;
    try {
        const rgb = parseInt(cleanHex, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        return 0.299 * r + 0.587 * g + 0.114 * b;
    } catch (e) {
        return 0;
    }
};

const StatItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="text-center">
        <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
        <div className="flex items-baseline justify-center">
            <span className="text-xl sm:text-2xl font-bold mr-1" style={{ color }}>€</span>
            <div className="text-3xl sm:text-4xl font-bold" style={{ color }}>
                <AnimatedNumber 
                    targetValue={value} 
                    formatter={(val) => formatCurrency(val, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('€', '').trim()}
                />
            </div>
        </div>
    </div>
);

const TotalViewXAxisLabels = ({ data, theme }: { data: ProjectionData[], theme: string | null }) => {
    if (data.length < 2) return null;
    
    const first = data[0];
    const last = data[data.length - 1];

    const Label = ({ item }: { item: ProjectionData }) => (
        <div className="text-center">
            <p className="text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{item.monthLabel}</p>
            <p className="text-[11px] font-bold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.month.substring(0, 4)}</p>
        </div>
    );

    return (
        // HIER IS DE WIJZIGING: 'bottom-0' is veranderd naar 'bottom-3' om de labels omhoog te verplaatsen.
        <div className="absolute bottom-3 left-0 right-0 h-[30px] px-2 sm:px-4 flex justify-between items-center pointer-events-none">
            <Label item={first} />
            <Label item={last} />
        </div>
    );
};


// --- Hoofdcomponent ---
const ProjectionChart: React.FC<ProjectionChartProps> = ({ debts, incomes, expenses }) => {
  const { theme } = useTheme();
  
  const CustomTooltipContent: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ProjectionData;
      if (!data.monthLabel) return null;

      const [year, month] = data.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const fullMonthLabel = date.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });

      const readableNames: { [key: string]: string } = {
        openstaandeSchuld: 'Schuld',
        spaargeld: 'Spaargeld',
        aflossing: 'Aflossing',
        spaarruimte: 'Spaarruimte',
      };

      const entries = payload
        .map((p: any) => ({
          name: readableNames[p.dataKey] || p.dataKey,
          value: p.value,
          color: p.stroke,
        }))
        .filter((e: any) => e.value > 0)
        .sort((a: any, b: any) => b.value - a.value);

      return (
        <GlassCard className="!p-3 !rounded-neumorphic text-sm min-w-[220px]">
          <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{fullMonthLabel}</p>
          <ul className="mt-3 space-y-2">
            {entries.map((p: any) => (
              <li key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-sm shadow-inner" style={{ background: p.color }} />
                  <span className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)' }}>{p.name}</span>
                </div>
                <div className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)' }}>{formatCurrency(p.value)}</div>
              </li>
            ))}
          </ul>
        </GlassCard>
      );
    }
    return null;
  };
  
  const renderCustomXAxisTick = (props: any): React.ReactElement<SVGElement> => {
    const { x, y, payload } = props;
    const monthLabel = payload.value;

    const dataPoint = realVisibleData.find(d => d.monthLabel === monthLabel);
    if (!dataPoint) {
        return <g />;
    }
    
    const isJanuary = monthLabel.toLowerCase().startsWith('jan');
    let year = null;
    
    if (isJanuary) {
      const [yy] = dataPoint.month.split('-');
      year = yy;
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={12} textAnchor="middle" fontSize="12" fill={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}>{monthLabel}</text>
        {year && (
          <text x={0} y={26} textAnchor="middle" fontSize="11" fontWeight="bold" fill={theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}>{year}</text>
        )}
      </g>
    );
  };

  const colors = useMemo(() => {
    const monoColors = generateMonochromaticColors(BRAND_PRIMARY_COLOR, 4);
    const primary = BRAND_PRIMARY_COLOR;
    const otherColors = monoColors.filter(c => c !== primary);
    otherColors.sort((a, b) => getLuminance(b) - getLuminance(a));
    return {
      schuld: primary,
      spaargeld: otherColors[0] || '#A8BFFF',
      aflossing: otherColors[1] || '#6A8BFF',
      spaarRuimte: otherColors[2] || '#2C57FF',
    };
  }, []);

  const projectionData: ProjectionData[] = useMemo(() => {
    return generateProjectionData(debts, incomes, expenses);
  }, [debts, incomes, expenses]);

  const [viewMode, setViewMode] = useState<ViewMode>('1year');
  const [pinnedData, setPinnedData] = useState<ProjectionData | null>(null);

  const realVisibleData = useMemo(() => {
    if (viewMode === 'total') {
      const debtFreeIndex = projectionData.findIndex(d => d.openstaandeSchuld <= 0.01);
      if (debtFreeIndex !== -1) {
        return projectionData.slice(0, debtFreeIndex + 1);
      }
      return projectionData;
    }
    const startIndex = projectionData.findIndex(d => d.month >= '2025-08');
    return projectionData.slice(startIndex >= 0 ? startIndex : 0, (startIndex >= 0 ? startIndex : 0) + 12);
  }, [projectionData, viewMode]);

  const paddedVisibleData = useMemo(() => {
    if (realVisibleData.length < 1) {
      return [];
    }
    const startPadding = { ...realVisibleData[0], month: `start-pad`, monthLabel: '' };
    const endPadding = { ...realVisibleData[realVisibleData.length - 1], month: `end-pad`, monthLabel: '' };
    
    return [startPadding, ...realVisibleData, endPadding];
  }, [realVisibleData]);
  
  const displayData = pinnedData || (realVisibleData.length > 0 ? realVisibleData[0] : null);

  useEffect(() => {
    if (pinnedData && !realVisibleData.some(d => d.month === pinnedData.month)) {
      setPinnedData(null);
    }
  }, [realVisibleData, pinnedData]);
  
  const handleChartClick = (e: any) => {
    if (e?.activePayload?.[0]?.payload) {
      const newPin = e.activePayload[0].payload as ProjectionData;
      setPinnedData(p => (p && p.month === newPin.month) ? null : newPin);
    }
  };
  
  if (projectionData.length <= 1) {
    return (
      <GlassCard transparencyLevel="high" className="w-full h-full flex flex-col min-h-[400px]">
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <InformationCircleIcon className="text-4xl text-brand-accent mb-2 opacity-80" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary px-4 text-sm font-light">
                Projectie kan niet worden gemaakt. Controleer of er actieve schulden met een betalingsplan en voldoende inkomsten zijn.
            </p>
        </div>
      </GlassCard>
    );
  }

  const CHART_HEIGHT = 250;
  const CONTAINER_HEIGHT = CHART_HEIGHT + 30;

  return (
    <GlassCard transparencyLevel="high" className="w-full flex flex-col !p-0 overflow-hidden">
        <div className="p-4 sm:p-5 pb-2">
            <div className="flex justify-center mb-4">
              <GlassCard pressed className="flex !p-1 space-x-1 rounded-neumorphic">
                  <Button variant={viewMode === '1year' ? 'secondary' : 'ghost'} onClick={() => setViewMode('1year')} size="sm" className="text-xs">1 Jaar</Button>
                  <Button variant={viewMode === 'total' ? 'secondary' : 'ghost'} onClick={() => setViewMode('total')} size="sm" className="text-xs">Totaal</Button>
              </GlassCard>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 my-3">
                {displayData ? (
                    <>
                        <StatItem label="Schuld" value={displayData.openstaandeSchuld} color={colors.schuld} />
                        <StatItem label="Spaargeld" value={displayData.spaargeld} color={colors.spaargeld} />
                        <StatItem label="Aflossing" value={displayData.aflossing} color={colors.aflossing} />
                        <StatItem label="Spaarruimte" value={displayData.spaarruimte} color={colors.spaarRuimte} />
                    </>
                ) : <div className="h-[58px]"></div>}
            </div>
        </div>
      
        <div className="relative w-full" style={{ height: `${CONTAINER_HEIGHT}px`}}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={paddedVisibleData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 20 }}
                    onClick={handleChartClick}
                >
                    <defs>
                        <linearGradient id="colorSchuld" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.schuld} stopOpacity={0.4}/><stop offset="95%" stopColor={colors.schuld} stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorSpaarGeld" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.spaargeld} stopOpacity={0.4}/><stop offset="95%" stopColor={colors.spaargeld} stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorAflossing" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.aflossing} stopOpacity={0.4}/><stop offset="95%" stopColor={colors.aflossing} stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorSpaarRuimte" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.spaarRuimte} stopOpacity={0.4}/><stop offset="95%" stopColor={colors.spaarRuimte} stopOpacity={0}/></linearGradient>
                    </defs>
                    
                    <Tooltip 
                      content={<CustomTooltipContent />} 
                      wrapperStyle={{ zIndex: 9999 }}
                      cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', strokeWidth: 1.5, strokeDasharray: '3 3' }} 
                    />
                    
                    <XAxis 
                        dataKey="monthLabel" 
                        axisLine={false} 
                        tickLine={false}
                        tick={viewMode === '1year' ? renderCustomXAxisTick : false}
                        interval={0}
                    />

                    <ReferenceLine y={0} stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeWidth={1.5}/>

                    <Area type="monotone" dataKey="openstaandeSchuld" stroke={colors.schuld} strokeWidth={2.5} fill="url(#colorSchuld)" name="Openstaande Schuld" dot={false} activeDot={{ r: 5, strokeWidth: 2 }}/>
                    <Area type="monotone" dataKey="spaargeld" stroke={colors.spaargeld} strokeWidth={2.5} fill="url(#colorSpaarGeld)" name="Opgebouwd Spaargeld" dot={false} activeDot={{ r: 5, strokeWidth: 2 }}/>
                    <Area type="monotone" dataKey="aflossing" stroke={colors.aflossing} strokeWidth={2.5} fill="url(#colorAflossing)" name="Maandelijkse Aflossing" dot={false} activeDot={{ r: 5, strokeWidth: 2 }}/>
                    <Area type="monotone" dataKey="spaarruimte" stroke={colors.spaarRuimte} strokeWidth={2.5} fill="url(#colorSpaarRuimte)" name="Maandelijkse Spaarruimte" dot={false} activeDot={{ r: 5, strokeWidth: 2 }}/>
                </AreaChart>
            </ResponsiveContainer>
            
            {viewMode === 'total' && <TotalViewXAxisLabels data={realVisibleData} theme={theme} />}
        </div>
    </GlassCard>
  );
};

export default ProjectionChart;