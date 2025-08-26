
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { Debt, Income, Expense, User } from '@/types'; 
import { useTheme } from '@/contexts/ThemeContext';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { ArrowUpwardIcon, ContentCopyIcon, LightbulbIcon, EnvelopeIcon, AttachFileIcon, CheckCircleIcon, PrintIcon, MicrophoneIcon, CameraIcon } from '@/components/ui/Icons'; 
import ThinkingAnimation from '@/components/ui/ThinkingAnimation'; 
import TypedMessageContent from '@/components/ui/TypedMessageContent';
import { generateId } from '@/utils/helpers';
import { DebtForm, DebtFormInitialData } from '../components/forms/DebtForm';
import FinancialItemForm from '../components/forms/FinancialItemForm';
import Modal from '@/components/ui/Modal';
import { marked } from 'marked';

import { schuldenmaatjeAvatarPath, systemInstruction, debtScanSchema } from '@/utils/ai/prompts';
import { handleStandardMessage, handleFinancialOverview, handleFinancialAnalysis, constructDataContext } from '@/utils/ai/handlers';
import { initializeSpeechRecognition, SpeechRecognition } from '@/utils/ai/speech';
import EmailGeneratorModal from '@/components/ai/EmailGeneratorModal';

import AttachmentChoiceModal from '@/components/ai/AttachmentChoiceModal';
import CameraModal from '@/components/ai/CameraModal';
import ParseEmailModal from '@/components/ai/ParseEmailModal';

interface AIAssistantPageProps {
  currentUser: User | null;
  debts: Debt[];
  incomes: Income[];
  expenses: Expense[];
  addDebt: (debtData: Omit<Debt, 'id' | 'isPaidOff'>) => Promise<void>;
  addIncome: (incomeData: Omit<Income, 'id'>) => Promise<void>;
  addExpense: (expenseData: Omit<Expense, 'id'>) => Promise<void>;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isThinking?: boolean;
  isError?: boolean;
  groundingSources?: { uri: string; title: string }[];
  textSequence?: string[];
  isExportOverview?: boolean;
  isFinancialAnalysis?: boolean;
  isEmail?: boolean;
  emailSubject?: string;
  emailBody?: string;
}

const addThinkingMessage = (setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>, textOrSequence: string | string[] = 'Schuldhulpje is aan het nadenken...') => {
    const isSequence = Array.isArray(textOrSequence);
    const thinkingMsg: ChatMessage = { 
        id: generateId(), 
        text: isSequence ? textOrSequence[0] : textOrSequence, 
        sender: 'ai', 
        timestamp: new Date(), 
        isThinking: true, 
        ...(isSequence && { textSequence: textOrSequence }) 
    };
    setMessages(prev => [...prev, thinkingMsg]);
    return thinkingMsg.id;
};

const removeThinkingMessage = (setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>, thinkingId: string) => {
    setMessages(prev => prev.filter(m => m.id !== thinkingId));
};

const addErrorMessage = (setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>, messageText: string) => {
    setMessages(prev => prev.filter(m => !m.isThinking).concat({ 
        id: generateId(), 
        text: messageText, 
        sender: 'ai', 
        timestamp: new Date(), 
        isError: true 
    }));
};

