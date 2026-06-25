import type { PortInfo } from '@/types';

let invokeFn: (<T>(cmd: string, args?: Record<string, unknown>) => Promise<T>) | null = null;

async function getInvoke() {
  if (!invokeFn) {
    const { invoke } = await import('@tauri-apps/api/core');
    invokeFn = invoke;
  }
  return invokeFn;
}

/** 获取端口列表 */
export async function getPorts(): Promise<PortInfo[]> {
  const invoke = await getInvoke();
  return invoke<PortInfo[]>('get_ports');
}

/** 结束进程 */
export async function killProcess(pid: number): Promise<void> {
  const invoke = await getInvoke();
  return invoke<void>('kill_process', { pid });
}
