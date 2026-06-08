"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/StateContext";
import { formatCash } from "@/lib/currency";
import { Trophy, ShoppingBag, Gift, MapPin, Coins } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onCartOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const pathname = usePathname();
  const {
    points,
    dopamineCoins,
    level,
    rankName,
    pointsPercent,
    pointsToNextLevel,
    cart,
    activeOrder,
    dopamineRushActive,
    dopamineRushTimeLeft,
    ownedUpgrades
  } = useAppState();

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-20 items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo / Title */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-lg sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan select-none text-neon-glow-pink">
              DOPAMINE
            </span>
            <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded bg-zinc-900 border border-neon-cyan text-neon-cyan uppercase tracking-widest text-neon-glow-cyan animate-pulse">
              DELIVERY
            </span>
          </Link>

          {/* Persistent HUD: XP Bar, Level & Points */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
              <span className="text-neon-pink uppercase tracking-wider">Level {level}: {rankName}</span>
              <span className="text-neon-cyan">{pointsToNextLevel} XP to rank up</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan shadow-[0_0_8px_#ff007f]"
                initial={{ width: 0 }}
                animate={{ width: `${pointsPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Navigation & Controls */}
          <nav className="flex items-center space-x-1.5 sm:space-x-4">
            {/* Dopamine Rush Countdown Badge */}
            {dopamineRushActive && (
              <div className="h-8 sm:h-10 flex items-center justify-center space-x-1 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-black border border-neon-pink text-neon-pink shadow-[0_0_10px_rgba(255,0,127,0.3)] animate-pulse select-none shrink-0 font-black text-[10px] sm:text-xs">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-pink"></span>
                </span>
                <span>RUSH: {dopamineRushTimeLeft}s</span>
              </div>
            )}

            {/* Dopamine Coins Indicator */}
            {/* Creator Cash Indicator */}
            <div className="h-8 sm:h-10 flex items-center justify-center space-x-1 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-zinc-900 border border-neon-yellow/30 text-neon-yellow shadow-[0_0_10px_rgba(255,231,0,0.15)] select-none hover:shadow-[0_0_15px_rgba(255,231,0,0.3)] transition-all shrink-0">
              <Coins className="h-3.5 w-3.5 sm:h-4 w-4 text-neon-yellow" />
              <span className="text-[10px] sm:text-xs font-black text-neon-glow-yellow">{formatCash(dopamineCoins)}</span>
            </div>

            {/* Owned Perks Indicator */}
            {ownedUpgrades && ownedUpgrades.length > 0 && (
              <div className="h-8 sm:h-10 hidden xs:flex items-center justify-center space-x-1 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-zinc-900 border border-neon-green/30 text-neon-green shadow-[0_0_10px_rgba(57,255,20,0.15)] select-none shrink-0">
                <span className="text-[10px] sm:text-xs font-black">⚡ {ownedUpgrades.length} Part{ownedUpgrades.length > 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Mobile Level Pill */}
            <div className="md:hidden h-8 sm:h-10 flex items-center justify-center px-2 sm:px-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-black text-neon-cyan shrink-0">
              Lvl {level}
            </div>

            {/* Rewards Center Link */}
            <Link href="/rewards">
              <div className={`relative h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer ${
                pathname === "/rewards"
                  ? "bg-zinc-900 border-neon-yellow text-neon-yellow shadow-[0_0_10px_rgba(255,231,0,0.2)]"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-neon-yellow hover:border-neon-yellow/50"
              }`}>
                <Gift className="h-4 w-4 sm:h-5 w-5" />
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-neon-yellow text-[8px] sm:text-[9px] font-black text-black">
                  !
                </span>
              </div>
            </Link>

            {/* Courier Tracking Link (Visible if there's an active order) */}
            {activeOrder && (
              <Link href="/tracking">
                <div className={`relative h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl border bg-zinc-900 border-neon-cyan text-neon-cyan cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.25)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-200 ${
                  pathname === "/tracking" ? "animate-none" : "animate-pulse"
                }`}>
                  <Trophy className="h-4 w-4 sm:h-5 w-5 animate-bounce" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-cyan"></span>
                  </span>
                </div>
              </Link>
            )}

            {/* Divider */}
            <div className="h-6 w-[1px] bg-zinc-800" />

            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              className="relative flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold text-xs sm:text-sm border-0 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_20px_rgba(255,0,127,0.6)] hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 w-4" />
              <span className="hidden sm:inline">View Cart</span>
              {totalCartItems > 0 && (
                <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white text-[8px] sm:text-[10px] font-black text-neon-pink shadow-md animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>
          </nav>

        </div>

        {/* Mobile XP Bar sub-header */}
        <div className="md:hidden pb-2 sm:pb-3">
          <div className="relative h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${pointsPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

      </div>
    </header>
  );
};
export default Header;
