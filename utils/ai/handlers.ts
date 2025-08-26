import { GoogleGenAI, Chat, GenerateContentResponse, Part, Schema } from "@google/genai";
import { marked } from 'marked';
import { Debt, Income, Expense, User } from '@/types';
import { calculateTotalPaidForDebt, calculateRemainingDebt, generateId } from '@/utils/helpers';
import { ChatMessage } from '@/pages/AIAssistantPage';

type SetMessages = React.Dispatch<React.SetStateAction<ChatMessage[]>>;
type OpenFormModal = (actionType: string, payload: any) => void;

// --- Message Helper Functions ---

const addThinkingMessage = (setMessages: SetMessages, textOrSequence: string | string[] = 'Schuldhulpje is aan het nadenken...') => {
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

const removeThinkingMessage = (setMessages: SetMessages, thinkingId: string) => {
    setMessages(prev => prev.filter(m => m.id !== thinkingId));
};

const addErrorMessage = (setMessages: SetMessages, messageText: string) => {
    setMessages(prev => prev.filter(m => !m.isThinking).concat({ 
        id: generateId(), 
        text: messageText, 
        sender: 'ai', 
        timestamp: new Date(), 
        isError: true 
    }));
};

// --- Data Context ---

export const constructDataContext = (currentUser: User | null, debts: Debt[], incomes: Income[], expenses: Expense[]) => {
    const userContext = currentUser ? { firstName: currentUser.firstName, lastName: currentUser.lastName, email: currentUser.email, birthDate: currentUser.birthDate } : {};
    return {
      user: userContext,
      debts: debts.map(d => ({ 
        ...d, 
        totalPaid: calculateTotalPaidForDebt(d),
        remainingAmount: calculateRemainingDebt(d)
      })),
      incomes,
      expenses,
      currentDate: new Date().toISOString().split('T')[0],
    };
};

// --- Response Processing ---

const processAiResponse = (
    response: GenerateContentResponse, 
    setMessages: SetMessages, 
    openFormModal: OpenFormModal,
    isExportOverviewAction: boolean = false, 
    isFinancialAnalysisAction: boolean = false
) => {
    const aiResponseText = typeof response?.text === 'string' ? response.text : '';

    // 1. Check for email format
    if (aiResponseText && aiResponseText.includes('---EMAIL_BODY_STARTS_HERE---')) {
        const parts = aiResponseText.split('---EMAIL_BODY_STARTS_HERE---');
        const introAndBody = parts[1] || '';
        const bodyAndSubject = introAndBody.split('---SUBJECT_STARTS_HERE---');
        const body = bodyAndSubject[0]?.trim() || '';
        const subject = bodyAndSubject[1]?.trim() || 'Onderwerp niet gevonden';
        const intro = parts[0].trim();

        const newEmailMessage: ChatMessage = {
            id: generateId(), text: intro, sender: 'ai', timestamp: new Date(),
            isEmail: true, emailSubject: subject, emailBody: body
        };
        setMessages(prev => [...prev, newEmailMessage]);
        return;
    }

    // 2. Check for JSON action format
    let structuredAction;
    try {
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) structuredAction = JSON.parse(jsonMatch[0]);
    } catch (e) { /* Not JSON, continue */ }

    if (structuredAction && structuredAction.action && structuredAction.payload) {
        const confirmationText = structuredAction.confirmation_text || `Oké, ik heb het formulier voor je voorbereid. Controleer de gegevens en sla ze op.`;
        setMessages(prev => [...prev, { id: generateId(), text: confirmationText, sender: 'ai', timestamp: new Date() }]);
        openFormModal(structuredAction.action, structuredAction.payload);
        return;
    }

    // 3. Default to text/markdown with optional grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.filter((c: any) => c.web?.uri).map((c: any) => ({ uri: c.web.uri, title: c.web.title })) || [];
    const newTextMessage: ChatMessage = {
        id: generateId(), text: aiResponseText || '', sender: 'ai', timestamp: new Date(),
        groundingSources: sources.length > 0 ? sources : undefined,
        isExportOverview: isExportOverviewAction,
        isFinancialAnalysis: isFinancialAnalysisAction
    };
    setMessages(prev => [...prev, newTextMessage]);
};


