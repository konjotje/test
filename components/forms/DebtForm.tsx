

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Debt, Frequency, PaymentPlan } from '../../types';
import GlassCard from '@/components/ui/GlassCard';
import Button from '../ui/Button';
import Input, { TextArea } from '../ui/Input';
import DatePickerInput from '../ui/DatePickerInput';
import Select from '../ui/Select';
import {
    CurrencyDollarIcon,
    BanknotesIcon,
    ListBulletIcon,
    CalendarDaysIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    PublicIcon,
    ArrowForwardIcon,
    ArrowBackIcon,
    ApartmentIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    RepeatIcon
} from '../ui/Icons';
import { getFrequencyLabel } from '../../utils/helpers';
import AnimatedNumber from '../ui/AnimatedNumber';

const frequencyOptions = [
  { value: Frequency.MONTHLY, label: getFrequencyLabel(Frequency.MONTHLY, 'full') },
  { value: Frequency.MANUAL, label: "Eenmalig" },
];

export type DebtFormData = Omit<Debt, 'id' | 'isPaidOff'>;

export const initialDebtFormDataBase: DebtFormData = {
  creditorName: '',
  beneficiaryName: '',
  totalAmount: 0,
  startDate: new Date().toISOString().split('T')[0],
  description: '',
  dossierNumber: '',
  accountNumber: '',
  paymentReference: '',
  paymentPlan: undefined,
  contactPerson: '',
  email: '',
  phone: '',
  website: '',
};

export type DebtFormInitialData = Debt | Partial<DebtFormData>;


interface DebtFormProps {
    onSubmit: (data: DebtFormData | Debt) => void;
    initialData?: DebtFormInitialData;
    onClose: () => void;
    mode?: 'full' | 'planOnly';
}

const STEPS = [
  { id: 1, title: 'Basisgegevens' }, // Basic Info
  { id: 2, title: 'Betaalinformatie' },         // Payment Details
  { id: 3, title: 'Contact' }, // Contact Info
  { id: 4, title: 'Betalingsregeling' }, // Payment Plan
];

