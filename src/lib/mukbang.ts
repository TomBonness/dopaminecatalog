import { CartItem } from "@/context/StateContext";

export interface MukbangOrderSummary {
  totalQuantity: number;
  uniqueItemCount: number;
  foodTypeCount: number;
  visiblePlateCount: number;
  overflowCount: number;
  diversityMultiplier: number;
  quantityMultiplier: number;
}

export function classifyFoodType(item: { id: string; name: string }): string {
  const name = item.name.toLowerCase();
  const id = item.id.toLowerCase();
  if (name.includes("burger") || id.includes("burger")) return "burger";
  if (
    name.includes("fry") ||
    name.includes("fries") ||
    id.includes("fry") ||
    id.includes("fries") ||
    name.includes("tater") ||
    name.includes("onion ring")
  )
    return "fries";
  if (
    name.includes("sushi") ||
    name.includes("roll") ||
    id.includes("sushi") ||
    id.includes("roll") ||
    name.includes("edamame") ||
    name.includes("tempura")
  )
    return "sushi";
  if (name.includes("pizza") || name.includes("slice") || id.includes("pizza"))
    return "pizza";
  if (
    name.includes("taco") ||
    name.includes("burrito") ||
    name.includes("nacho") ||
    id.includes("taco") ||
    id.includes("nacho")
  )
    return "taco";
  if (
    name.includes("cake") ||
    name.includes("shake") ||
    name.includes("donut") ||
    name.includes("dessert") ||
    name.includes("cookie") ||
    name.includes("sweet") ||
    name.includes("waffle") ||
    id.includes("dessert") ||
    id.includes("shake")
  )
    return "dessert";
  if (
    name.includes("drink") ||
    name.includes("soda") ||
    name.includes("cola") ||
    name.includes("water") ||
    name.includes("juice") ||
    name.includes("boba") ||
    name.includes("tea") ||
    id.includes("drink")
  )
    return "drink";
  return "other";
}

export function summarizeMukbangOrder(items: CartItem[]): MukbangOrderSummary {
  let totalQuantity = 0;
  const uniqueItems = new Set<string>();
  const foodTypes = new Set<string>();

  for (const item of items) {
    totalQuantity += item.quantity;
    uniqueItems.add(item.menuItem.id);
    foodTypes.add(classifyFoodType(item.menuItem));
  }

  const uniqueItemCount = uniqueItems.size;
  const foodTypeCount = foodTypes.size;

  // Visual layout cap (e.g. max 12 items displayed on the table)
  const VISUAL_CAP = 12;
  const visiblePlateCount = Math.min(totalQuantity, VISUAL_CAP);
  const overflowCount = Math.max(0, totalQuantity - VISUAL_CAP);

  // Diversity multiplier
  // 1 type: severe penalty (0.5)
  // 2 types: slight penalty/neutral (0.8)
  // 3 types: base neutral/good (1.1)
  // 4+ types: strong bonus (1.3 + 0.1 per type above 4, max 1.6)
  let diversityMultiplier = 1.0;
  if (foodTypeCount === 0) {
    diversityMultiplier = 0.5;
  } else if (foodTypeCount === 1) {
    diversityMultiplier = 0.5;
  } else if (foodTypeCount === 2) {
    diversityMultiplier = 0.8;
  } else if (foodTypeCount === 3) {
    diversityMultiplier = 1.1;
  } else {
    diversityMultiplier = Math.min(1.6, 1.3 + (foodTypeCount - 4) * 0.1);
  }

  // Add small bonus for unique items within types
  if (uniqueItemCount > foodTypeCount) {
    diversityMultiplier += (uniqueItemCount - foodTypeCount) * 0.05;
  }

  // Quantity multiplier: scales down for large numbers
  // E.g., 1 item = 1.0, 2 = 1.1, 3 = 1.2, etc. Capped at 1.8.
  let quantityMultiplier = 1.0;
  if (totalQuantity > 1) {
    quantityMultiplier = Math.min(1.8, 1.0 + (totalQuantity - 1) * 0.08);
  }

  return {
    totalQuantity,
    uniqueItemCount,
    foodTypeCount,
    visiblePlateCount,
    overflowCount,
    diversityMultiplier,
    quantityMultiplier,
  };
}

export interface FoodDisplayItem {
  id: string;
  name: string;
  image: string;
  type: string;
  index: number;
}

