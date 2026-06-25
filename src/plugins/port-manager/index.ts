import type { Plugin } from '@/types';
import { portCommands } from './commands';

export const portManagerPlugin: Plugin = {
  id: 'port-manager',
  name: 'Port Manager',
  description: '查看和管理系统端口占用',
  icon: 'Network',
  version: '1.0.0',
  enabled: true,
  keywords: ['port', 'network', 'kill', 'pid', '端口', '网络', '进程'],
  route: '/port-manager',
  commands: portCommands,
  aiEnabled: false,
};
