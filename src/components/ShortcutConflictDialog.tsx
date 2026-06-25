import { Dialog, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import type { ShortcutConflictEvent } from '@/types';

interface ShortcutConflictDialogProps {
  open: boolean;
  onClose: () => void;
  onCustomize: () => void;
  conflict: ShortcutConflictEvent | null;
}

export function ShortcutConflictDialog({
  open,
  onClose,
  onCustomize,
  conflict,
}: ShortcutConflictDialogProps) {
  if (!conflict) return null;

  return (
    <Dialog open={open} onClose={onClose} title="快捷键冲突">
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          快捷键 <code className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono text-xs">{conflict.attempted}</code> 注册失败，可能已被其他应用占用。
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          您可以通过系统托盘图标随时打开应用。
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            稍后设置
          </Button>
          <Button variant="default" onClick={onCustomize}>
            自定义快捷键
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
