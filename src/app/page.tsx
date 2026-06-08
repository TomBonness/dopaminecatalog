"use client";

import React, { useState } from "react";
import { MOCK_RESTAURANTS, CATEGORIES, Restaurant } from "@/lib/mockData";
import { useAppState } from "@/context/StateContext";
import { useAudio } from "@/context/AudioContext";
import { Star, Clock, Sparkles, MapPin, Award, Trash2, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatCash } from "@/lib/currency";

export default function HomePage() {
  const { play } = useAudio();
  const {
    points,
    level,
    unlockedBadges,
    resetStats,
    dopamineRushActive,
    dopamineRushTimeLeft,
    questProgress,
    questClaimed,
    questConfig,
    claimQuestReward
  } = useAppState();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shakingCardId, setShakingCardId] = useState<string | null>(null);

  const handleRestaurantClick = (e: React.MouseEvent, restaurant: Restaurant) => {
    if (level < restaurant.levelRequired) {
      e.preventDefault();
      play("lock");
      setShakingCardId(restaurant.id);
      setTimeout(() => setShakingCardId(null), 600);
    }
  };

  // Filter restaurants based on category
  const filteredRestaurants = selectedCategory
    ? MOCK_RESTAURANTS.filter(r =>
        r.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase())
      )
    : MOCK_RESTAURANTS;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Address Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink shadow-[0_0_10px_rgba(255,0,127,0.15)] animate-pulse">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Delivery Capsule</span>
            <span className="text-sm font-extrabold text-white text-neon-glow-cyan">
              Pod 42, Sector-9 Cyber-Basement, Earth-2
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset all your fake statistics and level?")) {
              resetStats();
            }
          }}
          className="text-xs font-bold text-zinc-500 hover:text-red-400 transition flex items-center space-x-1 border border-zinc-800 hover:border-red-950 p-2 rounded-lg bg-zinc-950/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Reset Addiction</span>
        </button>
      </div>

      {/* Dopamine Rush Status Banner */}
      {dopamineRushActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan p-4 text-black font-black flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(255,0,127,0.4)]"
        >
          <div className="absolute inset-0 bg-white/10 opacity-30 animate-pulse pointer-events-none" />
          <div className="flex items-center space-x-3 z-10">
            <span className="text-2xl animate-bounce">⚡</span>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-black">
                Dopamine Rush Active!
              </h3>
              <p className="text-xs font-bold text-black/80">
                2x Rewards on all courier boosts and scratchcard lottery tickets!
              </p>
            </div>
          </div>
          <div className="z-10 bg-black text-neon-pink border border-neon-pink/30 px-4 py-2 rounded-xl text-lg font-black tracking-widest min-w-[90px] text-center shadow-[0_0_10px_rgba(255,0,127,0.3)] shrink-0">
            {dopamineRushTimeLeft}s
          </div>
        </motion.div>
      )}

      {/* Daily Quests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-neon-yellow" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400">
              Daily Dopamine Quests
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            "turboBoost",
            "serotoninScratch",
            "dopamineFeast",
            "crisisManager"
          ] as const).map(id => {
            const config = questConfig[id];
            return {
              id,
              title: config.title,
              desc: config.desc,
              current: questProgress[id] || 0,
              target: config.target,
              reward: `+${config.xp} XP & +${formatCash(config.coins)}`
            };
          }).map(quest => {
            const isCompleted = quest.current >= quest.target;
            const isClaimed = questClaimed[quest.id];
            const percent = Math.min((quest.current / quest.target) * 100, 100);

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-300 bg-zinc-950/60 ${
                  isClaimed
                    ? "border-zinc-800 opacity-60"
                    : isCompleted
                    ? "border-neon-yellow shadow-[0_0_15px_rgba(255,231,0,0.15)]"
                    : "border-zinc-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-sm text-white uppercase tracking-wide">
                      {quest.title}
                    </h4>
                    {isClaimed ? (
                      <span className="text-[10px] font-black text-zinc-500 uppercase">Claimed</span>
                    ) : isCompleted ? (
                      <span className="text-[10px] font-black text-neon-yellow uppercase animate-pulse">Ready</span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-500">
                        {quest.current}/{quest.target}
                       </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">{quest.desc}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-3 overflow-hidden border border-zinc-800/50">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isClaimed
                          ? "bg-zinc-700"
                          : isCompleted
                          ? "bg-neon-yellow"
                          : "bg-neon-cyan"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50">
                  <div className="text-[10px] font-bold text-neon-pink uppercase">
                    Reward: {quest.reward}
                  </div>
                  
                  {isClaimed ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed uppercase"
                    >
                      Claimed
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => claimQuestReward(quest.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-neon-yellow text-black shadow-[0_0_10px_rgba(255,231,0,0.25)] hover:shadow-[0_0_15px_rgba(255,231,0,0.5)] active:scale-95 transition uppercase"
                    >
                      Claim
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-zinc-900/40 text-zinc-500 border border-zinc-800/80 cursor-not-allowed uppercase"
                    >
                      Locked
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* 2. Category Scroll (horizontal quick filters moved to the top) */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400">Categories</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 shrink-0 ${
              selectedCategory === null
                ? "bg-zinc-900 border-neon-pink text-white shadow-[0_0_15px_rgba(255,0,127,0.15)]"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            <span>✨</span>
            <span>All Eats</span>
          </button>
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "bg-zinc-900 border-neon-pink text-white shadow-[0_0_15px_rgba(255,0,127,0.15)]"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* 3. Featured Restaurant List (with level lock overlays) */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400">
          Featured Neon Kitchens ({filteredRestaurants.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRestaurants.map((restaurant, idx) => {
            const isLocked = level < restaurant.levelRequired;
            return (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 15 }}
                animate={shakingCardId === restaurant.id ? { x: [-6, 6, -6, 6, -3, 3, 0] } : { opacity: 1, y: 0 }}
                transition={shakingCardId === restaurant.id ? { duration: 0.4 } : { delay: idx * 0.05 }}
                whileHover={!isLocked ? { y: -4 } : {}}
                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all duration-200 relative"
              >
                <Link
                  href={`/restaurant/${restaurant.id}`}
                  onClick={(e) => handleRestaurantClick(e, restaurant)}
                  className="block relative"
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
                      <div className="h-12 w-12 rounded-full bg-zinc-950/80 border border-neon-pink/40 flex items-center justify-center text-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.3)] mb-2 group-hover:scale-110 transition-transform">
                        <Lock className="h-5 w-5 animate-pulse" />
                      </div>
                      <span className="px-3 py-1 rounded bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-black uppercase tracking-widest text-neon-glow-pink">
                        Unlocks at Lvl {restaurant.levelRequired}
                      </span>
                      {shakingCardId === restaurant.id && (
                        <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest mt-2 block animate-bounce">
                          Access Denied: Level too low!
                        </span>
                      )}
                    </div>
                  )}
                  {/* Image */}
                  <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isLocked ? "blur-[2px]" : ""}`}
                    />
                    {/* Category Pills */}
                    <div className="absolute top-4 left-4 flex gap-1.5 z-20">
                      {restaurant.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-black/75 border border-zinc-800 text-[10px] font-black text-zinc-300 tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Details */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-black text-lg text-white leading-tight group-hover:text-neon-cyan transition-colors">
                          {restaurant.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                          {restaurant.description}
                        </p>
                      </div>
                      {/* Rating badge */}
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-black text-xs text-neon-yellow shrink-0">
                        <Star className="h-3.5 w-3.5 fill-neon-yellow text-neon-yellow" />
                        <span>{restaurant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {/* Delivery stats footer */}
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400 pt-3 border-t border-zinc-800">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                        <span className="text-zinc-500">•</span>
                        <span>
                          {restaurant.deliveryFee === 0 ? "FREE Delivery" : `$${restaurant.deliveryFee.toFixed(2)} Delivery`}
                        </span>
                      </div>
                      <span className="text-zinc-500">{restaurant.priceRange}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* 4. Interactive Promo Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-neon-pink/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-neon-cyan/10 blur-3xl" />
        <div className="space-y-3 relative z-10 max-w-lg text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Free Serotonin Boost</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Order Fake Food, Get <span className="text-neon-pink text-neon-glow-pink">Real Satisfaction</span>.
          </h2>
          <p className="text-xs text-zinc-400">
            No payments. No drivers. Just pure clicking, chimes, doorbell sounds, and courier tracking to satisfy the craving!
          </p>
        </div>
        <Link href="/rewards" className="relative z-10">
          <button className="py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-black bg-neon-yellow shadow-[0_0_15px_rgba(255,231,0,0.3)] hover:shadow-[0_0_25px_rgba(255,231,0,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
            <span>Play Scratch-Offs</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
