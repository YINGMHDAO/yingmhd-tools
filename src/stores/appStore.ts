import { create } from 'zustand';
import type { Theme, Toast, ToastType } from '@/types';

interface AppState {
  theme: Theme;
  shortcut: string;
  shortcutEnabled: boolean;
  shortcutConflict: boolean;
  toasts: Toast[];

  setTheme: (theme: Theme) => void;
  setShortcut: (shortcut: string) => void;
  setShortcutEnabled: (enabled: boolean) => void;
  setShortcutConflict: (conflict: boolean) => void;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  shortcut: '',
  shortcutEnabled: true,
  shortcutConflict: false,
  toasts: [],

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  setShortcut: (shortcut) => set({ shortcut }),

  setShortcutEnabled: (shortcutEnabled) => set({ shortcutEnabled }),

  setShortcutConflict: (shortcutConflict) => set({ shortcutConflict }),

  addToast: (message, type) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // 3 秒后自动移除
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
