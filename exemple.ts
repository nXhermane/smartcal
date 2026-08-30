import SmartCal, { compile, ConditionResult, isValidExpression } from './src/index';

/**
 * Example usage of SmartCal library demonstrating various features
 */

// Basic data types for examples
type UserData = {
  age: number;
  sexe: string;
  poids: number;
  taille: number;
  niveauActivite: number;
  f_IMC: string;
};

type ProductData = {
  basePrice: number;
  quantity: number;
  f_subtotal: string;
  f_discount: string;
  f_final: string;
};

type OrderData = {
  items: number;
  unitPrice: number;
  isPremium: typeof ConditionResult.True | typeof ConditionResult.False;
  f_baseTotal: string;
  f_discount: string;
  f_shipping: string;
  f_grandTotal: string;
};

// Example 1: Basic arithmetic and variable evaluation
console.log('=== Basic Examples ===');
console.log('2 + 3 * 4 =', SmartCal('2 + 3 * 4')); // 14 (respects operator precedence)
console.log('2 ^ 3 =', SmartCal('2 ^ 3')); // 8 (exponentiation)
console.log('10 % 3 =', SmartCal('10 % 3')); // 1 (modulo)

// Example 2: Working with variables and data binding
console.log('\n=== Variable Examples ===');
const userData: UserData = {
  age: 20,
  sexe: 'H',
  poids: 60,
  taille: 1.64,
  niveauActivite: 1.56,
  f_IMC: '10+5',
};

console.log('age + 5 =', SmartCal('age + 5', userData)); // 30

// Example 3: Complex formula with nested variables
const productData: ProductData = {
  basePrice: 100,
  quantity: 5,
  f_subtotal: 'basePrice * quantity',
  f_discount: 'f_subtotal >= 500 ? 0.1 : 0.05',
  f_final: 'f_subtotal * (1 - f_discount)',
};

console.log('\n=== Formula Variables ===');
console.log('f_final =', SmartCal('f_final', productData)); // 450 (500 * 0.9)

// Example 4: Conditional expressions with Unicode support
console.log('\n=== Conditional Expressions ===');
const studentData = { score: 85, name: 'José María' };
console.log(`score >= 80 ? "A" : "B" =`, SmartCal(`score >= 80 ? "A" : "B"`, studentData)); // "A"
// console.log(`"Student: " =`, SmartCal(`"Student: " + name`, studentData)); // "Student: José María"

// Example 5: Unicode string literals
console.log('\n=== Unicode Support ===');
console.log('SmartCal("café") =', SmartCal('"café"')); // "café"
console.log('SmartCal("北京") =', SmartCal('"北京"')); // "北京"
console.log('SmartCal("naïve") =', SmartCal('"naïve"')); // "naïve"
console.log(
  'SmartCal(""cnt_phase_transition"") =',
  SmartCal(`(current_care_phase == "cnt_phase_transition")`, { current_care_phase: 'hello' }),
); // cnt_phase_transition

// Example 6: Expression validation
console.log('\n=== Expression Validation ===');
console.log('isValidExpression("2 + 2") =', isValidExpression('2 + 2')); // true
console.log(
  "isValidExpression(\"x > 10 ? 'high' : 'low'\") =",
  isValidExpression("x > 10 ? 'high' : 'low'"),
); // true
console.log('isValidExpression("(a + b) * c") =', isValidExpression('(a + b) * c')); // true
console.log('isValidExpression("2 +") =', isValidExpression('2 +')); // false - incomplete expression

// Example 7: Compiled expressions for performance
console.log('\n=== Compiled Expressions ===');
const priceCalculator = compile('quantity * unitPrice * (1 - discount)');

console.log(
  'Compiled calculator with {quantity: 5, unitPrice: 10, discount: 0.1}:',
  priceCalculator.evaluate({ quantity: 5, unitPrice: 10, discount: 0.1 }),
); // 45

console.log(
  'Compiled calculator with {quantity: 3, unitPrice: 15, discount: 0.2}:',
  priceCalculator.evaluate({ quantity: 3, unitPrice: 15, discount: 0.2 }),
); // 36

// Example 8: Complex nested formulas
console.log('\n=== Complex Nested Formulas ===');
const taxCalculator = compile(`
  subtotal > 1000
    ? (subtotal * (1 + taxRate) * 0.95)
    : (subtotal * (1 + taxRate))
`);

console.log(
  'Tax calculator (subtotal: 1500, taxRate: 0.2):',
  taxCalculator.evaluate({ subtotal: 1500, taxRate: 0.2 }),
); // 1710 (includes 5% discount)

// Example 9: Working with boolean values
console.log('\n=== Boolean Values ===');
const orderData: OrderData = {
  items: 3,
  unitPrice: 40,
  isPremium: ConditionResult.True,
  f_baseTotal: 'items * unitPrice',
  f_discount: 'isPremium ? 0.15 : (f_baseTotal > 100 ? 0.1 : 0)',
  f_shipping: 'f_baseTotal > 200 ? 0 : 10',
  f_grandTotal: 'f_baseTotal * (1 - f_discount) + f_shipping',
};

console.log('f_grandTotal =', SmartCal('f_grandTotal', orderData)); // 112 (120 * 0.85 + 10)

// Example 10: Advanced rounding and calculations
console.log('\n=== Advanced Calculations ===');
const heightData = { height: 80.1 };
const arroundHeight = `(height - (height % 1)) + ((height % 1)<=0.2 ? 0:((height %1)>=0.8?1:0.5))`;

console.log('Height rounding formula validation:', isValidExpression(arroundHeight));
console.log('Height 80.1 rounded:', SmartCal(arroundHeight, heightData));
console.log('Height 80.4 rounded:', SmartCal(arroundHeight, { height: 80.4 }));
console.log('Height 80.9 rounded:', SmartCal(arroundHeight, { height: 80.9 }));

// Example 11: Logical operations
console.log('\n=== Logical Operations ===');
console.log('1 && 0 =', SmartCal('1 && 0')); // 0 (false)
console.log('1 || 0 =', SmartCal('1 || 0')); // 1 (true)
console.log('!1 =', SmartCal('!1')); // 0 (false)

// Example 12: String operations and comparisons
console.log('\n=== String Operations ===');
const carePhaseData = {
  current_care_phase: 'cnt_phase_aiguë',
  age_in_month: 8,
};

console.log(
  'String comparison result:',
  SmartCal(`(current_care_phase == "cnt_phase_aiguë") && (age_in_month >=6)`, carePhaseData),
);

// Example 13: Negative numbers
console.log('\n=== Negative Numbers ===');
console.log('-5 + -2 =', SmartCal('-5 + -2')); // -7

// Example 16: Chaining compiled expressions
console.log('\n=== Chaining Compiled Expressions ===');
const discountCalculator = compile('price >= 100 ? (discount * 2) : discount');
const finalPriceCalculator = compile(`basePrice * (1 - discountCalculator)`);

const chainedResult = finalPriceCalculator.evaluate({
  basePrice: 120,
  price: 120,
  discount: 0.1,
  discountCalculator,
});

console.log('Chained calculation result:', chainedResult); // 96 (120 * (1 - 0.2))

console.log('\n=== All Examples Completed ===');
