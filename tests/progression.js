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
// 4. Dopamine Rush rewards multiplier
function simulateBoostWithRush(isCombo, isRushActive) {
  const multiplier = isRushActive ? 2 : 1;
  const xpReward = (isCombo ? 15 : 5) * multiplier;
  const dcReward = (isCombo ? 3 : 1) * multiplier;
  return { xpReward, dcReward };
}

console.log('- Testing Dopamine Rush rewards multiplier...');
// Normal boost, no rush
const normalNoRush = simulateBoostWithRush(false, false);
assert.strictEqual(normalNoRush.xpReward, 5);
assert.strictEqual(normalNoRush.dcReward, 1);

// Normal boost, with rush
const normalRush = simulateBoostWithRush(false, true);
assert.strictEqual(normalRush.xpReward, 10);
assert.strictEqual(normalRush.dcReward, 2);

// Combo boost, with rush
const comboRush = simulateBoostWithRush(true, true);
assert.strictEqual(comboRush.xpReward, 30);
assert.strictEqual(comboRush.dcReward, 6);
console.log('✓ Dopamine Rush rewards multiplier is correct.');

// 5. Daily Quests Progress and Claim Rewards
function testQuests() {
  console.log('- Testing Quest progression and claiming rewards...');
  let points = 100;
  let coins = 100;

  // Quest configurations
  const limits = {
    turboBoost: 15,
    serotoninScratch: 1,
    dopamineFeast: 1
  };

  const rewards = {
    turboBoost: { xp: 150, coins: 50 },
    serotoninScratch: { xp: 100, coins: 30 },
    dopamineFeast: { xp: 200, coins: 60 }
  };

  // State mock
  let questProgress = { turboBoost: 0, serotoninScratch: 0, dopamineFeast: 0 };
  let questClaimed = { turboBoost: false, serotoninScratch: false, dopamineFeast: false };

  function incrementQuestProgress(questId, amount = 1) {
    if (questProgress[questId] >= limits[questId]) return;
    questProgress[questId] = Math.min(questProgress[questId] + amount, limits[questId]);
  }

  function claimQuestReward(questId) {
    if (questProgress[questId] < limits[questId]) return;
    if (questClaimed[questId]) return;
    points += rewards[questId].xp;
    coins += rewards[questId].coins;
    questClaimed[questId] = true;
  }

  // 1. Place order (Dopamine Feast)
  incrementQuestProgress('dopamineFeast');
  assert.strictEqual(questProgress.dopamineFeast, 1);
  claimQuestReward('dopamineFeast');
  assert.strictEqual(questClaimed.dopamineFeast, true);
  assert.strictEqual(points, 300); // 100 + 200
  assert.strictEqual(coins, 160);  // 100 + 60

  // 2. Play 1 scratch-off card (Serotonin Scratch)
  incrementQuestProgress('serotoninScratch');
  assert.strictEqual(questProgress.serotoninScratch, 1);
  claimQuestReward('serotoninScratch');
  assert.strictEqual(questClaimed.serotoninScratch, true);
  assert.strictEqual(points, 400); // 300 + 100
  assert.strictEqual(coins, 190);  // 160 + 30

  // 3. Boost couriers 15 times (Turbo Boost)
  for (let i = 0; i < 15; i++) {
    incrementQuestProgress('turboBoost');
  }
  assert.strictEqual(questProgress.turboBoost, 15);
  claimQuestReward('turboBoost');
  assert.strictEqual(questClaimed.turboBoost, true);
  assert.strictEqual(points, 550); // 400 + 150
  assert.strictEqual(coins, 240);  // 190 + 50

  console.log('✓ Quest progression and claiming rewards are correct.');
}

testQuests();

console.log('All tests passed successfully!');