// --- Core Action Handlers ---

export const handleStandardMessage = async (
    promptContent: string,
    chat: Chat | null,
    ai: GoogleGenAI | null,
    dataContext: any,
    setMessages: SetMessages,
    openFormModal: OpenFormModal,
    isSpecialAction: boolean = false
) => {
    if (!chat || !ai) return;

    let thinkingIndicatorText: string | string[] = 'Schuldhulpje is aan het nadenken...';
    if (isSpecialAction) thinkingIndicatorText = 'Een momentje, ik verwerk je verzoek...';
    const thinkingId = addThinkingMessage(setMessages, thinkingIndicatorText);

    try {
        const fullPrompt = `Hier is de huidige data:\n${JSON.stringify(dataContext)}\n\nGebruiker: ${promptContent}`;
        const shouldUseSearch = !isSpecialAction && (promptContent.toLowerCase().includes("zoek") || promptContent.toLowerCase().includes("nieuws"));
        
        let response: GenerateContentResponse;
        if (shouldUseSearch) {
            response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { tools: [{googleSearch: {}}]}});
        } else {
            response = await chat.sendMessage({ message: fullPrompt });
        }
      
        removeThinkingMessage(setMessages, thinkingId);
        processAiResponse(response, setMessages, openFormModal);
    } catch (e: any) {
        console.error(`Fout bij communiceren met Gemini API:`, e);
        removeThinkingMessage(setMessages, thinkingId);
        addErrorMessage(setMessages, `Sorry, er ging iets mis: ${e.message}`);
    }
};

export const handleFinancialOverview = async (chat: Chat | null, dataContext: any, setMessages: SetMessages, currentUser: User | null) => {
    if (!chat) return;
    const thinkingId = addThinkingMessage(setMessages, 'Ik stel je financieel overzicht samen...');
    const prompt = "Genereer het financiële overzicht volgens het strikte markdown formaat.";
    const fullPrompt = `Hier is de huidige data:\n${JSON.stringify(dataContext)}\n\nGebruiker: ${prompt}`;

    try {
        const response = await chat.sendMessage({ message: fullPrompt });
        removeThinkingMessage(setMessages, thinkingId);

        // Add a pre-message before showing the overview
        const preMessage: ChatMessage = {
          id: generateId(),
          sender: 'ai',
          timestamp: new Date(),
          text: `Hallo ${currentUser?.firstName || 'gebruiker'}, hier is een gedetailleerd overzicht van je huidige financiële situatie! 👍`,
        };
        setMessages(prev => [...prev, preMessage]);
        
        // Add the actual overview
        processAiResponse(response, setMessages, () => {}, true, false);

    } catch(e: any) {
        removeThinkingMessage(setMessages, thinkingId);
        addErrorMessage(setMessages, `Kon overzicht niet genereren: ${e.message}`);
    }
};

export const handleFinancialAnalysis = async (chat: Chat | null, dataContext: any, setMessages: SetMessages) => {
    if (!chat) return;
    const thinkingId = addThinkingMessage(setMessages, 'Ik analyseer je financiële gegevens...');
    const prompt = "Analyseer mijn huidige financiële situatie en geef me een uitgebreide analyse volgens het strikte 'Financiële Analyse Genereren' formaat.";
    const fullPrompt = `Hier is de huidige data:\n${JSON.stringify(dataContext)}\n\nGebruiker: ${prompt}`;
    try {
        const response = await chat.sendMessage({ message: fullPrompt });
        removeThinkingMessage(setMessages, thinkingId);
        processAiResponse(response, setMessages, () => {}, false, true);
    } catch(e: any) {
        removeThinkingMessage(setMessages, thinkingId);
        addErrorMessage(setMessages, `Kon analyse niet genereren: ${e.message}`);
    }
};