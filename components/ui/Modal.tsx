import React, { ReactNode, useEffect } from 'react';
import { XIcon } from '@/components/ui/Icons';
import GlassCard from './GlassCard'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  };

  return (
    <div 
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop: now a separate element to ensure it always covers the full screen */}
      <div 
        className="fixed inset-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Content Positioner: handles alignment and padding */}
      <div 
        className="fixed inset-0 flex items-start sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <GlassCard
          as="div"
          transparencyLevel="high"
          className={`
            w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col
            ${sizeClasses[size]} 
            transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-sv-modal-appear
            rounded-none sm:rounded-neumorphic-lg 
          `}
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-light-shadow-dark/30 dark:border-dark-shadow-light/30 flex-shrink-0">
            <h3 id="modal-title" className="text-md sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary truncate pr-2">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20 dark:active:bg-white/20 transition-all"
              aria-label="Sluiten"
            >
              <XIcon className="text-xl sm:text-2xl" />
            </button>
          </div>
          <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-grow font-light">
            {children}
          </div>
        </GlassCard>
      </div>

      <style>{`
        @keyframes sv-modal-appear {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-sv-modal-appear {
          animation: sv-modal-appear 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
