import type { PluginContext } from './plugin-context';

/**
 * Interface that a SmartCal plugin must implement.
 * A plugin is a stateless object registered via install().
 */
export interface SmartCalPlugin {
  /** Unique identifier. Used for deduplication. */
  readonly name: string;
  /** Optional semver version (e.g. "1.0.0"). */
  readonly version?: string;
  /**
   * Called EXACTLY ONCE during engine.use(plugin).
   * The plugin uses ctx to register its contributions.
   */
  install(ctx: PluginContext): void;
  /**
   * Optional. Called during engine.unuse(plugin) for cleanup.
   * Unused in v2.0 but reserved for future hot-reload.
   */
  uninstall?(ctx: PluginContext): void;
}
