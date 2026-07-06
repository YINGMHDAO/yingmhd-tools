import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { loader } from '@monaco-editor/react';

// worker 由 Vite 打包为独立文件,满足 CSP worker-src 'self'
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};

// 使用本地打包的 monaco 实例,避免默认从 CDN 加载被 CSP 拦截
loader.config({ monaco });
