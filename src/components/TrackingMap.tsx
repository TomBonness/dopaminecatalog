"use client";

import React from "react";
import { motion } from "framer-motion";
import { Store, Home, Bike } from "lucide-react";
import { useAppState } from "@/context/StateContext";

interface TrackingMapProps {
  progress: number;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ progress }) => {
  const { activeOrder } = useAppState();
  // Path definition:
  // Waypoints:
  // 1. Restaurant: (40, 160)
  // 2. Corner 1: (120, 160)
  // 3. Corner 2: (120, 100)
  // 4. Corner 3: (260, 100)
  // 5. Corner 4: (260, 40)
  // 6. User Capsule: (360, 40)
  // Total lengths of segments: 80, 60, 140, 60, 100. Sum = 440.
  
  const getCourierCoords = (pct: number) => {
    const totalLength = 440;
    const currentDist = (pct / 100) * totalLength;

    if (currentDist <= 80) {
      // Segment 1: Restaurant to Corner 1 (Horizontal right)
      return { x: 40 + currentDist, y: 160, angle: 0 };
    } else if (currentDist <= 140) {
      // Segment 2: Corner 1 to Corner 2 (Vertical up)
      const d = currentDist - 80;
      return { x: 120, y: 160 - d, angle: -90 };
    } else if (currentDist <= 280) {
      // Segment 3: Corner 2 to Corner 3 (Horizontal right)
      const d = currentDist - 140;
      return { x: 120 + d, y: 100, angle: 0 };
    } else if (currentDist <= 340) {
      // Segment 4: Corner 3 to Corner 4 (Vertical up)
      const d = currentDist - 280;
      return { x: 260, y: 100 - d, angle: -90 };
    } else {
      // Segment 5: Corner 4 to House (Horizontal right)
      const d = currentDist - 340;
      return { x: 260 + d, y: 40, angle: 0 };
    }
  };

  const coords = getCourierCoords(progress);

  const getIncidentCoords = () => {
    if (!activeOrder?.activeIncident) return null;
    const prog = activeOrder.deliveryProgress;
    if (prog <= 40) return { x: 120, y: 130, label: "GPS" };
    if (prog <= 65) return { x: 200, y: 100, label: "Pothole" };
    if (prog <= 85) return { x: 260, y: 50, label: "Gate" };
    return { x: 316, y: 40, label: "Crisis" };
  };

  const incidentCoords = getIncidentCoords();

  return (
    <div className="relative w-full max-w-lg mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-6 overflow-hidden aspect-[400/220]">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full relative z-10 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Grid Lines (Neon Vibe) */}
        <line x1="20" y1="20" x2="380" y2="20" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="20" y1="80" x2="380" y2="80" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="20" y1="140" x2="380" y2="140" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* The Cyber-Road Map Grid */}
        <path
          d="M 40 160 L 120 160 L 120 100 L 260 100 L 260 40 L 360 40"
          fill="none"
          stroke="#18181b"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The active neon delivery path */}
        <path
          d="M 40 160 L 120 160 L 120 100 L 260 100 L 260 40 L 360 40"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shadow-[0_0_15px_#00f0ff]"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff007f" />
            <stop offset="50%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Restaurant Icon Node */}
        <g transform="translate(40, 160)" className="cursor-pointer">
          <circle cx="0" cy="0" r="14" fill="#09090b" stroke="#ff007f" strokeWidth="2.5" className="animate-pulse" />
          <foreignObject x="-8" y="-8" width="16" height="16">
            <Store className="h-4 w-4 text-neon-pink text-neon-glow-pink" />
          </foreignObject>
        </g>

        {/* User House Capsule Node */}
        <g transform="translate(360, 40)">
          <circle cx="0" cy="0" r="16" fill="#09090b" stroke="#39ff14" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="#39ff14" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" style={{ transformOrigin: "360px 40px", animationDuration: "10s" }} />
          <foreignObject x="-8" y="-8" width="16" height="16">
            <Home className="h-4 w-4 text-neon-green" />
          </foreignObject>
        </g>

        {/* Pulse Glow/Warning for active incidents */}
        {incidentCoords && (
          <g transform={`translate(${incidentCoords.x}, ${incidentCoords.y})`}>
            <circle cx="0" cy="0" r="18" fill="none" stroke="#ff0055" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: `${incidentCoords.x}px ${incidentCoords.y}px`, animationDuration: "1.5s" }} />
            <circle cx="0" cy="0" r="10" fill="#09090b" stroke="#ff0055" strokeWidth="2" className="shadow-[0_0_10px_#ff0055]" />
            <path d="M 0 -4 L 0 1 M 0 3 L 0 4" stroke="#ff0055" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Pulse Glow beneath Courier */}
        <circle cx={coords.x} cy={coords.y} r="20" fill="url(#glow)" className="animate-ping" style={{ animationDuration: "2s" }} />

        {/* Moving Courier Icon */}
        <g
          transform={`translate(${coords.x}, ${coords.y}) rotate(${coords.angle})`}
          style={{ transition: "transform 0.1s linear" }}
        >
          <rect x="-14" y="-14" width="28" height="28" rx="8" fill="#09090b" stroke="#00f0ff" strokeWidth="2" className="shadow-[0_0_10px_#00f0ff]" />
          <foreignObject x="-7" y="-7" width="14" height="14" transform="rotate(0)">
            <Bike className="h-3.5 w-3.5 text-neon-cyan text-neon-glow-cyan" />
          </foreignObject>
        </g>
      </svg>

      {/* Progress display overlay */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 z-25">
        <span>Mega Burger Corp</span>
        <span className="text-neon-cyan">{progress.toFixed(0)}% Dispatched</span>
        <span>Your Capsule</span>
      </div>
    </div>
  );
};

export default TrackingMap;
