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
  return { orderPoints };
}

console.log('- Testing Order Placement payouts...');
// Sample order: 1 glitch-burger (450 points), 2 waffle fries (200 points each)
const mockCart = [
  { id: 'glitch-burger', dopaminePoints: 450, quantity: 1 },
  { id: 'sadness-destroyer', dopaminePoints: 200, quantity: 2 }
];
const payout = simulatePlaceOrder(mockCart, 1.99);
assert.strictEqual(payout.orderPoints, 450 * 1 + 200 * 2 + 100); // 450 + 400 + 100 = 950 XP
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
      "neon-gps": 1200,
      "route-memory": 1200,
      "turbo-battery": 2500,
      "signal-booster": 2500,
      "shock-absorbers": 4500,
      "cargo-clamps": 4500,
      "lucky-routing": 7500,
      "kitchen-sensors": 7500
    };
    const levelReqs = {
      "neon-gps": 4,
      "route-memory": 4,
      "turbo-battery": 6,
      "signal-booster": 6,
      "shock-absorbers": 9,
      "cargo-clamps": 9,
      "lucky-routing": 12,
      "kitchen-sensors": 12
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
  assert.strictEqual(canBuyUpgrade("neon-gps", 3, 2000, []), "LOCKED_LEVEL");
  assert.strictEqual(canBuyUpgrade("neon-gps", 4, 1000, []), "INSUFFICIENT_COINS");
  assert.strictEqual(canBuyUpgrade("neon-gps", 4, 2000, ["neon-glow-core"]), "SUCCESS"); // not owned
  assert.strictEqual(canBuyUpgrade("neon-gps", 4, 2000, ["neon-gps"]), "ALREADY_OWNED");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 8, 5000, []), "LOCKED_LEVEL");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 9, 3000, []), "INSUFFICIENT_COINS");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 9, 5000, ["shock-absorbers"]), "ALREADY_OWNED");
  assert.strictEqual(canBuyUpgrade("cargo-clamps", 9, 5000, []), "SUCCESS");
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
function testNewEconomyAndScrambling() {
  console.log('- Testing New Economy, Mukbang Payout, Option Scrambling, Slot Machine, and Completed Stability...');
  // 1. Scramble Options Test
  function scrambleOptions(sequence, allSymbols) {
    const decoys = allSymbols.filter(s => !sequence.includes(s));
    const chosenDecoys = [];
    const availableDecoys = [...decoys];
    while (chosenDecoys.length < Math.min(3, availableDecoys.length)) {
      const idx = Math.floor(Math.random() * availableDecoys.length);
      chosenDecoys.push(availableDecoys[idx]);
      availableDecoys.splice(idx, 1);
    }
    const pool = [...sequence, ...chosenDecoys];
    let shuffled = [...pool];
    let attempts = 0;
    while (attempts < 10) {
      shuffled.sort(() => Math.random() - 0.5);
      let isIdentical = true;
      for (let i = 0; i < sequence.length; i++) {
        if (shuffled[i] !== sequence[i]) {
          isIdentical = false;
          break;
        }
      }
      if (!isIdentical) {
        break;
      }
      attempts++;
    }
    if (attempts >= 10 && shuffled.length > 1) {
      const temp = shuffled[0];
      shuffled[0] = shuffled[1];
      shuffled[1] = temp;
    }
    return shuffled;
  }
  const sequence = ["▲", "▼", "◀"];
  const allSymbols = ["▲", "▼", "◀", "▶", "●", "■"];
  const scrambled = scrambleOptions(sequence, allSymbols);
  for (const s of sequence) {
    assert(scrambled.includes(s), `Scrambled options must contain ${s}`);
  }
  assert(scrambled.length > sequence.length, "Scrambled options must contain decoys");
  let identical = true;
  for (let i = 0; i < sequence.length; i++) {
    if (scrambled[i] !== sequence[i]) {
      identical = false;
      break;
    }
  }
  assert(!identical, "Scrambled options must not match sequence order exactly");
  // 2. Checkout Affordability Test
  let dopamineCoins = 100;
  function simulateCheckout(orderCost) {
    if (dopamineCoins < orderCost) {
      return false;
    }
    dopamineCoins -= orderCost;
    return true;
  }
  assert.strictEqual(simulateCheckout(120), false);
  assert.strictEqual(dopamineCoins, 100);
  assert.strictEqual(simulateCheckout(80), true);
  assert.strictEqual(dopamineCoins, 20);
  // 3. New Mukbang Payout Formula Test
  function summarizeMukbangOrder(items) {
    let totalQuantity = 0;
    const uniqueItems = new Set();
    const foodTypes = new Set();
    function classifyFoodType(item) {
      const name = item.name.toLowerCase();
      const id = item.id.toLowerCase();
      if (name.includes("burger") || id.includes("burger")) return "burger";
      if (name.includes("fry") || name.includes("fries") || id.includes("fry") || id.includes("fries")) return "fries";
      if (name.includes("sushi") || name.includes("roll")) return "sushi";
      if (name.includes("pizza") || id.includes("pizza")) return "pizza";
      if (name.includes("taco")) return "taco";
      if (name.includes("dessert") || name.includes("shake")) return "dessert";
      if (name.includes("drink") || name.includes("cola")) return "drink";
      return "other";
    }
    for (const item of items) {
      totalQuantity += item.quantity;
      uniqueItems.add(item.id);
      foodTypes.add(classifyFoodType(item));
    }
    const uniqueItemCount = uniqueItems.size;
    const foodTypeCount = foodTypes.size;
    let diversityMultiplier = 1.0;
    if (foodTypeCount === 0 || foodTypeCount === 1) {
      diversityMultiplier = 0.5;
    } else if (foodTypeCount === 2) {
      diversityMultiplier = 0.8;
    } else if (foodTypeCount === 3) {
      diversityMultiplier = 1.1;
    } else {
      diversityMultiplier = Math.min(1.6, 1.3 + (foodTypeCount - 4) * 0.1);
    }
    if (uniqueItemCount > foodTypeCount) {
      diversityMultiplier += (uniqueItemCount - foodTypeCount) * 0.05;
    }
    let quantityMultiplier = 1.0;
    if (totalQuantity > 1) {
      quantityMultiplier = Math.min(1.8, 1.0 + (totalQuantity - 1) * 0.08);
    }
    return {
      totalQuantity,
      uniqueItemCount,
      foodTypeCount,
      diversityMultiplier,
      quantityMultiplier,
    };
  }
  function calculateMukbangPayout(orderCost, summary, phaseResults) {
    const contentMultiplier = summary.diversityMultiplier * summary.quantityMultiplier;
    let totalScore = 0;
    let totalMistakes = 0;
    let perfectPhases = 0;
    for (const res of phaseResults) {
      totalScore += res.score;
      totalMistakes += res.mistakes;
      if (res.perfect) {
        perfectPhases++;
      }
    }
    const avgScorePercent = phaseResults.length > 0 ? (totalScore / (phaseResults.length * 100)) : 0;
    const avgMistakes = phaseResults.length > 0 ? (totalMistakes / phaseResults.length) : 0;
    let perfMultiplier = 0.5 + avgScorePercent * 0.6 - avgMistakes * 0.05 + perfectPhases * 0.08;
    perfMultiplier = Math.max(0.3, Math.min(2.0, perfMultiplier));
    const rawPayout = orderCost * contentMultiplier * perfMultiplier;
    const maxPayout = Math.min(1000, Math.max(50, orderCost * 3.5));
    const finalPayout = Math.max(5.0, Math.min(maxPayout, rawPayout));
    return Math.round(finalPayout * 100) / 100;
  }
  const lowDivItems = [{ id: "burger-1", name: "Glitch Burger", quantity: 1 }];
  const summaryA = summarizeMukbangOrder(lowDivItems);
  assert.strictEqual(summaryA.foodTypeCount, 1);
  assert.strictEqual(summaryA.diversityMultiplier, 0.5);
  const resultsA = [
    { score: 100, mistakes: 0, perfect: true },
    { score: 100, mistakes: 0, perfect: true },
    { score: 100, mistakes: 0, perfect: true }
  ];
  const payoutA = calculateMukbangPayout(15, summaryA, resultsA);
  assert.ok(payoutA < 15, `Low diversity should underperform cost. Payout: ${payoutA}`);
  const highDivItems = [
    { id: "burger-1", name: "Glitch Burger", quantity: 1 },
    { id: "fries-1", name: "Sadness Destroyer Fries", quantity: 1 },
    { id: "drink-1", name: "Soda", quantity: 1 }
  ];
  const summaryB = summarizeMukbangOrder(highDivItems);
  assert.strictEqual(summaryB.foodTypeCount, 3);
  assert.strictEqual(summaryB.diversityMultiplier, 1.1);
  const resultsB = [
    { score: 90, mistakes: 1, perfect: false },
    { score: 95, mistakes: 0, perfect: true },
    { score: 90, mistakes: 1, perfect: false }
  ];
  const payoutB = calculateMukbangPayout(25, summaryB, resultsB);
  assert.ok(payoutB > 25, `Diverse order with good play should be profitable. Payout: ${payoutB}`);
  // 4. Slot Machine Evaluation Test
  function evaluateSlotSpin(symbols) {
    const [s1, s2, s3] = symbols;
    if (s1 === "💎" && s2 === "💎" && s3 === "💎") {
      return { payout: 500, xpReward: 500 };
    }
    if (s1 === s2 && s2 === s3 && ["🍔", "🍕", "🍣"].includes(s1)) {
      return { payout: 250, xpReward: 250 };
    }
    if (s1 === s2 && s2 === s3) {
      return { payout: 120, xpReward: 120 };
    }
    const hasBurger = symbols.includes("🍔");
    const hasFries = symbols.includes("🍟");
    const hasDrink = symbols.includes("🥤");
    if (hasBurger && hasFries && hasDrink) {
      return { payout: 80, xpReward: 100 };
    }
    if (s1 === s2 || s2 === s3 || s1 === s3) {
      return { payout: 35, xpReward: 20 };
    }
    return { payout: 0, xpReward: 5 };
  }
  assert.deepStrictEqual(evaluateSlotSpin(["💎", "💎", "💎"]), { payout: 500, xpReward: 500 });
  assert.deepStrictEqual(evaluateSlotSpin(["🍔", "🍔", "🍔"]), { payout: 250, xpReward: 250 });
  assert.deepStrictEqual(evaluateSlotSpin(["🍔", "🍟", "🥤"]), { payout: 80, xpReward: 100 });
  assert.deepStrictEqual(evaluateSlotSpin(["🍔", "🍔", "🍕"]), { payout: 35, xpReward: 20 });
  assert.deepStrictEqual(evaluateSlotSpin(["🍔", "🍕", "🍣"]), { payout: 0, xpReward: 5 });
  // 5. Completed Order Stability Test
  function resolveIncidentForOrder(order, success) {
    if (order.status === "completed") {
      return order;
    }
    let nextProgress = order.deliveryProgress;
    if (success) {
      nextProgress = Math.min(nextProgress + 10, 100);
    } else {
      nextProgress = Math.max(0, nextProgress - 10);
    }
    return {
      ...order,
      deliveryProgress: nextProgress,
      status: nextProgress >= 100 ? "completed" : order.status
    };
  }
  const completeOrderObj = { status: "completed", deliveryProgress: 100 };
  const resolveCompletedFailure = resolveIncidentForOrder(completeOrderObj, false);
  assert.strictEqual(resolveCompletedFailure.status, "completed", "Should remain completed");
  assert.strictEqual(resolveCompletedFailure.deliveryProgress, 100, "Should remain 100%");
  console.log('✓ New Economy, Mukbang Payout, Option Scrambling, Slot Machine, and Completed Stability are correct.');
}
testQuests();
testIncidentsAndUpgrades();
testRouteInterpolation();
testNewEconomyAndScrambling();
console.log('All tests passed successfully!');