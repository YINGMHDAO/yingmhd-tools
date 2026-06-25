import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 注册内置插件
import { pluginManager } from '@/core/plugin';
import { jsonEditorPlugin } from '@/plugins/json-editor';
import { portManagerPlugin } from '@/plugins/port-manager';

pluginManager.register(jsonEditorPlugin);
pluginManager.register(portManagerPlugin);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
