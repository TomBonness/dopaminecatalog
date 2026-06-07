"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/StateContext";
import { Trophy, ShoppingBag, Gift, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onCartOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const pathname = usePathname();
  const {
    points,
    level,
    rankName,
    pointsPercent,
    pointsToNextLevel,
    cart,
    activeOrder
  } = useAppState();

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan select-none text-neon-glow-pink">
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
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Level Pill */}
            <div className="md:hidden flex flex-col items-end shrink-0">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Points</span>
              <div className="flex items-center space-x-1 font-bold text-neon-pink text-sm">
                <span>Lvl {level}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-neon-cyan">{points}</span>
              </div>
            </div>

            {/* Rewards Center Link */}
            <Link href="/rewards">
              <div className={`relative flex items-center justify-center p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                pathname === "/rewards"
                  ? "bg-zinc-900 border-neon-yellow text-neon-yellow shadow-[0_0_10px_rgba(255,231,0,0.2)]"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-neon-yellow hover:border-neon-yellow/50"
              }`}>
                <Gift className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neon-yellow text-[9px] font-black text-black">
                  !
                </span>
              </div>
            </Link>

            {/* Courier Tracking Link (Visible if there's an active order) */}
            {activeOrder && (
              <Link href="/tracking">
                <div className={`relative flex items-center justify-center p-2.5 rounded-lg border bg-zinc-900 border-neon-cyan text-neon-cyan cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.25)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-200 ${
                  pathname === "/tracking" ? "animate-none" : "animate-pulse"
                }`}>
                  <Trophy className="h-5 w-5 animate-bounce" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                  </span>
                </div>
              </Link>
            )}

            {/* Divider */}
            <div className="h-6 w-[1px] bg-zinc-800" />

            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              className="relative flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold text-sm border-0 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_20px_rgba(255,0,127,0.6)] hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">View Cart</span>
              {totalCartItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-neon-pink shadow-md animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>
          </nav>

        </div>

        {/* Mobile XP Bar sub-header */}
        <div className="md:hidden pb-3">
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
