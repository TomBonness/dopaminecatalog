"use client";

import React, { useState } from "react";
import { useAppState, BADGES } from "@/context/StateContext";
import { useAudio } from "@/context/AudioContext";
import { ScratchCard } from "@/components/ScratchCard";
import { Award, Sparkles, Coins, ShoppingBag, Landmark } from "lucide-react";
import { motion } from "framer-motion";

export default function RewardsPage() {
  const { play } = useAudio();
  const {
    points,
    unlockedBadges,
    addPoints,
    unlockBadge,
    moneySaved,
    impulsiveDecisionsAvoided
  } = useAppState();

  const [ticketState, setTicketState] = useState<"idle" | "purchased" | "revealed">("idle");
  const [resetKey, setResetKey] = useState<number>(0);
  const [rewardText, setRewardText] = useState<string>("");
  const [rewardValue, setRewardValue] = useState<{ type: "points" | "badge"; val: number | string } | null>(null);

  const TICKET_COST = 80;

  const handleBuyTicket = () => {
    if (points < TICKET_COST) {
      alert("You need at least 80 XP to purchase a Serotonin Lottery Ticket! Place more orders to earn XP.");
      return;
    }

    play("pop");
    // Deduct ticket cost (we add negative points)
    addPoints(-TICKET_COST);

    // Roll reward
    const roll = Math.random();
    let text = "";
    let value: { type: "points" | "badge"; val: number | string };

    if (roll < 0.6) {
      // Common points reward: 50, 100, 150, 200
      const amounts = [50, 100, 150, 200];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      text = `+${amount} Brain Points`;
      value = { type: "points", val: amount };
    } else if (roll < 0.85) {
      // Jackpot points: 300, 500
      const amounts = [300, 500];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      text = `🌟 JACKPOT! +${amount} XP`;
      value = { type: "points", val: amount };
    } else {
      // Badge reward
      text = "🎰 Lucky Gambler Badge!";
      value = { type: "badge", val: "lucky-gambler" };
    }

    setRewardText(text);
    setRewardValue(value);
    setResetKey(prev => prev + 1);
    setTicketState("purchased");
  };

  const handleScratchComplete = () => {
    if (!rewardValue) return;

    // Trigger reward payout
    if (rewardValue.type === "points") {
      addPoints(Number(rewardValue.val));
      play("rankup");
    } else if (rewardValue.type === "badge") {
      unlockBadge(String(rewardValue.val));
      play("rankup");
    }

    // Automatically unlock lucky-gambler since they completed a scratchcard successfully
    setTimeout(() => {
      unlockBadge("lucky-gambler");
    }, 800);

    setTicketState("revealed");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow text-xs font-black uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Reward & Serotonin Center</span>
        </div>
        <h1 className="text-3xl font-black text-white">Brain-Melt Rewards</h1>
        <p className="text-xs text-zinc-500">
          Spend your hard-earned XP on simulated scratch-offs to win jackpots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Lottery ticket widget */}
        <div className="md:col-span-1 space-y-6 flex flex-col items-center">
          <div className="w-full p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-md">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-300">
              Serotonin Lottery
            </h3>
            
            <p className="text-[11px] text-zinc-500 leading-normal">
              Spend 80 XP for a scratch-off ticket. Win up to +500 XP or unlock the legendary Lucky Gambler badge!
            </p>

            <div className="h-10 w-full flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400 font-bold">Your Balance: </span>
              <span className="text-sm font-black text-neon-cyan text-neon-glow-cyan ml-1.5">{points} XP</span>
            </div>

            {ticketState === "idle" && (
              <button
                onClick={handleBuyTicket}
                disabled={points < TICKET_COST}
                className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-black bg-neon-yellow hover:shadow-[0_0_20px_rgba(255,231,0,0.5)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none hover:scale-102 transition-all"
              >
                Buy Ticket (85 XP)
              </button>
            )}

            {ticketState !== "idle" && (
              <button
                onClick={() => setTicketState("idle")}
                disabled={ticketState !== "revealed"}
                className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 transition-all disabled:opacity-40"
              >
                Scratch Again
              </button>
            )}
          </div>

          {/* Interactive scratch card viewport */}
          {ticketState !== "idle" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2"
            >
              <ScratchCard
                width={280}
                height={160}
                resetKey={resetKey}
                rewardText={rewardText}
                onComplete={handleScratchComplete}
              />
              <span className="block text-[10px] text-zinc-500 text-center mt-3 animate-pulse">
                {ticketState === "purchased" ? "👆 Drag mouse or finger to scratch!" : "🎉 Reward claimed!"}
              </span>
            </motion.div>
          )}
        </div>

        {/* Right Column: Badges & accomplishments */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-md">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Award className="h-5 w-5 text-neon-pink" />
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-300">
                Your Accomplishment Badges
              </h3>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {BADGES.map(badge => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={isUnlocked ? { scale: 1.04 } : {}}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-between text-center gap-2.5 transition-all duration-300 select-none ${
                      isUnlocked
                        ? "bg-zinc-950 border-neon-pink shadow-[0_0_12px_rgba(255,0,127,0.1)] hover:shadow-[0_0_18px_rgba(255,0,127,0.25)]"
                        : "bg-zinc-950/45 border-zinc-800/50 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{badge.icon}</span>
                    <div>
                      <h4 className={`font-black text-xs ${isUnlocked ? "text-white" : "text-zinc-500"}`}>
                        {badge.name}
                      </h4>
                      <p className="text-[9px] text-zinc-500 leading-tight mt-1 max-w-[110px] mx-auto">
                        {badge.description}
                      </p>
                    </div>
                    
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isUnlocked ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/30 text-neon-glow-pink" : "bg-zinc-900 text-zinc-650"
                    }`}>
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Addiction Analytics footer card */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-zinc-500 text-xs font-black uppercase tracking-widest">
            <Coins className="h-3.5 w-3.5 text-neon-green" />
            <span>Money Avoided</span>
          </div>
          <span className="text-xl font-black text-neon-green text-neon-glow-green block mt-1">${moneySaved.toFixed(2)}</span>
          <span className="text-[10px] text-zinc-500 block">Total simulated cart checkout value saved.</span>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-zinc-500 text-xs font-black uppercase tracking-widest">
            <ShoppingBag className="h-3.5 w-3.5 text-neon-pink" />
            <span>Avoided Deliveries</span>
          </div>
          <span className="text-xl font-black text-neon-pink text-neon-glow-pink block mt-1">{impulsiveDecisionsAvoided} orders</span>
          <span className="text-[10px] text-zinc-500 block">Impulsive real-world clicks deflected here.</span>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-zinc-500 text-xs font-black uppercase tracking-widest">
            <Landmark className="h-3.5 w-3.5 text-neon-yellow" />
            <span>Dopamine Saved</span>
          </div>
          <span className="text-xl font-black text-neon-yellow text-neon-glow-yellow block mt-1">INFINITE</span>
          <span className="text-[10px] text-zinc-500 block">Real bank account remains perfectly safe.</span>
        </div>
      </div>

    </div>
  );
}
