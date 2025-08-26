
import React from 'react';
import GlassCard from './GlassCard';
import { formatCurrency } from '@/utils/helpers';
import { IconProps } from './Icons';

interface StatCardProps {
  title: string;
  value: string | number;
  valueClass?: string;
  children?: React.ReactNode;
  formatAsCurrency?: boolean;
  icon?: React.ReactElement<IconProps>;
  className?: string; // Allow passing additional className to GlassCard
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    valueClass, 
    children, 
    formatAsCurrency = true, 
    icon,
    className = '' 
}) => (
    <GlassCard className={`flex-1 flex flex-col items-center text-center p-1.5 sm:p-2 ${className}`}>
      {icon && React.isValidElement(icon) && (
        React.cloneElement(icon, { className: `text-2xl sm:text-3xl mb-1.5 ${icon.props.className || ''}`.trim() })
      )}
      <h3 className="text-[0.65rem] sm:text-[0.7rem] font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-tight mb-0.5">{title}</h3>
      {typeof value === 'number' && !isNaN(value) && formatAsCurrency ? (
         <p className={`text-sm sm:text-base lg:text-lg font-bold text-light-text-primary dark:text-dark-text-primary ${valueClass || ''}`}>{formatCurrency(value)}</p>
      ) : (
         <p className={`text-sm sm:text-base lg:text-lg font-bold text-light-text-primary dark:text-dark-text-primary ${valueClass || ''}`}>{value.toString()}</p>
      )}
      {children && <div className="mt-1 w-full text-xs font-light text-light-text-secondary dark:text-dark-text-secondary">{children}</div>}
    </GlassCard>
  );

export default StatCard;