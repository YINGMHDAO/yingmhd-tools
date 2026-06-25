import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LauncherInput } from './LauncherInput';
import { LauncherResults } from './LauncherResults';
import { useCommandStore } from '@/stores/commandStore';
import { pluginManager } from '@/core/plugin';
import { fuseSearch } from '@/core/search';
import { useAppStore } from '@/stores/appStore';
import type { SearchItem } from '@/types';

/** 构建搜索索引 */
function buildSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];

  // 插件
  for (const plugin of pluginManager.getEnabledPlugins()) {
    items.push({
      id: plugin.id,
      title: plugin.name,
      keywords: plugin.keywords,
      type: 'plugin',
    });
  }

  // 命令
  for (const plugin of pluginManager.getEnabledPlugins()) {
    if (plugin.commands) {
      for (const cmd of plugin.commands) {
        items.push({
          id: cmd.id,
          title: cmd.title,
          keywords: cmd.keywords,
          type: 'command',
        });
      }
    }
  }

  return items;
}

export function Launcher() {
  const navigate = useNavigate();
  const { query, setResults, results, selectedIndex, selectNext, selectPrev } = useCommandStore();
  const addToast = useAppStore((s) => s.addToast);

  // 更新搜索索引
  useEffect(() => {
    const items = buildSearchItems();
    fuseSearch.updateItems(items);
  }, []);

  // 模糊搜索
  useEffect(() => {
    const items = fuseSearch.search(query);
    setResults(items);
  }, [query, setResults]);

  // 执行选中项
  const executeSelected = useCallback(() => {
    const item = results[selectedIndex];
    if (!item) return;

    if (item.type === 'plugin') {
      const plugin = pluginManager.getPlugin(item.id);
      if (plugin?.page && plugin.route) {
        navigate(plugin.route);
      }
    } else if (item.type === 'command') {
      // 查找命令所属插件
      for (const plugin of pluginManager.getEnabledPlugins()) {
        const cmd = plugin.commands?.find((c) => c.id === item.id);
        if (cmd) {
          try {
            const result = cmd.run(query);
            if (result instanceof Promise) {
              result.catch((err: Error) => {
                addToast(`命令执行失败: ${err.message}`, 'error');
              });
            }
          } catch (err) {
            addToast(`命令执行失败: ${String(err)}`, 'error');
          }
          return;
        }
      }
    }
  }, [results, selectedIndex, navigate, query, addToast]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectPrev();
          break;
        case 'Enter':
          e.preventDefault();
          executeSelected();
          break;
        case 'Escape':
          e.preventDefault();
          // 通知 Tauri 隐藏窗口
          import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
            getCurrentWindow().hide();
          }).catch(() => {});
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNext, selectPrev, executeSelected]);

  return (
    <div className="flex flex-col h-full bg-[var(--launcher-bg)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden">
      <LauncherInput />
      <LauncherResults />
    </div>
  );
}
