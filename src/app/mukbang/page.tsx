"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/StateContext";
import { MukbangExperience } from "@/components/MukbangExperience";
import { ShieldAlert, ArrowLeft, Video } from "lucide-react";

export default function MukbangPage() {
  const router = useRouter();
  const { activeOrder, completeActiveOrder, viewMultiplier } = useAppState();

  const isCompleted = activeOrder?.status === "completed" || (activeOrder?.deliveryProgress ?? 0) >= 100;

  if (!activeOrder) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-5 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-white text-xl">No active delivery to film</h3>
          <p className="text-zinc-500 max-w-sm text-xs leading-relaxed">
            Please place a delivery order first to begin filming.
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

  if (!isCompleted) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-5 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-850 text-neon-pink animate-pulse">
          <Video className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-white text-xl">Delivery still in transit</h3>
          <p className="text-zinc-500 max-w-sm text-xs leading-relaxed">
            Your delivery is currently at {Math.round(activeOrder.deliveryProgress)}%. Please wait for arrival.
          </p>
        </div>
        <Link href="/tracking">
          <button className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 font-black text-xs uppercase tracking-widest text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Tracking</span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          MukBang Studio
        </h1>
        <p className="text-sm text-zinc-400">
          Delivery capsule secured. Film the creator video before collecting rewards.
        </p>
      </div>

      <MukbangExperience
        activeOrder={activeOrder}
        viewMultiplier={viewMultiplier}
        onComplete={(result) => {
          completeActiveOrder(result);
          router.push("/rewards");
        }}
      />
    </div>
  );
}
