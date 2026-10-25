import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

const STYLES = {
  success: { icon: Check, color: 'text-emerald-400' },
  info: { icon: Info, color: 'text-sky-400' },
  error: { icon: AlertTriangle, color: 'text-brand' },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((toast) => {
        const { icon: Icon, color } = STYLES[toast.type] || STYLES.info;
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-lg border border-white/10 bg-surface-raised/95 px-4 py-3 text-sm shadow-2xl shadow-black/60 backdrop-blur"
          >
            <Icon className={`h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-white/50 transition hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
