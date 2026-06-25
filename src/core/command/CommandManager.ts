import type { Command } from '@/types';

/** 命令管理器 — 单例模式 */
class CommandManager {
  private commands: Map<string, Command> = new Map();

  /** 注册命令 */
  register(command: Command): void {
    this.commands.set(command.id, command);
  }

  /** 注销命令 */
  unregister(id: string): void {
    this.commands.delete(id);
  }

  /** 获取所有命令 */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /** 执行命令 */
  async execute(id: string, input?: string): Promise<void> {
    const command = this.commands.get(id);
    if (!command) {
      console.warn(`命令 "${id}" 不存在`);
      return;
    }
    await command.run(input);
  }
}

export const commandManager = new CommandManager();
