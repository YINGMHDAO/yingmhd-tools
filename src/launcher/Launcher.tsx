import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LauncherInput } from './LauncherInput';
import { LauncherResults } from './LauncherResults';
import { useCommandStore } from '@/stores/commandStore';
import { pluginManager } from '@/core/plugin';
import { fuseSearch } from '@/core/search';
import type { SearchItem } from '@/types';

/** 构建搜索索引（只索引插件，不索引插件内部命令） */
function buildSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const plugin of pluginManager.getEnabledPlugins()) {
    items.push({
      id: plugin.id,
      title: plugin.name,
      keywords: plugin.keywords,
      type: 'plugin',
    });
  }

  return items;
}

export function Launcher() {
  const navigate = useNavigate();
  const { query, setResults, results, selectedIndex, selectNext, selectPrev } = useCommandStore();

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

  // 执行单个搜索项（键盘 Enter 与鼠标点击共用）
  const executeItem = useCallback(
    (item: SearchItem) => {
      if (item.type === 'plugin') {
        const plugin = pluginManager.getPlugin(item.id);
        // 只要插件声明了路由即可导航（插件可只有 route 没有 page 组件）
        if (plugin?.route) {
          navigate(plugin.route);
        }
      }
    },
    [navigate],
  );

  // 执行当前选中项
  const executeSelected = useCallback(() => {
    const item = results[selectedIndex];
    if (item) executeItem(item);
  }, [results, selectedIndex, executeItem]);

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
    <div data-tauri-drag-region className="flex flex-col h-full bg-[var(--launcher-bg)]">
      <LauncherInput />
      <LauncherResults onExecute={executeItem} />
    </div>
  );
}
