import type { Plugin } from '@/types';
import { jsonCommands } from './commands';

export const jsonEditorPlugin: Plugin = {
  id: 'json-editor',
  name: 'JSON Editor',
  description: '格式化、压缩、校验 JSON 数据',
  icon: 'Braces',
  version: '1.0.0',
  enabled: true,
  keywords: ['json', 'formatter', 'format', 'compress', 'validate', 'beautify', '编辑器'],
  route: '/json-editor',
  commands: jsonCommands,
  aiEnabled: false,
};
