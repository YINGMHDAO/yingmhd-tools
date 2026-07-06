import { useCallback, useRef } from 'react';
import '@/monaco';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { ArrowLeft, Braces, Minimize2, Copy, Eraser, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJsonStore } from '@/stores/jsonStore';
import { useAppStore } from '@/stores/appStore';
import { jsonErrorMessage } from '@/utils/json';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function JsonEditorPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { input, output, setInput, setOutput, setError, clear, error } = useJsonStore();
  const addToast = useAppStore((s) => s.addToast);
  const outputEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      // 定义 Monaco 主题
      monaco.editor.defineTheme('vscode-dark-plus', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#cccccc',
          'editor.lineHighlightBackground': '#2d2d30',
        },
      });
      monaco.editor.defineTheme('vscode-light-plus', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#1e1e1e',
          'editor.lineHighlightBackground': '#f3f3f3',
        },
      });

      monaco.editor.setTheme(theme === 'dark' ? 'vscode-dark-plus' : 'vscode-light-plus');
      editor.focus();
    },
    [theme],
  );

  const handleOutputMount: OnMount = useCallback((editor) => {
    outputEditorRef.current = editor;
  }, []);

  /** 格式化 JSON */
  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch {
      setError(jsonErrorMessage(input));
    }
  }, [input, setOutput, setError]);

  /** 压缩 JSON */
  const compressJson = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch {
      setError(jsonErrorMessage(input));
    }
  }, [input, setOutput, setError]);

  /** 校验 JSON */
  const validateJson = useCallback(() => {
    try {
      JSON.parse(input);
      setError(null);
      addToast('JSON 格式正确 ✓', 'success');
    } catch {
      setError(jsonErrorMessage(input));
    }
  }, [input, setError, addToast]);

  /** 复制输出到剪贴板 */
  const copyOutput = useCallback(async () => {
    const text = output || input;
    if (!text) {
      addToast('没有可复制的内容', 'info');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      addToast('已复制到剪贴板 ✓', 'success');
    } catch {
      addToast('复制失败', 'error');
    }
  }, [output, input, addToast]);

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
        <span className="text-sm font-semibold text-[var(--text-primary)]">JSON Editor</span>
        <div data-tauri-drag-region className="flex-1" />
      </header>

      {/* 工具栏 */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <Button size="sm" variant="ghost" onClick={formatJson}>
          <Braces size={14} />
          <span className="hidden sm:inline">格式化</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={compressJson}>
          <Minimize2 size={14} />
          <span className="hidden sm:inline">压缩</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={validateJson}>
          <FileCheck size={14} />
          <span className="hidden sm:inline">校验</span>
        </Button>
        <span className="w-px h-5 bg-[var(--border-color)] mx-1" />
        <Button size="sm" variant="ghost" onClick={copyOutput}>
          <Copy size={14} />
          <span className="hidden sm:inline">复制</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={clear}>
          <Eraser size={14} />
          <span className="hidden sm:inline">清空</span>
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-900/20 border-b border-red-500/30 text-sm text-[var(--danger)] shrink-0">
          {error}
        </div>
      )}

      {/* 编辑器区域 - 左右分栏 */}
      <div className="flex-1 flex divide-x divide-[var(--border-color)] min-h-0">
        {/* 左侧 - 输入 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-3 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] shrink-0">
            输入
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={input}
              onChange={(value) => setInput(value ?? '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontSize: 13,
                fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
                tabSize: 2,
                automaticLayout: true,
                bracketPairColorization: { enabled: true },              }}
            />
          </div>
        </div>

        {/* 右侧 - 输出 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-3 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] shrink-0">
            输出
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={output}
              onMount={handleOutputMount}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly: true,
                fontSize: 13,
                fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
                tabSize: 2,
                automaticLayout: true,
                domReadOnly: true,              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
