import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

/** 初始化并管理主题 */
export function useTheme() {
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    // 从 Tauri Store 加载主题
    const loadTheme = async () => {
      try {
        const { load } = await import('@tauri-apps/plugin-store');
        const store = await load('settings.json', { autoSave: false, defaults: {} });
        const stored = await store.get<string>('theme');
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored);
        }
      } catch {
        // 不在 Tauri 环境中或首次启动，使用默认深色主题
      }
    };

    loadTheme();
  }, [setTheme]);

  /** 切换主题并持久化 */
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', { autoSave: false, defaults: {} });
      await store.set('theme', newTheme);
      await store.save();
    } catch {
      // 非 Tauri 环境，忽略持久化失败
    }
  };

  return { theme, toggleTheme };
}
