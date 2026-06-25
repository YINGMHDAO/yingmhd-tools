import { useEffect, useRef } from 'react';
import { useCommandStore } from '@/stores/commandStore';
import { Search } from 'lucide-react';

export function LauncherInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, reset } = useCommandStore();

  useEffect(() => {
    // 自动聚焦
    inputRef.current?.focus();
    return () => reset();
  }, [reset]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
      <Search size={18} className="text-[var(--text-muted)] shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索插件或命令..."
        className="w-full bg-transparent text-[var(--text-primary)] text-base outline-none placeholder:text-[var(--text-muted)]"
        autoFocus
        spellCheck={false}
      />
    </div>
  );
}
