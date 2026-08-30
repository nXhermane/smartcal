/**
 * @file engine.bench.ts
 * @description Official Vitest Benchmark suite for SmartCal v1.1+.
 *
 * Covers:
 * 1. Cold Evaluation: Direct `SmartCal(expr, data)` execution.
 * 2. Hot Precompiled Evaluation: `compile(expr).evaluate(data)`.
 * 3. JIT vs Fast VM Engine Comparison.
 * 4. Deep DAG Sub-formula Resolution (`f_*`).
 * 5. Parsing & Lexing Throughput.
 */

import { bench, describe } from 'vitest';
import SmartCal, { compile, isValidExpression } from '../src/index';
import { Scanner } from '../src/scanner/scanner';
import { parse } from '../src/parser/parser';

// ── Shared Datasets & Formulas ──────────────────────────────────────────────

const simpleMath = '2 + 3 * 4 - 5 / 2';

const polyFormula =
  '((x ^ 3 + 3 * x ^ 2 * y + 3 * x * y ^ 2 + y ^ 3) / (x + y)) + ((a * b - c * d) * (e + f) / (g + 1)) - ((h % 5) * (i ^ 2))';
const polyData = { x: 4, y: 3, a: 10, b: 5, c: 2, d: 4, e: 8, f: 12, g: 3, h: 14, i: 6 };

const xxlMonsterMath =
  '(a + b * (c - d / (e + f * (g - h / (i + 1))))) + ((j ^ 2 + k ^ 2 + l ^ 2) / (m * n + 1)) * ((o + p) * (q - r) + (s * t) / (u + v)) - ((w % 7) + (x % 5) + (y % 3) + z)';
const monsterData = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
  l: 12,
  m: 13,
  n: 14,
  o: 15,
  p: 16,
  q: 17,
  r: 18,
  s: 19,
  t: 20,
  u: 21,
  v: 22,
  w: 23,
  x: 24,
  y: 25,
  z: 26,
};

const deepTernary =
  'age < 18 ? 0 : (age < 25 ? 15 : (age < 60 ? (income > 50000 ? 120 : 80) : 30))';
const decisionData = { age: 35, income: 65000 };

const booleanLogicXXL =
  "(status == 'active' && age >= 21 && (country == 'FR' || country == 'DE') && score > 750) ? 1 : 0";
const logicData = { status: 'active', age: 28, country: 'FR', score: 800 };

const dag8Data = {
  base: 1000,
  rateA: 0.05,
  rateB: 0.1,
  rateC: 0.15,
  threshold: 1200,
  f_step1: compile('base * (1 + rateA)'),
  f_step2: compile('f_step1 * (1 + rateB)'),
  f_step3: compile('f_step2 - (f_step2 * rateC)'),
  f_step4: compile('f_step3 > threshold ? (f_step3 * 0.95) : f_step3'),
  f_step5: compile('f_step4 + (f_step1 * 0.02)'),
  f_step6: compile('f_step5 * 1.08'),
  f_step7: compile('f_step6 - (base * 0.01)'),
  f_finalScore: compile('f_step7'),
};

// ── 1. Cold Evaluation (Direct SmartCal) ────────────────────────────────────

describe('1. Cold Evaluation [Direct SmartCal()]', () => {
  bench('Simple Arithmetic', () => {
    SmartCal(simpleMath);
  });

  bench('Polynomial 11 Variables', () => {
    SmartCal(polyFormula, polyData);
  });

  bench('XXL Monster Formula (26 Variables)', () => {
    SmartCal(xxlMonsterMath, monsterData);
  });

  bench('Deep Nested Ternary Decision Tree', () => {
    SmartCal(deepTernary, decisionData);
  });

  bench('Boolean Logic XXL', () => {
    SmartCal(booleanLogicXXL, logicData);
  });

  bench('Cascading DAG (8 Nested f_* Formulas)', () => {
    SmartCal('f_finalScore', dag8Data);
  });
});

// ── 2. Hot Precompiled Evaluation [compile().evaluate()] ────────────────────

describe('2. Hot Precompiled Evaluation [JIT Mode]', () => {
  const compiledSimple = compile(simpleMath, { mode: 'jit' });
  const compiledPoly = compile(polyFormula, { mode: 'jit' });
  const compiledMonster = compile(xxlMonsterMath, { mode: 'jit' });
  const compiledTernary = compile(deepTernary, { mode: 'jit' });
  const compiledLogic = compile(booleanLogicXXL, { mode: 'jit' });

  bench('Simple Arithmetic [JIT]', () => {
    compiledSimple.evaluate({});
  });

  bench('Polynomial 11 Variables [JIT]', () => {
    compiledPoly.evaluate(polyData);
  });

  bench('XXL Monster Formula 26 Vars [JIT]', () => {
    compiledMonster.evaluate(monsterData);
  });

  bench('Deep Ternary Tree [JIT]', () => {
    compiledTernary.evaluate(decisionData);
  });

  bench('Boolean Logic XXL [JIT]', () => {
    compiledLogic.evaluate(logicData);
  });
});

// ── 3. Hot Precompiled Evaluation [CSP-Safe Fast VM Mode] ───────────────────

describe('3. Hot Precompiled Evaluation [Fast VM Mode]', () => {
  const vmSimple = compile(simpleMath, { mode: 'vm' });
  const vmPoly = compile(polyFormula, { mode: 'vm' });
  const vmMonster = compile(xxlMonsterMath, { mode: 'vm' });
  const vmTernary = compile(deepTernary, { mode: 'vm' });
  const vmLogic = compile(booleanLogicXXL, { mode: 'vm' });

  bench('Simple Arithmetic [VM]', () => {
    vmSimple.evaluate({});
  });

  bench('Polynomial 11 Variables [VM]', () => {
    vmPoly.evaluate(polyData);
  });

  bench('XXL Monster Formula 26 Vars [VM]', () => {
    vmMonster.evaluate(monsterData);
  });

  bench('Deep Ternary Tree [VM]', () => {
    vmTernary.evaluate(decisionData);
  });

  bench('Boolean Logic XXL [VM]', () => {
    vmLogic.evaluate(logicData);
  });
});

// ── 4. Lexing, Parsing & Compilation Throughput ─────────────────────────────

describe('4. Lexing & Parsing Throughput', () => {
  bench('Zero-Allocation Scanner (XXL Formula)', () => {
    new Scanner(xxlMonsterMath).scanTokens();
  });

  bench('Pratt Parser AST Generation (XXL Formula)', () => {
    parse(xxlMonsterMath);
  });

  bench('Full Compilation Phase: compile(polyFormula)', () => {
    compile(polyFormula);
  });

  bench('Validation Phase: isValidExpression(deepTernary)', () => {
    isValidExpression(deepTernary);
  });
});
