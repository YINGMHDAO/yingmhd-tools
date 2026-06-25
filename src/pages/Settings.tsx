import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';

export function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { shortcut, setShortcut, setShortcutEnabled, shortcutEnabled, shortcutConflict } =
    useAppStore();
  const [recording, setRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const addToast = useAppStore((s) => s.addToast);

  // 加载当前快捷键
  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const current = await invoke<string>('get_shortcut');
        setShortcut(current);
      } catch {
        // 非 Tauri 环境
      }
    };
    loadShortcut();
  }, [setShortcut]);

  // 开始录制快捷键
  const startRecording = useCallback(() => {
    setRecording(true);
    setRecordedKeys([]);
  }, []);

  // 快捷键录制键盘监听
  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.metaKey || e.ctrlKey) keys.push(e.metaKey ? 'Cmd' : 'Ctrl');
      if (e.altKey) keys.push(e.metaKey ? 'Option' : 'Alt');
      if (e.shiftKey) keys.push('Shift');

      const keyName = e.code.startsWith('Key')
        ? e.code.slice(3)
        : e.code.startsWith('Digit')
          ? e.code.slice(5)
          : e.code === 'Space'
            ? 'Space'
            : e.key;

      if (!['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
        keys.push(keyName);
      }

      if (keys.length >= 2) {
        setRecordedKeys(keys);
        // 自动保存
        const shortcutStr = keys.join('+');
        saveShortcut(shortcutStr);
        setRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recording]);

  // 保存快捷键
  const saveShortcut = async (shortcutStr: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_shortcut', { shortcutStr });
      setShortcut(shortcutStr);
      useAppStore.getState().setShortcutConflict(false);
      addToast(`快捷键已更新为 ${shortcutStr}`, 'success');
    } catch (err) {
      addToast(`快捷键冲突: ${String(err)}。请尝试其他组合。`, 'error');
    }
  };

  // 恢复默认快捷键
  const resetShortcut = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const defaultShortcut = await invoke<string>('get_default_shortcut');
      await invoke('set_shortcut', { shortcutStr: defaultShortcut });
      setShortcut(defaultShortcut);
      addToast(`快捷键已恢复为 ${defaultShortcut}`, 'success');
    } catch (err) {
      addToast(`恢复失败: ${String(err)}`, 'error');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* 顶部导航栏 */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>
        <span className="text-sm font-semibold text-[var(--text-primary)]">设置</span>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-lg">
        {/* 主题 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">深色主题</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              当前: {theme === 'dark' ? '深色模式' : '浅色模式'}
            </div>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={() => toggleTheme()} />
        </div>

        {/* 快捷键 */}
        <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">全局快捷键</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--text-secondary)]">当前快捷键</div>
            <div className="text-sm font-mono text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
              {shortcut || '...'}
            </div>
          </div>

          {shortcutConflict && (
            <div className="text-xs text-[var(--danger)] bg-red-900/10 px-3 py-1.5 rounded">
              当前快捷键可能与其他应用冲突
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">启用快捷键</span>
            <Switch
              checked={shortcutEnabled}
              onCheckedChange={(checked) => setShortcutEnabled(checked)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={startRecording} disabled={recording}>
              {recording ? '请按键...' : '修改快捷键'}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetShortcut}>
              恢复默认
            </Button>
          </div>

          {recording && (
            <div className="text-sm text-[var(--accent)] animate-pulse">
              请按下新的快捷键组合...
            </div>
          )}

          {recordedKeys.length > 0 && (
            <div className="text-sm font-mono text-[var(--text-primary)]">
              {recordedKeys.join(' + ')}
            </div>
          )}
        </div>

        {/* 占位设置 */}
        <div className="flex items-center justify-between opacity-50">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">自动检查更新</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">启动时检查新版本</div>
          </div>
          <Switch checked={false} onCheckedChange={() => {}} disabled />
        </div>

        <div className="flex items-center justify-between opacity-50">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">开机启动</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">系统启动时自动运行</div>
          </div>
          <Switch checked={false} onCheckedChange={() => {}} disabled />
        </div>
      </div>
    </div>
  );
}
