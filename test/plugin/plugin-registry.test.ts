import { describe, expect, it } from 'vitest';
import { PluginRegistry } from '../../src/plugin/plugin-registry';

describe('PluginRegistry', () => {
  it('starts empty', () => {
    const registry = new PluginRegistry();
    expect(registry.list()).toHaveLength(0);
    expect(registry.has('anything')).toBe(false);
  });

  it('registers and finds a plugin', () => {
    const registry = new PluginRegistry();
    registry.register({ name: 'a', install() {} });
    expect(registry.has('a')).toBe(true);
    expect(registry.list()).toHaveLength(1);
  });

  it('overwrites a plugin with the same name', () => {
    const registry = new PluginRegistry();
    registry.register({ name: 'a', install() {} });
    registry.register({ name: 'a', install() {} });
    expect(registry.list()).toHaveLength(1);
  });
});
