import { useAppStore } from '@/stores/appStore';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const typeStyles = {
  success: 'border-[var(--success)] text-[var(--success)]',
  error: 'border-[var(--danger)] text-[var(--danger)]',
  info: 'border-[var(--accent)] text-[var(--accent)]',
};

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border-l-4 shadow-lg animate-[slideIn_0.2s_ease-out] max-w-sm',
            typeStyles[toast.type],
          )}
          style={{
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          <span className="text-sm flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
