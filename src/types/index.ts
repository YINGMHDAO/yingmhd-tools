import type { ComponentType } from 'react';

/** 插件接口 */
export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide 图标名
  version: string;
  enabled: boolean;
  keywords: string[];
  route?: string;
  page?: ComponentType;
  commands?: Command[];
  aiEnabled?: boolean;
}

/** 命令接口 */
export interface Command {
  id: string;
  title: string;
  keywords: string[];
  run(input?: string): Promise<void> | void;
}

/** 端口信息 */
export interface PortInfo {
  port: number;
  pid: number;
  processName: string;
}

/** Toast 类型 */
export type ToastType = 'success' | 'error' | 'info';

/** Toast 通知 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/** 搜索结果项 */
export interface SearchItem {
  id: string;
  title: string;
  keywords: string[];
  type: 'command' | 'plugin';
}

/** 快捷键冲突事件 */
export interface ShortcutConflictEvent {
  attempted: string;
  error: string;
}

/** 应用主题 */
export type Theme = 'dark' | 'light';
