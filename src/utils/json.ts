import { parse, type ParseError } from 'jsonc-parser';

/**
 * 定位 JSON 首个语法错误的行列位置(1 起始)。
 * JSON.parse 的错误信息格式因 JS 引擎而异(JavaScriptCore 不含位置),
 * 因此用 jsonc-parser 独立扫描定位,与引擎无关。
 */
export function locateJsonError(input: string): { line: number; col: number } | null {
  const errors: ParseError[] = [];
  parse(input, errors, { disallowComments: true, allowTrailingComma: false });
  if (errors.length === 0) return null;

  const prefix = input.slice(0, errors[0].offset).split('\n');
  return { line: prefix.length, col: prefix[prefix.length - 1].length + 1 };
}

/** 生成带行列定位的 JSON 错误提示文案 */
export function jsonErrorMessage(input: string): string {
  const pos = locateJsonError(input);
  return pos ? `JSON 格式错误 — 第 ${pos.line} 行，第 ${pos.col} 列` : 'JSON 格式错误';
}
