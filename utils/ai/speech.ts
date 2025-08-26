// Type declarations for Web Speech API
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface InitializeSpeechRecognitionParams {
    onResult: (finalTranscript: string, interimTranscript: string) => void;
    onEnd: (finalTranscript: string) => void;
    onStart: () => void;
    onError: (errorMessage: string, isPermissionError: boolean) => void;
}

export const initializeSpeechRecognition = (params: InitializeSpeechRecognitionParams): { supported: boolean, recognition: SpeechRecognition | null } => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        return { supported: false, recognition: null };
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'nl-NL';
    let finalTranscript = '';
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        params.onResult(finalTranscript, interimTranscript);
    };
    
    recognition.onend = () => {
        params.onEnd(finalTranscript);
        finalTranscript = ''; // Reset for next use
    };

    recognition.onstart = params.onStart;
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error, event.message);
        let errorMessage = `Spraakherkenning fout: ${event.error}`;
        const isPermissionError = event.error === 'not-allowed' || event.error === 'service-not-allowed';
        
        if (isPermissionError) {
            errorMessage = "Geen permissie voor microfoon. Spraakmodus is uitgeschakeld.";
        } else if (event.error === 'no-speech') {
            errorMessage = "Ik kon je niet horen.";
        } else if (event.error === 'aborted') {
            return; // Don't show error on manual abort
        }
        params.onError(errorMessage, isPermissionError);
    };

    return { supported: true, recognition };
};
