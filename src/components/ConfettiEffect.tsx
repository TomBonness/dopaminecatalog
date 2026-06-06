"use client";

import React, { useEffect, useRef } from "react";
import { useAppState } from "@/context/StateContext";
import confetti from "canvas-confetti";

export const ConfettiEffect: React.FC = () => {
  const { activeOrder } = useAppState();
  const prevOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeOrder && activeOrder.id !== prevOrderIdRef.current) {
      prevOrderIdRef.current = activeOrder.id;
      
      // Explosion 1
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff007f", "#9d4edd", "#00f0ff", "#39ff14", "#ffe700"],
      });

      // Explosion 2 (slight delay)
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#ff007f", "#9d4edd", "#00f0ff", "#39ff14", "#ffe700"],
        });
      }, 250);

      return () => clearTimeout(timer);
    } else if (!activeOrder) {
      prevOrderIdRef.current = null;
    }
  }, [activeOrder]);

  return null;
};

export default ConfettiEffect;
