import { globalEngine } from '../global-engine';

/**
 * Parse an expression and return all variable names it references.
 * Excludes `f_*` sub-formula identifiers.
 *
 * @throws {ScanError | ParseError} if the expression is syntactically invalid.
 */
export function extractVariables(expression: string): string[] {
  return globalEngine.extractVariables(expression);
}
