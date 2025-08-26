
import React, { useState, useEffect } from 'react';
import { Income, Expense, Frequency } from '../../types';
import GlassCard from '@/components/ui/GlassCard';
import Button from '../ui/Button';
import Input, { TextArea } from '../ui/Input';
import DatePickerInput from '../ui/DatePickerInput';
import Select from '../ui/Select';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarDaysIcon } from '../ui/Icons';
import { getFrequencyLabel } from '../../utils/helpers';

export interface FinancialItemFormProps<T extends Income | Expense> {
  onSubmit: (data: Omit<T, 'id'> | T) => void;
  initialData?: T | Partial<Omit<T, 'id'>>;
  onClose: () => void;
  itemTypeLabel: string; 
  itemTypeName: 'income' | 'expense';
}

const financialFrequencyOptions = [
  { value: Frequency.MONTHLY, label: getFrequencyLabel(Frequency.MONTHLY, 'full') },
  { value: Frequency.EENMALIG, label: getFrequencyLabel(Frequency.EENMALIG, 'full') },
];

const initialIncomeFormData: Omit<Income, 'id'> = {
  source: '', amount: 0, frequency: Frequency.MONTHLY, startDate: new Date().toISOString().split('T')[0], notes: ''
};
const initialExpenseFormData: Omit<Expense, 'id'> = {
  category: '', amount: 0, frequency: Frequency.MONTHLY, startDate: new Date().toISOString().split('T')[0], notes: ''
};

const FinancialItemForm = <T extends Income | Expense>({ onSubmit, initialData, onClose, itemTypeLabel, itemTypeName }: FinancialItemFormProps<T>) => {
  const [formData, setFormData] = useState(() => {
    const baseData = itemTypeName === 'income' ? initialIncomeFormData : initialExpenseFormData;
    return { ...baseData, ...(initialData || {}) } as Omit<T, 'id'> | T;
  });

  useEffect(() => {
    const baseData = itemTypeName === 'income' ? initialIncomeFormData : initialExpenseFormData;
    setFormData({ ...baseData, ...(initialData || {}) } as Omit<T, 'id'> | T);
  }, [initialData, itemTypeName]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let val: string | number = value;
    if (type === 'number') {
        val = parseFloat(value) || 0;
    }
    setFormData(prev => ({ ...prev, [name]: val } as typeof prev));
  };
  
  const handleFrequencyChange = (value: string | number) => {
    setFormData(prev => ({ ...prev, frequency: value as Frequency }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, startDate: date } as typeof prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isIncome = itemTypeName === 'income';
  const nameLabel = isIncome ? 'Bron' : 'Categorie';
  const nameField = isIncome ? 'source' : 'category';
  const NameIcon = isIncome ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-light">
      <div>
        <label htmlFor={nameField} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">{nameLabel} *</label>
        <GlassCard pressed className="flex items-center px-3 !py-0 overflow-hidden rounded-neumorphic">
          <NameIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
          <Input
            id={nameField}
            name={nameField}
            value={(formData as any)[nameField]}
            onChange={handleChange}
            required
            label={undefined}
            icon={undefined}
            containerClassName="!mb-0 w-full"
            className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5"
          />
        </GlassCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Bedrag *</label>
          <GlassCard pressed className="flex items-center px-3 !py-0 overflow-hidden rounded-neumorphic">
            <CurrencyDollarIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
            <Input
              id="amount"
              label={undefined}
              icon={undefined}
              type="number"
              name="amount"
              value={String(formData.amount)}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              containerClassName="!mb-0 w-full"
              className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5"
            />
          </GlassCard>
        </div>
        <Select
          id="frequency"
          name="frequency"
          label="Frequentie *"
          value={formData.frequency}
          onChange={handleFrequencyChange}
          options={financialFrequencyOptions}
          required
        />
      </div>
       <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Startdatum *</label>
        <GlassCard pressed className="flex items-center px-3 !py-0 overflow-hidden rounded-neumorphic">
          <CalendarDaysIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
          <DatePickerInput
            id="startDate"
            value={formData.startDate}
            onChange={handleDateChange}
            required
            label={undefined}
            icon={undefined}
            containerClassName="!mb-0 w-full"
            className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5 cursor-pointer"
          />
        </GlassCard>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Notities</label>
        <GlassCard pressed className="!p-3 overflow-hidden rounded-neumorphic">
          <TextArea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            label={undefined}
            placeholder="Bijv. extra details over dit item."
            containerClassName="!mb-0 w-full"
            className="!bg-transparent !border-none focus:!ring-0 !p-0"
          />
        </GlassCard>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">Annuleren</Button>
        <Button type="submit" variant="primary" fullWidth className="sm:w-auto">Opslaan</Button>
      </div>
    </form>
  );
};

export default FinancialItemForm;
