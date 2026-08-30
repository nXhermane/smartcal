import SmartCal, { compile, isValidExpression, ConditionResult } from './src/index';

console.log('=== Basic Arithmetic ===');
console.log('2 + 3 * 4 =', SmartCal('2 + 3 * 4'));
console.log('2 ^ 3 ^ 2 =', SmartCal('2 ^ 3 ^ 2'));
console.log('10 % 3 =', SmartCal('10 % 3'));
console.log('-5 + 2 =', SmartCal('-5 + 2'));

console.log('\n=== Variables ===');
const userData = { age: 25, weight: 70, height: 1.75 };
console.log('age + 5 =', SmartCal('age + 5', userData));
console.log('BMI =', SmartCal('weight / (height ^ 2)', userData));

console.log('\n=== Ternary & Logic ===');
console.log('Grade:', SmartCal('score >= 80 ? "A" : "B"', { score: 85 }));
console.log('1 && 0 =', SmartCal('1 && 0'));
console.log('1 || 0 =', SmartCal('1 || 0'));

const taxBracket = SmartCal(
  'income < 10000 ? 0 : (income < 40000 ? 0.15 : (income < 100000 ? 0.30 : 0.45))',
  { income: 55000 }
);
console.log('Tax bracket:', taxBracket);

console.log('\n=== Unicode ===');
console.log('café price:', SmartCal('café_prix + quantité', { café_prix: 2.5, quantité: 4 }));
console.log('String literal:', SmartCal('"José María"'));

console.log('\n=== Validation ===');
console.log('Valid "2 + 2":', isValidExpression('2 + 2'));
console.log('Invalid "2 +":', isValidExpression('2 +'));
console.log('Valid ternary:', isValidExpression("x > 10 ? 'high' : 'low'"));

console.log('\n=== Compiled (JIT Mode) ===');
const priceCalc = compile('quantity * unitPrice * (1 - discount)');
console.log('Order 1:', priceCalc.evaluate({ quantity: 5, unitPrice: 10, discount: 0.1 }));
console.log('Order 2:', priceCalc.evaluate({ quantity: 3, unitPrice: 15, discount: 0.2 }));

console.log('\n=== Execution Modes ===');
const jitCalc = compile('price * (1 + taxRate)', { mode: 'jit' });
const vmCalc = compile('price * (1 + taxRate)', { mode: 'vm' });
console.log('JIT result:', jitCalc.evaluate({ price: 100, taxRate: 0.2 }));
console.log('VM result:', vmCalc.evaluate({ price: 100, taxRate: 0.2 }));

console.log('\n=== Sub-Formulas (f_*) ===');
const f_subtotal = compile('price * quantity * (1 - discount)');
const f_tax = compile('f_subtotal * taxRate');
const f_total = compile('f_subtotal + f_tax + shipping');
console.log('Order total:', f_total.evaluate({
  price: 50, quantity: 2, discount: 0.10, taxRate: 0.20, shipping: 5, f_subtotal, f_tax,
}));

console.log('\n=== Math Functions ===');
console.log('sqrt(16) =', SmartCal('sqrt(16) * 20 * round(2.7)'));
console.log('round(3.7) =', SmartCal('round(3.7)'));
console.log('min(10, 5) =', SmartCal('min(10, 5)'));
console.log('hypot =', SmartCal('sqrt(a ^ 2 + b ^ 2)', { a: 3, b: 4 }));

console.log('\n=== Boolean Values ===');
const f_baseTotal = compile('items * unitPrice');
const f_discount = compile('isPremium ? 0.15 : (f_baseTotal > 100 ? 0.1 : 0)');
const f_shipping = compile('f_baseTotal > 200 ? 0 : 10');
const f_grandTotal = compile('f_baseTotal * (1 - f_discount) + f_shipping');
console.log('Grand total:', f_grandTotal.evaluate({
  items: 3, unitPrice: 40, isPremium: ConditionResult.True, f_baseTotal, f_discount, f_shipping,
}));

console.log('\n=== Done ===');
