
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { SparklesIcon, WarningIcon } from '@/components/ui/Icons';
import Button from '../ui/Button';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  error?: string | null;
}

const statusTexts = [
  'Document scannen...',
  'Gegevens extraheren...',
  'Informatie structureren...',
  'Formulier voorbereiden...',
  'Bijna klaar...',
];

const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({ isOpen, onClose, error }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(statusTexts[0]);

  useEffect(() => {
    if (isOpen && !error) {
      setProgress(0);
      setStatusText(statusTexts[0]);

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          const increment = Math.random() * 8 + 2; // More varied increment
          const newProgress = Math.min(prev + increment, 95);

          if (newProgress < 25) setStatusText(statusTexts[0]);
          else if (newProgress < 50) setStatusText(statusTexts[1]);
          else if (newProgress < 75) setStatusText(statusTexts[2]);
          else if (newProgress < 90) setStatusText(statusTexts[3]);
          else setStatusText(statusTexts[4]);

          return newProgress;
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, [isOpen, error]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={error ? "Analyse Mislukt" : "Document Analyseren"} size="sm">
        {error ? (
             <div className="flex flex-col items-center justify-center text-center py-8">
                <WarningIcon className="text-5xl text-light-danger dark:text-dark-danger" />
                <h3 className="text-lg font-bold mt-4 text-light-text-primary dark:text-dark-text-primary">
                  Fout opgetreden
                </h3>
                <p className="text-sm mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                  {error}
                </p>
                <Button variant="secondary" onClick={onClose} className="mt-6">
                  Sluiten
                </Button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-8">
                <SparklesIcon className="text-5xl text-brand-accent animate-pulse" />
                <h3 className="text-lg font-bold mt-4 text-light-text-primary dark:text-dark-text-primary">
                Momentje, ik kijk er naar...
                </h3>
                <p className="text-sm mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                Dit kan enkele seconden duren.
                </p>

                <div className="w-full mt-6 space-y-2">
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5">
                        <div 
                            className="bg-brand-accent h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-medium text-brand-accent">{statusText}</p>
                </div>
            </div>
        )}
    </Modal>
  );
};

export default AnalysisProgressModal;
