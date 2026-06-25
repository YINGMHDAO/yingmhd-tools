import type { Command } from '@/types';

export const jsonCommands: Command[] = [
  {
    id: 'json-format',
    title: '格式化 JSON',
    keywords: ['format', 'beautify', 'pretty', '格式化'],
    run: () => {
      window.location.hash = '#/json-editor';
    },
  },
  {
    id: 'json-compress',
    title: '压缩 JSON',
    keywords: ['compress', 'minify', '压缩'],
    run: () => {
      window.location.hash = '#/json-editor';
    },
  },
  {
    id: 'json-validate',
    title: '校验 JSON',
    keywords: ['validate', 'check', '校验', '验证'],
    run: () => {
      window.location.hash = '#/json-editor';
    },
  },
];
