import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { ToastType } from '@/types';

/** Toast 通知 hook */
export function useToast() {
  const addToast = useAppStore((s) => s.addToast);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      addToast(message, type);
    },
    [addToast],
  );

  const success = useCallback((message: string) => toast(message, 'success'), [toast]);
  const error = useCallback((message: string) => toast(message, 'error'), [toast]);
  const info = useCallback((message: string) => toast(message, 'info'), [toast]);

  return { toast, success, error, info };
}
