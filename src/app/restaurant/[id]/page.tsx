"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_RESTAURANTS, MenuItem, MenuItemOption } from "@/lib/mockData";
import { useAppState } from "@/context/StateContext";
import { Star, Clock, ArrowLeft, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ItemModal } from "@/components/ItemModal";
import Image from "next/image";

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useAppState();

  const id = typeof params?.id === "string" ? params.id : "";
  const restaurant = MOCK_RESTAURANTS.find(r => r.id === id);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!restaurant) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <span className="text-5xl">🥡</span>
        <h3 className="font-extrabold text-white text-xl">Kitchen offline!</h3>
        <p className="text-zinc-500 max-w-xs">
          This restaurant seems to have glitched out of our cyber-catalog.
        </p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-sm font-bold text-white transition">
          Return to Hub
        </Link>
      </div>
    );
  }

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddOptions = (item: MenuItem, options: MenuItemOption[], quantity: number) => {
    addToCart(item, options, quantity);
  };

  return (
    <div className="pb-16 space-y-8">
      {/* Back button & header banner */}
      <div className="relative h-60 w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        <Image
          src={restaurant.bannerImage}
          alt={restaurant.name}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        {/* Floating Top controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setLiked(!liked)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-zinc-800 backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-neon-pink text-neon-pink" : "text-zinc-300"}`} />
          </button>
        </div>

        {/* Restaurant Header Details */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-neon-glow-cyan animate-pulse">
                Verified Serotonin
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-xs md:text-sm text-zinc-300 max-w-xl font-bold">
              {restaurant.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-1 font-black text-neon-yellow">
                <Star className="h-4 w-4 fill-neon-yellow" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                {restaurant.reviewsCount} reviews
              </span>
            </div>
            
            <div className="h-8 w-[1px] bg-zinc-800" />
            
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">{restaurant.deliveryTime}</span>
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                {restaurant.deliveryFee === 0 ? "Free del." : `$${restaurant.deliveryFee.toFixed(2)} del.`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Menu Listings */}
        <div className="lg:col-span-2 space-y-8">
          {restaurant.menu.map((category, catIdx) => (
            <div key={category.category} className="space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-neon-pink text-neon-glow-pink">
                {category.category}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.items.map((item, itemIdx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIdx * 0.1 + itemIdx * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className="p-4 rounded-2xl border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-white group-hover:text-neon-cyan transition-colors truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-normal line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-850/50 mt-4 pt-3 text-xs">
                      <span className="font-black text-white text-sm">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="font-bold text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                        +{item.dopaminePoints} XP
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reviews panel */}
        <div className="space-y-6 lg:border-l lg:border-zinc-850 lg:pl-8">
          <div className="flex items-center space-x-2 border-b border-zinc-850 pb-3">
            <MessageSquare className="h-5 w-5 text-neon-cyan" />
            <h3 className="font-black text-sm uppercase tracking-wider text-zinc-300">
              Brain-Melt Reviews
            </h3>
          </div>

          <div className="space-y-4">
            {restaurant.reviews.map(review => (
              <div
                key={review.id}
                className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">@{review.userName}</span>
                  <span className="text-[10px] text-zinc-500">{review.date}</span>
                </div>
                
                <div className="flex items-center space-x-0.5 text-neon-yellow">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(review.rating) ? "fill-neon-yellow text-neon-yellow" : "text-zinc-800"
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Item Selection Customization Modal */}
      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddOptions}
      />
    </div>
  );
}
