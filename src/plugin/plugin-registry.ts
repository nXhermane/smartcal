import type { SmartCalPlugin } from './types';

export class PluginRegistry {
  private readonly installed: Map<string, SmartCalPlugin> = new Map();

  has(name: string): boolean {
    return this.installed.has(name);
  }

  register(plugin: SmartCalPlugin): void {
    this.installed.set(plugin.name, plugin);
  }

  list(): SmartCalPlugin[] {
    return [...this.installed.values()];
  }
}
