import React, { useState, useEffect, useCallback } from 'react';
import { UpcomingPaymentItem, Debt } from '@/types';
import Modal from './Modal';
import GlassCard from './GlassCard';
import Button from './Button';
import { formatCurrency, formatDate } from '@/utils/helpers';
import {
  CheckCircleIcon,
  InformationCircleIcon,
  ListBulletIcon,
  BanknotesIcon,
  UserIcon,
  WarningIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './Icons';

interface PaymentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  items: UpcomingPaymentItem[];
  selectedItem: UpcomingPaymentItem | null;
  allDebts: Debt[];
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | undefined }> = ({ icon, label, value }) => {
    if (!value || value.trim() === '') return null;
    return (
        <div className="flex items-start py-2.5">
            <span className="text-brand-accent mr-3 mt-0.5 text-lg flex-shrink-0">{icon}</span>
            <div>
                <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
                <p className="text-sm text-light-text-primary dark:text-dark-text-primary break-words">{value}</p>
            </div>
        </div>
    );
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ isOpen, onClose, items, selectedItem, allDebts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && items.length > 0 && selectedItem) {
      const initialIndex = items.findIndex(item => 
        item.debtId === selectedItem.debtId && 
        item.dueDate === selectedItem.dueDate && 
        item.paymentAmount === selectedItem.paymentAmount
      );
      setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
    }
  }, [isOpen, items, selectedItem]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prevIndex => Math.min(items.length - 1, prevIndex + 1));
  }, [items.length]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (items.length <= 1) return;
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || items.length <= 1) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
  
    if (diff > 50) { // Swiped left
      handleNext();
    } else if (diff < -50) { // Swiped right
      handlePrevious();
    }
    setTouchStart(null);
  };

  const paymentItem = items.length > 0 ? items[currentIndex] : null;
  const debt = paymentItem ? allDebts.find(d => d.id === paymentItem.debtId) : null;

  if (!isOpen || !paymentItem || !debt) {
    return null;
  }

  const isPaid = paymentItem.isPaid ?? false;
  const isOverdue = !isPaid && new Date(paymentItem.dueDate.replace(/-/g, '/')) < new Date('2025-07-20T12:00:00Z');

  const status = isPaid
    ? { text: 'Betaald', icon: <CheckCircleIcon className="text-light-success dark:text-dark-success" />, color: 'text-light-success dark:text-dark-success' }
    : isOverdue
    ? { text: 'Te Laat', icon: <WarningIcon className="text-light-danger dark:text-dark-danger" />, color: 'text-light-danger dark:text-dark-danger' }
    : { text: 'Openstaand', icon: <InformationCircleIcon className="text-brand-accent" />, color: 'text-brand-accent' };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Details Betaling: ${debt.creditorName}`} size="md">
        <div 
          className="font-light"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
            {items.length > 1 && (
                <div className="flex items-center justify-between mb-3 p-1 bg-black/5 dark:bg-white/5 rounded-neumorphic">
                    <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={currentIndex === 0} className="!p-2">
                        <ChevronLeftIcon className="text-xl"/>
                    </Button>
                    <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        {currentIndex + 1} / {items.length}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleNext} disabled={currentIndex === items.length - 1} className="!p-2">
                        <ChevronRightIcon className="text-xl"/>
                    </Button>
                </div>
            )}
            <div key={currentIndex} className="space-y-4 animate-content-fade-in">
                <GlassCard pressed className="text-center p-4">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Bedrag</p>
                    <p className="text-4xl font-bold text-brand-accent my-1">{formatCurrency(paymentItem.paymentAmount)}</p>
                    <div className={`flex items-center justify-center text-sm font-medium ${status.color}`}>
                        {React.cloneElement(status.icon, { className: 'mr-1.5 text-lg' })}
                        <span>{status.text} op {formatDate(paymentItem.dueDate)}</span>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Betaalgegevens</h3>
                    <div className="divide-y divide-light-shadow-dark/10 dark:divide-dark-shadow-light/10">
                        <InfoRow icon={<UserIcon />} label="T.n.v. (Begunstigde)" value={debt.beneficiaryName} />
                        <InfoRow icon={<BanknotesIcon />} label="Rekeningnummer (IBAN)" value={debt.accountNumber} />
                        <InfoRow icon={<ListBulletIcon />} label="Betalingskenmerk" value={debt.paymentReference} />
                        <InfoRow icon={<ListBulletIcon />} label="Dossiernummer" value={debt.dossierNumber} />
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Omschrijving Schuld</h3>
                    <p className="text-sm whitespace-pre-wrap text-light-text-secondary dark:text-dark-text-secondary">{debt.description || 'Geen omschrijving beschikbaar.'}</p>
                </GlassCard>
            </div>
             <style>{`
                @keyframes content-fade-in {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-content-fade-in {
                  animation: content-fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    </Modal>
  );
};

export default PaymentDetails;