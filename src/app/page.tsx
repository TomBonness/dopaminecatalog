"use client";

import React, { useState } from "react";
import { MOCK_RESTAURANTS, CATEGORIES, Restaurant } from "@/lib/mockData";
import { useAppState } from "@/context/StateContext";
import { useAudio } from "@/context/AudioContext";
import { Star, Clock, Sparkles, MapPin, Award, Trash2, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  const { play } = useAudio();
  const {
    points,
    level,
    moneySaved,
    impulsiveDecisionsAvoided,
    unlockedBadges,
    resetStats
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
      {/* 5. Dopamine Stats Dashboard (placed at the bottom of the page) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Money Saved */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between h-32 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl font-black text-neon-green">$$$</div>
          <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest block">Money Saved</span>
          <span className="text-4xl font-black text-neon-green text-neon-glow-green block mt-2">
            ${moneySaved.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Saved by skipping real delivery apps
          </span>
        </motion.div>
        {/* Impulse Buys Avoided */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between h-32 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl font-black text-neon-pink">🛒</div>
          <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest block">Impulses Deflected</span>
          <span className="text-4xl font-black text-neon-pink text-neon-glow-pink block mt-2">
            {impulsiveDecisionsAvoided}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Fake orders completed successfully
          </span>
        </motion.div>
        {/* Total Badges */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between h-32 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl font-black text-neon-yellow">🏆</div>
          <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest block">Unlocked Badges</span>
          <span className="text-4xl font-black text-neon-yellow text-neon-glow-yellow block mt-2">
            {unlockedBadges.length}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Achievements earned in delivery loops
          </span>
        </motion.div>
      </div>
    </div>
  );
}
