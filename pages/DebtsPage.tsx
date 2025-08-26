

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Debt, Frequency, User, Income, Expense } from '../types';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    InformationCircleIcon,
    ChevronDownIcon,
    MoreVertIcon,
    AttachFileIcon,
    BellAlertIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarDaysIcon,
    ListBulletIcon,
    CheckCircleIcon,
    PublicIcon,
    RepeatIcon
} from '../components/ui/Icons';
import { calculateTotalPaidForDebt, formatDate, formatCurrency, getFrequencyLabel } from '../utils/helpers';
import { DebtForm, DebtFormInitialData } from '../components/forms/DebtForm'; 
import PageHeader from '@/components/ui/PageHeader';
import SuccessAnimation from '@/components/ui/SuccessAnimation';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { GoogleGenAI, Part } from '@google/genai';
import { debtScanSchema } from '@/utils/ai/prompts';
import { constructDataContext } from '@/utils/ai/handlers';
import AttachmentChoiceModal from '@/components/ai/AttachmentChoiceModal';
import CameraModal from '@/components/ai/CameraModal';
import ParseEmailModal from '@/components/ai/ParseEmailModal';
import AnalysisProgressModal from '@/components/ai/AnalysisProgressModal';


interface DebtsPageProps {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'isPaidOff'>) => Promise<void>;
  updateDebt: (debt: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  currentUser: User | null;
  incomes: Income[];
  expenses: Expense[];
}

const PaymentPlanDisplay: React.FC<{ debt: Debt }> = ({ debt }) => {
    if (debt.isPaidOff) {
        return (
            <GlassCard className="p-2 sm:p-3 text-center" pressed>
                 <p className="text-sm font-medium text-light-success dark:text-dark-success flex items-center justify-center">
                    <CheckCircleIcon className="text-lg mr-1.5" /> Volledig afbetaald!
                </p>
            </GlassCard>
        );
    }
    
    if (!debt.paymentPlan) {
         return (
            <div className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary py-8">
                Geen betalingsregeling ingesteld.
            </div>
        );
    }
    
    const { paymentPlan, totalAmount } = debt;
    const installments = paymentPlan.frequency === Frequency.MANUAL ? 1 : (paymentPlan.amount > 0 ? Math.ceil(totalAmount / paymentPlan.amount) : 0);

    return (
        <GlassCard pressed className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 items-center">
                <div className="text-center">
                    <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Bedrag p/keer</label>
                    <div className="flex items-center justify-center mt-1">
                        <span className="text-3xl font-bold text-brand-accent mr-1">€</span>
                        <div className="text-4xl font-bold text-brand-accent">
                            <AnimatedNumber targetValue={paymentPlan.amount || 0} />
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Aantal termijnen</label>
                    <div className="flex items-center justify-center">
                        <div className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
                             <AnimatedNumber targetValue={installments || 0} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-light-shadow-dark/10 dark:border-dark-shadow-light/10 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                 <div className="flex items-center">
                    <RepeatIcon className="text-base mr-2 text-brand-accent" />
                    <span>Frequentie: <strong className="text-light-text-primary dark:text-dark-text-primary">{getFrequencyLabel(paymentPlan.frequency, 'full')}</strong></span>
                </div>
                <div className="flex items-center">
                    <CalendarDaysIcon className="text-base mr-2 text-brand-accent" />
                    <span>Startdatum: <strong className="text-light-text-primary dark:text-dark-text-primary">{formatDate(paymentPlan.startDate)}</strong></span>
                </div>
            </div>
        </GlassCard>
    );
};

