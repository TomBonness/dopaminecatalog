"use client";

import React, { useState } from "react";
import { useAppState, BADGES, ROBOT_PARTS } from "@/context/StateContext";
import { formatCash } from "@/lib/currency";
import { useAudio } from "@/context/AudioContext";
import { ScratchCard } from "@/components/ScratchCard";
import { Award, Sparkles, Coins, ShoppingBag, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { evaluateSlotSpin, SlotResult } from "@/lib/mukbang";

const SLOT_SYMBOLS = ["💎", "🍔", "🍕", "🍣", "🌮", "🍟", "🥤", "🍒", "🍋"];

export default function RewardsPage() {
  const { play } = useAudio();
  const {
    points,
    dopamineCoins,
    unlockedBadges,
    addPoints,
    addCoins,
    unlockBadge,
    dopamineRushActive,
    incrementQuestProgress,
    pointsToNextLevel,
    level,
    ownedUpgrades,
    buyUpgrade
  } = useAppState();

  // Scratch Card State
  const [ticketState, setTicketState] = useState<"idle" | "purchased" | "revealed">("idle");
  const [resetKey, setResetKey] = useState<number>(0);
  const [rewardText, setRewardText] = useState<string>(``);
  const [rewardValue, setRewardValue] = useState<{ type: "reward" | "badge"; xp: number; coins: number; val?: string } | null>(null);
  const TICKET_COST = 80;

  // Slot Machine State
  const SPIN_COST = 50;
  const [slotReels, setSlotReels] = useState<string[]>(["💎", "🍔", "🍕"]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [slotResult, setSlotResult] = useState<SlotResult | null>(null);

  const handleBuyTicket = () => {
    if (dopamineCoins < TICKET_COST) {
      alert(`You need at least ${formatCash(TICKET_COST)} Creator Cash to purchase a Serotonin Lottery Ticket! Place more orders and film mukbangs to earn cash.`);
      return;
    }
    play("pop");
    addCoins(-TICKET_COST);
    const roll = Math.random();
    let text = "";
    let value: { type: "reward" | "badge"; xp: number; coins: number; val?: string };

    const multiplier = dopamineRushActive ? 2 : 1;

    if (roll < 0.6) {
      const amountsXP = [50, 100, 150];
      const amountsCoins = [20, 30, 40];
      const xp = amountsXP[Math.floor(Math.random() * amountsXP.length)];
      const coins = amountsCoins[Math.floor(Math.random() * amountsCoins.length)];
      const finalXp = xp * multiplier;
      const finalCoins = coins * multiplier;
      text = `+${finalXp} XP & +${formatCash(finalCoins)}`;
      value = { type: "reward", xp: finalXp, coins: finalCoins };
    } else if (roll < 0.85) {
      const xp = 300 * multiplier;
      const coins = 100 * multiplier;
      text = `🌟 JACKPOT! +${xp} XP & +${formatCash(coins)}`;
      value = { type: "reward", xp, coins };
    } else {
      const xp = 100 * multiplier;
      const coins = 50 * multiplier;
      text = `🎰 Lucky Gambler Badge! +${xp} XP & +${formatCash(coins)}`;
      value = { type: "badge", xp, coins, val: "lucky-gambler" };
    }
    setRewardText(text);
    setRewardValue(value);
    setResetKey(prev => prev + 1);
    setTicketState("purchased");
  };

  const handleScratchComplete = () => {
    if (!rewardValue) return;
    addPoints(rewardValue.xp);
    addCoins(rewardValue.coins);
    play("rankup");
    if (rewardValue.type === "badge" && rewardValue.val) {
      unlockBadge(rewardValue.val);
    }
    setTimeout(() => {
      unlockBadge("lucky-gambler");
    }, 800);

    incrementQuestProgress("serotoninScratch", 1);
    setTicketState("revealed");
  };

  const handleSpin = () => {
    if (dopamineCoins < SPIN_COST || isSpinning) return;

    addCoins(-SPIN_COST);
    setIsSpinning(true);
    setSlotResult(null);
    play("pop");

    let ticks = 0;
    const interval = setInterval(() => {
      setSlotReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);
      ticks++;
      if (ticks % 3 === 0) {
        play("pop");
      }
      if (ticks >= 15) {
        clearInterval(interval);

        const finalReels = [
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        ];

        setSlotReels(finalReels);

        const res = evaluateSlotSpin(finalReels, SPIN_COST);
        setSlotResult(res);
        setIsSpinning(false);

        if (res.payout > 0) {
          addCoins(res.payout);
          play("rankup");
        } else {
          play("lock");
        }
        if (res.xpReward > 0) {
          addPoints(res.xpReward);
        }

        unlockBadge("lucky-gambler");
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16 px-4">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow text-xs font-black uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Reward & Serotonin Center</span>
        </div>
        <h1 className="text-3xl font-black text-white">Brain-Melt Rewards</h1>
        <p className="text-xs text-zinc-500">
          Spend your hard-earned Creator Cash on high-yield serotonin games.
        </p>
      </div>

      {/* Row 1: Scratch-Off & Slot Machine Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Scratch Card */}
        <div className="space-y-6 flex flex-col items-stretch">
          <div className="p-6 rounded-3xl bg-zinc-950 border-4 border-neon-pink shadow-[0_0_30px_rgba(255,0,127,0.25)] relative overflow-hidden flex flex-col justify-between text-center space-y-5 flex-1 min-h-[420px]">
            {/* Blinking arcade lights top border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-between px-4 bg-zinc-900 border-b border-zinc-800">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-yellow animate-ping" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-pink animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-ping" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-purple animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-ping" />
            </div>
            <div className="pt-2">
              <h3 className="font-black text-base uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan text-neon-glow-pink">
                Serotonin Scratch-Off
              </h3>
              <span className="text-[9px] font-black text-zinc-500 tracking-wider block">MODEL-950 SCRATCHER</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal px-2">
              Buy a lottery card for <span className="text-neon-yellow font-extrabold">{formatCash(TICKET_COST)}</span>. Scratch to win cash multipliers & jackpot badges!
            </p>

            {/* Custom Ticket Slot Insert */}
            <div className="py-2.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center">
              <div className="border-2 border-zinc-700 bg-zinc-950 h-6 w-36 rounded-md shadow-[0_0_12px_rgba(255,0,127,0.2)] relative flex items-center justify-center overflow-hidden">
                <div className="absolute left-1/2 -translate-x-1/2 h-1 w-24 bg-neon-yellow animate-pulse" />
              </div>
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mt-2 animate-pulse">
                Dopamine Ticket Slot
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {ticketState === "idle" && (
                <button
                  onClick={handleBuyTicket}
                  disabled={dopamineCoins < TICKET_COST}
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-black bg-gradient-to-r from-neon-yellow to-neon-green hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-transparent"
                >
                  Buy Ticket for {formatCash(TICKET_COST)}
                </button>
              )}
              {ticketState !== "idle" && (
                <button
                  onClick={() => setTicketState("idle")}
                  disabled={ticketState !== "revealed"}
                  className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white border-2 border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 transition-all disabled:opacity-40"
                >
                  Get Another Card
                </button>
              )}
            </div>

            {ticketState !== "idle" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-2 flex flex-col items-center"
              >
                <ScratchCard
                  width={280}
                  height={140}
                  resetKey={resetKey}
                  rewardText={rewardText}
                  onComplete={handleScratchComplete}
                />
                <span className="block text-[10px] text-zinc-500 text-center mt-3 animate-pulse">
                  {ticketState === "purchased" ? "👆 Scratch off the cover to reveal reward!" : "🎉 Payout claimed!"}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Slot Machine */}
        <div className="space-y-6 flex flex-col items-stretch">
          <div className="p-6 rounded-3xl bg-zinc-950 border-4 border-neon-purple shadow-[0_0_30px_rgba(188,19,254,0.25)] relative overflow-hidden flex flex-col justify-between text-center space-y-5 flex-1 min-h-[420px]">
            {/* Blinking arcade lights top border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-between px-4 bg-zinc-900 border-b border-zinc-800">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-purple animate-ping" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-pink animate-ping" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-yellow animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-ping" />
            </div>
            <div className="pt-2">
              <h3 className="font-black text-base uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink text-neon-glow-purple">
                Dopamine Reels Slot
              </h3>
              <span className="text-[9px] font-black text-zinc-500 tracking-wider block">MODEL-777 JACKPOT</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal px-2">
              Spin the reels for <span className="text-neon-purple font-extrabold">{formatCash(SPIN_COST)}</span>. Hit matches or special food combos to score huge payouts!
            </p>

            {/* Slot Reels Container */}
            <div className="flex justify-center items-center space-x-3 py-6 bg-zinc-900/40 rounded-2xl border border-zinc-850 shadow-inner">
              {slotReels.map((symbol, idx) => (
                <motion.div
                  key={idx}
                  animate={isSpinning ? { y: [0, -15, 15, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 0.12 }}
                  className="w-16 h-20 xs:w-20 xs:h-24 flex items-center justify-center bg-zinc-950 border-2 border-neon-purple/50 text-4xl xs:text-5xl rounded-xl shadow-[0_0_15px_rgba(188,19,254,0.15)] select-none font-sans"
                >
                  {symbol}
                </motion.div>
              ))}
            </div>

            {/* Slot Result Summary */}
            {slotResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-xl border text-center font-bold text-[11px] sm:text-xs ${
                  slotResult.payout > 0
                    ? "bg-neon-green/10 border-neon-green/30 text-neon-green shadow-[0_0_12px_rgba(57,255,20,0.15)]"
                    : "bg-zinc-900 border-zinc-850 text-zinc-400"
                }`}
              >
                <div className="uppercase tracking-wider mb-0.5">{slotResult.message}</div>
                {slotResult.payout > 0 && (
                  <div className="font-black">
                    Win: +{formatCash(slotResult.payout)} (+{slotResult.xpReward} XP)
                  </div>
                )}
                {slotResult.payout === 0 && slotResult.xpReward > 0 && (
                  <div>
                    Award: +{slotResult.xpReward} XP
                  </div>
                )}
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSpin}
                disabled={isSpinning || dopamineCoins < SPIN_COST}
                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-black bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-[0_0_25px_rgba(188,19,254,0.5)] disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-transparent"
              >
                {isSpinning ? "SPINNING..." : `SPIN FOR ${formatCash(SPIN_COST)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Badges Accomplishments */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-md">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Award className="h-5 w-5 text-neon-pink" />
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-300">
            Your Accomplishment Badges
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={isUnlocked ? { scale: 1.04 } : {}}
                className={`p-4 rounded-xl border flex flex-col items-center justify-between text-center gap-2.5 transition-all duration-300 select-none ${
                  isUnlocked
                    ? "bg-zinc-950 border-neon-pink shadow-[0_0_12px_rgba(255,0,127,0.15)] hover:shadow-[0_0_18px_rgba(255,0,127,0.3)]"
                    : "bg-zinc-950/45 border-zinc-850/50 opacity-40 grayscale"
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
                  isUnlocked ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/30 text-neon-glow-pink" : "bg-zinc-900 text-zinc-500"
                }`}>
                  {isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Courier Robot Parts Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-md">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <ShoppingBag className="h-5 w-5 text-neon-yellow" />
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-300">
            Courier Robot Parts Shop
          </h3>
        </div>
        <p className="text-xs text-zinc-500">
          Invest your Creator Cash in hardware parts to upgrade your courier robot to handle incident categories, speed up delivery, and optimize rewards.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROBOT_PARTS.map(upgrade => {
            const isOwned = ownedUpgrades.includes(upgrade.id) || 
                            (upgrade.alias && ownedUpgrades.includes(upgrade.alias));
            const isLevelLocked = level < upgrade.levelReq;
            const canAfford = dopamineCoins >= upgrade.cost;
            return (
              <div
                key={upgrade.id}
                className={`p-5 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all duration-300 select-none bg-zinc-950 ${
                  isOwned
                    ? "border-neon-green/50 shadow-[0_0_12px_rgba(57,255,20,0.15)]"
                    : isLevelLocked
                    ? "border-zinc-800/40 opacity-45"
                    : "border-zinc-850 hover:border-zinc-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{upgrade.icon}</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Lvl {upgrade.levelReq} Req</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">{upgrade.name}</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal">{upgrade.desc}</p>
                </div>

                <div className="pt-2 border-t border-zinc-900/60 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                    <span>Cost:</span>
                    <span className="text-neon-yellow">{formatCash(upgrade.cost)}</span>
                  </div>

                  {isOwned ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg font-black text-[10px] uppercase tracking-wider bg-neon-green/10 text-neon-green border border-neon-green/30"
                    >
                      Owned
                    </button>
                  ) : isLevelLocked ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg font-black text-[10px] uppercase tracking-wider bg-zinc-900 text-zinc-600 border border-zinc-800"
                    >
                      Lvl {upgrade.levelReq} Locked
                    </button>
                  ) : (
                    <button
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all ${
                        canAfford
                          ? "bg-neon-yellow text-black border-transparent hover:shadow-[0_0_15px_rgba(255,231,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Purchase Upgrade" : "Insufficient Cash"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