export function buildFoodDisplayItems(items: CartItem[]): FoodDisplayItem[] {
  const list: FoodDisplayItem[] = [];
  let index = 0;
  for (const item of items) {
    for (let q = 0; q < item.quantity; q++) {
      list.push({
        id: `${item.menuItem.id}-${q}`,
        name: item.menuItem.name,
        image: item.menuItem.image,
        type: classifyFoodType(item.menuItem),
        index,
      });
      index++;
    }
  }
  return list;
}

export interface PhaseResult {
  score: number;      // e.g. 0 to 100
  mistakes: number;
  perfect: boolean;
}

export function calculateMukbangPayout(
  orderCost: number,
  summary: MukbangOrderSummary,
  phaseResults: PhaseResult[]
): number {
  // Content multiplier combines diversity and quantity
  const contentMultiplier = summary.diversityMultiplier * summary.quantityMultiplier;

  // Performance multiplier from the 3 phases
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

  // Performance multiplier formula:
  // Base from score percent (0.5 to 1.1)
  // Mistake penalty: -0.05 per average mistake
  // Perfect phase bonus: +0.08 per perfect phase
  let perfMultiplier = 0.5 + avgScorePercent * 0.6 - avgMistakes * 0.05 + perfectPhases * 0.08;

  // Bounds
  perfMultiplier = Math.max(0.3, Math.min(2.0, perfMultiplier));

  const rawPayout = orderCost * contentMultiplier * perfMultiplier;

  // Bound final payout: minimum 5, max 3.5x orderCost or 1000
  const maxPayout = Math.min(1000, Math.max(50, orderCost * 3.5));
  const finalPayout = Math.max(5.0, Math.min(maxPayout, rawPayout));

  return Math.round(finalPayout * 100) / 100;
}

export interface SlotResult {
  symbols: string[];
  payout: number;
  xpReward: number;
  message: string;
}

export function evaluateSlotSpin(symbols: string[], cost: number = 50): SlotResult {
  if (symbols.length !== 3) {
    return { symbols, payout: 0, xpReward: 0, message: "Invalid spin" };
  }

  const [s1, s2, s3] = symbols;

  // Check jackpot (3 of 💎)
  if (s1 === "💎" && s2 === "💎" && s3 === "💎") {
    return {
      symbols,
      payout: 500,
      xpReward: 500,
      message: "💎 TRIPLE DIAMOND JACKPOT! 💎",
    };
  }

  // Check 3 of same food (🍔, 🍕, 🍣)
  if (s1 === s2 && s2 === s3 && ["🍔", "🍕", "🍣"].includes(s1)) {
    return {
      symbols,
      payout: 250,
      xpReward: 250,
      message: `🍔 Triple Food Feast! +$250 🍔`,
    };
  }

  // Check 3 of any other matching symbols (e.g. 🍒, 🍋, 🥤)
  if (s1 === s2 && s2 === s3) {
    return {
      symbols,
      payout: 120,
      xpReward: 120,
      message: `🎉 Triple Match! +$120 🎉`,
    };
  }

  // Check Fast Food Combo: Burger, Fries, Drink (🍔, 🍟, 🥤) in any order
  const hasBurger = symbols.includes("🍔");
  const hasFries = symbols.includes("🍟");
  const hasDrink = symbols.includes("🥤");
  if (hasBurger && hasFries && hasDrink) {
    return {
      symbols,
      payout: 80,
      xpReward: 100,
      message: "🥤 Fast Food Combo! +$80 🍟",
    };
  }

  // Check World Tour Combo: Sushi, Pizza, Taco (🍣, 🍕, 🌮) in any order
  const hasSushi = symbols.includes("🍣");
  const hasPizza = symbols.includes("🍕");
  const hasTaco = symbols.includes("🌮");
  if (hasSushi && hasPizza && hasTaco) {
    return {
      symbols,
      payout: 150,
      xpReward: 150,
      message: "🌮 World Tour Combo! +$150 🍕",
    };
  }

  // Check 2 matching symbols
  if (s1 === s2 || s2 === s3 || s1 === s3) {
    const matchedSymbol = s1 === s2 ? s1 : s3;
    let payout = 35;
    let xpReward = 20;
    if (matchedSymbol === "💎") {
      payout = 50;
      xpReward = 30;
    }
    return {
      symbols,
      payout,
      xpReward,
      message: `✨ Double Match! +$${payout} ✨`,
    };
  }

  // No match
  return {
    symbols,
    payout: 0,
    xpReward: 5,
    message: "No match. Try again!",
  };
}