const DebtItem: React.FC<{
    debt: Debt;
    onEdit: (debt: Debt) => void;
    onDelete: (id: string) => void;
    onAddPaymentPlan: (debt: Debt) => void;
}> = ({ debt, onEdit, onDelete, onAddPaymentPlan }) => {
  const [expanded, setExpanded] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'contact' | 'regeling' | 'description'>('regeling');
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const totalPaid = calculateTotalPaidForDebt(debt);
  const remainingAmount = debt.totalAmount - totalPaid;
  const progressPercent = debt.totalAmount > 0 ? Math.min(100, (totalPaid / debt.totalAmount) * 100) : 0;

  const TABS = [
    { id: 'regeling', label: 'Regeling' },
    { id: 'details', label: 'Details' },
    { id: 'contact', label: 'Contact' },
    { id: 'description', label: 'Omschrijving' },
  ];

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
        className={`relative transition-all duration-300 ease-in-out ${isActionsMenuOpen ? 'z-20' : 'z-0'}`}
        pressed={debt.isPaidOff}
        aria-labelledby={`debt-title-${debt.id}`}
    >
      <div className="flex flex-row justify-between items-start">
        <div className="flex-grow pr-2">
            <h3 id={`debt-title-${debt.id}`} className={`font-bold ${debt.isPaidOff ? 'line-through text-light-text-secondary dark:text-dark-text-secondary' : 'text-light-text-primary dark:text-dark-text-primary'}`}>{debt.creditorName}</h3>
            {debt.isPaidOff ? (
                <p className="text-2xl font-bold mt-1 text-light-success dark:text-dark-success">
                    Afbetaald
                </p>
            ) : (
                <p className="text-2xl font-bold mt-1 text-brand-accent">
                    {formatCurrency(remainingAmount)}
                </p>
            )}
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
                className="absolute top-full right-0 mt-1 w-56 z-50 p-2 space-y-1"
                role="menu"
                aria-orientation="vertical"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => { onEdit(debt); setIsActionsMenuOpen(false); }}
                  className="justify-start text-sm"
                >
                  <PencilIcon className="mr-2 text-lg" /> Bewerken
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => { onDelete(debt.id); setIsActionsMenuOpen(false); }}
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

      <div className="mt-3">
            <div className="w-full h-5 sm:h-6 rounded-neumorphic bg-black/10 dark:bg-white/10 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 bottom-0 bg-brand-accent h-full rounded-neumorphic transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(0, Math.min(progressPercent, 100))}%` }}
                >
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className={`text-xs sm:text-sm font-medium ${progressPercent > 50 ? 'text-white/90' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                        {progressPercent.toFixed(1)}%
                    </span>
                </div>
            </div>
            <div className="flex justify-between text-xs mt-1.5 sm:mt-2 text-light-text-secondary dark:text-dark-text-secondary font-light">
                <span>Betaald: {formatCurrency(totalPaid)}</span>
                <span>Nog: {formatCurrency(remainingAmount)}</span>
            </div>
      </div>

      {!debt.isPaidOff && !debt.paymentPlan && (
          <GlassCard
              interactive
              onClick={() => onAddPaymentPlan(debt)}
              className="!p-2 !py-1.5 mt-3 flex items-center"
              aria-label="Voeg betaalafspraak toe"
          >
              <BellAlertIcon className="text-lg mr-2 text-brand-accent" />
              <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">
                  Voeg betaalafspraak toe
              </p>
          </GlassCard>
      )}

<div className={`grid transition-all duration-500 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
    {/* De 'mt-4' is hier weggehaald */}
    <div className={`overflow-hidden ${expanded ? 'p-4 -m-4' : ''}`}> 
        {/* De 'mt-4' is hier toegevoegd */}
        <div className="mt-4 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20">
                {/* Tab Buttons */}
                <div className="flex border-b border-light-shadow-dark/10 dark:border-dark-shadow-light/10 mb-3 text-sm -mx-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`tabpanel-${debt.id}-${tab.id}`}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-3 py-1.5 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 rounded-t-md ${
                            activeTab === tab.id
                                ? 'border-b-2 border-brand-accent text-brand-accent'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent/80 border-b-2 border-transparent'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="py-1">
                     {activeTab === 'regeling' && (
                        <div role="tabpanel" id={`tabpanel-${debt.id}-regeling`} className="space-y-3">
                           <PaymentPlanDisplay debt={debt} />
                        </div>
                    )}
                    {activeTab === 'details' && (
                        <div role="tabpanel" id={`tabpanel-${debt.id}-details`} className="space-y-2 text-sm font-light text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="grid grid-cols-1 gap-y-2 pt-2">
                                <div className="flex items-center"><ListBulletIcon className="mr-2 text-brand-accent text-sm" /><strong>Startdatum schuld:</strong><span className="ml-auto">{formatDate(debt.startDate)}</span></div>
                                {debt.dossierNumber && <div className="flex items-center"><ListBulletIcon className="mr-2 text-brand-accent text-sm" /><strong>Dossiernr:</strong><span className="ml-auto">{debt.dossierNumber}</span></div>}
                                {debt.beneficiaryName && <div className="flex items-center"><UserIcon className="mr-2 text-brand-accent text-sm" /><strong>T.n.v.:</strong><span className="ml-auto">{debt.beneficiaryName}</span></div>}
                                {debt.accountNumber && <div className="flex items-center"><ListBulletIcon className="mr-2 text-brand-accent text-sm" /><strong>Rekeningnr:</strong><span className="ml-auto">{debt.accountNumber}</span></div>}
                                {debt.paymentReference && <div className="flex items-center"><ListBulletIcon className="mr-2 text-brand-accent text-sm" /><strong>Betalingskenmerk:</strong><span className="ml-auto text-right">{debt.paymentReference}</span></div>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'contact' && (
                        <div role="tabpanel" id={`tabpanel-${debt.id}-contact`}>
                            {(debt.contactPerson || debt.email || debt.phone || debt.website) ? (
                                <GlassCard className="p-3 space-y-2 text-sm" pressed>
                                    {debt.contactPerson && <p className="flex items-center"><UserIcon className="mr-2 text-brand-accent text-base"/>Contact: {debt.contactPerson}</p>}
                                    {debt.email && <p className="flex items-center"><EnvelopeIcon className="mr-2 text-brand-accent text-base"/>E-mail: <a href={`mailto:${debt.email}`} className="text-brand-accent hover:underline ml-1 truncate">{debt.email}</a></p>}
                                    {debt.phone && <p className="flex items-center"><PhoneIcon className="mr-2 text-brand-accent text-base"/>Telefoon: <a href={`tel:${debt.phone}`} className="text-brand-accent hover:underline ml-1">{debt.phone}</a></p>}
                                    {debt.website && <p className="flex items-center"><PublicIcon className="mr-2 text-brand-accent text-base"/>Website: <a href={debt.website} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline ml-1 truncate">{debt.website}</a></p>}
                                </GlassCard>
                            ) : (
                                <div className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary py-8">Geen contactgegevens beschikbaar.</div>
                            )}
                        </div>
                    )}
                    {activeTab === 'description' && (
                         <div role="tabpanel" id={`tabpanel-${debt.id}-description`} className="space-y-3">
                            <GlassCard pressed className="p-3">
                                <p className="text-sm font-light whitespace-pre-wrap">{debt.description || 'Geen omschrijving beschikbaar.'}</p>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

    </GlassCard>
  );
};


const DebtsPage: React.FC<DebtsPageProps> = ({ debts, addDebt, updateDebt, deleteDebt, currentUser, incomes, expenses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtFormInitialData | undefined>(undefined);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [debtForPaymentPlan, setDebtForPaymentPlan] = useState<Debt | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  // AI Import State
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [isAttachmentChoiceModalOpen, setIsAttachmentChoiceModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isParseEmailModalOpen, setIsParseEmailModalOpen] = useState(false);
  const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null) as React.RefObject<HTMLVideoElement>;
  const canvasRef = useRef<HTMLCanvasElement>(null) as React.RefObject<HTMLCanvasElement>;
  const streamRef = useRef<MediaStream | null>(null);

  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (API_KEY) {
      try {
        setAi(new GoogleGenAI({ apiKey: API_KEY }));
      } catch (e: any) {
        console.error("Failed to initialize GoogleGenAI:", e);
        setAnalysisError("AI initialisatie mislukt.");
      }
    } else {
        setAnalysisError("API Key niet gevonden.");
    }
  }, [API_KEY]);

  const handleOpenModal = (debt?: DebtFormInitialData) => {
    setEditingDebt(debt);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingDebt(undefined);
    setIsModalOpen(false);
    setIsSuccess(false);
  };
  
  const handleOpenPaymentPlanModal = (debt: Debt) => {
    setDebtForPaymentPlan({ ...debt, paymentPlan: debt.paymentPlan || { amount: 0, frequency: Frequency.MONTHLY, startDate: new Date().toISOString().split('T')[0] } });
    setIsSuccess(false);
    setIsPaymentPlanModalOpen(true);
  };

  const handleClosePaymentPlanModal = () => {
    setDebtForPaymentPlan(undefined);
    setIsPaymentPlanModalOpen(false);
    setIsSuccess(false);
  };

  const handleImportDebt = () => {
    setAnalysisError(null);
    setIsAttachmentChoiceModalOpen(true);
  };
  
  const handleCloseAnalysisModal = () => {
    setIsAnalyzingModalOpen(false);
    setAnalysisError(null);
  }

  const handleSubmitDebt = async (data: Omit<Debt, 'id' | 'isPaidOff'> | Debt) => {
    if ('id' in data) {
      await updateDebt(data as Debt);
    } else {
      await addDebt(data as Omit<Debt, 'id' | 'isPaidOff'>);
    }
    setIsSuccess(true);
  };
  
  // --- AI Document Processing Logic ---

  const handleProcessDocument = async (analysisInput: { mimeType: string, data: string } | { text: string }) => {
    if (!ai) {
        setAnalysisError("AI client is niet geïnitialiseerd.");
        setIsAnalyzingModalOpen(true); // Open modal to show error
        return;
    }
    setAnalysisError(null);
    setIsAnalyzingModalOpen(true);
    
    try {
        const dataContext = constructDataContext(currentUser, debts, incomes, expenses);
        
        const promptInstruction = 'text' in analysisInput 
            ? `Analyseer deze e-mail en extraheer de gegevens. Retourneer dit als een JSON-object volgens de 'Action Flow'-structuur.`
            : `Analyseer dit document en extraheer de gegevens. Retourneer dit als een JSON-object volgens de 'Action Flow'-structuur.`;
        
        const fullPrompt = `Hier is de huidige data context:\n${JSON.stringify(dataContext)}\n\n${promptInstruction}\n\n${'text' in analysisInput ? `E-mail tekst:\n${analysisInput.text}` : ''}`;
        
        let contents: { parts: Part[] };
        const textPart: Part = { text: fullPrompt };

        if ('mimeType' in analysisInput) {
             const imagePart: Part = { inlineData: { mimeType: analysisInput.mimeType, data: analysisInput.data } };
             contents = { parts: [textPart, imagePart] };
        } else {
             contents = { parts: [textPart] };
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { responseMimeType: "application/json", responseSchema: debtScanSchema }
        });

        const responseText = response.text ?? '';
        const structuredAction = JSON.parse(responseText.trim());
        const payload = structuredAction?.payload;

        const isValid = payload &&
                        payload.creditorName &&
                        payload.totalAmount > 0 &&
                        (payload.dossierNumber || payload.paymentReference);

        if (structuredAction?.action === 'propose_add_debt' && isValid) {
            setIsAnalyzingModalOpen(false); // Close progress modal on success
            handleOpenModal(payload as DebtFormInitialData);
        } else {
            throw new Error("Onvoldoende informatie gevonden. Zorg ervoor dat de schuldeiser, het bedrag en een dossier- of factuurnummer zichtbaar zijn.");
        }
    } catch (e: any) {
        console.error("Error during document analysis:", e);
        setAnalysisError(e.message || "Fout bij analyseren van het document.");
    }
  };
  
  // Verwijderd: ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES (werden niet meer gebruikt)

  // handleFileChange verwijderd omdat het niet meer gebruikt wordt


  const handleEmailParse = async (emailText: string) => {
    await handleProcessDocument({ text: emailText });
  };
  
  // --- Camera Logic ---
  const startCamera = useCallback(async () => {
    try {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } }
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
    } catch (err) {
        console.error("Camera error:", err);
        setAnalysisError("Kon camera niet starten. Controleer permissies.");
        setIsCameraModalOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    if (isCameraModalOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isCameraModalOpen, startCamera, stopCamera]);

  const handleCameraCapture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          if (context) {
              context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
              const dataUrl = canvas.toDataURL('image/jpeg');
              const base64String = dataUrl.split(',')[1];
              setIsCameraModalOpen(false);
              handleProcessDocument({ mimeType: 'image/jpeg', data: base64String });
          }
      }
  };


  const activeDebts = useMemo(() => debts.filter(d => !d.isPaidOff).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [debts]);
  const paidDebts = useMemo(() => debts.filter(d => d.isPaidOff).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [debts]);

  const createColumns = (debtList: Debt[]) => {
    const left: Debt[] = [];
    const right: Debt[] = [];
    debtList.forEach((debt, index) => {
      if (index % 2 === 0) {
        left.push(debt);
      } else {
        right.push(debt);
      }
    });
    return [left, right];
  };

  const activeDebtColumns = useMemo(() => createColumns(activeDebts), [activeDebts]);
  const paidDebtColumns = useMemo(() => createColumns(paidDebts), [paidDebts]);

  return (
    <div className="space-y-6 sm:space-y-8 font-light">
      <PageHeader
        title="Schuldoverzicht"
        description={"Overwin je schulden, stap voor stap."}
        actions={
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleImportDebt} className="text-sm py-2 sm:py-2.5 flex-shrink-0">
                    <AttachFileIcon className="text-lg sm:text-xl mr-1 sm:mr-2" />
                    Importeer Schuld
                </Button>
                <Button variant="primary" onClick={() => handleOpenModal()} className="text-sm py-2 sm:py-2.5 flex-shrink-0">
                    <PlusCircleIcon className="text-lg sm:text-xl mr-1 sm:mr-2" />
                    Nieuwe Schuld
                </Button>
            </div>
        }

        mobileActions={
             <div className="flex w-full sm:w-auto gap-2 flex-shrink-0">
                <Button variant="secondary" onClick={handleImportDebt} className="flex-1 sm:flex-none text-sm">
                    <AttachFileIcon className="mr-1.5 sm:mr-2" />
                    Importeer
                </Button>
                <Button variant="primary" onClick={() => handleOpenModal()} className="flex-1 sm:flex-none text-sm">
                    <PlusCircleIcon className="mr-1.5 sm:mr-2" />
                    Nieuw
                </Button>
            </div>
        }
      />
      
      {debts.length === 0 && !isAnalyzingModalOpen ? (
         <GlassCard className="text-center py-10 sm:py-12">
            <InformationCircleIcon className="text-3xl sm:text-4xl mx-auto text-brand-accent opacity-70 mb-2" />
            <p className="text-light-text-primary dark:text-dark-text-primary text-sm sm:text-base font-light">Je hebt nog geen schulden toegevoegd.</p>
            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 font-light">Klik op "Nieuwe Schuld" om te beginnen.</p>
        </GlassCard>
      ) : (
        <div className="space-y-8">
            {activeDebts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Actieve Schulden</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-4 sm:gap-6">
                  <div className="space-y-4 sm:space-y-6">
                    {activeDebtColumns[0].map(debt => <DebtItem key={debt.id} debt={debt} onEdit={() => handleOpenModal(debt)} onDelete={deleteDebt} onAddPaymentPlan={handleOpenPaymentPlanModal} />)}
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    {activeDebtColumns[1].map(debt => <DebtItem key={debt.id} debt={debt} onEdit={() => handleOpenModal(debt)} onDelete={deleteDebt} onAddPaymentPlan={handleOpenPaymentPlanModal} />)}
                  </div>
                </div>
              </section>
            )}

            {paidDebts.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Afbetaalde Schulden</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-4 sm:gap-6">
                        <div className="space-y-4 sm:space-y-6">
                            {paidDebtColumns[0].map(debt => <DebtItem key={debt.id} debt={debt} onEdit={() => handleOpenModal(debt)} onDelete={deleteDebt} onAddPaymentPlan={handleOpenPaymentPlanModal} />)}
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                            {paidDebtColumns[1].map(debt => <DebtItem key={debt.id} debt={debt} onEdit={() => handleOpenModal(debt)} onDelete={deleteDebt} onAddPaymentPlan={handleOpenPaymentPlanModal} />)}
                        </div>
                    </div>
                </section>
            )}
        </div>
      )}

      <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title={isSuccess ? "Gelukt!" : (editingDebt && 'id' in editingDebt ? `Schuld Bewerken: ${(editingDebt as Debt).creditorName}` : 'Nieuwe Schuld Toevoegen')} 
          size={isSuccess ? 'sm' : '2xl'}
      >
        {isSuccess ? (
            <SuccessAnimation />
        ) : (
            <DebtForm
                onSubmit={handleSubmitDebt}
                initialData={editingDebt}
                onClose={handleCloseModal}
                mode="full"
            />
        )}
      </Modal>

      <Modal 
        isOpen={isPaymentPlanModalOpen} 
        onClose={handleClosePaymentPlanModal} 
        title={isSuccess ? "Gelukt!" : `Betaalafspraak: ${debtForPaymentPlan?.creditorName}`} 
        size={isSuccess ? 'sm' : '2xl'}
      >
        {isSuccess ? (
            <SuccessAnimation />
        ) : (
            debtForPaymentPlan && (
                <DebtForm
                    onSubmit={handleSubmitDebt}
                    initialData={debtForPaymentPlan}
                    onClose={handleClosePaymentPlanModal}
                    mode="planOnly"
                />
            )
        )}
      </Modal>
      
      {/* Verborgen file input voor upload, alleen getriggerd door modal */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,application/pdf"
        style={{ display: 'none' }}
        tabIndex={-1}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (fileInputRef.current) fileInputRef.current.value = "";
          if (!file) return;
          try {
            const reader = new FileReader();
            reader.onload = async () => {
              const base64String = reader.result?.toString().split(',')[1] || '';
              await handleProcessDocument({ mimeType: file.type, data: base64String });
            };
            reader.onerror = (error) => {
              setAnalysisError(`Fout bij lezen van bestand: ${error}`);
              setIsAnalyzingModalOpen(true);
            };
            reader.readAsDataURL(file);
          } catch (e: any) {
            setAnalysisError(`Fout bij lezen van bestand: ${e.message}`);
            setIsAnalyzingModalOpen(true);
          }
        }}
      />
      <AttachmentChoiceModal
        isOpen={isAttachmentChoiceModalOpen}
        onClose={() => setIsAttachmentChoiceModalOpen(false)}
        onFileSelect={() => fileInputRef.current?.click()}
        onCameraSelect={() => setIsCameraModalOpen(true)}
        onEmailSelect={() => setIsParseEmailModalOpen(true)}
      />
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
      <ParseEmailModal
        isOpen={isParseEmailModalOpen}
        onClose={() => setIsParseEmailModalOpen(false)}
        onSubmit={handleEmailParse}
      />
      <AnalysisProgressModal 
        isOpen={isAnalyzingModalOpen}
        onClose={handleCloseAnalysisModal}
        error={analysisError}
      />

    </div>
  );
};

export default DebtsPage;