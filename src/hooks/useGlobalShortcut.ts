import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useAppStore } from '@/stores/appStore';
import type { ShortcutConflictEvent } from '@/types';

/** 监听全局快捷键事件 */
export function useGlobalShortcut(onConflict?: (event: ShortcutConflictEvent) => void) {
  const { setShortcut, setShortcutConflict } = useAppStore();

  useEffect(() => {
    // 监听快捷键冲突事件
    const unlisten = listen<ShortcutConflictEvent>('shortcut-conflict', (event) => {
      setShortcutConflict(true);
      onConflict?.(event.payload);
    });

    // 获取当前快捷键
    const loadShortcut = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const shortcut = await invoke<string>('get_shortcut');
        setShortcut(shortcut);
      } catch {
        // 忽略
      }
    };
    loadShortcut();

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setShortcut, setShortcutConflict, onConflict]);
}
