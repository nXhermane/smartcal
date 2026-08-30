/**
 * @file legacy.ts
 * @description Legacy error classes reimplemented in src/ for 100% backward compatibility.
 */

/**
 * Thrown when an expression has incorrect syntax.
 * Reimplemented for backward compatibility with v1.
 */
export class IncorrectSyntaxError extends Error {
  override readonly name = 'IncorrectSyntaxError';
  private readonly data: { exp: string };

  constructor(message: string, exp: string) {
    super(message);
    this.data = { exp };
  }

  getData(): { exp: string } {
    return this.data;
  }
}

/**
 * Thrown when a formula expression is empty or invalid.
 * Reimplemented for backward compatibility with v1.
 */
export class InvalidFormulaError extends Error {
  override readonly name = 'Invalid formula';
  private readonly data: { exp: string };

  constructor(message: string, exp: string) {
    super(message);
    this.data = { exp };
  }

  getData(): { exp: string } {
    return this.data;
  }
}

/**
 * Thrown when an error occurs during formula interpretation.
 * Reimplemented for backward compatibility with v1.
 */
export class FormulaInterpreterError extends Error {
  override readonly name = 'FormulaInterpreterError';

  constructor(
    public override readonly message: string,
    stackError?: string,
  ) {
    super(message);
    if (stackError) {
      this.stack = stackError;
    }
  }
}

/**
 * Thrown when a required variable is missing from the data container.
 * Reimplemented for backward compatibility with v1.
 */
export class FormulaVariableNotFoundError extends Error {
  override readonly name = 'FormulaVariableNotFound';
  public readonly data: { variableName: string; container: object };

  constructor(message: string, variableName: string, variableContainer: object) {
    super(message);
    this.data = { variableName, container: variableContainer };
  }

  getData(): { variableName: string; container: object } {
    return this.data;
  }
}
