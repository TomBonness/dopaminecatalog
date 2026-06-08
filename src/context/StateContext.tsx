"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MenuItem, MenuItemOption, Restaurant } from "@/lib/mockData";
import { useAudio } from "./AudioContext";
import { scrambleOptions } from "@/lib/currency";
import {
  addViewInventoryItem,
  EMPTY_VIEW_INVENTORY,
  getViewInventoryMultiplier,
  normalizeViewInventory,
} from "@/lib/viewInventory";
import type { ViewInventory, ViewInventoryItemId } from "@/lib/viewInventory";
export type IncidentType = "gps" | "pothole" | "gatecode" | "kitchenSort" | "heatSync" | "signalJam" | "cargoBalance" | "lockerSync";

export const createIncident = (type: IncidentType, level: number, ownedUpgrades: string[] = []): Incident => {
  const hasBatteryUpgrade = ownedUpgrades.includes("turbo-battery") || ownedUpgrades.includes("signal-booster");
  let duration = 12000;
  if (hasBatteryUpgrade && (type === "gps" || type === "signalJam")) {
    duration += 6000;
  }
  const expiresAt = Date.now() + duration;
  const id = "inc_" + Math.random().toString(36).substring(2, 9);

  if (type === "gps") {
    const gpsPool = [
      {
        prompt: "Robot hit a neon alley fork. Which way avoids the drone traffic?",
        options: ["Left Alley (High Voltage)", "Right Bypass (Drone Swarm)", "Center Underpass (Clear)"],
        correctOptionIndex: 2
      },
      {
        prompt: "A delivery drone is tailing the robot! What evasive maneuver should it take?",
        options: ["Deceptive Decoy Drop", "S-Curve Speed Boost", "Chaff Flare Release"],
        correctOptionIndex: 1
      },
      {
        prompt: "GPS signal lost in the under-city grid! Select the manual correction sector:",
        options: ["Sector E-1 (Industrial)", "Sector G-4 (Residential)", "Sector B-9 (Cyber-Bazaar)"],
        correctOptionIndex: 0
      }
    ];
    const item = gpsPool[Math.floor(Math.random() * gpsPool.length)];
    return {
      id,
      type,
      phase: "route",
      prompt: item.prompt,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      expiresAt,
      duration
    };
  } else if (type === "pothole") {
    const symbols = ["▲", "▼", "◀", "▶", "●", "■"];
    const sequence: string[] = [];
    while (sequence.length < 3) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      if (!sequence.includes(sym)) {
        sequence.push(sym);
      }
    }
    return {
      id,
      type,
      phase: "route",
      prompt: "Warning: Pothole field detected! Tap the sequence to calibrate hover shields:",
      options: scrambleOptions(sequence, symbols),
      correctOptionIndex: 0,
      sequence,
      expiresAt,
      duration
    };
  } else if (type === "gatecode") {
    const codes = ["#4F9C", "#7A2B", "#9E5D", "#3B8F", "#1C6E", "#8D4A"];
    const targetCode = codes[Math.floor(Math.random() * codes.length)];
    const incorrect1 = targetCode.substring(0, 3) + (targetCode[3] === "A" ? "B" : "A");
    const incorrect2 = targetCode[0] + (targetCode[1] === "1" ? "2" : "1") + targetCode.substring(2);
    
    const options = [targetCode, incorrect1, incorrect2];
    const correctOptionIndex = Math.floor(Math.random() * 3);
    options[0] = options[correctOptionIndex];
    options[correctOptionIndex] = targetCode;

    return {
      id,
      type,
      phase: "dropoff",
      prompt: `Security gate at Neon Gated Heights! Match the passcode: ${targetCode}`,
      options,
      correctOptionIndex,
      expiresAt,
      duration
    };
  } else if (type === "kitchenSort") {
    const itemsPool = [
      {
        prompt: "Missing burger topping detected in the assembly line! What should be added?",
        options: ["Micro-Pickles", "Quantum Patty", "Cyber Cheese", "Plasma Sauce"],
        correctOptionIndex: 0
      },
      {
        prompt: "Sake dispenser is misaligned. Select the correct delivery tube configuration:",
        options: ["Tube A (Overpressure)", "Tube B (Miscalibrated)", "Tube C (Locked & Standard)"],
        correctOptionIndex: 2
      },
      {
        prompt: "Order sorting algorithm stalled! Choose the correct delivery bin for Order #77:",
        options: ["Bin Alpha (Local)", "Bin Beta (Priority Node)", "Bin Gamma (Express Port)"],
        correctOptionIndex: 1
      }
    ];
    const item = itemsPool[Math.floor(Math.random() * itemsPool.length)];
    return {
      id,
      type,
      phase: "kitchen",
      prompt: item.prompt,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      expiresAt,
      duration
    };
  } else if (type === "heatSync") {
    const heatPool = [
      {
        prompt: "Grill temperatures are reaching critical overload! Choose the coolant flow setting:",
        options: ["10% flow (Ineffective)", "50% flow (Optimal stabilization)", "100% flow (System freeze)"],
        correctOptionIndex: 1
      },
      {
        prompt: "Waffle-fry deep fryer temperature sync lost. Select the target oil thermal band:",
        options: ["High thermal (Risk of flame)", "Optimal thermal (Clean crisp)", "Low thermal (Soggy fries)"],
        correctOptionIndex: 1
      }
    ];
    const item = heatPool[Math.floor(Math.random() * heatPool.length)];
    return {
      id,
      type,
      phase: "kitchen",
      prompt: item.prompt,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      expiresAt,
      duration
    };
  } else if (type === "signalJam") {
    const symbols = ["⚡", "📶", "🔌", "📡", "🔑", "🛡️"];
    const sequence: string[] = [];
    while (sequence.length < 3) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      if (!sequence.includes(sym)) {
        sequence.push(sym);
      }
    }
    return {
      id,
      type,
      phase: "route",
      prompt: "Signal jammed! Input the correct encryption signal pattern to restore comms:",
      options: scrambleOptions(sequence, symbols),
      correctOptionIndex: 0,
      sequence,
      expiresAt,
      duration
    };
  } else if (type === "cargoBalance") {
    const balancePool = [
      {
        prompt: "Courier robot has lost balance on a wet cyber-turn! Engage stabilizer:",
        options: ["Portside thruster (Over-corrects)", "Engage anti-gravity clamps (Secured)", "Starboard thruster (Spins out)"],
        correctOptionIndex: 1
      },
      {
        prompt: "Soda cups shifting due to high-speed kinetic force! Select suspension damping:",
        options: ["Rigid dampers (Spills likely)", "Fluid dampers (Dynamic leveling)", "Soft dampers (Too bouncy)"],
        correctOptionIndex: 1
      }
    ];
    const item = balancePool[Math.floor(Math.random() * balancePool.length)];
    return {
      id,
      type,
      phase: "route",
      prompt: item.prompt,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      expiresAt,
      duration
    };
  } else { // lockerSync
    const colorCodePool = [
      {
        prompt: "Delivery locker requires synchronization! Select the Green-45 receptor:",
        options: ["Green-42 (Sync error)", "Red-45 (Mismatched band)", "Green-45 (Connection synced)"],
        correctOptionIndex: 2
      },
      {
        prompt: "Dropoff hub airlock code requested. Select the valid signature match:",
        options: ["Signature Alpha (Approved)", "Signature Beta (Rejected)", "Signature Gamma (Expired)"],
        correctOptionIndex: 0
      }
    ];
    const item = colorCodePool[Math.floor(Math.random() * colorCodePool.length)];
    return {
      id,
      type,
      phase: "dropoff",
      prompt: item.prompt,
      options: item.options,
      correctOptionIndex: item.correctOptionIndex,
      expiresAt,
      duration
    };
  }
};

