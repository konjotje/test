

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Income, Expense, Frequency } from '../types'; 
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { PlusCircleIcon, PencilIcon, TrashIcon, InformationCircleIcon, MoreVertIcon, ChevronDownIcon } from '../components/ui/Icons';
import { formatDate, formatCurrency, getFrequencyLabel } from '../utils/helpers';
import { useTheme } from '@/contexts/ThemeContext'; 
import FinancialItemForm from '../components/forms/FinancialItemForm';

interface FinancialItemDisplayProps<T extends Income | Expense> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  itemTypeLabel: string;
  itemTypeName: 'income' | 'expense';
}

const FinancialItemDisplay = <T extends Income | Expense,>({ item, onEdit, onDelete, itemTypeLabel, itemTypeName }: FinancialItemDisplayProps<T>) => {
  const [expanded, setExpanded] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const title = (item as any)[itemTypeName === 'income' ? 'source' : 'category'];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    if (isActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  return (
    <GlassCard
        as="article"
        className={`relative mb-3 transition-all duration-300 ease-in-out ${isActionsMenuOpen ? 'z-20' : 'z-0'}`}
        aria-labelledby={`item-title-${item.id}`}
    >
      <div className="flex flex-row justify-between items-start">
        <div className="flex-grow pr-2">
            <h3 id={`item-title-${item.id}`} className="font-bold text-light-text-primary dark:text-dark-text-primary">{title}</h3>
            <p className="text-2xl font-bold mt-1 text-brand-accent">
                {formatCurrency(item.amount)}
            </p>
        </div>

        <div className="flex-shrink-0 flex items-center space-x-1">
          <div ref={actionsMenuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              aria-label="Meer acties"
              title="Meer acties"
              className="!p-1.5"
              aria-haspopup="true"
              aria-expanded={isActionsMenuOpen}
            >
              <MoreVertIcon className="text-xl sm:text-2xl" />
            </Button>
            {isActionsMenuOpen && (
              <GlassCard
                as="div"
                className="absolute top-full right-0 mt-1 w-48 z-50 p-2 space-y-1"
                role="menu"
                aria-orientation="vertical"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => { onEdit(item); setIsActionsMenuOpen(false); }}
                  className="justify-start text-sm"
                >
                  <PencilIcon className="mr-2 text-lg" /> Bewerken
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => { onDelete(item.id); setIsActionsMenuOpen(false); }}
                  className="justify-start text-sm text-light-danger dark:text-dark-danger"
                >
                  <TrashIcon className="mr-2 text-lg" /> Verwijderen
                </Button>
              </GlassCard>
            )}
          </div>
          <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Details verbergen" : "Details tonen"}
              aria-expanded={expanded}
              title={expanded ? "Details verbergen" : "Details tonen"}
              className="!p-1.5"
          >
              <ChevronDownIcon aria-hidden="true" className={`text-2xl transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
      
      <p className="text-xs font-light text-light-text-secondary dark:text-dark-text-secondary mt-2">
        {getFrequencyLabel(item.frequency as Frequency, 'full')} vanaf {formatDate(item.startDate, { month: 'long', year: 'numeric' })}
      </p>

      <div className={`grid transition-all duration-500 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="mt-4 pt-3 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20 space-y-2 text-sm font-light text-light-text-secondary dark:text-dark-text-secondary">
               {item.notes && item.notes.trim() !== '' ? (
                 <div>
                    <strong className="font-medium text-light-text-primary dark:text-dark-text-primary">Notities:</strong>
                    <p className="whitespace-pre-wrap text-xs bg-light-surface/70 dark:bg-dark-surface/70 border border-light-shadow-dark/20 dark:border-dark-shadow-light/20 p-2 mt-1 rounded-md">{item.notes}</p>
                 </div>
               ) : (
                 <p className="italic text-xs">Geen notities voor dit item.</p>
               )}
            </div>
        </div>
      </div>
    </GlassCard>
  );
};


interface FinancesPageProps {
  incomes: Income[];
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const FinancesPage: React.FC<FinancesPageProps> = (props) => {
  const { theme } = useTheme();

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const handleOpenIncomeModal = (income?: Income) => { setEditingIncome(income); setIsIncomeModalOpen(true); };
  const handleCloseIncomeModal = () => { setEditingIncome(undefined); setIsIncomeModalOpen(false); };
  const handleSubmitIncome = (data: Omit<Income, 'id'> | Income) => {
    if ('id' in data) props.updateIncome(data as Income); else props.addIncome(data as Omit<Income, 'id'>);
    handleCloseIncomeModal();
  };

  const handleOpenExpenseModal = (expense?: Expense) => { setEditingExpense(expense); setIsExpenseModalOpen(true); };
  const handleCloseExpenseModal = () => { setEditingExpense(undefined); setIsExpenseModalOpen(false); };
  const handleSubmitExpense = (data: Omit<Expense, 'id'> | Expense) => {
    if ('id' in data) props.updateExpense(data as Expense); else props.addExpense(data as Omit<Expense, 'id'>);
    handleCloseExpenseModal();
  };
  
  const sortedIncomes = [...props.incomes].sort((a,b) => a.source.localeCompare(b.source));
  const sortedExpenses = [...props.expenses].sort((a,b) => a.category.localeCompare(b.category));


  return (
    <div className="space-y-6 sm:space-y-8 font-light">
      <PageHeader
        title="Financieel Overzicht"
        description={"Geef je geld een doel en bouw aan je dromen."}
        actions={
            <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => handleOpenIncomeModal()} className="text-sm">
                    <PlusCircleIcon className="mr-1.5 sm:mr-2" /> Nieuwe Inkomst
                </Button>
                <Button variant="secondary" onClick={() => handleOpenExpenseModal()} className="text-sm">
                    <PlusCircleIcon className="mr-1.5 sm:mr-2" /> Nieuwe Uitgave
                </Button>
            </div>
        }
        mobileActions={
           <div className="flex w-full sm:w-auto gap-2 flex-shrink-0">
              <Button variant="primary" onClick={() => handleOpenIncomeModal()} className="flex-1 sm:flex-none text-sm">
                <PlusCircleIcon className="mr-1.5 sm:mr-2" /> Nieuwe Inkomst
              </Button>
              <Button variant="secondary" onClick={() => handleOpenExpenseModal()} className="flex-1 sm:flex-none text-sm">
                <PlusCircleIcon className="mr-1.5 sm:mr-2" /> Nieuwe Uitgave
              </Button>
            </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <section aria-labelledby="incomes-heading">
          <h2 id="incomes-heading" className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Inkomsten</h2>
          {sortedIncomes.length === 0 ? (
            <GlassCard className="text-center py-8 sm:py-10">
              <InformationCircleIcon className="text-3xl sm:text-4xl mx-auto text-brand-accent opacity-70 mb-2" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-light">Geen inkomsten toegevoegd.</p>
            </GlassCard>
          ) : (
            sortedIncomes.map(income => (
              <FinancialItemDisplay<Income> key={income.id} item={income} onEdit={handleOpenIncomeModal} onDelete={props.deleteIncome} itemTypeLabel="Bron" itemTypeName="income" />
            ))
          )}
        </section>

        <section aria-labelledby="expenses-heading">
          <h2 id="expenses-heading" className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Uitgaven</h2>
          {sortedExpenses.length === 0 ? (
            <GlassCard className="text-center py-8 sm:py-10">
              <InformationCircleIcon className="text-3xl sm:text-4xl mx-auto text-brand-accent opacity-70 mb-2" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-light">Geen uitgaven toegevoegd.</p>
            </GlassCard>
          ) : (
            sortedExpenses.map(expense => (
              <FinancialItemDisplay<Expense> key={expense.id} item={expense} onEdit={handleOpenExpenseModal} onDelete={props.deleteExpense} itemTypeLabel="Categorie" itemTypeName="expense" />
            ))
          )}
        </section>
      </div>

      <Modal isOpen={isIncomeModalOpen} onClose={handleCloseIncomeModal} title={editingIncome ? 'Inkomst Bewerken' : 'Nieuwe Inkomst'} size="lg">
        <FinancialItemForm<Income> onSubmit={handleSubmitIncome} initialData={editingIncome} onClose={handleCloseIncomeModal} itemTypeLabel="Bron" itemTypeName="income" />
      </Modal>
      <Modal isOpen={isExpenseModalOpen} onClose={handleCloseExpenseModal} title={editingExpense ? 'Uitgave Bewerken' : 'Nieuwe Uitgave'} size="lg">
        <FinancialItemForm<Expense> onSubmit={handleSubmitExpense} initialData={editingExpense} onClose={handleCloseExpenseModal} itemTypeLabel="Categorie" itemTypeName="expense" />
      </Modal>
    </div>
  );
};

export default FinancesPage;