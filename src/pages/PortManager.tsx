import { useEffect, useCallback, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortStore } from '@/stores/portStore';
import { useAppStore } from '@/stores/appStore';
import { getPorts, killProcess } from '@/services/portService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function PortManagerPage() {
  const navigate = useNavigate();
  const { ports, searchQuery, setSearchQuery, setPorts, setLoading, loading } = usePortStore();
  const addToast = useAppStore((s) => s.addToast);
  const [killTarget, setKillTarget] = useState<{ pid: number; name: string } | null>(null);

  const fetchPorts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPorts();
      setPorts(data);
    } catch (err) {
      addToast(`获取端口列表失败: ${String(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [setPorts, setLoading, addToast]);

  useEffect(() => {
    fetchPorts();
  }, [fetchPorts]);

  const handleKill = useCallback(
    async (pid: number, name: string) => {
      try {
        await killProcess(pid);
        addToast(`进程 ${name} (PID: ${pid}) 已结束`, 'success');
        // 刷新列表
        await fetchPorts();
      } catch (err) {
        addToast(`结束进程失败: ${String(err)}`, 'error');
      }
    },
    [fetchPorts, addToast],
  );

  // 搜索结果过滤
  const filtered = searchQuery.trim()
    ? ports.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.port.toString().includes(q) ||
          p.pid.toString().includes(q) ||
          p.processName.toLowerCase().includes(q)
        );
      })
    : ports;

  return (
    <div className="h-full flex flex-col">
      {/* 顶部导航栏 */}
      <header
        data-tauri-drag-region
        className="flex items-center gap-3 px-4 h-12 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Port Manager</span>
        <div data-tauri-drag-region className="flex-1" />
      </header>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="搜索端口 / PID / 进程名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={fetchPorts} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">刷新</span>
        </Button>
      </div>

      {/* 端口表格 */}
      <div className="flex-1 overflow-auto">
        {loading && ports.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
            <RefreshCw size={20} className="animate-spin mr-2" />
            扫描端口中...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
            暂无监听端口
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] sticky top-0">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] w-20">
                  端口
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] w-24">
                  PID
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)]">
                  进程名
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] w-24">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={`${row.port}-${row.pid}-${i}`}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-[var(--accent)]">{row.port}</td>
                  <td className="px-4 py-2.5 font-mono text-[var(--text-secondary)]">{row.pid}</td>
                  <td className="px-4 py-2.5 truncate max-w-xs">{row.processName}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setKillTarget({ pid: row.pid, name: row.processName })
                      }
                    >
                      <Skull size={12} />
                      Kill
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Kill 确认弹窗 */}
      <ConfirmDialog
        open={killTarget !== null}
        onClose={() => setKillTarget(null)}
        onConfirm={() => {
          if (killTarget) {
            handleKill(killTarget.pid, killTarget.name);
          }
         }}
        title="确认结束进程"
        message={
          killTarget
            ? `确定要结束进程 "${killTarget.name}" (PID: ${killTarget.pid}) 吗？此操作不可撤销。`
            : ''
        }
        confirmText="结束进程"
        danger
      />
    </div>
  );
}
