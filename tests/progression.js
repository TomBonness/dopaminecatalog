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
  function getQuestConfig(level) {
    const levelOffset = level - 1;
    const turboTarget = Math.min(25 + levelOffset * 5, 100);
    const scratchTarget = Math.min(2 + Math.floor(levelOffset / 3), 5);
    const feastTarget = Math.min(2 + Math.floor(levelOffset / 4), 6);
    const crisisTarget = Math.min(4 + Math.floor(levelOffset / 2), 10);
    return {
      turboBoost: {
        target: turboTarget,
        xp: 150 + (turboTarget - 25) * 4,
        coins: 50 + Math.floor((turboTarget - 25) * 1.5)
      },
      serotoninScratch: {
        target: scratchTarget,
        xp: 100 + (scratchTarget - 2) * 50,
        coins: 30 + (scratchTarget - 2) * 15
      },
      dopamineFeast: {
        target: feastTarget,
        xp: 200 + (feastTarget - 2) * 75,
        coins: 60 + (feastTarget - 2) * 20
      },
      crisisManager: {
        target: crisisTarget,
        xp: 250 + (crisisTarget - 4) * 50,
        coins: 80 + (crisisTarget - 4) * 15
      }
    };
  }
  // State mock
  let questProgress = { turboBoost: 0, serotoninScratch: 0, dopamineFeast: 0, crisisManager: 0 };
  let questClaimed = { turboBoost: false, serotoninScratch: false, dopamineFeast: false, crisisManager: false };
  function incrementQuestProgress(questId, amount = 1) {
    const level = Math.floor(points / 500) + 1;
    const config = getQuestConfig(level);
    const limit = config[questId].target;
    if (questProgress[questId] >= limit) return;
    questProgress[questId] = Math.min(questProgress[questId] + amount, limit);
  }
  function claimQuestReward(questId) {
    const level = Math.floor(points / 500) + 1;
    const config = getQuestConfig(level);
    const limit = config[questId].target;
    if (questProgress[questId] < limit) return;
    if (questClaimed[questId]) return;
    points += config[questId].xp;
    coins += config[questId].coins;
    questClaimed[questId] = true;
  }
  // 1. Place orders (Dopamine Feast, target is 2 at Level 1)
  incrementQuestProgress('dopamineFeast');
  assert.strictEqual(questProgress.dopamineFeast, 1);
  incrementQuestProgress('dopamineFeast');
  assert.strictEqual(questProgress.dopamineFeast, 2);
  claimQuestReward('dopamineFeast');
  assert.strictEqual(questClaimed.dopamineFeast, true);
  assert.strictEqual(points, 300); // 100 + 200
  assert.strictEqual(coins, 160);  // 100 + 60
  // 2. Play 2 scratch-off cards (Serotonin Scratch, target is 2 at Level 1)
  incrementQuestProgress('serotoninScratch');
  incrementQuestProgress('serotoninScratch');
  assert.strictEqual(questProgress.serotoninScratch, 2);
  claimQuestReward('serotoninScratch');
  assert.strictEqual(questClaimed.serotoninScratch, true);
  assert.strictEqual(points, 400); // 300 + 100
  assert.strictEqual(coins, 190);  // 160 + 30
  // 3. Boost couriers 25 times (Turbo Boost, target is 25 at Level 1)
  for (let i = 0; i < 25; i++) {
    incrementQuestProgress('turboBoost');
  }
  assert.strictEqual(questProgress.turboBoost, 25);
  claimQuestReward('turboBoost');
  assert.strictEqual(questClaimed.turboBoost, true);
  assert.strictEqual(points, 550); // 400 + 150
  assert.strictEqual(coins, 240);  // 190 + 50
  // Now level is 2! (550 points)
  // 4. Resolve delivery incidents 4 times (Crisis Manager, target is 4 at Level 2)
  for (let i = 0; i < 4; i++) {
    incrementQuestProgress('crisisManager');
  }
  assert.strictEqual(questProgress.crisisManager, 4);
  claimQuestReward('crisisManager');
  assert.strictEqual(questClaimed.crisisManager, true);
  assert.strictEqual(points, 800); // 550 + 250
  assert.strictEqual(coins, 320);  // 240 + 80
  console.log('✓ Quest progression and claiming rewards are correct.');
}
function testIncidentsAndUpgrades() {
  console.log('- Testing delivery incidents and upgrades...');
  function calculateIncidentRewards(type, success, ownedUpgrades, level, isRushActive) {
    let xpReward = 0;
    let dcReward = 0;
    let progressBonus = 0;
    let penalty = 0;
    const hasGPSUpgrade = ownedUpgrades.includes("neon-gps") || ownedUpgrades.includes("route-memory");
    const hasAbsorbersUpgrade = ownedUpgrades.includes("shock-absorbers") || ownedUpgrades.includes("cargo-clamps");
    const hasRoutingUpgrade = ownedUpgrades.includes("lucky-routing") || ownedUpgrades.includes("kitchen-sensors");
    if (success) {
      xpReward = 20;
      dcReward = 5;
      progressBonus = 8;
      if (type === "pothole" || type === "signalJam" || type === "cargoBalance") {
        xpReward = 35;
        dcReward = 8;
        progressBonus = 12;
      } else if (type === "gatecode" || type === "lockerSync") {
        xpReward = 50;
        dcReward = 15;
        progressBonus = 15;
      }
      if (type === "gps" && hasGPSUpgrade) {
        progressBonus += 5;
      }
      if (level >= 7) {
        xpReward = Math.floor(xpReward * 1.5);
        dcReward = Math.floor(dcReward * 1.5);
      }
      if (hasRoutingUpgrade) {
        dcReward += 15;
      }
      const multiplier = isRushActive ? 2 : 1;
      xpReward *= multiplier;
      dcReward *= multiplier;
    } else {
      penalty = 5;
      if (type === "pothole" || type === "cargoBalance") penalty = 8;
      else if (type === "gatecode" || type === "lockerSync") penalty = 10;
      if (hasAbsorbersUpgrade) {
        if (type !== "kitchenSort" && type !== "heatSync") {
          penalty = 0;
        }
      }
      if (hasRoutingUpgrade) {
        if (type === "kitchenSort" && type === "heatSync") {
          penalty = 0;
        }
      }
    }
    return { xpReward, dcReward, progressBonus, penalty };
  }
  // 1. Success on GPS (level 2, no rush, no upgrades)
  const gpsSuccess = calculateIncidentRewards("gps", true, [], 2, false);
  assert.strictEqual(gpsSuccess.xpReward, 20);
  assert.strictEqual(gpsSuccess.dcReward, 5);
  assert.strictEqual(gpsSuccess.progressBonus, 8);
  // 2. Success on GPS with Neon GPS upgrade (level 2, no rush)
  const gpsNeonGps = calculateIncidentRewards("gps", true, ["neon-gps"], 2, false);
  assert.strictEqual(gpsNeonGps.progressBonus, 13);
  // 3. Success on Pothole (level 3, rush active, no upgrades)
  const potholeRush = calculateIncidentRewards("pothole", true, [], 3, true);
  assert.strictEqual(potholeRush.xpReward, 70);
  assert.strictEqual(potholeRush.dcReward, 16);
  // 4. Success on Gatecode at level 8 (rush active, with lucky-routing)
  const gatecodeLevel8 = calculateIncidentRewards("gatecode", true, ["lucky-routing"], 8, true);
  assert.strictEqual(gatecodeLevel8.xpReward, 150);
  assert.strictEqual(gatecodeLevel8.dcReward, 74);
  // 5. Failures with/without shock-absorbers
  const potholeFailNoShield = calculateIncidentRewards("pothole", false, [], 3, false);
  assert.strictEqual(potholeFailNoShield.penalty, 8);
  const potholeFailWithShield = calculateIncidentRewards("pothole", false, ["shock-absorbers"], 3, false);
  assert.strictEqual(potholeFailWithShield.penalty, 0);
  // 6. Test upgrade buying restrictions
  function canBuyUpgrade(upgradeId, level, coins, ownedUpgrades) {
    const prices = {
      "neon-gps": 150,
      "route-memory": 150,
      "turbo-battery": 250,
      "signal-booster": 250,
      "shock-absorbers": 350,
      "cargo-clamps": 350,
      "lucky-routing": 500,
      "kitchen-sensors": 500
    };
    const levelReqs = {
      "neon-gps": 2,
      "route-memory": 2,
      "turbo-battery": 3,
      "signal-booster": 3,
      "shock-absorbers": 5,
      "cargo-clamps": 5,
      "lucky-routing": 7,
      "kitchen-sensors": 7
    };
    const price = prices[upgradeId];
    const req = levelReqs[upgradeId];
    if (level < req) return "LOCKED_LEVEL";
    if (coins < price) return "INSUFFICIENT_COINS";
    if (ownedUpgrades.includes(upgradeId)) return "ALREADY_OWNED";
    if (upgradeId === "route-memory" && ownedUpgrades.includes("neon-gps")) return "ALREADY_OWNED";
    if (upgradeId === "neon-gps" && ownedUpgrades.includes("route-memory")) return "ALREADY_OWNED";
    if (upgradeId === "signal-booster" && ownedUpgrades.includes("turbo-battery")) return "ALREADY_OWNED";
    if (upgradeId === "turbo-battery" && ownedUpgrades.includes("signal-booster")) return "ALREADY_OWNED";
    if (upgradeId === "cargo-clamps" && ownedUpgrades.includes("shock-absorbers")) return "ALREADY_OWNED";
    if (upgradeId === "shock-absorbers" && ownedUpgrades.includes("cargo-clamps")) return "ALREADY_OWNED";
    if (upgradeId === "kitchen-sensors" && ownedUpgrades.includes("lucky-routing")) return "ALREADY_OWNED";
    if (upgradeId === "lucky-routing" && ownedUpgrades.includes("kitchen-sensors")) return "ALREADY_OWNED";
    return "SUCCESS";
  }
  assert.strictEqual(canBuyUpgrade("neon-gps", 1, 200, []), "LOCKED_LEVEL");
  assert.strictEqual(canBuyUpgrade("neon-gps", 2, 100, []), "INSUFFICIENT_COINS");
  assert.strictEqual(canBuyUpgrade("neon-gps", 2, 200, ["neon-gps"]), "ALREADY_OWNED");
  assert.strictEqual(canBuyUpgrade("neon-gps", 2, 200, []), "SUCCESS");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 4, 400, []), "LOCKED_LEVEL");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 5, 300, []), "INSUFFICIENT_COINS");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 5, 400, ["shock-absorbers"]), "ALREADY_OWNED");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 5, 400, []), "SUCCESS");
  console.log('✓ Incident and upgrade rules are correct.');
}
// 7. Route Interpolation Helper Test
function testRouteInterpolation() {
  console.log('- Testing Route interpolation...');
  function getPointAlongRoute(points, pct) {
    if (points.length === 0) return { x: 0, y: 0, angle: 0 };
    if (points.length === 1) return { x: points[0].x, y: points[0].y, angle: 0 };
    const segments = [];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      segments.push({ p1, p2, length });
      totalLength += length;
    }
    const targetDist = (pct / 100) * totalLength;
    let currentDist = 0;
    for (const seg of segments) {
      if (targetDist <= currentDist + seg.length || seg === segments[segments.length - 1]) {
        const segDist = targetDist - currentDist;
        const t = seg.length > 0 ? segDist / seg.length : 0;
        const x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
        const y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;
        const angle = Math.atan2(seg.p2.y - seg.p1.y, seg.p2.x - seg.p1.x) * (180 / Math.PI);
        return { x, y, angle };
      }
      currentDist += seg.length;
    }
    const last = points[points.length - 1];
    return { x: last.x, y: last.y, angle: 0 };
  }
  const testRoute = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
  const pt50 = getPointAlongRoute(testRoute, 50);
  assert.strictEqual(pt50.x, 100);
  assert.strictEqual(pt50.y, 0);
  assert.strictEqual(pt50.angle, 0);
  const pt75 = getPointAlongRoute(testRoute, 75);
  assert.strictEqual(pt75.x, 100);
  assert.strictEqual(pt75.y, 50);
  assert.strictEqual(pt75.angle, 90);
  console.log('✓ Route interpolation is correct.');
}
testQuests();
testIncidentsAndUpgrades();
testRouteInterpolation();
console.log('All tests passed successfully!');