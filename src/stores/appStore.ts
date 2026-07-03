import { create } from 'zustand';
import type { Theme, ThemeMode, Toast, ToastType } from '@/types';

interface AppState {
  theme: Theme;
  themeMode: ThemeMode;
  shortcut: string;
  shortcutEnabled: boolean;
  shortcutConflict: boolean;
  toasts: Toast[];

  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setShortcut: (shortcut: string) => void;
  setShortcutEnabled: (enabled: boolean) => void;
  setShortcutConflict: (conflict: boolean) => void;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useAppStore = create<AppState>((set) => ({
  // 初始值按系统外观计算，避免启动时主题闪烁
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  themeMode: 'system',
  shortcut: '',
  shortcutEnabled: true,
  shortcutConflict: false,
  toasts: [],

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  setThemeMode: (themeMode) => set({ themeMode }),

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
