// Toast notification system.
// Provides a ToastProvider context and useToast() hook for showing
// success/error/info/saved messages that auto-dismiss after 3 seconds.
// Positioned at the bottom-center of the viewport.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'saved';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Auto-dismiss duration in milliseconds
const TOAST_DURATION = 3000;

// Color mapping per variant — keeps className logic clean
const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-leaf-green text-white',
  error: 'bg-coral text-white',
  info: 'bg-sky-blue text-black',
  saved: 'bg-rose text-white',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);

      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container: fixed at bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest font-bold rounded-xl shadow-md transition-all ${VARIANT_CLASSES[toast.variant]}`}
            role="alert"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook for consuming the toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
