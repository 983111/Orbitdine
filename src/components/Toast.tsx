import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  pushToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2 w-[min(92vw,22rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border p-3 shadow-lg bg-white flex items-start gap-2 ${
              toast.kind === 'error' ? 'border-red-200' : toast.kind === 'success' ? 'border-green-200' : 'border-blue-200'
            }`}
          >
            {toast.kind === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            ) : (
              <CheckCircle2 className={`w-5 h-5 mt-0.5 ${toast.kind === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
            )}
            <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
