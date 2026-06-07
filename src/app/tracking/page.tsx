"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppState } from "@/context/StateContext";
import { useAudio } from "@/context/AudioContext";
import { TrackingMap } from "@/components/TrackingMap";
import { Bike, ShieldAlert, Rocket, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
}

export default function TrackingPage() {
  const { play } = useAudio();
  const router = useRouter();
  const {
    activeOrder,
    boostCourier,
    completeActiveOrder,
    dopamineRushActive,
    ownedUpgrades,
    resolveIncident
  } = useAppState();

  const [shuffledPotholeSymbols, setShuffledPotholeSymbols] = useState<string[]>([]);
  const [potholeProgress, setPotholeProgress] = useState<number>(0);
  const [incidentTimeLeft, setIncidentTimeLeft] = useState<number>(0);

  const [combo, setCombo] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const comboDecayRef = useRef<NodeJS.Timeout | null>(null);

  const hornPlayed = useRef<boolean>(false);
  const bellPlayed = useRef<boolean>(false);

  // Monitor progress for sound effect triggers
  useEffect(() => {
    if (!activeOrder) {
      hornPlayed.current = false;
      bellPlayed.current = false;
      return;
    }

    const progress = activeOrder.deliveryProgress;

    // Play horn when courier departs (around 45% progress)
    if (progress >= 45 && progress < 100 && !hornPlayed.current) {
      hornPlayed.current = true;
      play("horn");
    }

    // Play doorbell when courier arrives (100% progress)
    if (progress >= 100 && !bellPlayed.current) {
      bellPlayed.current = true;
      play("delivery");
    }
  }, [activeOrder, play]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (comboDecayRef.current) clearTimeout(comboDecayRef.current);
    };
  }, []);

  // Shuffle pothole sequence on change
  useEffect(() => {
    if (activeOrder?.activeIncident?.type === "pothole") {
      const seq = activeOrder.activeIncident.sequence || [];
      const shuffled = [...seq].sort(() => Math.random() - 0.5);
      setShuffledPotholeSymbols(shuffled);
      setPotholeProgress(0);
    }
  }, [activeOrder?.activeIncident?.id]);

  // Monitor incident timer expiration
  useEffect(() => {
    if (!activeOrder?.activeIncident) {
      setIncidentTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const expiresAt = activeOrder.activeIncident!.expiresAt;
      const left = expiresAt - Date.now();
      if (left <= 0) {
        clearInterval(interval);
        setIncidentTimeLeft(0);
        resolveIncident(false);
        addFloatingText("⏰ Incident Expired!", false);
      } else {
        setIncidentTimeLeft(left);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeOrder?.activeIncident?.id, resolveIncident]);

  const addFloatingText = (text: string, isSuccess: boolean) => {
    const newText: FloatingText = {
      id: `${Date.now()}-${Math.random()}`,
      x: 100 + Math.random() * 100,
      y: 50,
      text: text
    };
    setFloatingTexts(prev => [...prev, newText]);
  };

  const handlePotholeTap = (symbol: string) => {
    if (!activeOrder?.activeIncident) return;
    const seq = activeOrder.activeIncident.sequence || [];
    const nextTarget = seq[potholeProgress];
    if (symbol === nextTarget) {
      const nextProgress = potholeProgress + 1;
      setPotholeProgress(nextProgress);
      play("boost");
      if (nextProgress >= seq.length) {
        resolveIncident(true);
        addFloatingText("✓ Shields Calibrated! +Progress", true);
      }
    } else {
      resolveIncident(false);
      addFloatingText("⚡ Shield Calibration Failed!", false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (!activeOrder?.activeIncident) return;
    const isCorrect = index === activeOrder.activeIncident.correctOptionIndex;
    resolveIncident(isCorrect);
    if (isCorrect) {
      addFloatingText("✓ Route Corrected! +XP", true);
    } else {
      addFloatingText("❌ Wrong Option! -Progress", false);
    }
  };

  if (!activeOrder) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-white text-xl">No active deliveries!</h3>
          <p className="text-zinc-500 max-w-xs text-xs">
            Feed your brain first by placing a simulated order from our premium kitchens.
          </p>
        </div>
        <Link href="/">
          <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-black text-xs uppercase tracking-widest text-white border-0 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:scale-105 transition-all">
            Browse Kitchens
          </button>
        </Link>
      </div>
    );
  }

  const progress = activeOrder.deliveryProgress;
  const isCompleted = progress >= 100;

  // Status Ticker Messages
  const getTickerMessage = (prog: number) => {
    if (activeOrder?.activeIncident) {
      return `⚠️ CRISIS: ${activeOrder.activeIncident.type === "gps" ? "GPS Glitch!" : activeOrder.activeIncident.type === "pothole" ? "Pothole Panic!" : "Gate Code Scramble!"}`;
    }
    if (prog <= 15) return "Kitchen is aggressively chopping cyber-lettuce...";
    if (prog <= 30) return "Chef is performing a ceremonial seasoning of the patty...";
    if (prog <= 45) return "Assembling your simulated order with absolute care...";
    if (prog <= 60) return "Courier dispatched! Speeding through red lights using quantum tunnels...";
    if (prog <= 75) return "Courier is avoiding a giant neighborhood cat wearing sunglasses...";
    if (prog <= 90) return "Courier is double-checking for napkins and sauces...";
    if (prog <= 99) return "Courier is hovering in your front yard via jetpack...";
    return "Arrived! Open the airlock and receive the dopamine rush!";
  };

  const handleBoostClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isCombo = combo > 4;
    boostCourier(isCombo);
    // Add combo multiplier
    setCombo(prev => {
      const next = prev + 1;
      const comboDecayDuration = ownedUpgrades.includes("turbo-battery") ? 2500 : 1200;
      if (comboDecayRef.current) clearTimeout(comboDecayRef.current);
      comboDecayRef.current = setTimeout(() => {
        setCombo(0);
      }, comboDecayDuration);
      return next;
    });
    // Create a floating combo text element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20);
    const y = e.clientY - rect.top - 20;

    const multiplier = dopamineRushActive ? 2 : 1;
    const xpVal = (isCombo ? 15 : 5) * multiplier;
    const dcVal = (isCombo ? 3 : 1) * multiplier;

    const newText: FloatingText = {
      id: `${Date.now()}-${Math.random()}`,
      x,
      y,
      text: isCombo ? `🔥 COMBO X${combo}! +${xpVal} XP | +${dcVal} DC` : `🚀 BOOST! +${xpVal} XP | +${dcVal} DC`
    };
    setFloatingTexts(prev => [...prev, newText]);
  };

  const removeFloatingText = (id: string) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-black uppercase tracking-wider">
            <Bike className="h-3.5 w-3.5 animate-bounce" />
            <span>Real-time Tracking</span>
          </div>
          {activeOrder.incidentStreak > 0 && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow text-xs font-black uppercase tracking-wider animate-bounce">
              <span>🔥 Crisis Streak: {activeOrder.incidentStreak}</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-black text-white">Courier Live Hub</h1>
        <p className="text-xs text-zinc-500">
          Spam Turbo Boost to speed up delivery and earn points combos.
        </p>
      </div>
      {/* Dopamine Rush Status Banner */}
      {dopamineRushActive && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-black font-black text-center text-xs uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(255,0,127,0.3)]">
          ⚡ Dopamine Rush Active! 2x Boosting Rewards! ⚡
        </div>
      )}
      {/* SVG Tracking Map */}
      <TrackingMap progress={progress} />

      {/* Status Ticker Card */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-neon-cyan" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Courier Status</span>
        <div className="text-sm font-bold text-white text-neon-glow-cyan h-6 flex items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={getTickerMessage(progress)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {getTickerMessage(progress)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Control Area */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
        
        {!isCompleted ? (
          activeOrder.activeIncident ? (
            /* Incident Minigame Card */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full p-6 rounded-2xl bg-zinc-900 border-2 border-neon-pink shadow-[0_0_20px_rgba(255,0,127,0.15)] space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-neon-pink animate-pulse flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 animate-bounce" />
                  <span>Courier Incident Active!</span>
                </span>
                <span className="text-xs font-bold text-zinc-400">
                  {(incidentTimeLeft / 1000).toFixed(1)}s
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-sm">
                  {activeOrder.activeIncident.prompt}
                </h3>
                {activeOrder.activeIncident.type === "pothole" && (
                  <div className="flex space-x-1.5 justify-center py-2 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-xs text-zinc-500 mr-2 self-center font-bold">Sequence:</span>
                    {activeOrder.activeIncident.sequence?.map((sym, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg font-black text-sm border ${
                          idx < potholeProgress
                            ? "bg-neon-green/20 border-neon-green text-neon-green"
                            : "bg-zinc-900 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timer Bar */}
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-neon-pink h-full transition-all duration-100 ease-linear"
                  style={{ width: `${Math.max(0, Math.min(100, (incidentTimeLeft / (activeOrder.activeIncident.duration || 12000)) * 100))}%` }}
                />
              </div>

              {/* Minigame Interactive area */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                {activeOrder.activeIncident.type === "pothole" ? (
                  <div className="grid grid-cols-3 gap-2">
                    {shuffledPotholeSymbols.map((sym, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePotholeTap(sym)}
                        className="py-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-neon-cyan hover:text-neon-cyan text-white text-lg font-black transition-all active:scale-[0.95]"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeOrder.activeIncident.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className="w-full py-3 px-4 text-left rounded-xl bg-zinc-800 border border-zinc-700 hover:border-neon-pink hover:bg-neon-pink/5 text-zinc-200 hover:text-white font-semibold text-xs transition-all active:scale-[0.99] flex justify-between items-center"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="relative w-full">
              {/* Turbo Boost Button */}
              <button
                onClick={handleBoostClick}
                className="w-full py-5 rounded-2xl font-black text-base uppercase tracking-wider text-black border-2 border-transparent bg-gradient-to-r from-neon-yellow via-neon-green to-neon-cyan shadow-[0_0_25px_rgba(57,255,20,0.25)] hover:shadow-[0_0_35px_rgba(57,255,20,0.5)] active:scale-[0.97] transition-all relative overflow-hidden select-none flex items-center justify-center space-x-2"
              >
                <Rocket className="h-5 w-5 animate-pulse" />
                <span>Spam Turbo Boost!</span>
              </button>

              {/* Floating text combo labels */}
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {floatingTexts.map(text => (
                  <motion.span
                    key={text.id}
                    initial={{ y: text.y, x: text.x, opacity: 1, scale: 0.8 }}
                    animate={{ y: text.y - 80, opacity: 0, scale: 1.2 }}
                    onAnimationComplete={() => removeFloatingText(text.id)}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute text-xs font-black text-neon-green text-neon-glow-green drop-shadow-md select-none pointer-events-none bg-black/40 px-1.5 py-0.5 rounded border border-zinc-800"
                  >
                    {text.text}
                  </motion.span>
                ))}
              </div>
              
              {/* Combo alert */}
              {combo > 3 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  className="text-center font-black text-neon-pink text-neon-glow-pink mt-3 text-sm animate-pulse"
                >
                  🔥 COMBO FLAME X{combo}! Keep spamming!
                </motion.div>
              )}
            </div>
          )
        ) : (
          /* Arrived / Claim Rewards Button */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full space-y-4"
          >
            <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold text-center">
              🎉 Delivery capsule secured! Open it for instant satisfaction.
            </div>
            
            <button
              onClick={() => {
                completeActiveOrder();
                router.push("/rewards");
              }}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black bg-neon-green shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:shadow-[0_0_35px_rgba(57,255,20,0.7)] hover:scale-102 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <span>Accept Delivery & Claim Reward (+{activeOrder.pointsEarned} XP {activeOrder.coinsEarned ? `& +${activeOrder.coinsEarned} DC` : ""})</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Details Box */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-500 space-y-4">
        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider border-b border-zinc-800 pb-2">
          Receipt Details
        </h4>
        <div className="flex justify-between">
          <span>Order Reference</span>
          <span className="font-bold text-zinc-400">{activeOrder.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Kitchen Name</span>
          <span className="font-bold text-zinc-400">{activeOrder.restaurantName}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Items</span>
          <span className="font-bold text-zinc-400">
            {activeOrder.items.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-zinc-800/50">
          <span>Brain Points Earned</span>
          <span className="font-black text-neon-cyan">+{activeOrder.pointsEarned} XP</span>
        </div>
        {activeOrder.coinsEarned !== undefined && (
          <div className="flex justify-between">
            <span>Dopamine Coins Earned</span>
            <span className="font-black text-neon-yellow">+{activeOrder.coinsEarned} DC</span>
          </div>
        )}
      </div>

    </div>
  );
}
