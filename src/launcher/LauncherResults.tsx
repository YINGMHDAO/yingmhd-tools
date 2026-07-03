import { useCommandStore } from '@/stores/commandStore';
import { pluginManager } from '@/core/plugin';
import { cn } from '@/utils/cn';
import * as LucideIcons from 'lucide-react';
import type { SearchItem } from '@/types';
import type { LucideIcon } from 'lucide-react';

/** 根据图标名动态获取 Lucide 图标组件 */
function getIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || LucideIcons.Box;
}

function ResultItem({
  item,
  isSelected,
  onClick,
  onHover,
}: {
  item: SearchItem;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const plugin = item.type === 'plugin' ? pluginManager.getPlugin(item.id) : null;
  const Icon = plugin ? getIcon(plugin.icon) : LucideIcons.Terminal;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75 cursor-pointer',
        isSelected ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
      )}
    >
      <Icon size={18} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.title}</div>
        {plugin && (
          <div
            className={cn(
              'text-xs truncate',
              isSelected ? 'text-white/70' : 'text-[var(--text-muted)]',
            )}
          >
            {plugin.description}
          </div>
        )}
      </div>
      {item.type === 'plugin' && (
        <span
          className={cn(
            'text-xs shrink-0',
            isSelected ? 'text-white/70' : 'text-[var(--text-muted)]',
          )}
        >
          插件
        </span>
      )}
    </button>
  );
}

export function LauncherResults({ onExecute }: { onExecute: (item: SearchItem) => void }) {
  const { results, selectedIndex, setSelectedIndex } = useCommandStore();

  if (results.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
        未找到匹配结果
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-80 py-1">
      {results.map((item, index) => (
        <ResultItem
          key={item.id}
          item={item}
          isSelected={index === selectedIndex}
          onClick={() => onExecute(item)}
          onHover={() => setSelectedIndex(index)}
        />
      ))}
    </div>
  );
}