const AIAssistantPage: React.FC<AIAssistantPageProps> = (props) => {
  const { currentUser, debts, incomes, expenses, addDebt, addIncome, addExpense } = props;
  const { theme } = useTheme();

  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isProcessingSpecialAction, setIsProcessingSpecialAction] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // State for Form Modals
  const [debtFormState, setDebtFormState] = useState<{ isOpen: boolean; initialData?: DebtFormInitialData }>({ isOpen: false });
  const [incomeFormState, setIncomeFormState] = useState<{ isOpen: boolean; initialData?: Partial<Omit<Income, 'id'>> }>({ isOpen: false });
  const [expenseFormState, setExpenseFormState] = useState<{ isOpen: boolean; initialData?: Partial<Omit<Expense, 'id'>> }>({ isOpen: false });

  // State for AI-specific Modals
  const [isEmailGeneratorModalOpen, setIsEmailGeneratorModalOpen] = useState(false);
  const [isAttachmentChoiceModalOpen, setIsAttachmentChoiceModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isParseEmailModalOpen, setIsParseEmailModalOpen] = useState(false);
  
  // State and Refs for Speech Recognition
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Refs for Document Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const API_KEY = import.meta.env.VITE_API_KEY;

  const openFormModal = useCallback((actionType: string, payload: any) => {
    switch (actionType) {
        case 'propose_add_debt':
            setDebtFormState({ isOpen: true, initialData: payload });
            break;
        case 'propose_add_income':
            setIncomeFormState({ isOpen: true, initialData: payload });
            break;
        case 'propose_add_expense':
            setExpenseFormState({ isOpen: true, initialData: payload });
            break;
        default:
             setMessages(prev => [...prev.filter(m => !m.isThinking), { id: generateId(), text: `Onbekende actie '${actionType}' ontvangen van AI.`, sender: 'ai', timestamp: new Date(), isError: true }]);
    }
  }, []);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading || isProcessingSpecialAction || (!chat && !ai)) return;
    setUserInput('');
    const newUserMessage: ChatMessage = { id: generateId(), text: messageText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    const dataContext = constructDataContext(currentUser, debts, incomes, expenses);
    await handleStandardMessage(messageText, chat, ai, dataContext, setMessages, openFormModal);
    setIsLoading(false);
  }, [isLoading, isProcessingSpecialAction, chat, ai, currentUser, debts, incomes, expenses, openFormModal]);

  useEffect(() => {
    if (!API_KEY) { 
        setError("API Key niet gevonden."); 
        setMessages([{ id: 'initial-greeting', text: "Hallo! Configuratiefout (API Key ontbreekt).", sender: 'ai', timestamp: new Date(), isError: true, }]); 
        return; 
    }
    try {
        const genAI = new GoogleGenAI({ apiKey: API_KEY });
        setAi(genAI);
        const newChat = genAI.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
        setChat(newChat);
        if (messages.length === 0) { 
            const userName = currentUser?.firstName || ""; 
            const greeting = `Hallo ${userName || ''}! Ik ben Schuldhulpje, jouw digitale hulp bij je geldzaken. Samen zorgen we voor helder inzicht en een stevig financieel plan. Stel gerust je vragen!`; 
            setMessages([{ id: 'initial-greeting', text: greeting, sender: 'ai', timestamp: new Date() }]); 
        }
    } catch (e: any) { 
        console.error("Fout bij initialiseren Gemini Chat:", e); 
        setError(`Fout bij initialiseren: ${e.message}`); 
        setMessages([{ id: 'initial-greeting', text: `Probleem bij opstarten: ${e.message}`, sender: 'ai', timestamp: new Date(), isError: true, }]); 
    }
  }, [API_KEY, currentUser]);

  useEffect(() => {
    const { supported, recognition } = initializeSpeechRecognition({
        onResult: (finalTranscript, interimTranscript) => {
            setUserInput(finalTranscript + interimTranscript);
        },
        onEnd: (finalTranscript) => {
            setIsListening(false);
            if (finalTranscript.trim()) {
                handleSendMessage(finalTranscript.trim());
            } else {
                setUserInput('');
            }
        },
        onStart: () => {
            setIsListening(true);
            setUserInput('Luisteren...');
        },
        onError: (errorMessage, isPermissionError) => {
            addErrorMessage(setMessages, errorMessage);
            setIsListening(false); 
            setUserInput(''); 
        }
    });
    setSpeechRecognitionSupported(supported);
    recognitionRef.current = recognition;
    
    return () => { recognitionRef.current?.abort(); };
  }, [handleSendMessage]);

  useEffect(() => {
    if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }
  }, [messages]);
  
  const handleToggleListening = () => {
    if (!speechRecognitionSupported || isLoading || isProcessingSpecialAction) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleQuickAction = async (action: 'import' | 'analyse' | 'overzicht' | 'email') => {
    if (isProcessingSpecialAction || isLoading || isListening) return;

    if (action === 'import') {
        setIsAttachmentChoiceModalOpen(true);
        return;
    }

    const dataContext = constructDataContext(currentUser, debts, incomes, expenses);
    setIsProcessingSpecialAction(true);
    switch(action) {
      case 'analyse':
        await handleFinancialAnalysis(chat, dataContext, setMessages);
        break;
      case 'overzicht':
        await handleFinancialOverview(chat, dataContext, setMessages, currentUser);
        break;
      case 'email':
        setIsEmailGeneratorModalOpen(true);
        break;
    }
    if (action !== 'email') {
        setIsProcessingSpecialAction(false);
    }
  };

  const handleCopy = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };
  
  // --- AI Document Processing Logic (for Chat) ---

  const handleProcessDocument = async (analysisInput: { mimeType: string, data: string } | { text: string }) => {
      // This function now processes a single document and should be called iteratively for multiple documents.
    if (!ai) {
        addErrorMessage(setMessages, "AI client is niet geïnitialiseerd.");
        return;
    }

    const thinkingId = addThinkingMessage(setMessages, [ // This will be shown for each document
        'Document scannen...',
        'Gegevens extraheren...',
        'Informatie structureren...',
        'Bijna klaar...',
    ]);
    
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

        removeThinkingMessage(setMessages, thinkingId);

        let structuredAction;
        if (!response.text) {
            throw new Error("AI gaf een leeg antwoord. Probeer het opnieuw.");
        }

        try {
             structuredAction = JSON.parse(response.text.trim());
        } catch (parseError) {
             throw new Error("AI gaf een onverwacht antwoord. Probeer het opnieuw met een duidelijker document.");
        }

        const payload = structuredAction?.payload;
        const isValid = payload &&
                        payload.creditorName &&
                        payload.totalAmount > 0 &&
                        (payload.dossierNumber || payload.paymentReference);

        if (structuredAction?.action === 'propose_add_debt' && isValid) {
             openFormModal('propose_add_debt', payload);
        } else {
             const errorMessage = "Ik kon niet genoeg informatie vinden om een schuld aan te maken. Zorg ervoor dat de schuldeiser, het bedrag en een dossier- of factuurnummer zichtbaar zijn.";
             addErrorMessage(setMessages, errorMessage);
        }

    } catch (e: any) {
        console.error("Error during document analysis:", e);
        removeThinkingMessage(setMessages, thinkingId);
        addErrorMessage(setMessages, e.message || "Fout bij analyseren van het document.");
    }
  };
  
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const MAX_FILE_SIZE_MB = 20;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = ""; // Always reset
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        addErrorMessage(setMessages, `Bestandstype niet toegestaan. Probeer een JPG, PNG, of PDF.`);
        return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        addErrorMessage(setMessages, `Bestand is te groot. Maximumgrootte is ${MAX_FILE_SIZE_MB}MB.`);
        return;
    }
    
    try {
        const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
            reader.onerror = error => reject(error);
        });
        await handleProcessDocument({ mimeType: file.type, data: base64String });
    } catch (e: any) {
        addErrorMessage(setMessages, `Fout bij lezen van bestand: ${e.message}`);
    }
  };


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
        addErrorMessage(setMessages, "Kon camera niet starten. Controleer permissies.");
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


  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,application/pdf" className="hidden" multiple />
      <GlassCard transparencyLevel="high" className="flex flex-col h-full w-full overflow-hidden font-light !p-0">
        <header className="p-3 sm:p-4 flex items-center justify-between sticky top-0 z-10 flex-shrink-0 border-b border-light-shadow-dark/10 dark:border-dark-shadow-light/10">
          <div className="flex items-center">
            <img src={schuldenmaatjeAvatarPath} alt="Schuldhulpje Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg mr-2 sm:mr-3 object-contain bg-light-bg/70 dark:bg-dark-bg/70 p-0.5" />
            <h1 className="text-md sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Schuldhulpje AI</h1>
          </div>
        </header>

        <div ref={chatContainerRef} className="flex-grow min-h-0 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
          {messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;
              const shouldType = isLastMessage && msg.sender === 'ai' && !msg.isThinking && !msg.isError;
              const isCopyable = msg.isExportOverview || msg.isFinancialAnalysis;
              const copyButtonLabel = msg.isExportOverview ? 'Kopieer overzicht' : 'Kopieer analyse';

              return (
                  <div key={msg.id} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col ${msg.sender === 'user' ? 'max-w-[95%]' : 'w-full'} p-2.5 sm:p-3 rounded-2xl text-sm shadow-lg ${msg.sender === 'user' ? 'bg-brand-accent text-white dark:text-dark-text-primary rounded-br-none' : msg.isError ? 'bg-light-danger/20 dark:bg-dark-danger/30 text-light-danger dark:text-dark-danger rounded-bl-none' : 'bg-light-surface/70 dark:bg-dark-surface/70 border border-light-shadow-light/30 dark:border-dark-shadow-light/30 text-light-text-primary dark:text-dark-text-primary rounded-bl-none'}`}>
                          <div className="w-full">
                              {msg.isThinking ? (
                                  <ThinkingAnimation texts={msg.textSequence || [msg.text]} theme={theme} />
                              ) : msg.isEmail ? (
                                <div>
                                  <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }} />
                                  <div className="mt-3 pt-3 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20">
                                      <p className="font-bold text-sm mb-1">Onderwerp: <span className="font-light">{msg.emailSubject}</span></p>
                                      <pre className="text-xs whitespace-pre-wrap font-sans bg-black/5 dark:bg-white/5 p-2 rounded-md font-light">{msg.emailBody}</pre>
                                      <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(msg.emailBody || '')} className="mt-2 text-xs">
                                          <ContentCopyIcon className="mr-1.5" /> Kopieer e-mailtekst
                                      </Button>
                                  </div>
                                </div>
                              ) : shouldType ? (
                                 <TypedMessageContent fullText={msg.text} className="markdown-content" />
                              ) : (
                                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }} />
                              )}
                          </div>
                          {isCopyable && (
                              <div className="w-full flex justify-start mt-2 pt-2 border-t border-light-shadow-dark/10 dark:border-dark-shadow-light/10">
                                  <Button variant="ghost" size="sm" className="!p-1.5 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10" onClick={() => handleCopy(msg.text, msg.id)} aria-label={copyButtonLabel} title={copyButtonLabel}>
                                      {copiedMessageId === msg.id ? <CheckCircleIcon className="text-base text-light-success dark:text-dark-success" /> : <ContentCopyIcon className="text-base" />}
                                  </Button>
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}
        </div>
        
        <div className="flex-shrink-0 p-2 sm:p-3 border-t border-light-shadow-dark/10 dark:border-dark-shadow-light/10">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button variant="secondary" size="sm" onClick={() => handleQuickAction('import')} disabled={isProcessingSpecialAction || isLoading || isListening} className="text-xs">
                <AttachFileIcon className="mr-2 text-lg"/>Importeer
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickAction('email')} disabled={isProcessingSpecialAction || isLoading || isListening} className="text-xs">
                <EnvelopeIcon className="mr-2 text-lg"/>Genereer
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickAction('analyse')} disabled={isProcessingSpecialAction || isLoading || isListening} className="text-xs">
                <LightbulbIcon className="mr-2 text-lg"/>Analyse
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickAction('overzicht')} disabled={isProcessingSpecialAction || isLoading || isListening} className="text-xs">
                <PrintIcon className="mr-2 text-lg"/>Overzicht
            </Button>
          </div>
          <div className="relative flex items-end">
            <TextArea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSendMessage(userInput);}}} placeholder={isListening ? "Luisteren..." : "Typ je bericht..."} className="w-full resize-none p-3 !text-base !rounded-2xl pr-32" containerClassName="!mb-0 flex-grow" rows={2} disabled={isListening || isLoading || isProcessingSpecialAction} />
            <div className="absolute right-3 bottom-2.5 flex flex-row items-center gap-2">
              {speechRecognitionSupported && (<Button onClick={handleToggleListening} disabled={isLoading || isProcessingSpecialAction} variant={'secondary'} className={`h-10 w-10 !p-0 !rounded-full transition-all duration-300 ${isListening ? 'animate-glowing-pulse' : ''}`} aria-label={isListening ? 'Stop met luisteren' : 'Start spraak-naar-tekst'}><MicrophoneIcon className={`text-xl transition-colors duration-300 ${isListening ? '!text-brand-accent' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}/></Button>)}
              <Button onClick={() => handleSendMessage(userInput)} disabled={isListening || isLoading || isProcessingSpecialAction || !userInput.trim()} className="h-10 w-10 !p-0 !rounded-full" aria-label="Verstuur"><ArrowUpwardIcon className="text-xl"/></Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <EmailGeneratorModal
        isOpen={isEmailGeneratorModalOpen}
        onClose={() => { setIsEmailGeneratorModalOpen(false); setIsProcessingSpecialAction(false); }}
        debts={debts.filter(d => !d.isPaidOff)}
        onSubmit={async (prompt) => {
            const dataContext = constructDataContext(currentUser, debts, incomes, expenses);
            await handleStandardMessage(prompt, chat, ai, dataContext, setMessages, openFormModal, true);
            setIsProcessingSpecialAction(false);
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
        videoRef={videoRef as React.RefObject<HTMLVideoElement>}
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
      />
      <ParseEmailModal
        isOpen={isParseEmailModalOpen}
        onClose={() => setIsParseEmailModalOpen(false)}
        onSubmit={handleEmailParse}
      />

      <Modal isOpen={debtFormState.isOpen} onClose={() => setDebtFormState({ isOpen: false })} title="Schuld Toevoegen/Bewerken" size="2xl">
        <DebtForm
            onSubmit={async (data) => {
                await addDebt(data as Omit<Debt, 'id' | 'isPaidOff'>);
                setDebtFormState({ isOpen: false });
                setMessages(prev => [...prev, { id: generateId(), text: `Oké, ik heb de schuld bij '${(data as Debt).creditorName}' voor je toegevoegd.`, sender: 'ai', timestamp: new Date() }]);
            }}
            initialData={debtFormState.initialData}
            onClose={() => setDebtFormState({ isOpen: false })}
            mode="full"
        />
      </Modal>

      <Modal isOpen={incomeFormState.isOpen} onClose={() => setIncomeFormState({ isOpen: false })} title="Inkomst Toevoegen" size="lg">
        <FinancialItemForm<Income>
            onSubmit={async (data) => {
                await addIncome(data as Omit<Income, 'id'>);
                setIncomeFormState({ isOpen: false });
                setMessages(prev => [...prev, { id: generateId(), text: `Ik heb de inkomst van '${(data as Income).source}' voor je toegevoegd.`, sender: 'ai', timestamp: new Date() }]);
            }}
            initialData={incomeFormState.initialData}
            onClose={() => setIncomeFormState({ isOpen: false })}
            itemTypeLabel="Bron"
            itemTypeName="income"
        />
      </Modal>

      <Modal isOpen={expenseFormState.isOpen} onClose={() => setExpenseFormState({ isOpen: false })} title="Uitgave Toevoegen" size="lg">
        <FinancialItemForm<Expense>
            onSubmit={async (data) => {
                await addExpense(data as Omit<Expense, 'id'>);
                setExpenseFormState({ isOpen: false });
                setMessages(prev => [...prev, { id: generateId(), text: `Ik heb de uitgave voor '${(data as Expense).category}' voor je toegevoegd.`, sender: 'ai', timestamp: new Date() }]);
            }}
            initialData={expenseFormState.initialData}
            onClose={() => setExpenseFormState({ isOpen: false })}
            itemTypeLabel="Categorie"
            itemTypeName="expense"
        />
      </Modal>
    </>
  );
};

export default AIAssistantPage;
