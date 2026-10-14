import { FunctionRegistry, type MathFn } from './function-registry';

/**
 * Per-instance function registry for SmartCalEngine.
 * Unlike FunctionRegistry (static singleton), each
 * SmartCalEngine owns its own InstanceFunctionRegistry.
 *
 * Lookup order: instance customs → global builtins (FunctionRegistry).
 */
export class InstanceFunctionRegistry {
  private readonly customs: Map<string, MathFn> = new Map();

  get(name: string): MathFn | undefined {
    const key = name.toLowerCase();
    return this.customs.get(key) ?? FunctionRegistry.get(key);
  }

  has(name: string): boolean {
    const key = name.toLowerCase();
    return this.customs.has(key) || FunctionRegistry.has(key);
  }

  register(name: string, fn: MathFn): void {
    this.customs.set(name.toLowerCase(), fn);
  }

  registerMany(fns: Record<string, MathFn>): void {
    for (const [name, fn] of Object.entries(fns)) {
      this.register(name, fn);
    }
  }

  unregister(name: string): void {
    this.customs.delete(name.toLowerCase());
  }

  list(): string[] {
    return [...new Set([...this.customs.keys(), ...FunctionRegistry.list()])];
  }
}