export function getIncidentTypeForMilestone(milestone: number, level: number): IncidentType | null {
  if (milestone === 25) {
    const pool: IncidentType[] = ["kitchenSort"];
    if (level >= 2) pool.push("heatSync");
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  if (milestone === 50 || milestone === 75) {
    const pool: IncidentType[] = [];
    if (level >= 2) pool.push("gps");
    if (level >= 3) {
      pool.push("pothole");
      pool.push("signalJam");
    }
    if (level >= 4) pool.push("cargoBalance");

    if (pool.length === 0) return "kitchenSort";
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (milestone === 90) {
    const pool: IncidentType[] = [];
    if (level >= 5) pool.push("gatecode");
    if (level >= 6) pool.push("lockerSync");

    if (pool.length === 0) {
      return getIncidentTypeForMilestone(50, level);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return null;
}

export interface CartItem {
  cartItemId: string; // unique ID including customization
  menuItem: MenuItem;
  selectedOptions: MenuItemOption[];
  quantity: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  phase: "kitchen" | "route" | "dropoff";
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  expiresAt: number;
  duration: number;
  sequence?: string[];
  potholeSymbols?: string[];
  target?: string;
  payload?: any;
  difficulty?: number;
  displayLabel?: string;
}

export interface RobotPart {
  id: string;
  name: string;
  cost: number;
  levelReq: number;
  icon: string;
  desc: string;
  alias?: string;
}

export const ROBOT_PARTS: RobotPart[] = [
  {
    id: "route-memory",
    name: "Route Memory Core",
    cost: 1200,
    levelReq: 4,
    icon: "🛰️",
    desc: "Improves route/minigame rewards and adds +5% progress bonus on navigation incidents.",
    alias: "neon-gps"
  },
  {
    id: "signal-booster",
    name: "Signal Booster Antenna",
    cost: 2500,
    levelReq: 6,
    icon: "📡",
    desc: "Extends Turbo Boost combo window to 2.5s and adds +6s extra time to Signal Jam and GPS incidents.",
    alias: "turbo-battery"
  },
  {
    id: "cargo-clamps",
    name: "Magnetic Cargo Clamps",
    cost: 4500,
    levelReq: 9,
    icon: "🧲",
    desc: "Reduces/forgives Cargo Balance and Pothole penalties. Failed or expired incidents apply 0 progress penalty.",
    alias: "shock-absorbers"
  },
  {
    id: "kitchen-sensors",
    name: "Kitchen Sensor Arrays",
    cost: 7500,
    levelReq: 12,
    icon: "🌡️",
    desc: "Reduces/forgives Kitchen incident penalties. Completion grants +$15 cash bonus.",
    alias: "lucky-routing"
  }
];

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  status: "preparing" | "delivering" | "completed";
  pointsEarned: number;
  coinsEarned?: number;
  timestamp: number;
  deliveryProgress: number; // 0 to 100
  boostClicks: number;
  activeIncident?: Incident | null;
  resolvedIncidentCount: number;
  failedIncidentCount: number;
  incidentStreak: number;
  triggeredMilestones?: number[];
  routeId?: number;
  orderCost: number;
  videoPayout?: number;
  videoScore?: number;
}

export interface UserStats {
  points: number;
  ordersCompletedCount: number;
  moneySaved: number;
  impulsiveDecisionsAvoided: number;
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsReq?: number;
}

export const BADGES: Badge[] = [
  { id: "first-hit", name: "First Hit", description: "Placed your first simulated delivery order.", icon: "🎉" },
  { id: "fry-cadet", name: "Fry Cadet", description: "Reached Level 2 and entered the training grounds.", icon: "🍟" },
  { id: "chopstick-master", name: "Chopstick Master", description: "Reached Level 3 and mastered the neon sushi.", icon: "🥢" },
  { id: "caffeine-overlord", name: "Caffeine Overlord", description: "Reached Level 5 with extreme caffeine vibes.", icon: "☕" },
  { id: "fry-lord", name: "Fry Lord", description: "Reached Level 8. Truly supreme waffle-cut energy.", icon: "👑" },
  { id: "dopamine-emperor", name: "Dopamine Emperor", description: "Reached Level 12. Complete mastery of dopamine release.", icon: "⚡" },
  { id: "speed-demon", name: "Speed Demon", description: "Spammed Turbo Boost 20 times during one delivery.", icon: "🏎️" },
  { id: "lucky-gambler", name: "Lucky Gambler", description: "Scratched off a winning ticket in the rewards center.", icon: "🎰" },
  { id: "wealth-builder", name: "Wealth Builder", description: "Saved over $100 in fake purchases.", icon: "💰" },
  { id: "fire-breather", name: "Fire Breather", description: "Ordered extra-spicy Electric Wasabi or Volcano sauces.", icon: "🔥" }
];

export interface QuestProgress {
  turboBoost: number;
  serotoninScratch: number;
  dopamineFeast: number;
  crisisManager: number;
}

export interface QuestClaimed {
  turboBoost: boolean;
  serotoninScratch: boolean;
  dopamineFeast: boolean;
  crisisManager: boolean;
}

export interface QuestConfig {
  target: number;
  xp: number;
  coins: number;
  title: string;
  desc: string;
}

export const getQuestConfig = (level: number): Record<keyof QuestProgress, QuestConfig> => {
  const levelOffset = level - 1;

  const turboTarget = Math.min(25 + levelOffset * 5, 100);
  const scratchTarget = Math.min(2 + Math.floor(levelOffset / 3), 5);
  const feastTarget = Math.min(2 + Math.floor(levelOffset / 4), 6);
  const crisisTarget = Math.min(4 + Math.floor(levelOffset / 2), 10);

  return {
    turboBoost: {
      target: turboTarget,
      xp: 150 + (turboTarget - 25) * 4,
      coins: 50 + Math.floor((turboTarget - 25) * 1.5),
      title: "Turbo Boost",
      desc: `Speed up courier robot ${turboTarget} times.`
    },
    serotoninScratch: {
      target: scratchTarget,
      xp: 100 + (scratchTarget - 2) * 50,
      coins: 30 + (scratchTarget - 2) * 15,
      title: "Serotonin Scratch",
      desc: `Play ${scratchTarget} scratch-off cards.`
    },
    dopamineFeast: {
      target: feastTarget,
      xp: 200 + (feastTarget - 2) * 75,
      coins: 60 + (feastTarget - 2) * 20,
      title: "Dopamine Feast",
      desc: `Place ${feastTarget} orders.`
    },
    crisisManager: {
      target: crisisTarget,
      xp: 250 + (crisisTarget - 4) * 50,
      coins: 80 + (crisisTarget - 4) * 15,
      title: "Crisis Manager",
      desc: `Resolve ${crisisTarget} delivery incidents.`
    }
  };
};

interface StateContextProps {
  points: number;
  dopamineCoins: number;
  ordersCompletedCount: number;
  moneySaved: number;
  impulsiveDecisionsAvoided: number;
  unlockedBadges: string[];
  cart: CartItem[];
  activeOrder: Order | null;
  userId: string;
  level: number;
  rankName: string;
  pointsToNextLevel: number;
  pointsPercent: number;
  dopamineRushActive: boolean;
  dopamineRushTimeLeft: number;
  triggerDopamineRush: () => void;
  questProgress: QuestProgress;
  questClaimed: QuestClaimed;
  questConfig: Record<keyof QuestProgress, QuestConfig>;
  incrementQuestProgress: (questId: keyof QuestProgress, amount?: number) => void;
  claimQuestReward: (questId: keyof QuestProgress) => void;
  ownedUpgrades: string[];
  viewInventory: ViewInventory;
  viewMultiplier: number;
  awardViewInventoryItem: (itemId: ViewInventoryItemId, quantity?: number) => void;
  buyUpgrade: (upgradeId: string) => void;
  resolveIncident: (success: boolean) => void;
  addToCart: (menuItem: MenuItem, options: MenuItemOption[], quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: (restaurant: Restaurant) => boolean;
  boostCourier: (isCombo?: boolean) => void;
  completeActiveOrder: (result?: { payout: number; score: number; views?: number; viewMultiplier?: number }) => void;
  addPoints: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  syncStatsWithServer: () => Promise<void>;
  resetStats: () => void;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { play } = useAudio();
  
  // Basic states
  const [userId, setUserId] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [dopamineCoins, setDopamineCoins] = useState<number>(0);
  const [ordersCompletedCount, setOrdersCompletedCount] = useState<number>(0);
  const [moneySaved, setMoneySaved] = useState<number>(0);
  const [impulsiveDecisionsAvoided, setImpulsiveDecisionsAvoided] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Dopamine Rush & Quest states
  const [dopamineRushExpiresAt, setDopamineRushExpiresAt] = useState<number | null>(null);
  const [dopamineRushTimeLeft, setDopamineRushTimeLeft] = useState<number>(0);
  const [questProgress, setQuestProgress] = useState<QuestProgress>({
    turboBoost: 0,
    serotoninScratch: 0,
    dopamineFeast: 0,
    crisisManager: 0,
  });
  const [questClaimed, setQuestClaimed] = useState<QuestClaimed>({
    turboBoost: false,
    serotoninScratch: false,
    dopamineFeast: false,
    crisisManager: false,
  });
  const [ownedUpgrades, setOwnedUpgrades] = useState<string[]>([]);
  const [viewInventory, setViewInventory] = useState<ViewInventory>(EMPTY_VIEW_INVENTORY);
  const viewMultiplier = getViewInventoryMultiplier(viewInventory);

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedUserId = localStorage.getItem("dopamine_user_id");
      if (!storedUserId) {
        storedUserId = "user_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("dopamine_user_id", storedUserId);
      }
      setUserId(storedUserId);
      setPoints(Number(localStorage.getItem("dopamine_points") || "100")); // start with 100 welcome points!
      setDopamineCoins(Number(localStorage.getItem("dopamine_coins") || "100")); // start with 100 welcome coins!
      setOrdersCompletedCount(Number(localStorage.getItem("dopamine_orders_count") || "0"));
      setMoneySaved(Number(localStorage.getItem("dopamine_money_saved") || "0"));
      setImpulsiveDecisionsAvoided(Number(localStorage.getItem("dopamine_decisions_avoided") || "0"));
      const savedBadges = localStorage.getItem("dopamine_badges");
      if (savedBadges) {
        try {
          setUnlockedBadges(JSON.parse(savedBadges) as string[]);
        } catch {
          setUnlockedBadges([]);
        }
      }

      const savedCart = localStorage.getItem("dopamine_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart) as CartItem[]);
        } catch {
          setCart([]);
        }
      }

      const savedActiveOrder = localStorage.getItem("dopamine_active_order");
      if (savedActiveOrder) {
        try {
          setActiveOrder(JSON.parse(savedActiveOrder) as Order);
        } catch {
          setActiveOrder(null);
        }
      }

      const storedRushExpires = localStorage.getItem("dopamine_rush_expires_at");
      if (storedRushExpires) {
        const expiresAt = Number(storedRushExpires);
        if (expiresAt > Date.now()) {
          setDopamineRushExpiresAt(expiresAt);
          setDopamineRushTimeLeft(Math.ceil((expiresAt - Date.now()) / 1000));
        } else {
          localStorage.removeItem("dopamine_rush_expires_at");
        }
      }

      const savedQuestProgress = localStorage.getItem("dopamine_quest_progress");
      if (savedQuestProgress) {
        try {
          const parsed = JSON.parse(savedQuestProgress) as QuestProgress;
          setQuestProgress({
            turboBoost: parsed.turboBoost || 0,
            serotoninScratch: parsed.serotoninScratch || 0,
            dopamineFeast: parsed.dopamineFeast || 0,
            crisisManager: parsed.crisisManager || 0,
          });
        } catch {
          // fallback
        }
      }
      const savedQuestClaimed = localStorage.getItem("dopamine_quest_claimed");
      if (savedQuestClaimed) {
        try {
          const parsed = JSON.parse(savedQuestClaimed) as QuestClaimed;
          setQuestClaimed({
            turboBoost: !!parsed.turboBoost,
            serotoninScratch: !!parsed.serotoninScratch,
            dopamineFeast: !!parsed.dopamineFeast,
            crisisManager: !!parsed.crisisManager,
          });
        } catch {
          // fallback
        }
      }
      const savedUpgrades = localStorage.getItem("dopamine_owned_upgrades");
      if (savedUpgrades) {
        try {
          setOwnedUpgrades(JSON.parse(savedUpgrades) as string[]);
        } catch {
          setOwnedUpgrades([]);
        }
      }
      const savedInventory = localStorage.getItem("dopamine_inventory");
      if (savedInventory) {
        try {
          setViewInventory(normalizeViewInventory(JSON.parse(savedInventory)));
        } catch {
          setViewInventory(EMPTY_VIEW_INVENTORY);
        }
      }
    }
  }, []);

  // Save changes to LocalStorage
  // Save changes to LocalStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem("dopamine_points", points.toString());
      localStorage.setItem("dopamine_coins", dopamineCoins.toString());
      localStorage.setItem("dopamine_orders_count", ordersCompletedCount.toString());
      localStorage.setItem("dopamine_money_saved", moneySaved.toString());
      localStorage.setItem("dopamine_decisions_avoided", impulsiveDecisionsAvoided.toString());
      localStorage.setItem("dopamine_badges", JSON.stringify(unlockedBadges));
      localStorage.setItem("dopamine_quest_progress", JSON.stringify(questProgress));
      localStorage.setItem("dopamine_quest_claimed", JSON.stringify(questClaimed));
      localStorage.setItem("dopamine_owned_upgrades", JSON.stringify(ownedUpgrades));
      localStorage.setItem("dopamine_inventory", JSON.stringify(viewInventory));
    }
  }, [points, dopamineCoins, ordersCompletedCount, moneySaved, impulsiveDecisionsAvoided, unlockedBadges, questProgress, questClaimed, userId, ownedUpgrades, viewInventory]);

  // Dopamine Rush countdown timer effect
  useEffect(() => {
    if (!dopamineRushExpiresAt) {
      setDopamineRushTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const timeLeft = Math.ceil((dopamineRushExpiresAt - Date.now()) / 1000);
      if (timeLeft <= 0) {
        setDopamineRushTimeLeft(0);
        setDopamineRushExpiresAt(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("dopamine_rush_expires_at");
        }
      } else {
        setDopamineRushTimeLeft(timeLeft);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [dopamineRushExpiresAt]);

  const dopamineRushActive = dopamineRushTimeLeft > 0;

  useEffect(() => {
    if (userId) {
      localStorage.setItem("dopamine_cart", JSON.stringify(cart));
    }
  }, [cart, userId]);

  useEffect(() => {
    if (userId) {
      if (activeOrder) {
        localStorage.setItem("dopamine_active_order", JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem("dopamine_active_order");
      }
    }
  }, [activeOrder, userId]);

  // Passive courier progress simulation
  useEffect(() => {
    const hasActiveOrder = activeOrder !== null;
    if (!hasActiveOrder) return;
    const currentLevel = Math.floor(points / 500) + 1;

    const interval = setInterval(() => {
      setActiveOrder(prev => {
        if (!prev) return null;
        if (prev.deliveryProgress >= 100) {
          clearInterval(interval);
          return prev;
        }
        const nextProgress = Math.min(prev.deliveryProgress + 1, 100);
        
        let activeIncident = prev.activeIncident;
        const triggeredMilestones = prev.triggeredMilestones || [];
        const milestones = [25, 50, 75, 90];
        let newTriggered = [...triggeredMilestones];
        let incidentToTrigger: IncidentType | null = null;
        for (const m of milestones) {
          if (nextProgress >= m && !triggeredMilestones.includes(m)) {
            newTriggered.push(m);
            incidentToTrigger = getIncidentTypeForMilestone(m, currentLevel);
            break;
          }
        }
        if (incidentToTrigger && !activeIncident) {
          activeIncident = createIncident(incidentToTrigger, currentLevel, ownedUpgrades);
        }
        return {
          ...prev,
          deliveryProgress: nextProgress,
          status: nextProgress >= 100 ? "completed" : prev.status,
          activeIncident,
          triggeredMilestones: newTriggered
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeOrder !== null, points, ownedUpgrades]);

  // Synchronize stats with AWS backend endpoint
  const syncStatsWithServer = useCallback(async () => {
    if (!userId) return;
    try {
      await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          points,
          dopamineCoins,
          ordersCompletedCount,
          moneySaved,
          impulsiveDecisionsAvoided,
          unlockedBadges
        })
      });
    } catch (err) {
      console.warn("Server sync skipped or failed (DynamoDB offline):", err);
    }
  }, [userId, points, dopamineCoins, ordersCompletedCount, moneySaved, impulsiveDecisionsAvoided, unlockedBadges]);

  // Sync to database periodically
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userId) {
        syncStatsWithServer();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [points, dopamineCoins, ordersCompletedCount, moneySaved, syncStatsWithServer, userId]);

  // Level & Rank calculations
  // Level threshold: Level 1 = 0-499, Level 2 = 500-999, Level 3 = 1000-1499, etc.
  const level = Math.floor(points / 500) + 1;
  const pointsInCurrentLevel = points % 500;
  const pointsToNextLevel = 500 - pointsInCurrentLevel;
  const pointsPercent = (pointsInCurrentLevel / 500) * 100;
  const questConfig = getQuestConfig(level);

  // Rank Names
  let rankName = "Fry Cadet";
  if (level >= 12) rankName = "Dopamine Emperor ⚡";
  else if (level >= 10) rankName = "Dopamine Prince 👑";
  else if (level >= 8) rankName = "Fry Lord 🍟";
  else if (level >= 7) rankName = "Wagyu Knight 🥩";
  else if (level >= 6) rankName = "Pizza Baron 🍕";
  else if (level >= 5) rankName = "Caffeine Overlord ☕";
  else if (level >= 4) rankName = "Burrito Squire 🌯";
  else if (level >= 3) rankName = "Chopstick Master 🥢";
  else if (level >= 2) rankName = "Snack Novice 🥤";

  // Check level badges
  useEffect(() => {
    if (level >= 2 && !unlockedBadges.includes("fry-cadet")) {
      unlockBadge("fry-cadet");
    }
    if (level >= 3 && !unlockedBadges.includes("chopstick-master")) {
      unlockBadge("chopstick-master");
    }
    if (level >= 5 && !unlockedBadges.includes("caffeine-overlord")) {
      unlockBadge("caffeine-overlord");
    }
    if (level >= 8 && !unlockedBadges.includes("fry-lord")) {
      unlockBadge("fry-lord");
    }
    if (level >= 12 && !unlockedBadges.includes("dopamine-emperor")) {
      unlockBadge("dopamine-emperor");
    }
  }, [level, unlockedBadges]);

  const unlockBadge = (badgeId: string) => {
    if (!unlockedBadges.includes(badgeId)) {
      setUnlockedBadges(prev => {
        const next = [...prev, badgeId];
        play("rankup");
        return next;
      });
    }
  };

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };
  const addCoins = (amount: number) => {
    setDopamineCoins(prev => Math.max(0, prev + amount));
  };

  // Cart operations
  const addToCart = (menuItem: MenuItem, options: MenuItemOption[], quantity: number) => {
    play("pop");
    
    // Create unique cart item ID based on chosen options
    const optionIds = options.map(o => o.id).sort().join("-");
    const cartItemId = `${menuItem.id}-${optionIds}`;

    // check if it's spicy
    const hasSpicy = options.some(o => 
      o.id.includes("electric") || 
      o.id.includes("spicy") || 
      o.id.includes("volcano") || 
      menuItem.id.includes("volcano")
    );
    if (hasSpicy) {
      unlockBadge("fire-breather");
    }

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { cartItemId, menuItem, selectedOptions: options, quantity }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    play("pop");
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    play("pop");
    setCart(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const triggerDopamineRush = useCallback(() => {
    const expiresAt = Date.now() + 60 * 1000;
    setDopamineRushExpiresAt(expiresAt);
    setDopamineRushTimeLeft(60);
    if (typeof window !== "undefined") {
      localStorage.setItem("dopamine_rush_expires_at", expiresAt.toString());
    }
  }, []);

  const incrementQuestProgress = useCallback((questId: keyof QuestProgress, amount: number = 1) => {
    setQuestProgress(prev => {
      const currentLevel = Math.floor(points / 500) + 1;
      const config = getQuestConfig(currentLevel);
      const maxVal = config[questId].target;
      if (prev[questId] >= maxVal) return prev;
      return {
        ...prev,
        [questId]: Math.min(prev[questId] + amount, maxVal)
      };
    });
  }, [points]);

  const claimQuestReward = useCallback((questId: keyof QuestProgress) => {
    const currentLevel = Math.floor(points / 500) + 1;
    const config = getQuestConfig(currentLevel);
    const target = config[questId].target;
    const { xp, coins } = config[questId];

    setQuestProgress(currProgress => {
      const isCompleted = currProgress[questId] >= target;
      if (!isCompleted) return currProgress;

      setQuestClaimed(currClaimed => {
        if (currClaimed[questId]) return currClaimed;

        setPoints(prev => prev + xp);
        setDopamineCoins(prev => Math.max(0, prev + coins));
        play("rankup");

        return {
          ...currClaimed,
          [questId]: true
        };
      });

      return currProgress;
    });
  }, [play, points]);

  // Order placement
  const placeOrder = (restaurant: Restaurant): boolean => {
    if (cart.length === 0) return false;
    // Calculate subtotal
    const subtotal = cart.reduce((acc, item) => {
      const optionsCost = item.selectedOptions.reduce((oAcc, o) => oAcc + o.price, 0);
      return acc + (item.menuItem.price + optionsCost) * item.quantity;
    }, 0);
    const tax = subtotal * 0.085;
    const totalCost = subtotal > 0 ? subtotal + restaurant.deliveryFee + tax : 0;
    if (dopamineCoins < totalCost) {
      play("lock");
      return false;
    }
    // Calculate dopamine points earned
    const itemsPoints = cart.reduce((acc, item) => acc + (item.menuItem.dopaminePoints * item.quantity), 0);
    const orderPoints = itemsPoints + 100; // 100 flat points for placing order
    // Create the simulated order
    const orderId = "order_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const coinsEarned = Math.floor(orderPoints / 5);
    const newOrder: Order = {
      id: orderId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: [...cart],
      status: "preparing",
      pointsEarned: orderPoints,
      coinsEarned: coinsEarned,
      timestamp: Date.now(),
      deliveryProgress: 0,
      boostClicks: 0,
      resolvedIncidentCount: 0,
      failedIncidentCount: 0,
      incidentStreak: 0,
      triggeredMilestones: [],
      routeId: Math.floor(Math.random() * 4),
      orderCost: totalCost
    };
    setDopamineCoins(prev => Math.max(0, prev - totalCost));
    setActiveOrder(newOrder);
    setCart([]); // Clear cart
    play("checkout");
    // Track statistics
    setMoneySaved(prev => {
      const nextSaved = prev + totalCost;
      if (nextSaved >= 100) {
        // Unlock wealth builder badge if saved > $100
        setTimeout(() => unlockBadge("wealth-builder"), 500);
      }
      return nextSaved;
    });
    setImpulsiveDecisionsAvoided(prev => prev + 1);
    addPoints(orderPoints);
    unlockBadge("first-hit");
    // Quest & Rush updates
    incrementQuestProgress("dopamineFeast", 1);
    triggerDopamineRush();
    return true;
  };

  // Turbo boost button spam
  const boostCourier = (isCombo: boolean = false) => {
    if (!activeOrder || activeOrder.status === "completed") return;
    play("boost");

    const multiplier = dopamineRushActive ? 2 : 1;
    const xpReward = (isCombo ? 15 : 5) * multiplier;
    const dcReward = (isCombo ? 3 : 1) * multiplier;

    setPoints(prev => prev + xpReward);
    setDopamineCoins(prev => prev + dcReward);

    // Quest updates
    incrementQuestProgress("turboBoost", 1);

    const currentLevel = Math.floor(points / 500) + 1;

    setActiveOrder(prev => {
      if (!prev) return null;
      const newClicks = prev.boostClicks + 1;
      const nextProgress = Math.min(prev.deliveryProgress + 4, 100);
      
      let activeIncident = prev.activeIncident;
      const triggeredMilestones = prev.triggeredMilestones || [];
      const milestones = [25, 50, 75, 90];
      let newTriggered = [...triggeredMilestones];
      let incidentToTrigger: IncidentType | null = null;
      for (const m of milestones) {
        if (nextProgress >= m && !triggeredMilestones.includes(m)) {
          newTriggered.push(m);
          incidentToTrigger = getIncidentTypeForMilestone(m, currentLevel);
          break;
        }
      }
      if (incidentToTrigger && !activeIncident && nextProgress < 100) {
        activeIncident = createIncident(incidentToTrigger, currentLevel, ownedUpgrades);
      }
      if (nextProgress >= 100) {
        activeIncident = null;
      }
      if (newClicks >= 20) {
        setTimeout(() => unlockBadge("speed-demon"), 200);
      }
      return {
        ...prev,
        boostClicks: newClicks,
        deliveryProgress: nextProgress,
        status: nextProgress >= 100 ? "completed" : prev.status,
        activeIncident,
        triggeredMilestones: newTriggered
      };
    });
  };

  const resolveIncident = useCallback((success: boolean) => {
    const currentLevel = Math.floor(points / 500) + 1;
    setActiveOrder(prev => {
      if (!prev) return null;
      if (prev.status === "completed") return prev;
      if (!prev.activeIncident) return prev;
      const type = prev.activeIncident.type;
      let newStreak = prev.incidentStreak || 0;
      let resolvedCount = prev.resolvedIncidentCount || 0;
      let failedCount = prev.failedIncidentCount || 0;
      let nextProgress = prev.deliveryProgress;
      const hasGPSUpgrade = ownedUpgrades.includes("neon-gps") || ownedUpgrades.includes("route-memory");
      const hasAbsorbersUpgrade = ownedUpgrades.includes("shock-absorbers") || ownedUpgrades.includes("cargo-clamps");
      const hasRoutingUpgrade = ownedUpgrades.includes("lucky-routing") || ownedUpgrades.includes("kitchen-sensors");
      if (success) {
        play("boost");
        newStreak += 1;
        resolvedCount += 1;
        let xpReward = 20;
        let dcReward = 5;
        let progressBonus = 8;
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
        if (currentLevel >= 7) {
          xpReward = Math.floor(xpReward * 1.5);
          dcReward = Math.floor(dcReward * 1.5);
        }
        if (hasRoutingUpgrade) {
          dcReward += 15;
        }
        const multiplier = dopamineRushActive ? 2 : 1;
        xpReward *= multiplier;
        dcReward *= multiplier;
        setPoints(p => p + xpReward);
        setDopamineCoins(c => Math.max(0, c + dcReward));
        nextProgress = Math.min(nextProgress + progressBonus, 100);
        incrementQuestProgress("crisisManager", 1);
      } else {
        play("horn");
        newStreak = 0;
        failedCount += 1;
        let penalty = 5;
        if (type === "pothole" || type === "cargoBalance") penalty = 8;
        else if (type === "gatecode" || type === "lockerSync") penalty = 10;
        if (hasAbsorbersUpgrade) {
          if (type !== "kitchenSort" && type !== "heatSync") {
            penalty = 0;
          }
        }
        if (hasRoutingUpgrade) {
          if (type === "kitchenSort" || type === "heatSync") {
            penalty = 0;
          }
        }
        nextProgress = Math.max(0, nextProgress - penalty);
      }

      return {
        ...prev,
        deliveryProgress: nextProgress,
        status: nextProgress >= 100 ? "completed" : prev.status,
        activeIncident: null,
        incidentStreak: newStreak,
        resolvedIncidentCount: resolvedCount,
        failedIncidentCount: failedCount
      };
    });
  }, [play, ownedUpgrades, points, dopamineRushActive, incrementQuestProgress]);

  const buyUpgrade = useCallback((upgradeId: string) => {
    // Find matching part in ROBOT_PARTS, matching id or alias
    const part = ROBOT_PARTS.find(p => p.id === upgradeId || p.alias === upgradeId);
    if (!part) {
      play("lock");
      return;
    }
    const price = part.cost;
    const req = part.levelReq;
    const currentLevel = Math.floor(points / 500) + 1;
    if (currentLevel < req) {
      play("lock");
      return;
    }
    if (dopamineCoins < price) {
      play("lock");
      return;
    }
    // Check if owned (either by id or alias)
    const isOwned = ownedUpgrades.includes(part.id) || (part.alias && ownedUpgrades.includes(part.alias));
    if (isOwned) {
      return;
    }
    play("checkout");
    setDopamineCoins(prev => Math.max(0, prev - price));
    // Store the canonical part id when purchased
    setOwnedUpgrades(prev => [...prev, part.id]);
  }, [points, dopamineCoins, ownedUpgrades, play]);
  // Complete delivery
  const completeActiveOrder = (result?: { payout: number; score: number; views?: number; viewMultiplier?: number }) => {
    if (!activeOrder) return;
    play("delivery");
    setOrdersCompletedCount(prev => prev + 1);
    if (result && typeof result.payout === "number") {
      setDopamineCoins(prev => Math.max(0, prev + result.payout));
    }
    setActiveOrder(null);
    // Trigger dopamine rush
    triggerDopamineRush();
  };

  const awardViewInventoryItem = (itemId: ViewInventoryItemId, quantity: number = 1) => {
    setViewInventory(prev => addViewInventoryItem(prev, itemId, quantity));
  };

  const resetStats = () => {
    setPoints(100);
    setDopamineCoins(100);
    setOrdersCompletedCount(0);
    setMoneySaved(0);
    setImpulsiveDecisionsAvoided(0);
    setUnlockedBadges([]);
    setCart([]);
    setActiveOrder(null);
    setDopamineRushExpiresAt(null);
    setDopamineRushTimeLeft(0);
    setQuestProgress({
      turboBoost: 0,
      serotoninScratch: 0,
      dopamineFeast: 0,
      crisisManager: 0
    });
    setQuestClaimed({
      turboBoost: false,
      serotoninScratch: false,
      dopamineFeast: false,
      crisisManager: false
    });
    setOwnedUpgrades([]);
    setViewInventory(EMPTY_VIEW_INVENTORY);
    if (typeof window !== "undefined") {
      localStorage.setItem("dopamine_points", "100");
      localStorage.setItem("dopamine_coins", "100");
      localStorage.setItem("dopamine_orders_count", "0");
      localStorage.setItem("dopamine_money_saved", "0");
      localStorage.setItem("dopamine_decisions_avoided", "0");
      localStorage.setItem("dopamine_badges", JSON.stringify([]));
      localStorage.setItem("dopamine_cart", JSON.stringify([]));
      localStorage.removeItem("dopamine_active_order");
      localStorage.removeItem("dopamine_rush_expires_at");
      localStorage.setItem("dopamine_owned_upgrades", JSON.stringify([]));
      localStorage.setItem("dopamine_inventory", JSON.stringify(EMPTY_VIEW_INVENTORY));
      localStorage.setItem("dopamine_quest_progress", JSON.stringify({
        turboBoost: 0,
        serotoninScratch: 0,
        dopamineFeast: 0,
        crisisManager: 0
      }));
      localStorage.setItem("dopamine_quest_claimed", JSON.stringify({
        turboBoost: false,
        serotoninScratch: false,
        dopamineFeast: false,
        crisisManager: false
      }));
    }
  };

  return (
    <StateContext.Provider
      value={{
        points,
        dopamineCoins,
        ordersCompletedCount,
        moneySaved,
        impulsiveDecisionsAvoided,
        unlockedBadges,
        cart,
        activeOrder,
        userId,
        level,
        rankName,
        pointsToNextLevel,
        pointsPercent,
        dopamineRushActive,
        dopamineRushTimeLeft,
        triggerDopamineRush,
        questProgress,
        questClaimed,
        questConfig,
        incrementQuestProgress,
        claimQuestReward,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        boostCourier,
        completeActiveOrder,
        addPoints,
        addCoins,
        unlockBadge,
        syncStatsWithServer,
        resetStats,
        ownedUpgrades,
        viewInventory,
        viewMultiplier,
        awardViewInventoryItem,
        buyUpgrade,
        resolveIncident
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
};
