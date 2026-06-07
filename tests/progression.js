// Simple progression test script using Node's built-in assert
const assert = require('assert');

console.log('Running Dopamine Progression Logic Tests...');

// 1. Level Calculation Formula
function calculateLevel(points) {
  return Math.floor(points / 500) + 1;
}

function calculatePointsToNextLevel(points) {
  return 500 - (points % 500);
}

function calculatePointsPercent(points) {
  return ((points % 500) / 500) * 100;
}

// Test Level Thresholds
console.log('- Testing Level thresholds...');
assert.strictEqual(calculateLevel(0), 1);
assert.strictEqual(calculateLevel(100), 1);
assert.strictEqual(calculateLevel(499), 1);
assert.strictEqual(calculateLevel(500), 2);
assert.strictEqual(calculateLevel(999), 2);
assert.strictEqual(calculateLevel(1000), 3);
assert.strictEqual(calculateLevel(3000), 7);
console.log('✓ Level thresholds are correct.');

// 2. Order Placement Payouts
function simulatePlaceOrder(cartItems, deliveryFee) {
  // dopaminePoints per item
  const itemsPoints = cartItems.reduce((acc, item) => acc + (item.dopaminePoints * item.quantity), 0);
  const orderPoints = itemsPoints + 100; // 100 flat points
  const coinsEarned = Math.floor(orderPoints / 5);
  return { orderPoints, coinsEarned };
}

console.log('- Testing Order Placement payouts...');
// Sample order: 1 glitch-burger (450 points), 2 waffle fries (200 points each)
const mockCart = [
  { id: 'glitch-burger', dopaminePoints: 450, quantity: 1 },
  { id: 'sadness-destroyer', dopaminePoints: 200, quantity: 2 }
];
const payout = simulatePlaceOrder(mockCart, 1.99);
assert.strictEqual(payout.orderPoints, 450 * 1 + 200 * 2 + 100); // 450 + 400 + 100 = 950 XP
assert.strictEqual(payout.coinsEarned, Math.floor(950 / 5)); // 190 DC
console.log('✓ Order Placement payouts are correct.');

// 3. Courier Boost Rewards
function simulateBoost(isCombo) {
  const xpReward = isCombo ? 15 : 5;
  const dcReward = isCombo ? 3 : 1;
  return { xpReward, dcReward };
}

console.log('- Testing Courier Boost rewards...');
// Normal boost
const normalBoost = simulateBoost(false);
assert.strictEqual(normalBoost.xpReward, 5);
assert.strictEqual(normalBoost.dcReward, 1);

// Active combo boost
const comboBoost = simulateBoost(true);
assert.strictEqual(comboBoost.xpReward, 15);
assert.strictEqual(comboBoost.dcReward, 3);
console.log('✓ Courier Boost rewards are correct.');

console.log('All tests passed successfully!');
