import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Monitor } from 'lucide-react';
import { pluginManager } from '@/core/plugin';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function getIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || Box;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [osType, setOsType] = useState('...');

  useEffect(() => {
    // 检测操作系统
    const ua = navigator.userAgent;
    if (ua.includes('Mac')) setOsType('macOS');
    else if (ua.includes('Win')) setOsType('Windows');
    else setOsType('Linux');

    // 通过 Tauri API 获取更准确的平台信息
    import('@tauri-apps/api/core')
      .then(({ invoke }) => invoke<string>('get_default_shortcut'))
      .catch(() => {});
  }, []);

  const plugins = pluginManager.getEnabledPlugins();

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* 顶部 */}
      <header data-tauri-drag-region className="px-6 py-8 text-center shrink-0">
        <h1 data-tauri-drag-region className="text-2xl font-bold text-[var(--text-primary)]">
          YINGMHD Tools
        </h1>
        <p data-tauri-drag-region className="mt-1 text-sm text-[var(--text-muted)]">
          Developer Launcher v0.1.0
        </p>
      </header>

      {/* 系统信息 */}
      <div className="px-6 pb-6 shrink-0">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Monitor size={16} className="text-[var(--accent)]" />
              系统信息
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">操作系统</span>
                <span className="text-[var(--text-primary)]">{osType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">版本</span>
                <span className="text-[var(--text-primary)]">v0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">已安装插件</span>
                <span className="text-[var(--text-primary)]">{plugins.length} 个</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 插件列表 */}
      <div className="px-6 pb-6">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
          已安装插件
        </h2>
        <div className="space-y-2">
          {plugins.map((plugin) => {
            const Icon = getIcon(plugin.icon);
            return (
              <Card
                key={plugin.id}
                className="hover:border-[var(--accent)] transition-colors cursor-pointer"
                onClick={() => plugin.route && navigate(plugin.route)}
              >
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {plugin.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {plugin.description}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    打开
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
