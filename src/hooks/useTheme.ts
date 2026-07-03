import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { Theme, ThemeMode } from '@/types';

/** 获取当前系统外观对应的主题 */
function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 初始化并管理主题 */
export function useTheme() {
  const { theme, themeMode, setTheme, setThemeMode } = useAppStore();

  useEffect(() => {
    // 从 Tauri Store 加载主题模式
    const loadTheme = async () => {
      try {
        const { load } = await import('@tauri-apps/plugin-store');
        const store = await load('settings.json', { autoSave: false, defaults: {} });
        const stored = await store.get<string>('theme');
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeMode(stored);
        }
      } catch {
        // 不在 Tauri 环境中或首次启动，默认跟随系统
      }
    };

    loadTheme();
  }, [setThemeMode]);

  // 根据模式解析实际主题；跟随系统时监听系统外观变化
  useEffect(() => {
    if (themeMode !== 'system') {
      setTheme(themeMode);
      return;
    }

    setTheme(getSystemTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themeMode, setTheme]);

  /** 设置主题模式并持久化 */
  const setMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', { autoSave: false, defaults: {} });
      await store.set('theme', mode);
      await store.save();
    } catch {
      // 非 Tauri 环境，忽略持久化失败
    }
  };

  return { theme, themeMode, setMode };
}
