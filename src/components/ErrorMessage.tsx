import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  onRetry,
  compact = false,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'gap-2 py-6' : 'gap-4 py-16'
      } ${className}`}
    >
      <AlertTriangle className={compact ? 'h-7 w-7 text-brand' : 'h-12 w-12 text-brand'} aria-hidden="true" />
      <div className="max-w-md space-y-1 px-4">
        <h3 className={compact ? 'text-base font-semibold' : 'text-xl font-bold'}>{title}</h3>
        <p className="text-sm text-white/60">{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
