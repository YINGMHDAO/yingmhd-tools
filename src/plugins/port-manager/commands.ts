import type { Command } from '@/types';

export const portCommands: Command[] = [
  {
    id: 'port-scan',
    title: '扫描端口',
    keywords: ['scan', 'list', 'ports', '扫描', '端口'],
    run: () => {
      window.location.hash = '#/port-manager';
    },
  },
  {
    id: 'port-kill',
    title: '结束进程',
    keywords: ['kill', 'terminate', '结束', '终止'],
    run: () => {
      window.location.hash = '#/port-manager';
    },
  },
];
