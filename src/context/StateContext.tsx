"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MenuItem, MenuItemOption, Restaurant } from "@/lib/mockData";
import { useAudio } from "./AudioContext";

export interface CartItem {
  cartItemId: string; // unique ID including customization
  menuItem: MenuItem;
  selectedOptions: MenuItemOption[];
  quantity: number;
}

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
  addToCart: (menuItem: MenuItem, options: MenuItemOption[], quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: (restaurant: Restaurant) => void;
  boostCourier: (isCombo?: boolean) => void;
  completeActiveOrder: () => void;
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
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem("dopamine_points", points.toString());
      localStorage.setItem("dopamine_coins", dopamineCoins.toString());
      localStorage.setItem("dopamine_orders_count", ordersCompletedCount.toString());
      localStorage.setItem("dopamine_money_saved", moneySaved.toString());
      localStorage.setItem("dopamine_decisions_avoided", impulsiveDecisionsAvoided.toString());
      localStorage.setItem("dopamine_badges", JSON.stringify(unlockedBadges));
    }
  }, [points, dopamineCoins, ordersCompletedCount, moneySaved, impulsiveDecisionsAvoided, unlockedBadges, userId]);

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

    const interval = setInterval(() => {
      setActiveOrder(prev => {
        if (!prev) return null;
        if (prev.deliveryProgress >= 100) {
          clearInterval(interval);
          return prev;
        }
        const nextProgress = Math.min(prev.deliveryProgress + 1, 100);
        return {
          ...prev,
          deliveryProgress: nextProgress,
          status: nextProgress >= 100 ? "completed" : prev.status
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeOrder !== null]);

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

  // Order placement
  const placeOrder = (restaurant: Restaurant) => {
    if (cart.length === 0) return;

    // Calculate subtotal
    const subtotal = cart.reduce((acc, item) => {
      const optionsCost = item.selectedOptions.reduce((oAcc, o) => oAcc + o.price, 0);
      return acc + (item.menuItem.price + optionsCost) * item.quantity;
    }, 0);
    const totalCost = subtotal + restaurant.deliveryFee;

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
      boostClicks: 0
    };

    setActiveOrder(newOrder);
    setCart([]); // Clear cart
    play("checkout");
    addCoins(coinsEarned);

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
  };

  // Turbo boost button spam
  const boostCourier = (isCombo: boolean = false) => {
    if (!activeOrder || activeOrder.status === "completed") return;
    play("boost");
    const xpReward = isCombo ? 15 : 5;
    const dcReward = isCombo ? 3 : 1;
    setPoints(prev => prev + xpReward);
    setDopamineCoins(prev => prev + dcReward);
    setActiveOrder(prev => {
      if (!prev) return null;
      const newClicks = prev.boostClicks + 1;
      // Faster progression with each boost click (+4% progress per click)
      const nextProgress = Math.min(prev.deliveryProgress + 4, 100);
      if (newClicks >= 20) {
        setTimeout(() => unlockBadge("speed-demon"), 200);
      }
      return {
        ...prev,
        boostClicks: newClicks,
        deliveryProgress: nextProgress,
        status: nextProgress >= 100 ? "completed" : prev.status
      };
    });
  };

  // Complete delivery
  const completeActiveOrder = () => {
    if (!activeOrder) return;
    
    play("delivery");
    setOrdersCompletedCount(prev => prev + 1);
    setActiveOrder(null);
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
    if (typeof window !== "undefined") {
      localStorage.setItem("dopamine_points", "100");
      localStorage.setItem("dopamine_coins", "100");
      localStorage.setItem("dopamine_orders_count", "0");
      localStorage.setItem("dopamine_money_saved", "0");
      localStorage.setItem("dopamine_decisions_avoided", "0");
      localStorage.setItem("dopamine_badges", JSON.stringify([]));
      localStorage.setItem("dopamine_cart", JSON.stringify([]));
      localStorage.removeItem("dopamine_active_order");
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
        resetStats
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