export const DebtForm: React.FC<DebtFormProps> = ({ onSubmit, initialData: propInitialData, onClose, mode = 'full' }) => {
    const [currentStep, setCurrentStep] = useState(mode === 'planOnly' ? 4 : 1);

    const {
        formData: initialFormData,
        existingDebtMeta: initialExistingDebtMeta,
        isPaymentPlanActive: initialIsPaymentPlanActive,
        installments: initialInstallments,
    } = useMemo(() => {
        const base = { ...initialDebtFormDataBase };
        let newFormData: DebtFormData;
        let newMeta: { id: string; isPaidOff: boolean; } | null = null;
        let planIsInitiallyActive = true; 
        
        if (propInitialData) {
            if ('id' in propInitialData && typeof (propInitialData as Debt).id === 'string') {
                const existingDebt = propInitialData as Debt;
                const { id, isPaidOff, ...formFieldsFromExistingDebt } = existingDebt;
                newFormData = { ...base, ...formFieldsFromExistingDebt };
                newMeta = { id, isPaidOff };
                planIsInitiallyActive = !!newFormData.paymentPlan;
            } else {
                newFormData = { ...base, ...(propInitialData as Partial<DebtFormData>) };
                planIsInitiallyActive = mode === 'planOnly' || !!newFormData.paymentPlan;
            }
        } else {
            newFormData = base;
            planIsInitiallyActive = true;
        }
        
        if (planIsInitiallyActive && !newFormData.paymentPlan) {
            newFormData.paymentPlan = {
                amount: newFormData.totalAmount,
                frequency: Frequency.MANUAL,
                startDate: new Date().toISOString().split('T')[0]
            };
        }
        
        let calculatedInstallments: number | '' = '';
        if (newFormData.paymentPlan) {
            if(newFormData.paymentPlan.frequency === Frequency.MANUAL){
                calculatedInstallments = 1;
            } else if (newFormData.totalAmount > 0 && newFormData.paymentPlan.amount > 0) {
                calculatedInstallments = Math.ceil(newFormData.totalAmount / newFormData.paymentPlan.amount);
            } else {
                calculatedInstallments = 0;
            }
        } else {
            calculatedInstallments = 0;
            planIsInitiallyActive = false;
        }

        return {
            formData: newFormData,
            existingDebtMeta: newMeta,
            isPaymentPlanActive: planIsInitiallyActive,
            installments: calculatedInstallments,
        };
    }, [propInitialData, mode]);

    const [formData, setFormData] = useState(initialFormData);
    const [existingDebtMeta, setExistingDebtMeta] = useState(initialExistingDebtMeta);
    const [isPaymentPlanActive, setIsPaymentPlanActive] = useState(initialIsPaymentPlanActive);
    const [installments, setInstallments] = useState<number | ''>(initialInstallments);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        setFormData(initialFormData);
        setExistingDebtMeta(initialExistingDebtMeta);
        setIsPaymentPlanActive(initialIsPaymentPlanActive);
        setInstallments(initialInstallments);
        setFormError(null); // Clear any previous errors
        setCurrentStep(mode === 'planOnly' ? 4 : 1); // Set initial step based on mode
    }, [initialFormData, initialExistingDebtMeta, initialIsPaymentPlanActive, initialInstallments, mode]);

    useEffect(() => {
        if (formData.paymentPlan?.frequency === Frequency.MANUAL) {
            setFormData(prev => ({
                ...prev,
                paymentPlan: { ...(prev.paymentPlan!), amount: prev.totalAmount }
            }));
        }
    }, [formData.totalAmount, formData.paymentPlan?.frequency]);
    
    useEffect(() => {
        const numInstallments = Number(installments);
        if (numInstallments > 0 && !isPaymentPlanActive) {
            setIsPaymentPlanActive(true);
        } else if (numInstallments === 0 && installments !== '' && isPaymentPlanActive) {
            setIsPaymentPlanActive(false);
        }
    }, [installments, isPaymentPlanActive]);

    const updateInstallments = (newInstallments: number | '') => {
        let finalInstallments: number | '' = newInstallments;
        if (typeof newInstallments === 'number') {
            if (newInstallments > 500) finalInstallments = 500;
            if (newInstallments < 0) finalInstallments = 0;
        }
        setInstallments(finalInstallments);

        const numInstallments = Number(finalInstallments);
        if (numInstallments > 0) {
            const newAmount = formData.totalAmount > 0 ? Math.ceil(formData.totalAmount / numInstallments) : 0;
            const newFrequency = numInstallments === 1 ? Frequency.MANUAL : Frequency.MONTHLY;
            setFormData(prev => ({
                ...prev,
                paymentPlan: {
                    ...(prev.paymentPlan || {
                        startDate: new Date().toISOString().split('T')[0],
                    }),
                    amount: newAmount,
                    frequency: newFrequency,
                } as PaymentPlan,
            }));
        }
    };


    const handleInstallmentsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        updateInstallments(val === '' ? '' : parseInt(val, 10));
    };

    const handleInstallmentBlur = () => { if (installments === '') updateInstallments(0) };
    const incrementInstallments = () => updateInstallments(Number(installments || 0) + 1);
    const decrementInstallments = () => updateInstallments(Math.max(0, Number(installments || 1) - 1));

    const handleFrequencyChange = (value: string | number) => {
        const newFrequency = value as (Frequency.MANUAL | Frequency.MONTHLY);
        if (newFrequency === Frequency.MANUAL) { 
            updateInstallments(1);
        } else if (Number(installments) <= 1) { 
            updateInstallments(2);
        } else { 
            setFormData(prev => ({ ...prev, paymentPlan: { ...prev.paymentPlan!, frequency: Frequency.MONTHLY }}));
        }
    };
    
    const handlePlanToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.checked) {
            if(Number(installments) === 0) {
                updateInstallments(1);
            } else {
                setIsPaymentPlanActive(true);
            }
        } else {
            updateInstallments(0);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormError(null);
        let finalValue = type === 'number' ? (value ? parseFloat(value) : 0) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleDateChange = (name: string, date: string) => {
        setFormError(null);
        if (name.startsWith('paymentPlan.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, paymentPlan: { ...(prev.paymentPlan!), [field]: date } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: date }));
        }
    };
    
    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.creditorName || formData.creditorName.trim() === '') {
                setFormError("Naam schuldeiser is verplicht.");
                return;
            }
            if (!formData.totalAmount || formData.totalAmount <= 0) {
                setFormError("Totaalbedrag moet groter zijn dan €0.");
                return;
            }
            if (!formData.startDate) {
                setFormError("Startdatum is verplicht.");
                return;
            }
        }
        setFormError(null);
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        setFormError(null);
        let finalFormFields = { ...formData };
        if (!isPaymentPlanActive) {
            finalFormFields.paymentPlan = null;
        }

        let dataForSubmission: DebtFormData | Debt;
        if (existingDebtMeta) {
            dataForSubmission = { ...existingDebtMeta, ...finalFormFields };
        } else {
            dataForSubmission = finalFormFields;
        }
        
        onSubmit(dataForSubmission);
    };
    
    const inputInCardClassName = "!bg-transparent !border-none !py-2.5 !px-3 focus:!ring-0";

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return ( // Basic Info
                <div className="space-y-3">
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Naam schuldeiser *</label><GlassCard pressed className="flex items-center !p-0"><ApartmentIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="creditorName" name="creditorName" value={formData.creditorName} onChange={handleChange} required placeholder="Bijv. CreditCard Maatschappij" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Totaalbedrag schuld *</label><GlassCard pressed className="flex items-center !p-0"><span className="text-lg font-medium text-brand-accent ml-3 mr-1">€</span><Input id="totalAmount" name="totalAmount" type="number" value={String(formData.totalAmount === 0 ? '' : formData.totalAmount)} onChange={handleChange} required min="0.01" step="0.01" placeholder="2500,00" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Startdatum schuld *</label><GlassCard pressed className="flex items-center !p-0"><CalendarDaysIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><DatePickerInput id="startDate" value={formData.startDate} onChange={(d) => handleDateChange('startDate', d)} required label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={`${inputInCardClassName} cursor-pointer`}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Dossiernummer (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><ListBulletIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="dossierNumber" name="dossierNumber" value={formData.dossierNumber || ''} onChange={handleChange} placeholder="Bijv. CC-2025-12345" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                </div>
            );
            case 4: return ( // Payment Plan
                <div>
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Betalingsregeling</label>
                    <GlassCard pressed className="p-3 space-y-3">
                        <label className="flex items-center justify-between cursor-pointer"><span className="font-medium text-light-text-primary dark:text-dark-text-primary">Regeling actief</span><div className="relative"><input type="checkbox" checked={isPaymentPlanActive} onChange={handlePlanToggle} className="sr-only peer" /><div className="block bg-black/10 dark:bg-white/10 w-10 h-6 rounded-full peer-checked:bg-brand-accent/30"></div><div className="dot absolute left-1 top-1 bg-white dark:bg-dark-surface w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-brand-accent"></div></div></label>
                        <div className={`space-y-4 pt-3 border-t border-light-shadow-dark/10 dark:border-dark-shadow-light/10 transition-opacity duration-300 ${isPaymentPlanActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <div className="grid grid-cols-2 gap-3 items-center"><div className="text-center"><label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Bedrag p/keer</label><div className="flex items-center justify-center mt-1"><span className="text-4xl font-bold text-brand-accent mr-1">€</span><div className="text-6xl font-bold text-brand-accent"><AnimatedNumber targetValue={formData.paymentPlan?.amount || 0} /></div></div></div><div className="text-center"><label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Aantal termijnen</label><div className="flex items-center justify-center"><Button type="button" variant="ghost" className="!p-1 rounded-full" onClick={decrementInstallments}><ChevronLeftIcon className="text-2xl" /></Button><input type="number" value={installments} onChange={handleInstallmentsInputChange} onBlur={handleInstallmentBlur} min="0" max="500" className="text-6xl font-bold text-light-text-primary dark:text-dark-text-primary bg-transparent border-none focus:ring-0 focus:outline-none w-24 text-center p-0 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /><Button type="button" variant="ghost" className="!p-1 rounded-full" onClick={incrementInstallments}><ChevronRightIcon className="text-2xl" /></Button></div></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select icon={<RepeatIcon />} label="Frequentie" options={frequencyOptions} value={formData.paymentPlan?.frequency || Frequency.MONTHLY} onChange={handleFrequencyChange} />
                                <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Datum</label><GlassCard pressed className="flex items-center !p-0"><CalendarDaysIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><DatePickerInput id="paymentPlan.startDate" value={formData.paymentPlan?.startDate || ''} onChange={(d) => handleDateChange('paymentPlan.startDate', d)} required label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={`${inputInCardClassName} cursor-pointer`}/></GlassCard></div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            );
            case 2: return ( // Payment Details
                <div className="space-y-3">
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Naam begunstigde (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><UserIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="beneficiaryName" name="beneficiaryName" value={formData.beneficiaryName || ''} onChange={handleChange} placeholder="Naam zoals op bankrekening" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Rekeningnummer (IBAN, optioneel)</label><GlassCard pressed className="flex items-center !p-0"><BanknotesIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="accountNumber" name="accountNumber" value={formData.accountNumber || ''} onChange={handleChange} placeholder="NL20BANK0123456789" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Betalingskenmerk (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><ListBulletIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="paymentReference" name="paymentReference" value={formData.paymentReference || ''} onChange={handleChange} placeholder="Factuurnummer of kenmerk" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Omschrijving (voor bankoverschrijving)</label><GlassCard pressed className="!p-3"><TextArea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={2} placeholder="Omschrijving voor je eigen bankafschrift" label={undefined} containerClassName="!mb-0 w-full" className="!bg-transparent !border-none focus:!ring-0 !p-0"/></GlassCard></div>
                </div>
            );
            case 3: return ( // Contact Info
                <div className="space-y-3">
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Contactpersoon (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><UserIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder="Naam contactpersoon" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">E-mailadres (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><EnvelopeIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="contact@schuldeiser.nl" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Telefoonnummer (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><PhoneIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} placeholder="012-3456789" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                     <div><label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Website (optioneel)</label><GlassCard pressed className="flex items-center !p-0"><PublicIcon className="text-lg ml-3 mr-2 shrink-0 text-brand-accent" /><Input id="website" name="website" type="url" value={formData.website || ''} onChange={handleChange} placeholder="https://www.schuldeiser.nl" label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className={inputInCardClassName}/></GlassCard></div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col font-light">
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    <span>Stap {currentStep} van {STEPS.length}</span>
                    <span className="font-bold">{STEPS[currentStep - 1].title}</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-1.5">
                    <div className="h-full bg-brand-accent rounded-full transition-all duration-300" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
                </div>
            </div>

            <div className="overflow-y-auto mb-3 p-3 pb-6">
                <div className="py-1">
                    {renderStepContent()}
                </div>
            </div>
            
            {formError && <p className="text-sm text-light-danger dark:text-dark-danger bg-light-danger/10 p-3 rounded-md shadow-sm font-light mb-3">{formError}</p>}

            <div className="flex justify-between items-center mt-auto pt-3 border-t border-light-shadow-dark/10 dark:border-dark-shadow-light/10">
                <Button type="button" variant="secondary" onClick={prevStep} disabled={(mode === 'full' && currentStep === 1) || (mode === 'planOnly' && currentStep === 2)}>
                    <ArrowBackIcon className="mr-1" /> Terug
                </Button>
                {currentStep < STEPS.length ? (
                    <Button type="button" variant="primary" onClick={nextStep}> Volgende <ArrowForwardIcon className="ml-1" /> </Button>
                ) : (
                    <Button type="button" variant="primary" onClick={handleSubmit}>Opslaan</Button>
                )}
            </div>
        </form>
    );
};