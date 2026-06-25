import type { Plugin, Command } from '@/types';

/** 插件管理器 — 单例模式 */
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  /** 注册插件 */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`插件 "${plugin.id}" 已存在，将被覆盖`);
    }
    this.plugins.set(plugin.id, { ...plugin });
  }

  /** 注销插件 */
  unregister(id: string): void {
    this.plugins.delete(id);
  }

  /** 获取单个插件 */
  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  /** 获取所有插件 */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /** 获取已启用的插件 */
  getEnabledPlugins(): Plugin[] {
    return this.getPlugins().filter((p) => p.enabled);
  }

  /** 聚合所有已启用插件的命令 */
  getCommands(): Command[] {
    const commands: Command[] = [];
    for (const plugin of this.getEnabledPlugins()) {
      if (plugin.commands) {
        commands.push(...plugin.commands);
      }
    }
    return commands;
  }

  /** 切换插件启用状态 */
  togglePlugin(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = !plugin.enabled;
    }
  }

  /** 设置插件启用状态 */
  setEnabled(id: string, enabled: boolean): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = enabled;
    }
  }
}

export const pluginManager = new PluginManager();
