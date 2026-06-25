import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Launcher } from '@/launcher/Launcher';
import { JsonEditorPage } from '@/pages/JsonEditor';
import { PortManagerPage } from '@/pages/PortManager';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut';
import { ShortcutConflictDialog } from '@/components/ShortcutConflictDialog';
import { useAppStore } from '@/stores/appStore';
import type { ShortcutConflictEvent } from '@/types';

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const [conflictEvent, setConflictEvent] = useState<ShortcutConflictEvent | null>(null);
  const [showConflict, setShowConflict] = useState(false);

  // 初始化主题
  useTheme();

  // 监听快捷键冲突
  useGlobalShortcut((event) => {
    setConflictEvent(event);
    setShowConflict(true);
  });

  // 设置 data-theme 属性
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Launcher />} />
          <Route path="/json-editor" element={<JsonEditorPage />} />
          <Route path="/port-manager" element={<PortManagerPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>

      {/* 快捷键冲突弹窗 */}
      <ShortcutConflictDialog
        open={showConflict}
        onClose={() => setShowConflict(false)}
        onCustomize={() => {
          setShowConflict(false);
          window.location.hash = '#/settings';
        }}
        conflict={conflictEvent}
      />
    </HashRouter>
  );
}
