import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast notification system for user feedback
 * Provides consistent notifications across the application
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isVisible: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider component
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      isVisible: true,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));

    // Remove from DOM after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast Container component
 */
const ToastContainer: React.FC<{
  toasts: Toast[];
  onHide: (id: string) => void;
}> = ({ toasts, onHide }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>,
    document.body
  );
};

/**
 * Individual Toast Item component
 */
const ToastItem: React.FC<{
  toast: Toast;
  onHide: (id: string) => void;
}> = ({ toast, onHide }) => {
  const getToastStyles = (type: ToastType): string => {
    const baseStyles = "p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 transform";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50/90 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseStyles} bg-blue-50/90 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200`;
      default:
        return `${baseStyles} bg-gray-50/90 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`${getToastStyles(toast.type)} ${
        toast.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg font-medium" aria-hidden="true">
            {getIcon(toast.type)}
          </span>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onHide(toast.id)}
          className="ml-3 text-lg opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Melding sluiten"
        >
          ×
        </button>
      </div>
    </div>
  );
};

/**
 * Convenience hooks for specific toast types
 */
export const useSuccessToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast('error', title, message);
  }, [showToast]);
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);
};