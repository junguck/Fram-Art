import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

const toastClasses: Record<ToastType, string> = {
  success: 'border-emerald-500 bg-emerald-50 text-emerald-950',
  error: 'border-red-500 bg-red-50 text-red-950',
  info: 'border-blue-500 bg-blue-50 text-blue-950',
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 4200);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 border-l-4 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.22)] ${toastClasses[toast.type]}`}
            role="status"
          >
            <p className="text-sm font-bold leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 transition hover:opacity-70"
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
